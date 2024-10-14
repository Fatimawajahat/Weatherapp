const apiKey = '9cef5226693e7fcd8ba755ce66fb1684'; 

function getWeather() {
    const city = document.getElementById('cityInput').value;
    const apiKey = '9cef5226693e7fcd8ba755ce66fb1684'; 
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => {
            if (response.status === 404) {
                throw new Error('City not found');
            }
            if (!response.ok) {
                throw new Error(`HTTP error, status = ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.cod !== "200") {
                throw new Error('City not found');
            }
            console.log("Forecast data received:", data); 
            window.storedForecastList = data.list;
            displayWeather(data.list[0], data.city.name);  
            updateCharts(data.list.slice(0, 40));  
            displayForecastGrid(data, 'metric');   
        })
        .catch(error => {
            console.error(error);
            document.getElementById('weatherDetails').innerText = error.message === 'City not found'
                ? 'City not found. Please try again.'
                : 'Something went wrong. Please try again later.';
        });
}



function displayWeather(data, cityName) {
    if (!data.weather || data.weather.length === 0) {
        document.getElementById('weatherDetails').innerHTML = "<p>No weather data available.</p>";
        return;
    }
    
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    const weatherDetailsDiv = document.getElementById('weatherDetails');
    const weather = `
        <h3>Weather Details</h3>
        <img src="${iconUrl}" alt="${data.weather[0].description}" style="width:50px;height:50px;">
        <p>City: ${cityName}</p>
        <p>Temperature: ${data.main.temp}°C</p>
        <p>Weather: ${data.weather[0].main}</p>
        <p>Description: ${data.weather[0].description}</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} km/h</p>
    `;
    weatherDetailsDiv.innerHTML = weather;
    setBackground(weatherDetailsDiv, data.weather[0].main);
}

function setBackground(element, weatherCondition) {
    console.log("Setting background for condition:", weatherCondition); 
    let imageUrl = '';
    switch (weatherCondition.toLowerCase()) {
        case 'clear':
            imageUrl = "url('/images/weather/sun.png')";
            break;
        case 'clouds':
            imageUrl = "url('/images/weather/clouds.png')";
            break;
        case 'rain':
            imageUrl = "url('/images/weather/rain.png')";
            break;
        default:
            imageUrl = "url('/images/weather/def.png')"; 
            break;
    }
    element.style.backgroundImage = imageUrl;
    element.style.backgroundSize = 'cover';
    element.style.backgroundPosition = 'center';
}

function updateCharts(forecast) {
    const sliceIndex = Math.max(forecast.length - 5, 0);
    const lastFiveForecast = forecast.slice(sliceIndex);

    const dates = lastFiveForecast.map(f => new Date(f.dt * 1000).toLocaleDateString());
    const temperatures = lastFiveForecast.map(f => f.main.temp);
    const conditionCounts = lastFiveForecast.reduce((acc, f) => {
        const condition = f.weather[0].main;
        acc[condition] = (acc[condition] || 0) + 1;
        return acc;
    }, {});

    if (window.barChart && typeof window.barChart.destroy === 'function') {
        window.barChart.destroy();
    }
    if (window.doughnutChart && typeof window.doughnutChart.destroy === 'function') {
        window.doughnutChart.destroy();
    }
    if (window.lineChart && typeof window.lineChart.destroy === 'function') {
        window.lineChart.destroy();
    }

    var barCtx = document.getElementById('barChart').getContext('2d');
    window.barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Temperature in °C',
                data: temperatures,
                backgroundColor: '#e891e0',
                borderColor: '#e891e4',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{ ticks: { beginAtZero: true } }],
                xAxes: [{ ticks: { autoSkip: false } }]
            }
        }
    });

    var doughnutCtx = document.getElementById('doughnutChart').getContext('2d');
    window.doughnutChart = new Chart(doughnutCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(conditionCounts),
            datasets: [{
                label: 'Weather Conditions',
                data: Object.values(conditionCounts),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF6384'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF6384']
            }]
        }
    });

    var lineCtx = document.getElementById('lineChart').getContext('2d');
    window.lineChart = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Temperature over Time',
                data: temperatures,
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderColor: '#5658af',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                yAxes: [{ ticks: { beginAtZero: true } }]
            }
        }
    });
}


function displayForecastGrid(forecastData, unit) {
    const forecastDetails = document.getElementById("forecast-details");
    forecastDetails.innerHTML = ""; 

    if (!forecastData || !forecastData.list || forecastData.list.length === 0) {
        console.log("No forecast data available or incorrect data structure:", forecastData);
        forecastDetails.innerHTML = "<p>No forecast data available.</p>";
        return;
    }

    const dailyForecasts = forecastData.list.filter((_, index) => index % 8 === 0).slice(0, 5);

    dailyForecasts.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const temp = item.main.temp;
        const weatherCondition = item.weather[0].description;
        const humidity = item.main.humidity;
        const windSpeed = item.wind.speed;
        const icon = `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`;

        const forecastCard = `
            <div class="forecast-item">
                <h5>${date.toLocaleDateString()} at ${date.toLocaleTimeString()}</h5>
                <img src="${icon}" alt="${weatherCondition}" style="width:50px;height:50px;">
                <p>Temperature: ${temp.toFixed(2)} ${unit === 'metric' ? '°C' : '°F'}</p>
                <p>Condition: ${weatherCondition}</p>
                <p>Humidity: ${humidity}%</p>
                <p>Wind Speed: ${windSpeed} m/s</p>
            </div>
        `;
        forecastDetails.innerHTML += forecastCard;
    });

    forecastDetails.style.display = 'flex';
    forecastDetails.style.justifyContent = 'space-between';
    forecastDetails.style.flexWrap = 'wrap'; 
    forecastDetails.style.padding = '10px';
    forecastDetails.style.width = '100%';
}

function displaySingleForecast(item, unit) {
    const forecastDetails = document.getElementById("forecast-details");
    forecastDetails.innerHTML = ""; 

    const date = new Date(item.dt * 1000);
    const temp = item.main.temp;
    const weatherCondition = item.weather[0].description;
    const humidity = item.main.humidity;
    const windSpeed = item.wind.speed;
    const icon = `http://openweathermap.org/img/wn/${item.weather[0].icon}.png`;

    const forecastCard = `
        <div class="forecast-item">
            <h5>${date.toLocaleDateString()}</h5>
            <img src="${icon}" alt="${weatherCondition}">
            <p>Temp: ${temp} ${unit === 'metric' ? '°C' : '°F'}</p>
            <p>Humidity: ${humidity}%</p>
            <p>Wind Speed: ${windSpeed} m/s</p>
            <p>Condition: ${weatherCondition}</p>
        </div>
    `;
    forecastDetails.innerHTML += forecastCard;
}

function showAscendingTemperatures(forecastList) {
    return forecastList
        .filter((item, index) => index % 8 === 0) 
        .sort((a, b) => a.main.temp - b.main.temp); 
}

function showDescendingTemperatures(forecastList) {
    return forecastList
        .filter((item, index) => index % 8 === 0)
        .sort((a, b) => b.main.temp - a.main.temp); 
}

function filterRainyDays(forecastList) {
    return forecastList
        .filter((item, index) => index % 8 === 0)
        .filter(item => item.weather[0].main.toLowerCase().includes('rain')); 
}

function showHighestTemperature(forecastList) {
    return forecastList.reduce((max, item) => (item.main.temp > max.main.temp ? item : max));
}

function sortTempsAsc() {
    const forecastList = getStoredForecastList(); 
    const sortedForecast = showAscendingTemperatures(forecastList); 
    displaySortedForecast(sortedForecast, 'metric'); 
}

function sortTempsDesc() {
    const forecastList = getStoredForecastList(); 
    const sortedForecast = showDescendingTemperatures(forecastList); 
    displaySortedForecast(sortedForecast, 'metric');
}

function filterRainDays() {
    const forecastList = getStoredForecastList();
    const filteredForecast = filterRainyDays(forecastList); 
    displaySortedForecast(filteredForecast, 'metric'); 
}

function resetFilters() {
    const forecastList = getStoredForecastList(); 
    displaySortedForecast(forecastList, 'metric'); 
}

function showHighestTemperature(forecastList) {
    
    const highestTempDay = forecastList
        .filter((item, index) => index % 8 === 0) 
        .reduce((max, item) => item.main.temp > max.main.temp ? item : max);

    
    return [highestTempDay]; 
}

function filterHighestTemperatureDay() {
    const forecastList = getStoredForecastList(); 
    const highestTempForecast = showHighestTemperature(forecastList); 
    displaySortedForecast(highestTempForecast, 'metric'); 
}

function displaySortedForecast(sortedList, unit) {
    const forecastDetails = document.getElementById("forecast-details");
    forecastDetails.innerHTML = ""; 

    sortedList.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const temp = item.main.temp;
        const weatherCondition = item.weather[0].description;
        const humidity = item.main.humidity;
        const windSpeed = item.wind.speed;
        const icon = `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`;

        const forecastCard = `
            <div class="forecast-item">
                <h5>${date.toLocaleDateString()} at ${date.toLocaleTimeString()}</h5>
                <img src="${icon}" alt="${weatherCondition}" style="width:50px;height:50px;">
                <p>Temperature: ${temp.toFixed(2)} ${unit === 'metric' ? '°C' : '°F'}</p>
                <p>Condition: ${weatherCondition}</p>
                <p>Humidity: ${humidity}%</p>
                <p>Wind Speed: ${windSpeed} m/s</p>
            </div>
        `;
        forecastDetails.innerHTML += forecastCard;
    });
}

function getStoredForecastList() {
    return window.storedForecastList || []; 
}


