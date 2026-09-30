"""
KBC Community Intelligence Database
Aggregated, anonymized statistical benchmarks derived from millions of KBC customer journeys.
These benchmarks fuel the AI recommendation engine with real peer behaviors.
"""

from typing import Dict, Any

KBC_COMMUNITY_BENCHMARKS: Dict[str, Any] = {
    "INTERNATIONAL_TRAVEL": {
        "JP": {
            "countryName": "Japan",
            "currency": "JPY",
            "avgDailySpendEUR": 115.00,
            "cashVsCardRatio": "40% Cash / 60% Card (Many local ramen bars, shrines, and metro kiosks are cash-only)",
            "communityStats": {
                "cardNonEuActivationRate": "86% of KBC travelers activate Non-EU debit card access 7-14 days before departure.",
                "currencyPreOrderRate": "68% pre-order ¥30,000-¥50,000 JPY cash in KBC Mobile to avoid high airport exchange fees.",
                "travelInsuranceRate": "92% travel with KBC Global Travel Assistance for high medical coverage in Asia."
            }
        },
        "GB": {
            "countryName": "United Kingdom",
            "currency": "GBP",
            "avgDailySpendEUR": 140.00,
            "cashVsCardRatio": "5% Cash / 95% Card (London is virtually cashless)",
            "communityStats": {
                "currencyWallet": "79% of Belgian travelers to London hold GBP in multi-currency to avoid dynamic FX fees on transport & contactless.",
                "travelRoaming": "91% activate UK data roaming packages or use KBC Deals partner eSIMs."
            }
        },
        "CH": {
            "countryName": "Switzerland",
            "currency": "CHF",
            "avgDailySpendEUR": 160.00,
            "cashVsCardRatio": "10% Cash / 90% Card",
            "communityStats": {
                "vignettePreOrder": "74% buy the Swiss e-Vignette directly via KBC Deals/Mobility tab.",
                "currencyWallet": "81% utilize KBC multi-currency live conversion to lock in favorable exchange rates."
            }
        }
    },
    "EUROPEAN_TRAVEL": {
        "PT": {
            "countryName": "Portugal",
            "currency": "EUR",
            "avgDailySpendEUR": 75.00,
            "communityStats": {
                "cashbackRate": "94% use KBC Deals for 4-8% cashback on Booking.com & Ryanair car rentals.",
                "flightDelayProtection": "62% activate automatic Flight Delay Instant Compensation."
            }
        },
        "GR": {
            "countryName": "Greece",
            "currency": "EUR",
            "avgDailySpendEUR": 130.00,
            "communityStats": {
                "cardLimitBuffer": "83% of yacht charterers temporarily raise credit card limits by €2,500 for marina security deposits.",
                "boatingAssistance": "89% verify maritime assistance coverage under KBC Family Insurance."
            }
        }
    },
    "BIRTHDAY_MILESTONE": {
        "milestone25": {
            "avgCelebrationBudgetEUR": 380.00,
            "communityStats": {
                "groupPotUsage": "79% of 20-30yo KBC customers create a KBC 'Group Pot' (Cadeaupot) for sharing party costs and group gifts.",
                "cashbackSavings": "Average €28 saved by booking event venues and catering through KBC Deals partners."
            }
        }
    },
    "FESTIVAL_ENTERTAINMENT": {
        "rock_werchter": {
            "avgFestivalSpendEUR": 310.00,
            "communityStats": {
                "coinPreloading": "65% of festival attendees use contactless wristband auto-topup via KBC Mobile.",
                "safeCardLimit": "88% set a temporary daily ATM limit to avoid overspending at festival grounds."
            }
        }
    },
    "HOME_PURCHASE_NOTARY": {
        "notary_milestone": {
            "avgRenovationBufferEUR": 18500.00,
            "communityStats": {
                "renovationAccount": "91% of buyers open a dedicated KBC Renovation Savings Account with automated contractor invoice validation.",
                "homeInsurance": "100% of mortgage holders bundle KBC Fire & Family Insurance before official deed transfer."
            }
        }
    },
    "SUSTAINABILITY_INVESTMENT": {
        "solar_heatpump": {
            "avgInvestmentEUR": 16500.00,
            "communityStats": {
                "greenLoan": "82% finance green home improvements via the KBC Green Energy Loan at a reduced interest rate.",
                "subsidies": "Average €2,100 reclaimed in Flemish energy transition subsidies through KBC's automated grant scanner."
            }
        }
    },
    "FAMILY_MILESTONE": {
        "junior_growth": {
            "avgMonthlyContributionEUR": 85.00,
            "communityStats": {
                "investPlan": "76% of grandparents choose KBC Junior Growth Investment over traditional low-yield savings books.",
                "maturityValue": "Projected €28,400 at age 18 based on historical 5.2% annualized growth."
            }
        }
    },
    "HEALTH_MEDICAL": {
        "hospitalization": {
            "communityStats": {
                "mediAssistance": "93% register planned hospital admissions via KBC Medi-Assistance for direct third-party payment.",
                "dentalCoverage": "71% with children aged 8-14 utilize KBC Dentalia supplementary benefits."
            }
        }
    },
    "BUSINESS_TAX": {
        "corporate_quarterly": {
            "communityStats": {
                "taxBufferAccount": "87% of Flemish SMEs utilize automated tax buffer accounts to earn interest on VAT reserves before payout.",
                "advisorSync": "74% share automated digital bank statements with their accountant via KBC Corporate Cloud."
            }
        }
    }
}
