#!/usr/bin/env python3
"""
Manually import quotes to production database via API
"""
import json
import requests

# Production API
API_URL = "https://octovoc-production.up.railway.app/api"

# Admin credentials
EMAIL = "info@katern.be"
PASSWORD = "18SIcttasd!"

def main():
    # Login
    print("Logging in...")
    response = requests.post(
        f"{API_URL}/auth/login",
        json={"email": EMAIL, "password": PASSWORD}
    )

    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return

    token = response.json()["token"]
    print(f"✓ Logged in successfully")

    # Load quotes
    with open("backend/quotes_export.json", "r", encoding="utf-8") as f:
        quotes = json.load(f)

    print(f"\nImporting {len(quotes)} quotes...")

    # Import each quote
    headers = {"Authorization": f"Bearer {token}"}
    success_count = 0

    for i, quote in enumerate(quotes, 1):
        response = requests.post(
            f"{API_URL}/admin/quote",
            headers=headers,
            json=quote
        )

        if response.status_code in [200, 201]:
            success_count += 1
            print(f"  [{i}/{len(quotes)}] ✓ {quote['author'][:30]}")
        else:
            print(f"  [{i}/{len(quotes)}] ✗ Failed: {response.text}")

    print(f"\n{'='*60}")
    print(f"✓ Successfully imported {success_count}/{len(quotes)} quotes!")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
