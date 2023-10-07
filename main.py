import requests
import json
from datetime import datetime
import pytz

# Define the list of train numbers
train_numbers = [4400, 930, 932, 5600, 520, 540, 510, 730, 4416, 720, 4422, 4424, 524, 4426, 512, 4428, 722, 542, 4430, 4432, 126, 511, 4407, 121, 541, 4409, 721, 4413, 621, 4415, 513, 4417, 543, 523, 5601, 525, 931, 731, 4427, 515, 545, 723, 529, 131, 180, 123, 130, 182, 125, 120, 133, 122, 135, 132, 127, 184, 137, 186, 124, 134, 136]

# Set the timezone to Lisbon
lisbon_timezone = pytz.timezone("Europe/Lisbon")
# Get the current date and time in Lisbon timezone
current_datetime = datetime.now(lisbon_timezone)
# Format the current date in "yyyy-mm-dd" format
current_date = current_datetime.strftime("%Y-%m-%d")

# Define headers
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
}

# Loop through train numbers
for train_number in train_numbers:
    # Define GitHub raw URL
    github_url = f"https://raw.githubusercontent.com/Ladol/trains/main/2023-10/{current_date}/{train_number}.json"
    
    # Check if the GitHub raw URL exists (returns 404 if not)
    github_response = requests.get(github_url, headers=headers)
    
    if github_response.status_code == 404:
        # GitHub raw URL does not exist, make a request to infraestruturasdeportugal.pt
        infraestruturas_url = f"https://www.infraestruturasdeportugal.pt/negocios-e-servicos/horarios-ncombio/{train_number}/{current_date}"
        infraestruturas_response = requests.get(infraestruturas_url, headers=headers)
        
        if infraestruturas_response.status_code == 200:
            # Parse JSON data from infraestruturasdeportugal.pt
            infraestruturas_data = infraestruturas_response.json()
            
            # Process data (skip SUPRIMIDO and update NodesPassagemComboio)
            #processed_data = process_train_data(infraestruturas_data, infraestruturas_data)
            
            # Save processed data to a file
            with open(f'./2023-10/{current_date}/{train_number}.json', 'w') as json_file:
                json.dump(infraestruturas_data, json_file)
        else:
            print(f"Failed to fetch data from infraestruturasdeportugal.pt for train {train_number}")
    else:
        print(f"Data already exists for train {train_number} on GitHub")
        # GitHub raw URL exists, fetch the data from GitHub
        github_data = github_response.json()
            
        # Check SituacaoComboio in data1
        situacao_comboio = github_data["response"]["SituacaoComboio"]
            
        # Check if SituacaoComboio is null or "SUPRIMIDO"
        if situacao_comboio is None or situacao_comboio == "SUPRIMIDO":
            print(f"Skipping train {train_number} as SituacaoComboio is {situacao_comboio}")
            continue
            
         # Iterate through NodesPassagemComboio in data1
        write = False
        for node1 in github_data["response"]["NodesPassagemComboio"]:
            if node1["ComboioPassou"]:
                continue
            write = True
            # Find the corresponding node in data2 based on "NomeEstacao"
            corresponding_node2 = next((node2 for node2 in infraestruturas_data["response"]["NodesPassagemComboio"] if node2["NomeEstacao"] == node1["NomeEstacao"]), None)
                
            if corresponding_node2 is not None: #SHOULD NEVER BE NONE!
                # Update "ComboioPassou" in data1 with the value from data2
                if corresponding_node2["ComboioPassou"]:
                    node1["ComboioPassou"] = True
                else:
                    node1 = corresponding_node2
            
        # Save updated data1 to a file
        if write:
            with open(f'./2023-10/{current_date}/{train_number}.json', 'w') as json_file:
                json.dump(github_data, json_file)
