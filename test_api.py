import requests
import json

def test_endpoint():
    url = "http://127.0.0.1:8001/attendance/CS101/2026-02-11/G"
    try:
        print(f"Fetching {url}...")
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Data received: {len(data)} records")
            print(json.dumps(data[:3], indent=2))
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    test_endpoint()
