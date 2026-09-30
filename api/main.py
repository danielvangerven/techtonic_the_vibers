"""
FastAPI Server for KBC LifeSync Backend (Team The Vibers)
Provides REST endpoints for fetching user personas, agenda events, transaction logs,
community benchmarks, and exporting standard .ics calendar files.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

from data.users_and_agendas import USERS_DATA
from data.kbc_community_intelligence import KBC_COMMUNITY_BENCHMARKS
from engine.recommender import LifeSyncRecommender

app = FastAPI(
    title="KBC LifeSync API (Team The Vibers)",
    description="Dual-Signal Contextual Banking Engine powered by Agenda Intelligence, Transaction Streams & KBC Community Data",
    version="2.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

recommender = LifeSyncRecommender(KBC_COMMUNITY_BENCHMARKS)

@app.get("/")
def read_root():
    return {
        "service": "KBC LifeSync Engine (Dual-Signal: Calendar + Transactions)",
        "team": "The Vibers",
        "status": "online",
        "endpoints": [
            "/api/users",
            "/api/users/{user_id}",
            "/api/users/{user_id}/transactions",
            "/api/users/{user_id}/recommendations",
            "/api/community-benchmarks",
            "/api/calendar/ics/{user_id}"
        ]
    }

@app.get("/api/users")
def get_all_users():
    """Returns all 4 user personas with their full agendas and transaction streams."""
    return USERS_DATA

@app.get("/api/users/{user_id}")
def get_user(user_id: str):
    """Returns a specific user profile, agenda, and transactions."""
    for u in USERS_DATA:
        if u["userId"] == user_id:
            return u
    raise HTTPException(status_code=404, detail="User not found")

@app.get("/api/users/{user_id}/transactions")
def get_user_transactions(user_id: str):
    """Returns the banking transaction stream for a specific user."""
    for u in USERS_DATA:
        if u["userId"] == user_id:
            return {
                "userId": user_id,
                "userName": u["name"],
                "transactions": u.get("transactions", [])
            }
    raise HTTPException(status_code=404, detail="User not found")

@app.get("/api/users/{user_id}/recommendations")
def get_user_recommendations(user_id: str):
    """Generates dual-signal proactive recommendations correlating calendar events with transaction logs."""
    for u in USERS_DATA:
        if u["userId"] == user_id:
            recommendations = recommender.generate_recommendations_for_user(u)
            return {
                "userId": user_id,
                "userName": u["name"],
                "financialSnapshot": u["financialSnapshot"],
                "totalEvents": len(u.get("agenda", [])),
                "totalTransactions": len(u.get("transactions", [])),
                "recommendations": recommendations
            }
    raise HTTPException(status_code=404, detail="User not found")

@app.get("/api/community-benchmarks")
def get_community_benchmarks():
    """Returns aggregated KBC community spending and behavior benchmarks."""
    return KBC_COMMUNITY_BENCHMARKS

@app.get("/api/calendar/ics/{user_id}")
def export_user_calendar_ics(user_id: str):
    """Exports the user's agenda as a standard .ics format to import directly into Google or Apple Calendar."""
    user = next((u for u in USERS_DATA if u["userId"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    ics_lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        f"PRODID:-//KBC LifeSync//{user['name']}//EN"
    ]

    for ev in user.get("agenda", []):
        start_str = ev["startDate"].replace("-", "").replace(":", "").split(".")[0]
        end_str = ev["endDate"].replace("-", "").replace(":", "").split(".")[0]
        ics_lines.extend([
            "BEGIN:VEVENT",
            f"UID:{ev['id']}@kbclifesync.com",
            f"SUMMARY:{ev['title']}",
            f"LOCATION:{ev.get('location', '')}",
            f"DESCRIPTION:{ev.get('notes', '')}",
            f"DTSTART:{start_str}",
            f"DTEND:{end_str}",
            "END:VEVENT"
        ])

    ics_lines.append("END:VCALENDAR")
    return "\n".join(ics_lines)
