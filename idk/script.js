const apiKey = '9cef5226693e7fcd8ba755ce66fb1684'; 
const weatherDetails = document.getElementById('weatherDetails');
const cityInput = document.getElementById('cityInput');

function getWeather() {
    const city = cityInput.value.trim();
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.cod !== 200) {
                weatherDetails.innerText = "City not found.";
                return;
            }
            displayWeatherData(data);
            updateCharts(data);
        })
        .catch(error => {
            weatherDetails.innerText = "Failed to retrieve data.";
            console.error('Error fetching weather data:', error);
        });
}

function displayWeatherData(data) {
    weatherDetails.innerHTML = `
        City: ${data.name}<br>
        Temperature: ${data.main.temp} °C<br>
        Weather: ${data.weather[0].main} (${data.weather[0].description})<br>
        Humidity: ${data.main.humidity}%<br>
        Wind: ${data.wind.speed} km/h
    `;
}

function updateCharts(data) {
    const tempData = [data.main.temp, data.main.feels_like, data.main.temp_min, data.main.temp_max];
    const labels = ['Current', 'Feels Like', 'Min', 'Max'];

    if (window.barChart) window.barChart.destroy();
    if (window.doughnutChart) window.doughnutChart.destroy();
    if (window.lineChart) window.lineChart.destroy();

    var barCtx = document.getElementById('barChart').getContext('2d');
    window.barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature in °C',
                data: tempData,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });

    var doughnutCtx = document.getElementById('doughnutChart').getContext('2d');
    window.doughnutChart = new Chart(doughnutCtx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature Distribution',
                data: tempData,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false
        }
    });

    var lineCtx = document.getElementById('lineChart').getContext('2d');
    window.lineChart = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature over Time',
                data: tempData,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}
