"""
KBC LifeSync - Multi-User Profiles with Dual-Signal Streams (Agenda + Transactions)
Contains 4 distinct personas with 6 agenda events and rich banking transaction logs.
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any

NOW = datetime.now()

USERS_DATA: List[Dict[str, Any]] = [
    # =========================================================================
    # PERSONA 1: Thomas Dubois (28, Software Engineer in Ghent)
    # =========================================================================
    {
        "userId": "user_thomas",
        "name": "Thomas Dubois",
        "age": 28,
        "city": "Ghent",
        "occupation": "Software Engineer",
        "segment": "Young Professional / Frequent Traveler",
        "financialSnapshot": {
            "checkingBalance": 3450.75,
            "savingsBalance": 18200.00,
            "monthlyIncome": 3100.00,
            "hasTravelInsurance": False,
            "cardNonEuActive": False,
            "currencyWallets": ["EUR"],
            "creditCardLimit": 2500.00
        },
        "transactions": [
            {
                "id": "tx_th_101",
                "date": (NOW - timedelta(days=6)).replace(hour=14, minute=22).isoformat(),
                "merchant": "ANA All Nippon Airways",
                "mccCategory": "AIRLINES",
                "amount": 1150.00,
                "currency": "EUR",
                "type": "DEBIT_CARD",
                "description": "Flight Brussels (BRU) - Tokyo Haneda (HND) Roundtrip",
                "status": "COMPLETED",
                "matchedEventId": "thomas_evt_1"
            },
            {
                "id": "tx_th_102",
                "date": (NOW - timedelta(days=4)).replace(hour=19, minute=10).isoformat(),
                "merchant": "Airbnb Payments UK",
                "mccCategory": "ACCOMMODATION",
                "amount": 840.00,
                "currency": "EUR",
                "type": "CREDIT_CARD",
                "description": "7 nights traditional Machiya in Kyoto",
                "status": "COMPLETED",
                "matchedEventId": "thomas_evt_1"
            },
            {
                "id": "tx_th_103",
                "date": (NOW - timedelta(days=1)).replace(hour=12, minute=45).isoformat(),
                "merchant": "Eurostar International Ltd",
                "mccCategory": "RAILWAYS",
                "amount": 145.00,
                "currency": "EUR",
                "type": "DEBIT_CARD",
                "description": "Brussels Midi to London St Pancras Standard Premier",
                "status": "COMPLETED",
                "matchedEventId": "thomas_evt_5"
            },
            {
                "id": "tx_th_104",
                "date": (NOW - timedelta(days=10)).replace(hour=16, minute=30).isoformat(),
                "merchant": "Energy Lab Ghent",
                "mccCategory": "SPORTS_RECREATION",
                "amount": 45.00,
                "currency": "EUR",
                "type": "BANCONTACT",
                "description": "Ghent Half Marathon 2026 Registration Ticket",
                "status": "COMPLETED",
                "matchedEventId": "thomas_evt_4"
            },
            {
                "id": "tx_th_105",
                "date": (NOW - timedelta(days=18)).replace(hour=21, minute=15).isoformat(),
                "merchant": "Otomat Ghent",
                "mccCategory": "RESTAURANTS",
                "amount": 112.50,
                "currency": "EUR",
                "type": "BANCONTACT",
                "description": "Previous Ghent Foodies group dinner (split via Payconiq)",
                "status": "COMPLETED",
                "matchedEventId": "thomas_evt_2"
            }
        ],
        "agenda": [
            {
                "id": "thomas_evt_1",
                "title": "Vacation: Trip to Tokyo & Kyoto 🇯🇵",
                "category": "INTERNATIONAL_TRAVEL",
                "frequency": "INFREQUENT_MAJOR",
                "location": "Tokyo & Kyoto, Japan",
                "country": "JP",
                "destinationCurrency": "JPY",
                "isNonEurozone": True,
                "startDate": (NOW + timedelta(days=14)).replace(hour=10, minute=0).isoformat(),
                "endDate": (NOW + timedelta(days=28)).replace(hour=18, minute=0).isoformat(),
                "durationDays": 14,
                "participants": ["thomas.dubois@gmail.com", "laura.v@outlook.com"],
                "notes": "14-day holiday. Flights with ANA. Need yen cash for temples, ramen bars, and JR train pass."
            },
            {
                "id": "thomas_evt_2",
                "title": "Ghent Foodies Monthly Group Dinner 🍕",
                "category": "SOCIAL_DINING",
                "frequency": "FREQUENT_MONTHLY",
                "location": "Otomat Ghent, Belgium",
                "country": "BE",
                "destinationCurrency": "EUR",
                "isNonEurozone": False,
                "startDate": (NOW + timedelta(days=3)).replace(hour=19, minute=30).isoformat(),
                "endDate": (NOW + timedelta(days=3)).replace(hour=22, minute=30).isoformat(),
                "durationDays": 0,
                "participants": ["thomas.dubois@gmail.com", "sarah.m@gmail.com", "arne.d@telenet.be", "elena.k@gmail.com"],
                "notes": "Thomas pays table total. Auto-split via Payconiq / KBC Split Bill with 4 friends."
            },
            {
                "id": "thomas_evt_3",
                "title": "Annual Car Technical Inspection (Autokeuring) 🚗",
                "category": "MOBILITY_MAINTENANCE",
                "frequency": "ANNUAL",
                "location": "SBAT Keuring Nazareth, Belgium",
                "country": "BE",
                "destinationCurrency": "EUR",
                "isNonEurozone": False,
                "startDate": (NOW + timedelta(days=21)).replace(hour=8, minute=30).isoformat(),
                "endDate": (NOW + timedelta(days=21)).replace(hour=10, minute=0).isoformat(),
                "durationDays": 0,
                "participants": ["thomas.dubois@gmail.com"],
                "notes": "Annual mandatory inspection for VW Golf. Check green insurance card validity."
            },
            {
                "id": "thomas_evt_4",
                "title": "Ghent Half Marathon 🏃‍♂️",
                "category": "SPORTS_EVENT",
                "frequency": "SEMI_ANNUAL",
                "location": "Topsporthal Vlaanderen, Ghent",
                "country": "BE",
                "destinationCurrency": "EUR",
                "isNonEurozone": False,
                "startDate": (NOW + timedelta(days=35)).replace(hour=9, minute=0).isoformat(),
                "endDate": (NOW + timedelta(days=35)).replace(hour=13, minute=0).isoformat(),
                "durationDays": 0,
                "participants": ["thomas.dubois@gmail.com", "runclub@gent.be"],
                "notes": "Entry fee €45 paid. Need new running shoes (KBC Deals Decathlon cashback)."
            },
            {
                "id": "thomas_evt_5",
                "title": "Tech Conference London (QCon London) 🇬🇧",
                "category": "INTERNATIONAL_TRAVEL",
                "frequency": "INFREQUENT_BUSINESS",
                "location": "QEII Centre, London, UK",
                "country": "GB",
                "destinationCurrency": "GBP",
                "isNonEurozone": True,
                "startDate": (NOW + timedelta(days=50)).replace(hour=8, minute=0).isoformat(),
                "endDate": (NOW + timedelta(days=53)).replace(hour=20, minute=0).isoformat(),
                "durationDays": 3,
                "participants": ["thomas.dubois@work.be", "team-lead@work.be"],
                "notes": "Eurostar booked. Hotel in Westminster. Need British Pound spending without dynamic FX markups."
            },
            {
                "id": "thomas_evt_6",
                "title": "Home Telecom & Fiber Contract Renewal 🌐",
                "category": "RECURRING_UTILITY",
                "frequency": "ANNUAL",
                "location": "Home Ghent",
                "country": "BE",
                "destinationCurrency": "EUR",
                "isNonEurozone": False,
                "startDate": (NOW + timedelta(days=12)).replace(hour=14, minute=0).isoformat(),
                "endDate": (NOW + timedelta(days=12)).replace(hour=15, minute=0).isoformat(),
                "durationDays": 0,
                "participants": ["thomas.dubois@gmail.com"],
                "notes": "Evaluate current €65/mo fiber package vs new partner deals in KBC Deals."
            }
        ]
    },

    # =========================================================================
    # PERSONA 2: Emma Van de Velde (24, Master Student in Leuven)
    # =========================================================================
    {
        "userId": "user_emma",
        "name": "Emma Van de Velde",
        "age": 24,
        "city": "Leuven",
        "occupation": "Master Student & Marketer",
        "segment": "Student / Social & Milestone Stage",
        "financialSnapshot": {
            "checkingBalance": 820.40,
            "savingsBalance": 3400.00,
            "monthlyIncome": 1150.00,
            "hasTravelInsurance": False,
            "cardNonEuActive": False,
            "currencyWallets": ["EUR"],
            "creditCardLimit": 750.00
        },
        "transactions": [
            {
                "id": "tx_em_201",
                "date": (NOW - timedelta(days=8)).replace(hour=15, minute=40).isoformat(),
                "merchant": "Rooftop Leuven Events BV",
                "mccCategory": "EVENT_VENUES",
                "amount": 250.00,
                "currency": "EUR",
                "type": "BANCONTACT",
                "description": "Advance hall & terrace deposit for 25th birthday party",
                "status": "COMPLETED",
                "matchedEventId": "emma_evt_1"
            },
            {
                "id": "tx_em_202",
                "date": (NOW - timedelta(days=14)).replace(hour=11, minute=10).isoformat(),
                "merchant": "Ticketmaster Belgium",
                "mccCategory": "ENTERTAINMENT",
                "amount": 315.00,
                "currency": "EUR",
                "type": "BANCONTACT",
                "description": "Rock Werchter 2026 Combi 4-Day Ticket + Camping The Hive",
                "status": "COMPLETED",
                "matchedEventId": "emma_evt_3"
            },
            {
                "id": "tx_em_203",
                "date": (NOW - timedelta(days=3)).replace(hour=22, minute=0).isoformat(),
                "merchant": "Ryanair DAC",
                "mccCategory": "AIRLINES",
                "amount": 89.00,
                "currency": "EUR",
                "type": "DEBIT_CARD",
                "description": "Flights Brussels Charleroi (CRL) - Lisbon (LIS)",
                "status": "COMPLETED",
                "matchedEventId": "emma_evt_5"
            },
            {
                "id": "tx_em_204",
                "date": (NOW - timedelta(days=2)).replace(hour=19, minute=30).isoformat(),
                "merchant": "Klimzaal Leuven",
                "mccCategory": "SPORTS_RECREATION",
                "amount": 14.50,
                "currency": "EUR",
                "type": "PAYCONIQ",
                "description": "Single entry boulder pass + shoe rental",
                "status": "COMPLETED",
                "matchedEventId": "emma_evt_2"
            }
        ],
        "agenda": [
            {
                "id": "emma_evt_1",
                "title": "Emma's 25th Milestone Birthday Celebration! 🎂🎉",
                "category": "BIRTHDAY_MILESTONE",
                "frequency": "INFREQUENT_MAJOR",
                "location": "Leuven Rooftop Lounge, Belgium",
                "country": "BE",
                "destinationCurrency": "EUR",
                "isNonEurozone": False,
                "startDate": (NOW + timedelta(days=9)).replace(hour=20, minute=0).isoformat(),
                "endDate": (NOW + timedelta(days=10)).replace(hour=2, minute=0).isoformat(),
                "durationDays": 1,
                "participants": ["emma.vdv@student.kuleuven.be", "18 friends on guestlist..."],
                "notes": "Turning 25! Venue deposit €250 paid. Total estimated drinks/tapas budget €450. Shared pot needed."
            },
            {
                "id": "emma_evt_2",
                "title": "Weekly Bouldering & Padel Session 🧗‍♀️",
                "category": "HEALTH_FITNESS",
                "frequency": "FREQUENT_WEEKLY",
                "location": "Klimzaal Leuven",
                "country": "BE",
                "destinationCurrency": "EUR",
                "isNonEurozone": False,
                "startDate": (NOW + timedelta(days=2)).replace(hour=18, minute=0).isoformat(),
                "endDate": (NOW + timedelta(days=2)).replace(hour=20, minute=0).isoformat(),
                "durationDays": 0,
                "participants": ["emma.vdv@student.kuleuven.be", "charlotte.b@gmail.com"],
                "notes": "10-entry card empty, renewing monthly student membership (€55/mo)."
            },
            {
                "id": "emma_evt_3",
                "title": "Rock Werchter Music Festival 🎸⛺",
                "category": "FESTIVAL_ENTERTAINMENT",
                "frequency": "ANNUAL",
                "location": "Festivalpark Werchter, Belgium",
                "country": "BE",
                "destinationCurrency": "EUR",
                "isNonEurozone": False,
                "startDate": (NOW + timedelta(days=45)).replace(hour=12, minute=0).isoformat(),
                "endDate": (NOW + timedelta(days=49)).replace(hour=12, minute=0).isoformat(),
                "durationDays": 4,
                "participants": ["emma.vdv@student.kuleuven.be", "simon.k@gmail.com", "noor.p@telenet.be"],
                "notes": "4 days of camping with 3 friends. Shared supplies + need safe daily contactless cap."
            },
            {
                "id": "emma_evt_4",
                "title": "Master Thesis Graduation Ceremony & Gala 🎓",
                "category": "EDUCATION_GRADUATION",
                "frequency": "RARE_MILESTONE",
                "location": "University Hall, KU Leuven",
                "country": "BE",
                "destinationCurrency": "EUR",
                "isNonEurozone": False,
                "startDate": (NOW + timedelta(days=70)).replace(hour=15, minute=0).isoformat(),
                "endDate": (NOW + timedelta(days=70)).replace(hour=23, minute=0).isoformat(),
                "durationDays": 0,
                "participants": ["emma.vdv@student.kuleuven.be", "parents.vdv@telenet.be"],
                "notes": "Official graduation. Transitioning from KBC Student Account to KBC Plus Account for starters."
            },
            {
                "id": "emma_evt_5",
                "title": "City Trip: Lisbon Long Weekend 🇵🇹☀️",
                "category": "EUROPEAN_TRAVEL",
                "frequency": "INFREQUENT",
                "location": "Lisbon, Portugal",
                "country": "PT",
                "destinationCurrency": "EUR",
                "isNonEurozone": False,
                "startDate": (NOW + timedelta(days=25)).replace(hour=6, minute=30).isoformat(),
                "endDate": (NOW + timedelta(days=29)).replace(hour=21, minute=0).isoformat(),
                "durationDays": 4,
                "participants": ["emma.vdv@student.kuleuven.be", "charlotte.b@gmail.com"],
                "notes": "Ryanair flight. Need flight delay protection and Booking.com KBC Deals cashbacks."
            },
            {
                "id": "emma_evt_6",
                "title": "Apartment Rental Handover & Keys (Antwerp Starter Flat) 🔑",
                "category": "HOUSING_RENTAL",
                "frequency": "RARE_MILESTONE",
                "location": "Zuid, Antwerp, Belgium",
                "country": "BE",
                "destinationCurrency": "EUR",
                "isNonEurozone": False,
                "startDate": (NOW + timedelta(days=85)).replace(hour=11, minute=0).isoformat(),
                "endDate": (NOW + timedelta(days=85)).replace(hour=13, minute=0).isoformat(),
                "durationDays": 0,
                "participants": ["emma.vdv@student.kuleuven.be", "landlord@immo-antwerp.be"],
                "notes": "Setting up KBC Rental Deposit (Huurwaarborg - €1,900) & mandatory tenant fire insurance."
            }
        ]
    },

    # =========================================================================
    # PERSONA 3: Lucas & Sophie Peeters (36 & 34, Family in Mechelen)
    # =========================================================================
    {
        "userId": "user_lucas",
        "name": "Lucas & Sophie Peeters",
        "age": 36,
        "city": "Mechelen",
        "occupation": "Senior Product Lead & Architect",
        "segment": "Family / High Income & Big Milestones",
        "financialSnapshot": {
            "checkingBalance": 6250.00,
            "savingsBalance": 54000.00,
            "monthlyIncome": 5800.00,
            "hasTravelInsurance": True,
            "cardNonEuActive": True,
            "currencyWallets": ["EUR", "USD"],
            "creditCardLimit": 5000.00
        },
        "transactions": [
            {
                "id": "tx_lu_301",
                "date": (NOW - timedelta(days=5)).replace(hour=10, minute=15).isoformat(),
                "merchant": "Notarisassociatie Van Damme",
                "mccCategory": "LEGAL_SERVICES",
                "amount": 5000.00,
                "currency": "EUR",
                "type": "WIRE_TRANSFER",
                "description": "Advance escrow compromis security deposit for house acquisition",
                "status": "COMPLETED",
                "matchedEventId": "lucas_evt_1"
            },
            {
                "id": "tx_lu_302",
                "date": (NOW - timedelta(days=12)).replace(hour=18, minute=20).isoformat(),
                "merchant": "Engie Home Services Belgium",
                "mccCategory": "UTILITIES_ENERGY",
                "amount": 120.00,
                "currency": "EUR",
                "type": "BANCONTACT",
                "description": "Pre-renovation EPC & Heat Pump Feasibility Diagnostic",
                "status": "COMPLETED",
                "matchedEventId": "lucas_evt_4"
            },
            {
                "id": "tx_lu_303",
                "date": (NOW - timedelta(days=15)).replace(hour=13, minute=45).isoformat(),
                "merchant": "Swiss Federal Railways (SBB/CFF/FFS)",
                "mccCategory": "RAILWAYS",
                "amount": 260.00,
                "currency": "EUR",
                "type": "CREDIT_CARD",
                "description": "Jungfrau Railway Mountain Excursion Family Pass",
                "status": "COMPLETED",
                "matchedEventId": "lucas_evt_3"
            }
        ],
        "agenda": [
            {
                "id": "lucas_evt_1",
                "title": "Notary Deed Signing: New House Purchase 🏡✍️",
                "category": "HOME_PURCHASE_NOTARY",
                "frequency": "RARE_MILESTONE",
                "location": "Notary Office Van Damme, Mechelen, Belgium",
                "country": "BE",
                "destinationCurrency": "EUR",
                "isNonEurozone": False,
                "startDate": (NOW + timedelta(days=18)).replace(hour=14, minute=0).isoformat(),
                "endDate": (NOW + timedelta(days=18)).replace(hour=16, minute=0).isoformat(),
                "durationDays": 0,
                "participants": ["lucas.peeters@telenet.be", "sophie.p@gmail.com", "notaris.vandamme@notaris.be"],
                "notes": "Final deed signing for 1930s townhouse. Transfer €48,000 downpayment & notary fees via escrow."
            },
            {
                "id": "lucas_evt_2",
                "title": "Youth Football Tournament - Noah (KV Mechelen U10) ⚽",
                "category": "FAMILY_ROUTINE",
                "frequency": "FREQUENT_WEEKLY",
                "location": "KV Mechelen Jeugdcomplex",
                "country": "BE",
                "destinationCurrency": "EUR",
                "isNonEurozone": False,
                "startDate": (NOW + timedelta(days=4)).replace(hour=9, minute=30).isoformat(),
                "endDate": (NOW + timedelta(days=4)).replace(hour=12, minute=30).isoformat(),
                "durationDays": 0,
                "participants": ["lucas.peeters@telenet.be", "coach.karl@kvmechelen.be"],
                "notes": "Weekly match + snacks carpool. Noah's sports insurance card verification."
            },
            {
                "id": "lucas_evt_3",
                "title": "Family Summer Vacation: Swiss Alps Roadtrip 🇨🇭🏔️",
                "category": "INTERNATIONAL_TRAVEL",
                "frequency": "ANNUAL",
                "location": "Interlaken & Zermatt, Switzerland",
                "country": "CH",
                "destinationCurrency": "CHF",
                "isNonEurozone": True,
                "startDate": (NOW + timedelta(days=60)).replace(hour=6, minute=0).isoformat(),
                "endDate": (NOW + timedelta(days=74)).replace(hour=20, minute=0).isoformat(),
                "durationDays": 14,
                "participants": ["lucas.peeters@telenet.be", "sophie.p@gmail.com", "noah.p@family.be", "emma.p@family.be"],
                "notes": "Family road trip. Swiss highway e-Vignette required. Need CHF sub-wallet to avoid foreign exchange markups."
            },
            {
                "id": "lucas_evt_4",
                "title": "Solar Panels & Heat Pump Site Audit ☀️🔋",
                "category": "SUSTAINABILITY_INVESTMENT",
                "frequency": "INFREQUENT",
                "location": "New House, Mechelen",
                "country": "BE",
                "destinationCurrency": "EUR",
                "isNonEurozone": False,
                "startDate": (NOW + timedelta(days=30)).replace(hour=10, minute=0).isoformat(),
                "endDate": (NOW + timedelta(days=30)).replace(hour=12, minute=0).isoformat(),
                "durationDays": 0,
                "participants": ["lucas.peeters@telenet.be", "solar-expert@engie.be"],
                "notes": "Contractor quote: €16,500. Explore KBC Green Energy Loan (preferential rate 2.99%) & Flemish subsidies."
            },
            {
                "id": "lucas_evt_5",
                "title": "Kids Orthodontist & Dental Checkup 🦷",
                "category": "HEALTH_MEDICAL",
                "frequency": "SEMI_ANNUAL",
                "location": "Dental Clinic Mechelen",
                "country": "BE",
                "destinationCurrency": "EUR",
                "isNonEurozone": False,
                "startDate": (NOW + timedelta(days=15)).replace(hour=16, minute=30).isoformat(),
                "endDate": (NOW + timedelta(days=15)).replace(hour=17, minute=30).isoformat(),
                "durationDays": 0,
                "participants": ["sophie.p@gmail.com"],
                "notes": "Braces quote for Noah approx €2,400. Check KBC Dentalia Plus supplementary reimbursement."
            },
            {
                "id": "lucas_evt_6",
                "title": "Year-End Pension Savings Tax Optimization 📈",
                "category": "TAX_INVESTMENT",
                "frequency": "ANNUAL",
                "location": "KBC Bank Mechelen Branch (Online)",
                "country": "BE",
                "destinationCurrency": "EUR",
                "isNonEurozone": False,
                "startDate": (NOW + timedelta(days=40)).replace(hour=11, minute=0).isoformat(),
                "endDate": (NOW + timedelta(days=40)).replace(hour=11, minute=45).isoformat(),
                "durationDays": 0,
                "participants": ["lucas.peeters@telenet.be", "kbc.advisor@kbc.be"],
                "notes": "Max out annual Belgian tax ceiling (€1,020 at 30% or €1,310 at 25% tax reduction for both partners)."
            }
        ]
    },

    # =========================================================================
    # PERSONA 4: Marc Verhoeven (58, SME Business Owner in Hasselt)
    # =========================================================================
    {
        "userId": "user_marc",
        "name": "Marc Verhoeven",
        "age": 58,
        "city": "Hasselt",
        "occupation": "SME Managing Director",
        "segment": "Business Owner / Wealth & Pre-Retirement",
        "financialSnapshot": {
            "checkingBalance": 12800.00,
            "savingsBalance": 142000.00,
            "monthlyIncome": 7200.00,
            "hasTravelInsurance": True,
            "cardNonEuActive": True,
            "currencyWallets": ["EUR", "USD", "GBP"],
            "creditCardLimit": 10000.00
        },
        "transactions": [
            {
                "id": "tx_ma_401",
                "date": (NOW - timedelta(days=7)).replace(hour=11, minute=30).isoformat(),
                "merchant": "Olympic Yachting Athens Ltd",
                "mccCategory": "TRAVEL_CHARTER",
                "amount": 1450.00,
                "currency": "EUR",
                "type": "CREDIT_CARD",
                "description": "50% advance charter deposit for Bavaria 46 Cruiser",
                "status": "COMPLETED",
                "matchedEventId": "marc_evt_3"
            },
            {
                "id": "tx_ma_402",
                "date": (NOW - timedelta(days=3)).replace(hour=14, minute=0).isoformat(),
                "merchant": "BMW Financial Services Belgium",
                "mccCategory": "AUTOMOTIVE",
                "amount": 4250.00,
                "currency": "EUR",
                "type": "DIRECT_DEBIT",
                "description": "Initial advance payment for KBC Autolease BMW iX3 contract",
                "status": "COMPLETED",
                "matchedEventId": "marc_evt_5"
            },
            {
                "id": "tx_ma_403",
                "date": (NOW - timedelta(days=20)).replace(hour=9, minute=15).isoformat(),
                "merchant": "BDO Belgium Hasselt",
                "mccCategory": "ACCOUNTING_LEGAL",
                "amount": 850.00,
                "currency": "EUR",
                "type": "WIRE_TRANSFER",
                "description": "Quarterly fiscal closing and corporate income tax prep",
                "status": "COMPLETED",
                "matchedEventId": "marc_evt_1"
            }
        ],
        "agenda": [
            {
                "id": "marc_evt_1",
                "title": "Quarterly Corporate VAT & Tax Review with Accountant 📊",
                "category": "BUSINESS_TAX",
                "frequency": "FREQUENT_QUARTERLY",
                "location": "BDO Accountants Hasselt",
                "country": "BE",
                "destinationCurrency": "EUR",
                "isNonEurozone": False,
                "startDate": (NOW + timedelta(days=11)).replace(hour=10, minute=0).isoformat(),
                "endDate": (NOW + timedelta(days=11)).replace(hour=12, minute=0).isoformat(),
                "durationDays": 0,
                "participants": ["marc.verhoeven@verhoeven-bv.be", "accountant@bdo.be"],
                "notes": "Prepare quarterly corporate tax reserve transfer (€32,000) from business to tax buffer."
            },
            {
                "id": "marc_evt_2",
                "title": "Sunday Golf Match & Limburg Club Cup ⛳",
                "category": "SPORTS_LEISURE",
                "frequency": "FREQUENT_WEEKLY",
                "location": "Flanders Nippon Golf Hasselt",
                "country": "BE",
                "destinationCurrency": "EUR",
                "isNonEurozone": False,
                "startDate": (NOW + timedelta(days=5)).replace(hour=10, minute=0).isoformat(),
                "endDate": (NOW + timedelta(days=5)).replace(hour=15, minute=0).isoformat(),
                "durationDays": 0,
                "participants": ["marc.verhoeven@gmail.com", "golf-friends@hasselt.be"],
                "notes": "Club membership renewal due next week (€1,850/yr). Review KBC Family Liability Insurance."
            },
            {
                "id": "marc_evt_3",
                "title": "Sailing Holiday: Greek Islands Yacht Charter 🇬🇷⛵",
                "category": "EUROPEAN_TRAVEL",
                "frequency": "ANNUAL",
                "location": "Athens Marina & Cyclades, Greece",
                "country": "GR",
                "destinationCurrency": "EUR",
                "isNonEurozone": False,
                "startDate": (NOW + timedelta(days=38)).replace(hour=8, minute=0).isoformat(),
                "endDate": (NOW + timedelta(days=48)).replace(hour=18, minute=0).isoformat(),
                "durationDays": 10,
                "participants": ["marc.verhoeven@gmail.com", "an.verhoeven@telenet.be"],
                "notes": "Bavaria 46 charter. Security deposit hold of €3,000 on credit card needed."
            },
            {
                "id": "marc_evt_4",
                "title": "Granddaughter Julie's 1st Birthday 🎀👶",
                "category": "FAMILY_MILESTONE",
                "frequency": "RARE_MILESTONE",
                "location": "Family Home, Genk",
                "country": "BE",
                "destinationCurrency": "EUR",
                "isNonEurozone": False,
                "startDate": (NOW + timedelta(days=16)).replace(hour=14, minute=0).isoformat(),
                "endDate": (NOW + timedelta(days=16)).replace(hour=19, minute=0).isoformat(),
                "durationDays": 0,
                "participants": ["marc.verhoeven@gmail.com", "claire.verhoeven@gmail.com"],
                "notes": "Setting up a monthly automatic KBC Junior Investment Plan (€100/mo) for Julie's 18th future fund."
            },
            {
                "id": "marc_evt_5",
                "title": "Delivery of New Hybrid Company Car (KBC Autolease) 🚙",
                "category": "MOBILITY_MAINTENANCE",
                "frequency": "RARE_MILESTONE",
                "location": "BMW Dealer Hasselt",
                "country": "BE",
                "destinationCurrency": "EUR",
                "isNonEurozone": False,
                "startDate": (NOW + timedelta(days=22)).replace(hour=14, minute=30).isoformat(),
                "endDate": (NOW + timedelta(days=22)).replace(hour=16, minute=0).isoformat(),
                "durationDays": 0,
                "participants": ["marc.verhoeven@verhoeven-bv.be", "kbc-autolease@kbc.be"],
                "notes": "Key handover for BMW iX3. Activate KBC Mobility fuel & charging card in KBC Mobile."
            },
            {
                "id": "marc_evt_6",
                "title": "Knee Arthroscopy Preventive Consultation 🏥",
                "category": "HEALTH_MEDICAL",
                "frequency": "INFREQUENT",
                "location": "Jessa Ziekenhuis Hasselt",
                "country": "BE",
                "destinationCurrency": "EUR",
                "isNonEurozone": False,
                "startDate": (NOW + timedelta(days=29)).replace(hour=9, minute=0).isoformat(),
                "endDate": (NOW + timedelta(days=29)).replace(hour=10, minute=30).isoformat(),
                "durationDays": 0,
                "participants": ["marc.verhoeven@gmail.com"],
                "notes": "Day surgery scheduled. Register admission via KBC Mobile Hospitalization Medi-Assistance for direct third-party payment."
            }
        ]
    }
]
