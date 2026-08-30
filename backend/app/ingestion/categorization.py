"""
CreditLens Transaction Categorization Engine
Maps normalized merchants and narrations into a standard 16-category financial taxonomy.
Provides classification confidence score and method provenance.
"""
import re
from typing import Tuple
from app.ingestion.models import CategoryType, ClassificationMethod

# Direct high-confidence merchant mappings (Rule-Based)
MERCHANT_CATEGORY_RULES = {
    # Food & Dining
    "SWIGGY": "Food & Dining",
    "ZOMATO": "Food & Dining",
    "STARBUCKS": "Food & Dining",
    "MCDONALDS": "Food & Dining",
    "DOMINOS PIZZA": "Food & Dining",
    "BURGER KING": "Food & Dining",
    "CHAAYOS": "Food & Dining",
    "BLUE TOKAI COFFEE": "Food & Dining",
    "SUBWAY": "Food & Dining",
    "KFC": "Food & Dining",
    "CAFE COFFEE DAY": "Food & Dining",
    
    # Shopping
    "AMAZON": "Shopping",
    "FLIPKART": "Shopping",
    "MYNTRA": "Shopping",
    "AJIO": "Shopping",
    "NYKAA": "Shopping",
    "TATA CLIQ": "Shopping",
    "MEESHO": "Shopping",
    "ZARA": "Shopping",
    "H&M": "Shopping",
    "UNIQLO": "Shopping",
    "DECATHLON": "Shopping",
    "CROMA ELECTRONICS": "Shopping",
    "RELIANCE DIGITAL": "Shopping",
    
    # Transport
    "UBER": "Transport",
    "OLA CABS": "Transport",
    "RAPIDO": "Transport",
    "FASTAG TOLL": "Transport",
    "SHELL FUEL": "Transport",
    "HPCL FUEL": "Transport",
    "BPCL FUEL": "Transport",
    "IOCL FUEL": "Transport",
    
    # Entertainment
    "NETFLIX": "Entertainment",
    "SPOTIFY": "Entertainment",
    "AMAZON PRIME": "Entertainment",
    "DISNEY+ HOTSTAR": "Entertainment",
    "BOOKMYSHOW": "Entertainment",
    "YOUTUBE PREMIUM": "Entertainment",
    "APPLE SERVICES": "Entertainment",
    "GOOGLE PLAY / CLOUD": "Entertainment",
    
    # Groceries
    "BLINKIT": "Groceries",
    "ZEPTO": "Groceries",
    "SWIGGY INSTAMART": "Groceries",
    "BIGBASKET": "Groceries",
    "DMART": "Groceries",
    "NATURES BASKET": "Groceries",
    
    # Healthcare
    "APOLLO PHARMACY": "Healthcare",
    "PHARMEASY": "Healthcare",
    "TATA 1MG": "Healthcare",
    "MEDPLUS PHARMACY": "Healthcare",
    "CULT.FIT GYM": "Healthcare",
    "MAX HEALTHCARE": "Healthcare",
    "FORTIS HOSPITAL": "Healthcare",
    
    # Utilities
    "AIRTEL": "Utilities",
    "RELIANCE JIO": "Utilities",
    "VI TELECOM": "Utilities",
    "TATA POWER": "Utilities",
    "BESCOM ELECTRICITY": "Utilities",
    "MAHADISCOM ELECTRICITY": "Utilities",
    "ADANI ELECTRICITY": "Utilities",
    "IGL GAS": "Utilities",
    
    # Travel
    "IRCTC": "Travel",
    "MAKEMYTRIP": "Travel",
    "INDIGO AIRLINES": "Travel",
    "AIR INDIA": "Travel",
    "GOIBIBO": "Travel",
    "AIRBNB": "Travel",
    
    # Financial / Loans / Income
    "CRED CLUB": "EMI / Loan",
    "HDFC BANK LOAN": "EMI / Loan",
    "SBI LOAN": "EMI / Loan",
    "ICICI BANK LOAN": "EMI / Loan",
    "SALARY CREDIT": "Salary / Income",
    "PAYROLL CREDIT": "Salary / Income",
    "ATM CASH WITHDRAWAL": "Cash Withdrawal",
}

