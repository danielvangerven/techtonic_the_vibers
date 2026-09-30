# 🚀 KBC LifeSync — Team The Vibers

> **Tectonic Hackathon 2026 — KBC Case Submission**  
> Proactive Contextual Banking powered by Agenda Intelligence & Anonymized KBC Community Benchmarks.

---

## 🌟 The Concept: From Reactive to Proactive Banking
Instead of waiting for customers to open their banking app when a problem occurs, **KBC LifeSync** equips **Kate** (KBC's AI assistant) with **proactive life-event foresight**.

By securely ingesting calendar events and combining them with **anonymized KBC peer data**, Kate delivers the right financial action at the exact right moment.

---

## 👥 4 User Personas & 24 Agenda Events

| Persona | Profile & Stage | Key Agenda Events (6 Each) | Financial & Kate Proactive Actions |
| :--- | :--- | :--- | :--- |
| **1. Thomas Dubois** *(Age 28)* | Young Tech Professional & Traveler | 🇯🇵 Tokyo & Kyoto Vacation<br>🍕 Ghent Foodies Dinner<br>🚗 Autokeuring Car Inspection<br>🏃 Ghent Half Marathon<br>🇬🇧 London Tech Conference<br>🌐 Telecom Fiber Renewal | • Auto-unlock Non-EU debit card<br>• JPY foreign currency cash pre-order<br>• KBC Global Travel Assistance<br>• Instant Payconiq table split<br>• GBP multi-currency wallet |
| **2. Emma Van de Velde** *(Age 24)* | KU Leuven Master Student & Marketer | 🎂 25th Milestone Birthday Bash<br>🧗 Weekly Bouldering / Padel<br>🎸 Rock Werchter 4-Day Festival<br>🎓 Master Thesis Graduation Gala<br>🇵🇹 Lisbon Long Weekend<br>🔑 Antwerp Apartment Handover | • KBC Digital Birthday Group Pot<br>• €80/day Contactless Festival Shield<br>• Shared Camping Expense Splitter<br>• KBC Deals (8% catering cashback)<br>• Rental Deposit (Huurwaarborg) & Tenant Insurance |
| **3. Lucas & Sophie Peeters** *(Age 36 & 34)* | Senior Family with 2 Kids in Mechelen | 🏡 Notary Deed Signing (New Home)<br>⚽ Noah's Football Tournament<br>🇨🇭 Swiss Alps Summer Roadtrip<br>☀️ Solar & Heat Pump Site Audit<br>🦷 Orthodontist Dental Checkup<br>📈 Year-End Pension Tax Max | • 1-Day Wire Transfer Limit for Notary Escrow<br>• Dedicated Renovation Buffer Account<br>• Swiss e-Vignette & CHF sub-wallet<br>• Green Energy Loan (2.99%) & Flemish grant scanner<br>• Dentalia reimbursement check |
| **4. Marc Verhoeven** *(Age 58)* | SME Business Owner & Pre-Retiree | 📊 Quarterly VAT Review with BDO<br>⛳ Sunday Golf Club Match<br>🇬🇷 Greek Islands Yacht Charter<br>🎀 Granddaughter's 1st Birthday<br>🚙 Hybrid Lease Handover<br>🏥 Hospital Arthroscopy Surgery | • Tax Buffer liquidity interest account<br>• 1-Click CODA statement sync for BDO<br>• €3,000 credit limit buffer for yacht deposit<br>• KBC Junior Growth Investment (€100/mo)<br>• KBC Medi-Assistance direct hospital billing |

---

## 📁 Repository Structure

```
techtonic_the_vibers/
├── data/
│   ├── users_and_agendas.py           # 4 personas, 24 multi-category events
│   └── kbc_community_intelligence.py  # Crowdsourced peer benchmarks & statistics
├── engine/
│   └── recommender.py                 # Proactive recommendation & intent engine
├── api/
│   └── main.py                        # FastAPI server (REST & .ics calendar exporter)
├── kbc_lifesync_mock_data.json        # Single JSON bundle for frontend teammate
├── export_mock_data.py                # Build script for JSON bundle
└── README.md
```

---

## ⚡ Quick Start

### For Frontend Teammate:
Import [`kbc_lifesync_mock_data.json`](./kbc_lifesync_mock_data.json) directly in your frontend components.

### To Run FastAPI Backend:
```bash
pip install fastapi uvicorn
uvicorn api.main:app --reload --port 8000
```
Interactive API documentation: `http://localhost:8000/docs`

### To Export User Calendar to Google / Apple Calendar:
Navigate to `http://localhost:8000/api/calendar/ics/user_thomas` to download the standard `.ics` file.
