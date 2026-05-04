import urllib.request
import urllib.error

url = "http://127.0.0.1:8000/api/v1/complaints/upload-csv"
data = b'--boundary123\r\nContent-Disposition: form-data; name="file"; filename="test.csv"\r\nContent-Type: text/csv\r\n\r\ncomplaint_text\r\nHello there this is a test complaint for electricity issue\r\n--boundary123--\r\n'

req = urllib.request.Request(url, data=data, method="POST")
req.add_header("Content-Type", "multipart/form-data; boundary=boundary123")

try:
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Body:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print("Body:", e.read().decode('utf-8'))
except Exception as e:
    print("Error:", str(e))