# Regex pattern keywords for fallback taxonomy classification
KEYWORD_PATTERNS = [
    (r"\b(RESTAURANT|CAFE|DINER|PIZZA|BURGER|BIRYANI|BAKERY|SWEETS|SWIGGY|ZOMATO|BAR|PUB|BREWERY)\b", "Food & Dining", 0.92),
    (r"\b(GROCERY|SUPERMARKET|HYPERMARKET|PROVISION|VEGETABLES|FRUITS|BLINKIT|ZEPTO|INSTAMART|BIGBASKET|DMART)\b", "Groceries", 0.92),
    (r"\b(SHOPPING|APPAREL|CLOTHING|SHOES|FOOTWEAR|JEWELLERY|ELECTRONICS|MALL|FASHION|AMAZON|FLIPKART|MYNTRA)\b", "Shopping", 0.90),
    (r"\b(CAB|TAXI|AUTO|METRO|BUS|FUEL|PETROL|DIESEL|TOLL|PARKING|UBER|OLA|RAPIDO|FASTAG|PETROLEUM)\b", "Transport", 0.92),
    (r"\b(FLIGHT|AIRLINE|HOTEL|RESORT|HOMESTAY|TRAIN|IRCTC|RAILWAY|BOOKING|MAKEMYTRIP|AIRBNB|TRAVEL)\b", "Travel", 0.90),
    (r"\b(NETFLIX|SPOTIFY|HOTSTAR|CINEMA|MOVIE|THEATRE|SHOW|TICKET|STREAMING|ENTERTAINMENT|DISNEY)\b", "Entertainment", 0.94),
    (r"\b(PHARMACY|MEDICINE|HOSPITAL|CLINIC|LAB|DIAGNOSTICS|DOCTOR|HEALTHCARE|DENTAL|FITNESS|GYM)\b", "Healthcare", 0.92),
    (r"\b(ELECTRICITY|WATER|GAS|INTERNET|BROADBAND|WIFI|MOBILE|RECHARGE|POSTPAID|PREPAID|DTH|UTILITY)\b", "Utilities", 0.92),
    (r"\b(RENT|MAINTENANCE|SOCIETY|HOUSING|APARTMENT|LANDLORD|LEASE)\b", "Rent & Housing", 0.94),
    (r"\b(SCHOOL|COLLEGE|UNIVERSITY|TUITION|EXAM|FEES|COURSE|UDEMY|COURSERA|EDUCATION|BOOKS)\b", "Education", 0.92),
    (r"\b(INSURANCE|PREMIUM|LIC|HDFC LIFE|ICICI PRU|MAX LIFE|STAR HEALTH|POLICYBAZAAR)\b", "Insurance", 0.95),
    (r"\b(SALARY|PAYROLL|STIPEND|BONUS|DIVIDEND|INTEREST\s+CREDIT|DIRECT\s+DEPOSIT)\b", "Salary / Income", 0.98),
    (r"\b(EMI|LOAN|REPAYMENT|INSTALLMENT|HOME\s+LOAN|AUTO\s+LOAN|PERSONAL\s+LOAN|CRED\b|MORTGAGE)\b", "EMI / Loan", 0.95),
    (r"\b(ATM\s+WDL|CASH\s+WITHDRAWAL|ATM\s+DEBIT)\b", "Cash Withdrawal", 0.98),
    (r"\b(TRANSFER|SELF\s+TRANSFER|NEFT|IMPS|RTGS|UPI\s+TRANSFER)\b", "Transfer", 0.85),
]

def categorize_transaction(
    normalized_merchant: str,
    original_narration: str,
    transaction_type: str = "debit"
) -> Tuple[CategoryType, float, ClassificationMethod]:
    """
    Determines category taxonomy, confidence score, and method provenance for a transaction.
    """
    # 1. Check for salary/income by transaction type and keywords
    upper_narration = original_narration.upper()
    if transaction_type == "credit":
        if any(term in upper_narration for term in ["SALARY", "PAYROLL", "ACH SALARY", "DIRECT DEP"]):
            return "Salary / Income", 0.98, "merchant_rule"
        if any(term in upper_narration for term in ["INTEREST", "DIVIDEND", "REFUND", "CASHBACK"]):
            return "Salary / Income", 0.92, "keyword_pattern"
        return "Transfer", 0.85, "fallback_default"

    # 2. Check direct merchant rule table
    norm_upper = normalized_merchant.upper()
    if norm_upper in MERCHANT_CATEGORY_RULES:
        return MERCHANT_CATEGORY_RULES[norm_upper], 0.98, "merchant_rule"

    for merchant_key, cat in MERCHANT_CATEGORY_RULES.items():
        if merchant_key in norm_upper or merchant_key in upper_narration:
            return cat, 0.95, "merchant_rule"

    # 3. Check regex keyword patterns across both normalized and raw narrations
    full_search_text = f"{norm_upper} {upper_narration}"
    for pat, category, conf in KEYWORD_PATTERNS:
        if re.search(pat, full_search_text, flags=re.IGNORECASE):
            return category, conf, "keyword_pattern"

    # 4. Fallback Default
    return "Other", 0.50, "fallback_default"
