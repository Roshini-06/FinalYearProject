import urllib.request
import json
import urllib.error

def test_endpoint(url, data):
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=5) as f:
            print(f.status, f.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"Error {e.code}: {e.read().decode('utf-8')}")
    except Exception as e:
        print("Network error:", str(e))

print("Testing Registration...")
test_endpoint('http://localhost:8000/api/v1/auth/register', {
    "email": "testagent10@gmail.com",
    "password": "password123",
    "role": "user"
})

print("\nTesting Login...")
test_endpoint('http://localhost:8000/api/v1/auth/login', {
    "email": "testagent10@gmail.com",
    "password": "password123"
})
