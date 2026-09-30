"""Owner: C (Data + peers). Writes synthetic data into /data with a fixed seed.

Outputs: customers.json (5,000), past_moments.json (~12,000), personas.json (Lotte, Tom).
Plant the tiny Iceland / singles 65+ cohort (n≈8) on purpose.
Run: python scripts/generate.py
"""
import json
import random
from pathlib import Path

SEED = 42
DATA = Path(__file__).resolve().parent.parent / "data"


def main() -> None:
    random.seed(SEED)
    DATA.mkdir(exist_ok=True)
    # TODO: generate customers, past_moments, personas
    for name in ("customers", "past_moments", "personas"):
        (DATA / f"{name}.json").write_text(json.dumps([], indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
