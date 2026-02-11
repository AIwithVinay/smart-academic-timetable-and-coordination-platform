import requests

def test_eod_api(user_id):
    url = f"http://127.0.0.1:8001/student/eod-dues/{user_id}"
    try:
        response = requests.get(url)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_eod_api(1)
