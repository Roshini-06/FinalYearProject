import urllib.request, json
data=json.dumps({'email': 'admin@gmail.com', 'password': 'Admin@123'}).encode()
req1 = urllib.request.Request('http://localhost:8000/api/v1/admin/login', data=data, headers={'Content-Type': 'application/json'})
token = json.loads(urllib.request.urlopen(req1).read().decode())['access_token']
req2 = urllib.request.Request('http://localhost:8000/api/v1/admin/complaints', headers={'Authorization': 'Bearer ' + token})
try:
    print(urllib.request.urlopen(req2).read().decode())
except Exception as e:
    print(e.read().decode())
