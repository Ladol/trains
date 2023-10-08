document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('search-form').addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent the form from submitting

        const trainNumber = document.getElementById('train-number').value;
        const selectedDate = document.getElementById('date').value;

        // Construct the URL for the JSON file based on the selected date and train number
        const jsonUrl = `./${selectedDate.substring(0, 7)}/${selectedDate}/${trainNumber}.json`;

        // Fetch the JSON data
        fetch(jsonUrl)
            .then(response => response.json())
            .then(data => {
                // Display the JSON data on the webpage
                const resultContainer = document.getElementById('result-container');
                resultContainer.innerHTML = JSON.stringify(data, null, 2);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                // Display an error message if fetching fails
                const resultContainer = document.getElementById('result-container');
                resultContainer.innerHTML = 'Error fetching data';
            });
    });
});
