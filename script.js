document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('search-form');
    const resultContainer = document.getElementById('result-container');

    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent the form from submitting

        const trainNumber = document.getElementById('train-number').value;
        const selectedDate = document.getElementById('date').value;

        // Construct the URL for the JSON file based on the selected date and train number
        const jsonUrl = `./${selectedDate.substring(0, 7)}/${selectedDate}/${trainNumber}.json`;

        // Fetch the JSON data
        fetch(jsonUrl)
            .then(response => response.json())
            .then(data => {
                // Handle the JSON data
                handleJsonData(data, trainNumber, selectedDate, resultContainer);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                // Display an error message if fetching fails
                resultContainer.innerHTML = `Não temos dados para o ${trainNumber} no dia ${selectedDate}`;
            });
    });
});

async function handleJsonData(data, trainNumber, selectedDate, resultContainer) {
    const response = data.response;
    const situacaoComboio = response.SituacaoComboio;
    const nodesPassagemComboio = response.NodesPassagemComboio;

    if (situacaoComboio === null) {
        resultContainer.innerHTML = `O comboio ${trainNumber} não se realizou no dia ${selectedDate}`;
    } else if (situacaoComboio === "SUPRIMIDO") {
        resultContainer.innerHTML = `O comboio ${trainNumber} foi suprimido no dia ${selectedDate}`;
    } else {
        // Create a table for displaying the data
        const table = document.createElement('table');
        const thead = table.createTHead();
        const tbody = table.createTBody();

        // Create table headers
        const headers = ['Estação', 'Programado', 'Real', "Atrasos Anteriores"];
        const headerRow = thead.insertRow();
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        // Create an array to store promises for each dropdown
        const dropdownPromises = [];

        // Loop through nodesPassagemComboio and create rows
        nodesPassagemComboio.forEach(async (node,index) => {
            const row = tbody.insertRow();
            const estacaoCell = row.insertCell(0);
            const programadoCell = row.insertCell(1);
            const realCell = row.insertCell(2);
            const atrasosCell = row.insertCell(3);

            // Wait for all dropdown promises to resolve
            dropdownPromises.push(getDelays(node.NomeEstacao, trainNumber));
            const dropdownContents = await Promise.all(dropdownPromises);

            atrasosCell.innerHTML = dropdownContents[index];
            estacaoCell.textContent = node.NomeEstacao;
            programadoCell.textContent = node.HoraProgramada;

            if (node.Observacoes && node.Observacoes !== "") {
                const match = node.Observacoes.match(/Hora Prevista:(\d{2}:\d{2})/);
                if (match) {
                    realCell.textContent = match[1];
                } else {
                    realCell.textContent = node.HoraProgramada;
                }
            } else {
                realCell.textContent = node.HoraProgramada;
            }
        });
        resultContainer.innerHTML = ''; // Clear any previous content
        resultContainer.appendChild(table);
    }
}


async function getDelays(NomeEstacao, trainNumber) {
    // time to get the delays
    // Get the current date in Lisbon, Portugal's timezone (WET or WEST)
    let currentDate = new Date().toLocaleString('en-US', { timeZone: 'Europe/Lisbon' });
    currentDate = new Date(currentDate); // Convert the formatted date back to a Date object
    let iter = 0;
    let innerHTML = '<select>';
    while (iter < 100) {
        iter += 1;
        const formattedDate = new Date(currentDate).toISOString().split('T')[0];
        const url = `./${formattedDate.substring(0, 7)}/${formattedDate}/${trainNumber}.json`;
        currentDate.setDate(currentDate.getDate() - 1);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                // File not found, stop fetching
                break;
            }
            const data = await response.json();
            const situacaoComboio = data.response.SituacaoComboio;
            if (situacaoComboio === null) {
                innerHTML += `<option value=0>${formattedDate} -> Não Realizado</option>`;
                continue;
            }
            else if (situacaoComboio === "SUPRIMIDO") {
                innerHTML += `<option value=0>${formattedDate} -> SUPRIMIDO</option>`;
                continue;
            }
            const nodesPassagemComboio = data.response.NodesPassagemComboio;
            nodesPassagemComboio.forEach(node => {
                if (node.NomeEstacao === NomeEstacao) {
                    // Move to the previous day
                    if (node.Observacoes && node.Observacoes !== "") {
                        const match = node.Observacoes.match(/Hora Prevista:(\d{2}):(\d{2})/);
                        if (match) {
                            let horaPrevistaHours = parseInt(match[1]);
                            if (horaPrevistaHours === 0 || horaPrevistaHours === 1){
                                horaPrevistaHours += 24;
                            }
                            const horaPrevistaMinutes = parseInt(match[2]);
                            const horaProgramadaHours = parseInt(node.HoraProgramada.substring(0, 2));
                            const horaProgramadaMinutes = parseInt(node.HoraProgramada.substring(3, 5));

                            // Calculate the time difference
                            const atraso = (horaPrevistaHours - horaProgramadaHours)*60 + (horaPrevistaMinutes - horaProgramadaMinutes)
                            let val = 1;
                            if(atraso >= 30){
                                val = 3;
                            }
                            else if(atraso >= 15){
                                val = 2;
                            }
                            innerHTML += `<option value=${val}>${formattedDate} -> ${atraso}</option>`
                        }
                    }
                    else{
                        innerHTML += `<option value=1>${formattedDate} -> 0</option>`
                    }
                    return;
                }
            });
        } catch (error) {
            // no need to display this error!
            //console.error(error);
            break;
        }
    }
    innerHTML += `</select>`;
    return innerHTML;
}
