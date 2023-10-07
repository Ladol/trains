import requests
import json
from datetime import date

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
}
# Define the URL to fetch JSON data from
url = "https://www.infraestruturasdeportugal.pt/negocios-e-servicos/horarios-ncombio/731/2023-10-07"
#just to force a push
# Send an HTTP GET request to the URL
response = requests.get(url, headers=headers)

# Check if the request was successful (status code 200)
if response.status_code == 200:
    # Parse the JSON data
    data = response.json()

    # Define the path where you want to save the JSON file in your local repository
    file_path = f"2023-10/2023-10-07/730-2023-10-07.json"

    # Serialize the JSON data and save it to the specified file path
    with open('output2.json', 'w') as json_file:
        json.dump(data, json_file)

    print("JSON data has been fetched and saved successfully.")
else:
    print(f"Failed to fetch data. Status code: {response.status_code}")
