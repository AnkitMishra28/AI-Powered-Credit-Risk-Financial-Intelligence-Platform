"""
CreditLens Gemini Synthesis Service
Calls Google Gemini API with grounded context and falls back to deterministic grounded synthesis if unconfigured/offline.
"""
import os
import json
import logging
import re
from typing import Optional, Dict, Any, List
from app.rag.models import (
    RetrievalResult,
    StructuredUserFinancialContext,
    StructuredGeminiResponse,
    SourceReferenceItem
)
from app.rag.config import rag_settings
from app.rag.prompt_builder import build_grounded_prompt

logger = logging.getLogger("creditlens.gemini")

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "") or rag_settings.GEMINI_API_KEY
        self.model_name = rag_settings.GEMINI_MODEL
        self._genai = None

        if self.api_key and self.api_key != "your_gemini_api_key_here":
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self._genai = genai.GenerativeModel(
                    model_name=self.model_name,
                    generation_config={
                        "temperature": rag_settings.TEMPERATURE,
                        "max_output_tokens": rag_settings.MAX_OUTPUT_TOKENS,
                        "response_mime_type": "application/json"
                    }
                )
            except Exception as e:
                logger.warning(f"Could not initialize Google GenAI SDK: {e}")
                self._genai = None

    def generate_grounded_response(
        self,
        query: str,
        retrieved_chunks: List[RetrievalResult],
        user_context: Optional[StructuredUserFinancialContext] = None,
        personal_context_missing: bool = False
    ) -> StructuredGeminiResponse:
        """
        Synthesizes a structured, grounded response from retrieved knowledge chunks and user metrics.

        `personal_context_missing` is True when an authenticated real user asked for
        personalized grounding but has not analyzed any financial data yet. In that case
        the copilot answers from regulatory knowledge only and must NOT invent any
        user-specific figures.
        """
        # 1. Check for prompt injection attempts
        lower_q = query.lower()
        if any(bad in lower_q for bad in ["ignore previous", "system prompt", "developer mode", "reveal api key", "jailbreak"]):
            return StructuredGeminiResponse(
                answer=(
                    "CreditLens Copilot operates under strict financial intelligence and data protection safeguards. "
                    "I cannot modify system instructions, bypass security boundaries, or reveal internal system configurations. "
                    "How can I assist you with your credit health, spending velocity, or regulatory guidelines?"
                ),
                key_points=["Security boundary maintained", "No unauthorized instructions executed"],
                personalized_insights=[],
                sources=[],
                grounding_facts=[],
                suggested_followups=[
                    "What affects my Credit Health Score?",
                    "How is credit utilization calculated?",
                    "What happens if I only pay the minimum amount?"
                ],
                disclaimer="Educational information only. CreditLens is not a financial advisor or credit bureau.",
                is_grounded=True,
                out_of_scope=False
            )

        # 2. Check for out-of-scope / non-financial requests
        if not retrieved_chunks and not any(k in lower_q for k in ["score", "health", "risk", "spend", "dining", "income", "credit", "utilization", "payment", "apr", "loan", "rbi", "card", "minimum"]):
            return StructuredGeminiResponse(
                answer=(
                    "I couldn't find sufficiently relevant information in the verified CreditLens knowledge base to answer that confidently. "
                    "CreditLens Copilot is specialized in credit health mechanics, credit card regulations (RBI Master Directions), "
                    "utilization management, and transaction cashflow analytics."
                ),
                key_points=["Inquiry falls outside the verified financial knowledge base"],
                personalized_insights=[],
                sources=[],
                grounding_facts=[],
                suggested_followups=[
                    "What affects my Credit Health Score?",
                    "How can I reduce my credit utilization?",
                    "What are the implications of paying only the minimum due?"
                ],
                disclaimer="Educational information only. CreditLens is not a credit bureau or financial advisor.",
                is_grounded=False,
                out_of_scope=True
            )

        # 3. Attempt Live Gemini API Call if available
        result: Optional[StructuredGeminiResponse] = None
        if self._genai is not None:
            try:
                prompt = build_grounded_prompt(query, retrieved_chunks, user_context)
                if personal_context_missing:
                    prompt += (
                        "\n\nNOTE: The authenticated user has NOT analyzed any financial data yet. "
                        "Answer ONLY from the authoritative sources. Do NOT state or estimate any "
                        "user-specific figures (score, utilization, balances, spending). You may note "
                        "that connecting their financial data unlocks personalized insights.\n"
                    )
                response = self._genai.generate_content(prompt)
                raw_text = response.text.strip()
                parsed = self._clean_and_parse_json(raw_text)
                if parsed:
                    result = self._map_to_structured_response(parsed, retrieved_chunks, user_context)
            except Exception as e:
                logger.warning(f"Live Gemini call failed, falling back to deterministic synthesis: {e}")

        # 4. Deterministic Grounded Synthesis Engine (Guaranteed zero-failure fallback)
        if result is None:
            result = self._deterministic_grounded_synthesis(query, retrieved_chunks, user_context)

        # 5. If a real user has no analyzed data, make that explicit and strip any
        #    stray personalized insights so no user-specific figure is ever implied.
        if personal_context_missing:
            result.personalized_insights = []
            note = (
                "You have not analyzed any financial data yet, so this answer is based only on "
                "verified regulatory guidance — not your personal profile. Upload a bank statement "
                "and complete your credit profile to unlock personalized, grounded insights."
            )
            if note not in result.answer:
                result.answer = f"{note}\n\n{result.answer}"
            if note not in result.key_points:
                result.key_points = [note] + list(result.key_points)

        return result

    @staticmethod
    def _facts_from_context(uc: Optional[StructuredUserFinancialContext]) -> List[Dict[str, str]]:
        """
        Builds the grounding-fact chips from ONLY the fields a context actually
        carries. A real user's partial context (e.g. spending but no score yet)
        contributes just the facts it has; nothing is fabricated to fill gaps.
        """
        if not uc:
            return []
        facts: List[Dict[str, str]] = []
        if uc.has_credit_health:
            facts.append({"label": "Credit Health Score", "value": f"{uc.health_score} / 1000 ({uc.score_tier})"})
        if uc.has_utilization:
            facts.append({
                "label": "Credit Utilization",
                "value": f"{uc.credit_utilization_pct}% (₹{uc.revolving_balance:,.0f} / ₹{uc.credit_limit_total:,.0f})",
            })
        if uc.payment_consistency_pct is not None:
            facts.append({"label": "Payment Consistency", "value": f"{uc.payment_consistency_pct}% on-time ratio"})
        if uc.net_cashflow is not None:
            facts.append({"label": "Net Monthly Cashflow", "value": f"₹{uc.net_cashflow:,.0f} / month"})
        elif uc.monthly_spending is not None:
            facts.append({"label": "Monthly Outflow", "value": f"₹{uc.monthly_spending:,.0f}"})
        if uc.has_risk:
            facts.append({"label": "ML Risk Category", "value": f"{uc.risk_category} ({uc.risk_probability_pct}% conf.)"})
        return facts

    def _clean_and_parse_json(self, text: str) -> Optional[Dict[str, Any]]:
        """Cleans markdown JSON fences and parses JSON securely."""
        try:
            cleaned = text
            if "```json" in cleaned:
                cleaned = cleaned.split("```json")[1].split("```")[0].strip()
            elif "```" in cleaned:
                cleaned = cleaned.split("```")[1].split("```")[0].strip()
            return json.loads(cleaned)
        except Exception:
            return None

    def _map_to_structured_response(
        self,
        data: Dict[str, Any],
        retrieved_chunks: List[RetrievalResult],
        user_context: Optional[StructuredUserFinancialContext]
    ) -> StructuredGeminiResponse:
        """Converts raw parsed JSON to validated StructuredGeminiResponse."""
        sources: List[SourceReferenceItem] = []
        for s in data.get("source_references", []):
            sources.append(
                SourceReferenceItem(
                    document_id=s.get("document_id", "doc-rbi"),
                    chunk_id=s.get("chunk_id", "chk-01"),
                    title=s.get("title", "Regulatory Document"),
                    source_name=s.get("source_name", "Reserve Bank of India (RBI)"),
                    source_url=s.get("source_url"),
                    doc_type="Regulatory Directive",
                    excerpt=s.get("title", "Verified Source Guidance"),
                    relevance_score=0.95
                )
            )

        # If LLM omitted sources but we had retrieved chunks, attach top retrieved sources
        if not sources and retrieved_chunks:
            for rc in retrieved_chunks[:3]:
                sources.append(
                    SourceReferenceItem(
                        document_id=rc.document_id,
                        chunk_id=rc.chunk_id,
                        title=rc.title,
                        source_name=rc.source_name,
                        source_url=rc.source_url,
                        doc_type=rc.doc_type,
                        excerpt=rc.content[:160] + "...",
                        relevance_score=rc.score
                    )
                )

        grounding_facts = self._facts_from_context(user_context)

        return StructuredGeminiResponse(
            answer=data.get("answer", "Here is your grounded financial intelligence summary."),
            key_points=data.get("key_points", []),
            personalized_insights=data.get("personalized_insights", []),
            sources=sources,
            grounding_facts=grounding_facts,
            suggested_followups=data.get("suggested_followups", [
                "What affects my Credit Health Score?",
                "How can I bring utilization below 30%?",
                "What happens if I only pay the minimum amount?"
            ]),
            disclaimer=data.get("disclaimer", "Educational information only. CreditLens is not a credit bureau or financial advisor."),
            is_grounded=True,
            out_of_scope=False
        )

    def _deterministic_grounded_synthesis(
        self,
        query: str,
        retrieved_chunks: List[RetrievalResult],
        user_context: Optional[StructuredUserFinancialContext]
    ) -> StructuredGeminiResponse:
        """
        High-fidelity deterministic grounded synthesis when running without an external LLM API key.
        Synthesizes exact facts from retrieved regulatory chunks + user's structured metrics.
        """
        lower_q = query.lower()

        # Build source references
        sources: List[SourceReferenceItem] = [
            SourceReferenceItem(
                document_id=c.document_id,
                chunk_id=c.chunk_id,
                title=c.title,
                source_name=c.source_name,
                source_url=c.source_url,
                doc_type=c.doc_type,
                excerpt=c.content[:180].strip() + "...",
                relevance_score=c.score
            )
            for c in retrieved_chunks[:3]
        ]

        # Out-of-scope guardrail check
        if not retrieved_chunks and not any(k in lower_q for k in ["score", "health", "risk", "spend", "dining", "income", "credit", "utilization", "payment", "apr", "loan", "rbi", "card", "minimum", "balance", "limit", "history", "debt", "interest"]):
            return StructuredGeminiResponse(
                answer=(
                    "I couldn't find sufficiently relevant information in the verified CreditLens knowledge base to answer that confidently. "
                    "CreditLens Copilot is specialized in credit health mechanics, credit card regulations (RBI Master Directions), "
                    "utilization management, and transaction cashflow analytics."
                ),
                key_points=["Inquiry falls outside the verified financial knowledge base"],
                personalized_insights=[],
                sources=[],
                grounding_facts=[],
                suggested_followups=[
                    "What affects my Credit Health Score?",
                    "How can I reduce my credit utilization?",
                    "What are the implications of paying only the minimum due?"
                ],
                disclaimer="Educational information only. CreditLens is not a credit bureau or financial advisor.",
                is_grounded=False,
                out_of_scope=True
            )

        grounding_facts = self._facts_from_context(user_context)

        # Minimum payment query
        if "minimum" in lower_q:
            answer = (
                "Paying only the Minimum Amount Due (MAD) avoids late payment penalties and preserves account status, "
                "but it triggers severe compounding interest dynamics under RBI guidelines:\n\n"
                "1. **Compounding APR Burden**: Finance charges (typically 36% to 42% annualized APR in India) continue "
                "to accrue daily on your entire remaining revolving balance.\n\n"
                "2. **Loss of Interest-Free Grace Period**: Under RBI Master Direction Clause 8(c), carrying forward an unpaid balance "
                "revokes the 20–50 day interest-free period on all subsequent purchases, meaning new swipes accrue daily finance charges immediately.\n\n"
                "3. **Credit Health Stagnation**: Because the minimum payment settles mostly interest and taxes rather than principal, "
                "your revolving balance remains elevated rather than dropping toward the optimal <30% threshold."
            )
            key_points = [
                "Minimum due covers mostly finance charges and taxes, leaving principal nearly untouched",
                "Subsequent retail purchases immediately lose the interest-free grace window",
                "Can take 10–15+ years to amortize a substantial balance using minimum payments alone"
            ]
            personalized = []
            if user_context and user_context.has_utilization:
                personalized.append(
                    f"Your current revolving balance is ₹{user_context.revolving_balance:,.0f} (utilization: {user_context.credit_utilization_pct}%). "
                    f"Paying only the minimum will keep your utilization elevated in the watch corridor."
                )
            followups = [
                "What is the fastest strategy to bring utilization below 30%?",
                "How does the Debt Avalanche method work?",
                "How does minimum payment impact my Credit Health Score?"
            ]

        # Credit utilization query
        elif "utilization" in lower_q:
            answer = (
                "Credit Utilization Ratio measures the percentage of your total authorized revolving credit limit currently in use. "
                "Credit scoring models strongly penalize utilization above the optimal 30% ceiling.\n\n"
                "• **Optimal Target (<30%)**: Demonstrates disciplined credit management and minimizes default probabilities.\n"
                "• **High-Risk Band (>50% to 70%)**: Signals potential cashflow constraints to risk algorithms.\n"
                "• **Optimization Strategy**: Making mid-cycle payments before your monthly statement generation date ensures lower balances are reported to credit bureaus."
            )
            key_points = [
                "Target keeping aggregate revolving utilization under 30%",
                "Algorithms evaluate both total aggregate utilization and individual card utilization",
                "Mid-cycle payments reduce reported balances prior to statement generation dates"
            ]
            personalized = []
            if user_context and user_context.has_utilization:
                personalized.append(
                    f"Your profile currently has {user_context.credit_utilization_pct}% utilization (₹{user_context.revolving_balance:,.0f} balance / ₹{user_context.credit_limit_total:,.0f} limit). "
                    f"Reducing your balance by ₹{user_context.revolving_balance - (user_context.credit_limit_total * 0.3):,.0f} will move you into the prime <30% tier."
                )
            followups = [
                "How do mid-cycle card payments work?",
                "How does credit utilization affect the Credit Health Score?",
                "How does spending velocity impact credit health?"
            ]

        # Score explanation query
        elif any(k in lower_q for k in ["score", "credit health"]):
            if user_context and user_context.has_credit_health:
                lines = [
                    f"Your CreditLens Credit Health Score is **{user_context.health_score} / 1000** "
                    f"({user_context.score_tier} tier), calculated deterministically across 5 weighted pillars:\n"
                ]
                if user_context.payment_consistency_pct is not None:
                    lines.append(f"1. **Payment Consistency (35% weight)**: {user_context.payment_consistency_pct}% on-time ratio.")
                else:
                    lines.append("1. **Payment Consistency (35% weight)** — largest single weight.")
                if user_context.has_utilization:
                    lines.append(
                        f"2. **Revolving Credit Utilization (25% weight)**: {user_context.credit_utilization_pct}% "
                        f"(₹{user_context.revolving_balance:,.0f} / ₹{user_context.credit_limit_total:,.0f})."
                    )
                else:
                    lines.append("2. **Revolving Credit Utilization (25% weight)** — revolving balance ÷ aggregate limit.")
                if user_context.debt_to_income_pct is not None:
                    lines.append(f"3. **Debt-to-Income / DTI (20% weight)**: {user_context.debt_to_income_pct}% debt servicing load.")
                else:
                    lines.append("3. **Debt-to-Income / DTI (20% weight)** — monthly debt obligations ÷ monthly income.")
                if user_context.credit_history_years is not None:
                    lines.append(f"4. **Credit History Seasoning (10% weight)**: {user_context.credit_history_years} years.")
                else:
                    lines.append("4. **Credit History Seasoning (10% weight)** — average age of your credit lines.")
                lines.append("5. **Spending Stability (10% weight)** — current outflow vs your rolling baseline.")
                answer = "\n".join(lines)
                key_points = [
                    "Credit Health Score is an educational 0–1000 mathematical diagnostic index",
                    "Payment consistency carries the largest single weight (35%)",
                    "Revolving utilization is typically the primary lever for change",
                ]
                personalized = [
                    "Lowering revolving utilization below 30% has the largest deterministic upside for your score."
                ]
            else:
                answer = (
                    "The CreditLens Credit Health Score is an educational 0–1000 diagnostic computed deterministically "
                    "from 5 weighted pillars:\n\n"
                    "1. **Payment Consistency (35% weight)** — share of obligations paid on time.\n"
                    "2. **Revolving Credit Utilization (25% weight)** — revolving balance ÷ aggregate limit.\n"
                    "3. **Debt-to-Income / DTI (20% weight)** — monthly debt obligations ÷ monthly income.\n"
                    "4. **Credit History Seasoning (10% weight)** — average age of your credit lines.\n"
                    "5. **Spending Stability (10% weight)** — current outflow vs your rolling baseline.\n\n"
                    "You have not calculated your score yet, so no personal figure is shown. Complete your credit "
                    "profile in the Credit Health calculator to generate it."
                )
                key_points = [
                    "Credit Health Score is an educational 0–1000 mathematical diagnostic index",
                    "Payment consistency carries the largest single weight (35%)",
                    "No personal score has been calculated for your account yet",
                ]
                personalized = []
            followups = [
                "How is revolving credit utilization calculated?",
                "How does CreditLens differ from CIBIL?",
                "What happens if I only pay the minimum amount?"
            ]

        # Spending / Dining anomaly query
        elif any(k in lower_q for k in ["dining", "spending", "food", "outflow", "anomaly"]):
            if user_context and user_context.has_cashflow:
                _out = f"₹{user_context.monthly_spending:,.0f}" if user_context.monthly_spending is not None else "n/a"
                _inc = f"₹{user_context.monthly_income:,.0f}" if user_context.monthly_income is not None else "n/a"
                _net = f" (net cashflow ₹{user_context.net_cashflow:,.0f})" if user_context.net_cashflow is not None else ""
                answer = (
                    f"From your analyzed transactions, current-cycle outflow is {_out} against income of {_inc}{_net}.\n\n"
                    "• **Anomaly detection** compares each category's spend to your 3-month rolling average and flags "
                    "statistically significant surges.\n"
                    "• Redirecting discretionary surplus toward revolving balances lowers utilization faster."
                )
                key_points = [
                    "Spending analytics are derived only from your uploaded transactions",
                    "Category velocity is compared against your own rolling baseline",
                    "Discretionary surplus is the fastest lever for revolving debt reduction",
                ]
                personalized = [
                    f"Your top categories: {', '.join(user_context.top_spending_categories) or 'not enough data yet'}."
                ]
            else:
                answer = (
                    "CreditLens spending intelligence is derived entirely from the transactions in the bank/card "
                    "statements you upload. It normalizes merchants, assigns categories, then flags anomalies by "
                    "comparing each category's spend to your own 3-month rolling average.\n\n"
                    "You have not uploaded any statements yet, so there is no personal spending to report. Upload a "
                    "statement to unlock category breakdowns, recurring-payment detection and anomaly flags."
                )
                key_points = [
                    "Spending analytics require your uploaded statement data",
                    "Anomalies are relative to your own historical baseline, not a fixed threshold",
                    "No personal spending has been analyzed for your account yet",
                ]
                personalized = []
            followups = [
                "How does anomaly detection compare against a rolling baseline?",
                "How does the Debt Avalanche method work?",
                "What is the 50/30/20 budgeting standard?"
            ]

        # Risk classification query
        elif "risk" in lower_q:
            if user_context and user_context.has_risk:
                answer = (
                    f"Your most recent machine-learning risk evaluation is **{user_context.risk_category}** "
                    f"({user_context.risk_probability_pct}% model confidence), produced by the calibrated XGBoost "
                    "classifier with TreeSHAP attributions.\n\n"
                    f"• **Top positive drivers**: {'; '.join(user_context.top_positive_factors[:3]) or 'n/a'}.\n"
                    f"• **Watch signals**: {'; '.join(user_context.risk_watch_factors[:3]) or 'n/a'}."
                )
                key_points = [
                    "The XGBoost classifier outputs a calibrated default-probability distribution",
                    "TreeSHAP attributions identify the exact positive drivers and watch signals",
                    "The result reflects the applicant profile you submitted",
                ]
                personalized = [
                    "Maintaining an on-time payment streak is the strongest lever to hold a lower-risk classification."
                ]
            else:
                answer = (
                    "The CreditLens risk model is a calibrated XGBoost classifier trained on the public "
                    "(South) German Credit benchmark. It scores a 20-field structured applicant profile "
                    "(checking status, credit history, purpose, savings, employment, housing, and so on) and "
                    "returns a probability distribution across Low / Medium / High risk with TreeSHAP explanations.\n\n"
                    "A bank statement does not contain those 20 structured fields, so no risk result is shown until "
                    "you submit an applicant profile. No personal risk figure is being estimated for you."
                )
                key_points = [
                    "The risk model needs a 20-field structured applicant profile, not a bank statement",
                    "Output is a calibrated Low/Medium/High probability distribution with TreeSHAP attributions",
                    "No personal risk assessment has been generated for your account yet",
                ]
                personalized = []
            followups = [
                "What fields does the risk model require?",
                "Why is credit utilization important?",
                "How is the Credit Health Score calculated?"
            ]

        # General authoritative overview
        else:
            answer = (
                "CreditLens Copilot provides educational guidance grounded in verified regulatory frameworks and your structured metrics:\n\n"
                "• **Credit Health Diagnostic**: 0–1000 score based on payment consistency, utilization, DTI, tenure, and cashflow.\n"
                "• **Regulatory Compliance**: Grounded in RBI Master Directions for credit card disclosures, billing conduct, and consumer rights.\n"
                "• **Cashflow Intelligence**: Automated merchant normalization, category taxonomy, and statistical spending anomaly detection."
            )
            key_points = [
                "Ask about credit utilization, minimum payment APR compounding, or score factors",
                "Explanations are strictly grounded in verified sources and user metrics",
                "All outputs are for financial education and pattern awareness"
            ]
            personalized = []
            if user_context and user_context.has_credit_health:
                _rc = f" | {user_context.risk_category} ML Risk" if user_context.has_risk else ""
                personalized.append(
                    f"Current Profile: {user_context.health_score} / 1000 ({user_context.score_tier}){_rc}."
                )
            followups = [
                "What happens if I only pay the minimum amount?",
                "How is the Credit Health Score calculated?",
                "How can I reduce my revolving credit utilization?"
            ]

        return StructuredGeminiResponse(
            answer=answer,
            key_points=key_points,
            personalized_insights=personalized,
            sources=sources,
            grounding_facts=grounding_facts,
            suggested_followups=followups,
            disclaimer="Educational information only. CreditLens is not a credit bureau or financial advisor, and does not make credit decisions.",
            is_grounded=True,
            out_of_scope=False
        )

gemini_service = GeminiService()
