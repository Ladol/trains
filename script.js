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
                handleJsonData(data, trainNumber, selectedDate);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                // Display an error message if fetching fails
                resultContainer.innerHTML = `Não temos dados para o ${trainNumber} no dia ${selectedDate}`;
            });
    });
});

function handleJsonData(data, trainNumber, selectedDate) {
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
        const headers = ['Estação', 'Programado', 'Real'];
        const headerRow = thead.insertRow();
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        // Create table rows
        nodesPassagemComboio.forEach(node => {
            const row = tbody.insertRow();
            const estacaoCell = row.insertCell(0);
            const programadoCell = row.insertCell(1);
            const realCell = row.insertCell(2);

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
