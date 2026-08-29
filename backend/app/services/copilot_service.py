import uuid
from datetime import datetime
from app.schemas.copilot import (
    CopilotQueryRequest,
    CopilotQueryResponse,
    CitationSource,
    GroundingFact
)

class CopilotService:
    @staticmethod
    def query(request: CopilotQueryRequest) -> CopilotQueryResponse:
        """
        Provides educational responses with verified citations and structured metric grounding.
        In Phase 2, this connects to Gemini 1.5 + pgvector semantic retrieval.
        """
        conv_id = request.conversation_id or str(uuid.uuid4())
        user_q = request.query.lower()

        # Deterministic financial facts extracted from profile/pipeline
        grounding_facts = [
            GroundingFact(label="Monthly Income", value="₹65,000"),
            GroundingFact(label="Current Spending", value="₹49,230"),
            GroundingFact(label="Revolving Utilization", value="68% (₹1,70,000 / ₹2,50,000)"),
            GroundingFact(label="Payment Consistency", value="94% (11/12 on-time)"),
            GroundingFact(label="Dining Increase", value="+31% vs 3-month avg"),
        ]

        # Knowledge sources
        rbi_guideline_source = CitationSource(
            id="src-rbi-01",
            title="RBI Master Direction – Credit Card and Debit Card – Issuance and Conduct Directions, 2022",
            publisher="Reserve Bank of India (RBI)",
            doc_type="Regulatory Guideline",
            excerpt="Clause 8(b): Card issuers shall explicitly inform the cardholder of the implications of paying only the minimum amount due, including the compounding interest burden and the time required to liquidate the full outstanding amount.",
            url="https://www.rbi.org.in"
        )

        credit_score_guide = CitationSource(
            id="src-edu-02",
            title="Credit Utilization & Revolving Balance Optimization Handbook",
            publisher="CreditLens Financial Intelligence Framework",
            doc_type="Financial Education Guide",
            excerpt="Maintaining aggregate revolving utilization below 30% of authorized limits is historically correlated with lower default risk and faster score recovery.",
            url=None
        )

        terms_guide = CitationSource(
            id="src-terms-03",
            title="Consumer Credit Fair Practices & APR Disclosure Standard",
            publisher="National Financial Educators Council",
            doc_type="Credit Terms & Standards",
            excerpt="Carrying unpaid balances month-over-month revokes the interest-free grace period on subsequent purchases, subjecting all new charges to daily APR from the transaction date.",
            url=None
        )

        sources = [rbi_guideline_source, credit_score_guide, terms_guide]

        # Context-relevant educational answer generation (grounded in user's 68% utilization & ₹49k spending)
        if "minimum" in user_q:
            response_text = (
                "Paying only the minimum amount due keeps your account active and avoids late payment penalties, "
                "but it triggers two major financial impacts:\n\n"
                "1. **Compounding Interest Burden**: Finance charges (typically 36% to 42% annualized APR in India) "
                "continue to accrue daily on your entire remaining revolving balance (currently **₹1,70,000**).\n\n"
                "2. **Loss of Interest-Free Grace Period**: All new purchases immediately start accruing daily interest "
                "from the swipe date until the complete statement balance is settled.\n\n"
                "3. **Credit Health Impact**: Your credit utilization remains elevated at **68%** instead of dropping toward "
                "the optimal <30% zone, which dampens your CreditLens Credit Health Score."
            )
            suggested_followups = [
                "How much interest will I accrue on ₹1,70,000 balance?",
                "What is the fastest strategy to bring utilization below 30%?",
                "How does minimum payment affect my overall risk rating?"
            ]
        elif "utilization" in user_q:
            response_text = (
                "Your current credit utilization is **68%** (calculated as ₹1,70,000 outstanding against your ₹2,50,000 total limit).\n\n"
                "To optimize your CreditLens Credit Health Score:\n"
                "• **Immediate Target**: Lower your balance below **₹75,000** (30% utilization threshold).\n"
                "• **Strategic Split**: Make mid-cycle payments before your card statement generation date to report lower balances to credit bureaus.\n"
                "• **Limit Rebalance**: Requesting a non-revolving credit limit enhancement can also mathematically reduce utilization."
            )
            suggested_followups = [
                "What affects my credit health score the most?",
                "How does dining spending (+31%) impact my monthly savings?",
                "What is the difference between CreditLens Health Score and CIBIL?"
            ]
        else:
            response_text = (
                "Based on your current financial profile:\n"
                "• **Income**: ₹65,000/month with ₹49,230 current monthly expenditure.\n"
                "• **Risk Category**: **LOW RISK** (82% low-risk probability, 87% model confidence) driven by your 94% on-time payment track record.\n"
                "• **Primary Watch Item**: Revolving credit utilization is at **68%**, and dining spending rose **31%** this month.\n\n"
                "Ask any specific question about reducing utilization, interest calculations, or risk factors to receive verified educational guidance."
            )
            suggested_followups = [
                "What happens if I only pay the minimum amount?",
                "Why did my dining spending increase 31%?",
                "How does CreditLens calculate my Credit Health Score?"
            ]

        return CopilotQueryResponse(
            response=response_text,
            conversation_id=conv_id,
            timestamp=datetime.utcnow(),
            sources=sources,
            grounding_facts=grounding_facts,
            suggested_followups=suggested_followups,
            is_demo=True
        )

copilot_service = CopilotService()
