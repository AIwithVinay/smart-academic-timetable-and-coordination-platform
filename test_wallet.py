import requests

def test_add_money(user_id, amount):
    url = "http://127.0.0.1:8001/wallet/add"
    payload = {"user_id": user_id, "amount": amount}
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Test with a likely user ID (e.g., 1 or whatever existing user)
    # I'll try user_id=1, verify_admin_data.py showed we have users.
    test_add_money(1, 500.0)
