import urllib.request
import json
import base64

# Build a realistic JWT-shaped token (3 parts, base64 encoded)
header = base64.urlsafe_b64encode(b'{"alg":"RS256","typ":"JWT"}').decode().rstrip("=")
payload = base64.urlsafe_b64encode(
    b'{"sub":"user_test123","email":"jkroshini5@gmail.com","iat":1000000000,"exp":9999999999}'
).decode().rstrip("=")
fake_token = f"{header}.{payload}.fakesignature"

print(f"Testing with token: {fake_token[:50]}...")
print(f"Testing email: jkroshini5@gmail.com")
print()

try:
    req = urllib.request.Request("http://localhost:8000/api/v1/complaints/my")
    req.add_header("Authorization", f"Bearer {fake_token}")
    req.add_header("X-User-Email", "jkroshini5@gmail.com")
    resp = urllib.request.urlopen(req)
    data = json.loads(resp.read())
    print("SUCCESS - Complaints returned:", data)
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"HTTP Error {e.code}: {e.reason}")
    print("Response body:", body)
except Exception as e:
    print("Connection error:", e)
