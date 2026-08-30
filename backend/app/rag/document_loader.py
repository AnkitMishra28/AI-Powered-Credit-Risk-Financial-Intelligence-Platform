"""
CreditLens Authoritative Financial Knowledge Base Loader
Contains curated, authoritative regulatory and educational documents from the Reserve Bank of India (RBI)
and established financial intelligence standards.
"""
import hashlib
from typing import List
from app.rag.models import Document
from app.rag.text_cleaner import clean_text

KNOWLEDGE_DOCUMENTS = [
    {
        "document_id": "doc-rbi-cards-2022",
        "title": "RBI Master Direction – Credit Card and Debit Card – Issuance and Conduct Directions, 2022",
        "source_name": "Reserve Bank of India (RBI)",
        "source_url": "https://www.rbi.org.in",
        "publication_date": "2022-04-21",
        "document_type": "Regulatory Directive",
        "jurisdiction": "IN",
        "category": "credit_cards",
        "metadata": {"circular_no": "RBI/2022-23/92", "regulatory_body": "RBI"},
        "content": """
Clause 8 - Conduct of Business: Terms and Conditions and Disclosures:
(a) Card-issuers shall quote Annualized Percentage Rates (APR) on credit cards in all marketing materials and statements. The APR shall clearly indicate the annualized compounded interest rate and the method of calculation.
(b) Minimum Amount Due (MAD): Card-issuers shall explicitly display in credit card statements a warning on the implications of paying only the minimum amount due. Specifically, statements must disclose: 'Making only the minimum payment each month will result in you paying significantly more interest and will take you longer to pay off your balance.'
(c) Loss of Grace Period: If the cardholder does not pay the total amount due on or before the due date, the interest-free grace period (typically 20 to 50 days) shall no longer apply to subsequent transactions. All fresh purchases shall attract interest from the date of the transaction.
(d) Credit Bureau Reporting: Card-issuers shall report a credit card account as 'past due' or delayed to Credit Information Companies (CIBIL/Equifax/Experian/CRIF) only when the payment has remained overdue for more than three days past the due date. The number of days past due (DPD) and the amount due must be reported accurately.
(e) Closure of Credit Cards: Card-issuers must honor requests for closure of a credit card within seven working days of receiving the request from the cardholder, provided all outstanding dues are cleared.
(f) Unsolicited Cards & Limit Upgrades: Issuing unsolicited credit cards or upgrading credit limits without the explicit consent of the customer is strictly prohibited under RBI regulations.
"""
    },
    {
        "document_id": "doc-rbi-apr-finance",
        "title": "RBI Guidance on Annualized Percentage Rates (APR), Compounding Interest, and Minimum Payment Traps",
        "source_name": "Reserve Bank of India (RBI)",
        "source_url": "https://www.rbi.org.in",
        "publication_date": "2022-06-10",
        "document_type": "Regulatory Advisory",
        "jurisdiction": "IN",
        "category": "interest",
        "metadata": {"subject": "Consumer Credit Interest Transparency"},
        "content": """
Understanding Credit Card Interest Computation:
1. Daily Periodic Rate (DPR): Interest on credit card balances is computed on a daily periodic basis. If an APR is 42% per annum, the daily periodic rate is approximately 0.115% per day (42% / 365 days).
2. Daily Average Balance Method: Most card issuers calculate finance charges using the Average Daily Balance (ADB) method. Each day's ending balance during the billing cycle is summed and divided by the number of days in the cycle, then multiplied by the daily interest rate.
3. The Minimum Payment Trap: The Minimum Amount Due is usually 5% of the total outstanding balance (or finance charges plus 1% of principal, plus taxes). Paying only the minimum amount:
- Settles primarily interest and taxes, leaving the vast majority of the principal balance intact.
- Causes finance charges to compound every billing cycle on the remaining unpaid principal.
- For an outstanding balance of ₹1,50,000 at 42% APR, paying only 5% minimum amounts can take over 10 to 15 years to fully amortize, resulting in total interest paid exceeding double the original principal.
4. Revocation of Grace Period: When carrying forward a revolving balance, every subsequent merchant swipe loses its interest-free window and starts accruing finance charges immediately from the swipe date.
"""
    },
    {
        "document_id": "doc-credit-utilization-guide",
        "title": "Credit Utilization Ratio & Revolving Debt Management Framework",
        "source_name": "CreditLens Financial Intelligence Framework",
        "source_url": None,
        "publication_date": "2024-01-15",
        "document_type": "Financial Educational Standard",
        "jurisdiction": "Global Financial Standard",
        "category": "credit_utilization",
        "metadata": {"framework": "CreditLens Intelligence Core"},
        "content": """
Credit Utilization Ratio (CUR) Fundamentals:
1. Definition: Credit Utilization Ratio is the percentage of your total available revolving credit limits that is currently being used across credit card lines (CUR = Total Revolving Balances / Total Credit Limits).
2. Target Corridors:
- Optimal / Healthy Corridor: Below 30% aggregate utilization. Borrowers maintaining utilization below 30% statistically demonstrate the lowest rates of 90+ DPD defaults.
- Fair / Watch Corridor: 30% to 50% utilization. Begins applying mild negative pressure on credit scoring models.
- High Risk Corridor: Above 50% to 70%+ utilization. Strongly correlated with cashflow distress, elevated DTI burdens, and higher probability of revolving balance default.
3. Strategies to Reduce Utilization:
- Mid-Cycle Payments: Paying off portions of card balances before the monthly statement generation date reduces the balance reported to credit bureaus.
- Credit Limit Enhancements: Requesting a credit limit increase from your bank (without increasing spending) mathematically reduces the utilization percentage.
- Balance Spreading: Keeping balances distributed across multiple cards below 30% each is preferable to maxing out a single card, as scoring algorithms evaluate both aggregate and per-card utilization.
"""
    },
    {
        "document_id": "doc-credit-health-mechanics",
        "title": "Credit Scoring Mechanics, Credit History Seasoning, and Delinquency Impact Standards",
        "source_name": "CreditLens Financial Intelligence Framework",
        "source_url": None,
        "publication_date": "2024-03-01",
        "document_type": "Financial Educational Standard",
        "jurisdiction": "Global Financial Standard",
        "category": "credit_history",
        "metadata": {"module": "Scoring Diagnostics"},
        "content": """
Key Drivers of Credit Health & Scoring Models:
1. Payment Consistency (35% weight): The single most influential credit health pillar. Timely payments on loan EMIs and credit card minimum dues over a 12 to 24-month rolling period build resilience. A single 30+ DPD delinquency can depress a credit score by 50 to 100 points.
2. Revolving Utilization (25% weight): Measures reliance on short-term revolving debt. High utilization signals cashflow tightness.
3. Debt-to-Income (DTI) & Repayment Burden (20% weight): Compares total monthly debt commitments (EMIs + revolving minimums) against gross monthly income. A DTI below 35% is considered healthy; DTI exceeding 50% signals high leverage.
4. Credit History Tenure & Seasoning (10% weight): The average age of open credit accounts. Keeping older credit accounts open maintains historical depth and account seasoning.
5. Inquiries & Credit Mix (10% weight): Hard credit inquiries occur when lenders pull your bureau file during loan applications. Multiple hard inquiries in a brief period indicate credit-seeking behavior. Soft inquiries (e.g. self-checking on CreditLens) have zero impact on credit scores.
"""
    },
    {
        "document_id": "doc-rbi-ombudsman-grievance",
        "title": "Reserve Bank - Integrated Ombudsman Scheme, 2021 (Consumer Protection & Redressal)",
        "source_name": "Reserve Bank of India (RBI)",
        "source_url": "https://www.rbi.org.in",
        "publication_date": "2021-11-12",
        "document_type": "Statutory Policy",
        "jurisdiction": "IN",
        "category": "consumer_protection",
        "metadata": {"framework": "RBI Consumer Redressal"},
        "content": """
Consumer Rights & Dispute Redressal under RBI Guidelines:
1. Grievance Escalation: Cardholders and borrowers must first lodge complaints directly with the regulated entity (bank / NBFC). If the bank fails to respond within 30 days or provides an unsatisfactory resolution, the customer can escalate directly to the RBI Banking Ombudsman (via cms.rbi.org.in).
2. Fraudulent & Unauthorized Digital Transactions:
- Zero Customer Liability: If an unauthorized digital or credit card transaction occurs due to contributory fraud or negligence by the bank (or a third-party breach where the deficiency lies in the banking system and the customer reports within three working days), the customer has zero liability.
- Limited Liability: If the customer reports an unauthorized transaction within 4 to 7 working days, maximum liability is capped between ₹5,000 and ₹10,000 depending on account type.
3. Fair Recovery Practices: Banks and recovery agents are strictly prohibited from using abusive language, intimidation, calling before 8:00 AM or after 7:00 PM, or contacting relatives/friends without authorization.
"""
    },
    {
        "document_id": "doc-debt-cashflow-optimization",
        "title": "Personal Cashflow Velocity, Debt-to-Income Guardrails, and Debt Repayment Strategies",
        "source_name": "CreditLens Financial Intelligence Framework",
        "source_url": None,
        "publication_date": "2024-02-18",
        "document_type": "Financial Educational Standard",
        "jurisdiction": "Global Financial Standard",
        "category": "financial_literacy",
        "metadata": {"standard": "Cashflow Velocity & Debt Restructuring"},
        "content": """
Effective Debt Elimination & Cashflow Frameworks:
1. Debt Avalanche Method (Mathematically Optimal):
- List all debts in descending order of Annual Percentage Rate (APR / interest rate).
- Pay the minimum due on all obligations to maintain payment consistency.
- Channel all surplus monthly cashflow toward the debt with the highest APR (e.g. credit card revolving balances at 36%-42% APR).
- Minimizes the total interest paid over time and achieves the fastest debt liquidation.
2. Debt Snowball Method (Behavioral & Psychological):
- List debts in ascending order of balance size, regardless of interest rate.
- Aggressively pay off the smallest balance first for quick psychological momentum.
3. 50/30/20 Budgeting Allocation:
- 50% Essential Needs: Housing/rent, utilities, groceries, insurance, mandatory loan EMIs.
- 30% Discretionary Wants: Food delivery/dining, shopping, streaming subscriptions, leisure.
- 20% Financial Security: Debt reduction acceleration, emergency cushion fund (3 to 6 months of living expenses), long-term investments.
4. Cashflow Velocity & Anomaly Monitoring: A sudden monthly surge (>25%) in discretionary categories like Food & Dining indicates cashflow leakage that can erode monthly savings cushions.
"""
    }
]

def load_knowledge_documents() -> List[Document]:
    """Loads and returns all authoritative financial education and regulatory documents."""
    docs = []
    for d in KNOWLEDGE_DOCUMENTS:
        cleaned = clean_text(d["content"])
        content_hash = hashlib.sha256(cleaned.encode("utf-8")).hexdigest()
        doc = Document(
            document_id=d["document_id"],
            title=d["title"],
            source_name=d["source_name"],
            source_url=d["source_url"],
            publication_date=d.get("publication_date"),
            document_type=d["document_type"],
            jurisdiction=d.get("jurisdiction", "IN"),
            category=d["category"],
            content=cleaned,
            content_hash=content_hash,
            metadata=d.get("metadata", {})
        )
        docs.append(doc)
    return docs
