import requests

try:
    print("Checking Backend...")
    response = requests.get("http://127.0.0.1:8001/schedule?section=E")
    print(f"Status: {response.status_code}")
    print(f"Data: {response.json()}")
except Exception as e:
    print(f"Failed to connect: {e}")
