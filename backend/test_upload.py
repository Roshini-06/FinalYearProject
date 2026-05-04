import requests

url = "http://127.0.0.1:8000/api/v1/complaints/upload-csv"
files = {'file': ('test.csv', b"complaint_text\nHello there this is a test complaint for electricity issue", 'text/csv')}
headers = {} # No auth for now, expect 401. If it resets, there's a big problem.

try:
    response = requests.post(url, files=files)
    print("Status Code:", response.status_code)
    try:
        print("Response JSON:", response.json())
    except:
        print("Response Text:", response.text)
except Exception as e:
    print("Exception:", str(e))
