"""
CreditLens Transaction Normalization Engine
Normalizes raw banking statement narrations into canonical merchant identities.
Preserves original description for auditability while removing payment gateway noise.
"""
import re
from typing import Tuple

# Common gateway and payment prefix patterns to strip
PREFIX_STRIP_PATTERNS = [
    r"^UPI[-/:]\s*",
    r"^IMPS[-/:]\s*",
    r"^NEFT[-/:]\s*",
    r"^RTGS[-/:]\s*",
    r"^ACH[-/:]\s*",
    r"^POS\s+\d+[-/:]\s*",
    r"^POS\s+",
    r"^E-COMM\s+",
    r"^BILLDESK\s+[-/:]\s*",
    r"^RAZORPAY\s*[*_]?\s*",
    r"^PAYU\s*[*_]?\s*",
    r"^CC\s+PAYMENT\s+[-/:]\s*",
]

# Common corporate suffixes and web domains to remove from merchant identity
SUFFIX_STRIP_PATTERNS = [
    r"\*ONLINE",
    r"\*MKTPLACE",
    r"\*MARKETPLACE",
    r"\.COM(\.IN)?",
    r"\s+INDIA\s+PVT\s+LTD",
    r"\s+PVT\s+LTD",
    r"\s+PRIVATE\s+LIMITED",
    r"\s+LIMITED",
    r"\s+LTD",
    r"\s+LLC",
    r"\s+INC",
    r"\s+CORP",
    r"\s+PAY",
    r"\s+INTERNET",
    r"\s+TECHNOLOGIES",
    r"\s+SERVICES",
    r"\s+RETAIL",
]

# Canonical known merchant dictionary for high-precision entity resolution
KNOWN_MERCHANTS = {
    # Food & Dining
    "SWIGGY": "SWIGGY",
    "ZOMATO": "ZOMATO",
    "STARBUCKS": "STARBUCKS",
    "MCDONALD": "MCDONALDS",
    "DOMINOS": "DOMINOS PIZZA",
    "BURGER KING": "BURGER KING",
    "CHAAYOS": "CHAAYOS",
    "BLUE TOKAI": "BLUE TOKAI COFFEE",
    "SUBWAY": "SUBWAY",
    "KFC": "KFC",
    
    # Shopping & E-Commerce
    "AMAZON": "AMAZON",
    "AMZN": "AMAZON",
    "FLIPKART": "FLIPKART",
    "MYNTRA": "MYNTRA",
    "AJIO": "AJIO",
    "NYKAA": "NYKAA",
    "TATA CLIQ": "TATA CLiQ",
    "MEESHO": "MEESHO",
    "ZARA": "ZARA",
    "H&M": "H&M",
    "UNIQLO": "UNIQLO",
    "DECATHLON": "DECATHLON",
    "CROMA": "CROMA ELECTRONICS",
    "RELIANCE DIGITAL": "RELIANCE DIGITAL",
    
    # Transport & Travel
    "UBER": "UBER",
    "OLA": "OLA CABS",
    "RAPIDO": "RAPIDO",
    "IRCTC": "IRCTC",
    "MAKEMYTRIP": "MAKEMYTRIP",
    "INDIGO": "INDIGO AIRLINES",
    "AIR INDIA": "AIR INDIA",
    "FASTAG": "FASTAG TOLL",
    "SHELL": "SHELL FUEL",
    "HPCL": "HPCL FUEL",
    "BPCL": "BPCL FUEL",
    "IOCL": "IOCL FUEL",
    
    # Entertainment & Subscriptions
    "NETFLIX": "NETFLIX",
    "SPOTIFY": "SPOTIFY",
    "PRIME VIDEO": "AMAZON PRIME",
    "DISNEY": "DISNEY+ HOTSTAR",
    "HOTSTAR": "DISNEY+ HOTSTAR",
    "BOOKMYSHOW": "BOOKMYSHOW",
    "YOUTUBE": "YOUTUBE PREMIUM",
    "APPLE": "APPLE SERVICES",
    "GOOGLE": "GOOGLE PLAY / CLOUD",
    
    # Groceries
    "BLINKIT": "BLINKIT",
    "ZEPTO": "ZEPTO",
    "INSTAMART": "SWIGGY INSTAMART",
    "BIGBASKET": "BIGBASKET",
    "DMART": "DMART",
    "NATURES BASKET": "NATURES BASKET",
    
    # Healthcare & Wellness
    "APOLLO": "APOLLO PHARMACY",
    "PHARMEASY": "PHARMEASY",
    "1MG": "TATA 1MG",
    "MEDPLUS": "MEDPLUS PHARMACY",
    "CULT.FIT": "CULT.FIT GYM",
    "CULTFIT": "CULT.FIT GYM",
    "MAX HEALTHCARE": "MAX HEALTHCARE",
    "FORTIS": "FORTIS HOSPITAL",
    
    # Utilities & Bills
    "AIRTEL": "AIRTEL",
    "JIO": "RELIANCE JIO",
    "VODAFONE": "VI TELECOM",
    "TATA POWER": "TATA POWER",
    "BESCOM": "BESCOM ELECTRICITY",
    "MAHADISCOM": "MAHADISCOM ELECTRICITY",
    "ADANI ELECTRICITY": "ADANI ELECTRICITY",
    "INDRAPRASTHA GAS": "IGL GAS",
    
    # Financial & Banking
    "CRED": "CRED CLUB",
    "HDFC LOAN": "HDFC BANK LOAN",
    "SBI LOAN": "SBI LOAN",
    "ICICI LOAN": "ICICI BANK LOAN",
    "SALARY": "SALARY CREDIT",
    "PAYROLL": "PAYROLL CREDIT",
    "ATM WDL": "ATM CASH WITHDRAWAL",
}

def normalize_merchant(raw_narration: str) -> str:
    """
    Cleans raw banking transaction narration into a normalized merchant name.
    """
    if not raw_narration or not raw_narration.strip():
        return "UNKNOWN MERCHANT"

    text = raw_narration.upper().strip()

    # Step 1: Strip standard payment gateway / rail prefixes
    for pat in PREFIX_STRIP_PATTERNS:
        text = re.sub(pat, "", text, flags=re.IGNORECASE).strip()

    # Step 2: Check for canonical merchant match in known merchant catalog
    for key, canonical_name in KNOWN_MERCHANTS.items():
        if re.search(r"\b" + re.escape(key) + r"\b", text) or key in text:
            return canonical_name

    # Step 3: Strip noise suffixes and web domains
    for pat in SUFFIX_STRIP_PATTERNS:
        text = re.sub(pat, "", text, flags=re.IGNORECASE).strip()

    # Step 4: Remove trailing transaction reference numbers, IDs, and location codes
    # e.g., "CAFE COFFEE DAY BLR 560001" -> "CAFE COFFEE DAY"
    text = re.sub(r"/\s*[A-Z0-9_-]+$", "", text)
    text = re.sub(r"\b\d{6,}\b", "", text) # strip long transaction ref numbers
    text = re.sub(r"\s+", " ", text).strip()

    # If reduced to empty, fallback to truncated raw narration
    if len(text) < 2:
        return raw_narration.strip()[:30]

    return text[:40].title()
