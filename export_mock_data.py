"""
Export Script for techtonic_the_vibers repo: Compiles all 4 user personas, their 24 agenda events, and AI recommendations into a static JSON bundle.
"""

import json
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from data.users_and_agendas import USERS_DATA
from data.kbc_community_intelligence import KBC_COMMUNITY_BENCHMARKS
from engine.recommender import LifeSyncRecommender

def export_all():
    recommender = LifeSyncRecommender(KBC_COMMUNITY_BENCHMARKS)
    
    users_with_recommendations = []
    for user in USERS_DATA:
        user_copy = dict(user)
        user_copy["generatedRecommendations"] = recommender.generate_recommendations_for_user(user)
        users_with_recommendations.append(user_copy)

    full_payload = {
        "metadata": {
            "projectName": "KBC LifeSync (Team The Vibers)",
            "version": "2.0.0",
            "totalUsers": len(users_with_recommendations),
            "totalEvents": sum(len(u.get("agenda", [])) for u in users_with_recommendations)
        },
        "communityBenchmarks": KBC_COMMUNITY_BENCHMARKS,
        "users": users_with_recommendations
    }

    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "kbc_lifesync_mock_data.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(full_payload, f, indent=2, ensure_ascii=False)

    print(f"Successfully generated {output_path}")
    print(f"Exported {len(users_with_recommendations)} personas with {full_payload['metadata']['totalEvents']} total agenda events.")

if __name__ == "__main__":
    export_all()
