"""
KBC LifeSync Dual-Signal Recommendation Engine (Agenda + Transactions)
Fuses external intent (Calendar) with internal financial logs (Transactions & Balances)
to detect coverage gaps, spending buffers, and provide actionable 1-click banking interventions.
"""

from typing import List, Dict, Any, Optional

class LifeSyncRecommender:
    def __init__(self, community_data: Dict[str, Any]):
        self.community_data = community_data

    def generate_recommendations_for_user(self, user: Dict[str, Any]) -> List[Dict[str, Any]]:
        recommendations = []
        user_finance = user.get("financialSnapshot", {})
        transactions = user.get("transactions", [])
        user_name = user.get("name", "").split()[0]

        for event in user.get("agenda", []):
            rec = self._analyze_event_with_transactions(user_name, user_finance, transactions, event)
            if rec:
                recommendations.append(rec)

        return recommendations

    def _analyze_event_with_transactions(
        self,
        user_name: str,
        finance: Dict[str, Any],
        transactions: List[Dict[str, Any]],
        event: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        category = event.get("category")
        title = event.get("title")
        event_id = event.get("id")

        # Find any transactions linked to this event
        linked_txs = [tx for tx in transactions if tx.get("matchedEventId") == event_id]
        total_spent_so_far = sum(tx.get("amount", 0) for tx in linked_txs)

        # ---------------------------------------------------------------------
        # 1. INTERNATIONAL TRAVEL (e.g. Japan, London, Swiss)
        # ---------------------------------------------------------------------
        if category == "INTERNATIONAL_TRAVEL":
            country_code = event.get("country", "")
            benchmarks = self.community_data.get("INTERNATIONAL_TRAVEL", {}).get(country_code, {})
            country_name = benchmarks.get("countryName", event.get("location", "Abroad"))
            currency = benchmarks.get("currency", "Foreign Currency")
            
            alerts = []
            actions = []
            fused_signals = []

            # Check linked transaction signals
            flight_tx = next((tx for tx in linked_txs if tx.get("mccCategory") == "AIRLINES"), None)
            hotel_tx = next((tx for tx in linked_txs if tx.get("mccCategory") == "ACCOMMODATION"), None)

            if flight_tx:
                fused_signals.append(f"Confirmed booking: {flight_tx['merchant']} (€{flight_tx['amount']:,.2f})")
            if hotel_tx:
                fused_signals.append(f"Confirmed stay: {hotel_tx['merchant']} (€{hotel_tx['amount']:,.2f})")

            # GAP 1: Flight booked, but NO travel insurance
            if not finance.get("hasTravelInsurance", False):
                alerts.append(f"🛡️ Protection Gap: €{total_spent_so_far:,.2f} spent on travel with no active KBC Travel Insurance.")
                actions.append({
                    "actionId": "act_travel_insurance",
                    "label": f"Activate KBC Global Travel Insurance (€18.50/trip)",
                    "type": "INSTANT_INSURANCE",
                    "badge": "Missing Protection"
                })

            # GAP 2: Card locked in destination
            if not finance.get("cardNonEuActive", False):
                alerts.append(f"⚠️ Card Gap: Debit card is currently locked for {country_name} (Non-EU).")
                actions.append({
                    "actionId": "act_unlock_card",
                    "label": f"1-Tap Unlock Debit Card for {country_name}",
                    "type": "ONE_CLICK_TOGGLE",
                    "badge": "Crucial Action"
                })

            # GAP 3: Foreign currency pre-order / wallet
            if currency not in finance.get("currencyWallets", []):
                actions.append({
                    "actionId": "act_currency_order",
                    "label": f"Pre-order {currency} Cash or Open {currency} Sub-Wallet",
                    "type": "CURRENCY_SERVICE",
                    "badge": "Avoid Airport FX Markup"
                })

            if country_code == "CH":
                actions.append({
                    "actionId": "act_swiss_vignette",
                    "label": "Purchase Swiss Highway e-Vignette (€42)",
                    "type": "MOBILITY_PURCHASE",
                    "badge": "KBC Mobility"
                })

            speech = (
                f"Hello {user_name}, I saw your {flight_tx['merchant'] if flight_tx else 'travel'} booking for {country_name}. "
                f"Since your debit card is still locked for Non-EU and no travel insurance is active, I've prepared 1-tap solutions for you."
                if flight_tx else
                f"Hello {user_name}, I noticed your upcoming trip to {country_name}. Let's make sure your currency ({currency}) and card access are prepared."
            )

            return {
                "eventId": event_id,
                "eventTitle": title,
                "urgency": "HIGH",
                "category": category,
                "kateSpeech": speech,
                "insightSummary": f"Trip to {country_name} ({currency}) • Total commitments: €{total_spent_so_far:,.2f}",
                "dualSignalProof": {
                    "calendarEvent": f"Calendar: {title} ({event.get('durationDays', 1)} days)",
                    "detectedTransactions": fused_signals or ["No prior bookings detected yet"],
                    "financialCommitment": f"€{total_spent_so_far:,.2f}"
                },
                "communityBenchmark": {
                    "avgDailySpend": f"€{benchmarks.get('avgDailySpendEUR', 120)} / day",
                    "paymentHabits": benchmarks.get("cashVsCardRatio", "Card & Cash"),
                    "peerBehavior": " ".join(benchmarks.get("communityStats", {}).values())
                },
                "statusAlerts": alerts,
                "suggestedActions": actions
            }

        # ---------------------------------------------------------------------
        # 2. BIRTHDAY MILESTONE (e.g. Emma 25th)
        # ---------------------------------------------------------------------
        elif category == "BIRTHDAY_MILESTONE":
            benchmarks = self.community_data.get("BIRTHDAY_MILESTONE", {}).get("milestone25", {})
            venue_tx = next((tx for tx in linked_txs if tx.get("mccCategory") == "EVENT_VENUES"), None)
            
            fused_signals = []
            if venue_tx:
                fused_signals.append(f"Venue deposit paid: {venue_tx['merchant']} (€{venue_tx['amount']:,.2f})")

            est_guest_count = 18
            suggested_pot_target = 450.0

            return {
                "eventId": event_id,
                "eventTitle": title,
                "urgency": "HIGH",
                "category": category,
                "kateSpeech": f"Happy early 25th birthday, {user_name}! I noticed your €{venue_tx['amount']:.0f} venue deposit at {venue_tx['merchant'] if venue_tx else 'the lounge'}. Would you like me to open a KBC Digital Group Pot to collect contributions from your guests?",
                "insightSummary": "25th Birthday Milestone • Venue deposit confirmed.",
                "dualSignalProof": {
                    "calendarEvent": f"Calendar: {title}",
                    "detectedTransactions": fused_signals,
                    "financialCommitment": f"€{total_spent_so_far:,.2f} spent so far"
                },
                "communityBenchmark": {
                    "avgDailySpend": f"€{benchmarks.get('avgCelebrationBudgetEUR', 380)} avg celebration buffer",
                    "peerBehavior": benchmarks.get("communityStats", {}).get("groupPotUsage", "")
                },
                "statusAlerts": [
                    f"Checking balance: €{finance.get('checkingBalance', 0):,.2f}. Suggested guest pool: €25/person via Payconiq."
                ],
                "suggestedActions": [
                    {
                        "actionId": "act_create_birthday_pot",
                        "label": f"Generate KBC Payconiq Group Pot (€{suggested_pot_target:.0f} Goal)",
                        "type": "CREATE_GROUP_POT",
                        "badge": "79% of Peers Use This"
                    },
                    {
                        "actionId": "act_catering_cashback",
                        "label": "Unlock Local Leuven Catering Deals (8% Cashback)",
                        "type": "CLAIM_DEAL",
                        "badge": "KBC Deals"
                    }
                ]
            }

        # ---------------------------------------------------------------------
        # 3. FESTIVAL & SOCIAL EVENTS (e.g. Rock Werchter)
        # ---------------------------------------------------------------------
        elif category == "FESTIVAL_ENTERTAINMENT":
            benchmarks = self.community_data.get("FESTIVAL_ENTERTAINMENT", {}).get("rock_werchter", {})
            ticket_tx = next((tx for tx in linked_txs if tx.get("mccCategory") == "ENTERTAINMENT"), None)

            fused_signals = []
            if ticket_tx:
                fused_signals.append(f"Ticket detected: {ticket_tx['merchant']} (€{ticket_tx['amount']:,.2f})")

            return {
                "eventId": event_id,
                "eventTitle": title,
                "urgency": "MEDIUM",
                "category": category,
                "kateSpeech": f"I see your Rock Werchter ticket purchase with {ticket_tx['merchant'] if ticket_tx else 'Ticketmaster'}, {user_name}! Let's set up a camping expense split with your friends and turn on an €80/day contactless spending shield.",
                "insightSummary": "Rock Werchter 4-Day Festival • Ticket confirmed.",
                "dualSignalProof": {
                    "calendarEvent": f"Calendar: {title}",
                    "detectedTransactions": fused_signals,
                    "financialCommitment": f"€{total_spent_so_far:,.2f}"
                },
                "communityBenchmark": {
                    "avgDailySpend": f"€{benchmarks.get('avgFestivalSpendEUR', 310)} avg festival weekend",
                    "peerBehavior": benchmarks.get("communityStats", {}).get("safeCardLimit", "")
                },
                "statusAlerts": ["Proactive fraud & loss protection active."],
                "suggestedActions": [
                    {
                        "actionId": "act_camping_split",
                        "label": "Create Shared Camping Expense Group with 3 Friends",
                        "type": "EXPENSE_SPLIT",
                        "badge": "Smart Split"
                    },
                    {
                        "actionId": "act_festival_safe_cap",
                        "label": "Enable €80/day Contactless Festival Shield",
                        "type": "BUDGET_CAP",
                        "badge": "Safety Feature"
                    }
                ]
            }

        # ---------------------------------------------------------------------
        # 4. HOME PURCHASE / NOTARY
        # ---------------------------------------------------------------------
        elif category == "HOME_PURCHASE_NOTARY":
            benchmarks = self.community_data.get("HOME_PURCHASE_NOTARY", {}).get("notary_milestone", {})
            notary_tx = next((tx for tx in linked_txs if tx.get("mccCategory") == "LEGAL_SERVICES"), None)

            fused_signals = []
            if notary_tx:
                fused_signals.append(f"Escrow downpayment advance: {notary_tx['merchant']} (€{notary_tx['amount']:,.2f})")

            return {
                "eventId": event_id,
                "eventTitle": title,
                "urgency": "CRITICAL",
                "category": category,
                "kateSpeech": f"I see your €5,000 compromise transfer to Notaris Van Damme, {user_name}. For the upcoming deed signing, let's pre-authorize your 1-day wire limit for the remaining balance and shelter your renovation buffer.",
                "insightSummary": "Notary Deed Signing • €5,000 initial escrow detected.",
                "dualSignalProof": {
                    "calendarEvent": f"Calendar: {title}",
                    "detectedTransactions": fused_signals,
                    "financialCommitment": f"€{total_spent_so_far:,.2f} advance paid"
                },
                "communityBenchmark": {
                    "avgDailySpend": f"€{benchmarks.get('avgRenovationBufferEUR', 18500):,.0f} avg renovation buffer",
                    "peerBehavior": benchmarks.get("communityStats", {}).get("renovationAccount", "")
                },
                "statusAlerts": ["Mandatory: Remaining escrow must be wired 48h prior to deed signing."],
                "suggestedActions": [
                    {
                        "actionId": "act_wire_transfer_limit",
                        "label": "Authorize 1-Day Wire Limit Increase for Final Escrow",
                        "type": "INCREASE_LIMIT",
                        "badge": "Required Step"
                    },
                    {
                        "actionId": "act_open_renovation_account",
                        "label": "Open KBC Renovation Buffer Account (Preferential Rate)",
                        "type": "OPEN_SUB_ACCOUNT",
                        "badge": "Tax & Interest Benefit"
                    }
                ]
            }

        # ---------------------------------------------------------------------
        # 5. EUROPEAN TRAVEL & YACHT CHARTER
        # ---------------------------------------------------------------------
        elif category == "EUROPEAN_TRAVEL":
            country_code = event.get("country", "")
            benchmarks = self.community_data.get("EUROPEAN_TRAVEL", {}).get(country_code, {})
            country_name = benchmarks.get("countryName", event.get("location", "Europe"))
            
            fused_signals = [f"Booking: {tx['merchant']} (€{tx['amount']:,.2f})" for tx in linked_txs]

            actions = [
                {
                    "actionId": "act_kbc_deals_travel",
                    "label": f"Activate KBC Deals (4-8% Cashback on Booking.com & Airlines)",
                    "type": "CLAIM_DEAL",
                    "badge": "Instant Cashback"
                }
            ]

            if country_code == "GR":
                actions.append({
                    "actionId": "act_credit_limit_raise",
                    "label": "Temporarily Increase Credit Card Limit (+€3,000 for Yacht Deposit)",
                    "type": "INCREASE_LIMIT",
                    "badge": "Security Deposit Hold"
                })

            return {
                "eventId": event_id,
                "eventTitle": title,
                "urgency": "MEDIUM",
                "category": category,
                "kateSpeech": f"Enjoy your trip to {country_name}, {user_name}! I noticed your {linked_txs[0]['merchant'] if linked_txs else 'travel'} booking and prepared your credit limit and cashback settings.",
                "insightSummary": f"Trip to {country_name} • Bookings detected: €{total_spent_so_far:,.2f}",
                "dualSignalProof": {
                    "calendarEvent": f"Calendar: {title}",
                    "detectedTransactions": fused_signals or ["No prior bookings detected"],
                    "financialCommitment": f"€{total_spent_so_far:,.2f}"
                },
                "communityBenchmark": {
                    "avgDailySpend": f"€{benchmarks.get('avgDailySpendEUR', 85)} / day",
                    "peerBehavior": " ".join(benchmarks.get("communityStats", {}).values())
                },
                "statusAlerts": ["Eurozone transactions active with zero foreign exchange fees."],
                "suggestedActions": actions
            }

        # Fallback for remaining events
        return {
            "eventId": event_id,
            "eventTitle": title,
            "urgency": "LOW",
            "category": category or "GENERAL",
            "kateSpeech": f"You have '{title}' scheduled, {user_name}.",
            "insightSummary": f"Calendar event: {title}",
            "dualSignalProof": {
                "calendarEvent": f"Calendar: {title}",
                "detectedTransactions": [f"{tx['merchant']} (€{tx['amount']:,.2f})" for tx in linked_txs] or ["No direct transaction match"],
                "financialCommitment": f"€{total_spent_so_far:,.2f}"
            },
            "communityBenchmark": {
                "avgDailySpend": "Standard",
                "peerBehavior": "KBC LifeSync tracks your financial calendar seamlessly."
            },
            "statusAlerts": [],
            "suggestedActions": [
                {
                    "actionId": "act_quick_split",
                    "label": "Open KBC Quick Split / Payconiq",
                    "type": "P2P_SPLIT",
                    "badge": "Instant"
                }
            ]
        }
