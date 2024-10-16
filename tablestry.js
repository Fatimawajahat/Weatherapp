let currentPage = 1;  
const recordsPerPage = 10;
let totalRecords = 0;
var city;
const gapiKey = 'AIzaSyBhafo6_z_9mC6KdWLTGmIf1aYw2IatrzY'; 
var apiKey = '9cef5226693e7fcd8ba755ce66fb1684';


function fetchForecast() {
    city = document.getElementById('cityInput').value;
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    document.getElementById('loadingSpinner').style.display = 'block';

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch');
            }
            return response.json();
        })
        .then(data => {
            if (data.cod !== "200") {
                throw new Error(data.message);
            }
            window.storedForecastList = data.list;
            totalRecords = data.list.length;
            updatePagination(totalRecords);
            displayForecastTable(window.storedForecastList);  
        })
        .catch(error => {
            console.error("Error: ", error.message);
            document.getElementById('forecastTable').innerHTML = "Error loading data. Please try again.";
        })
        .finally(() => {
            document.getElementById('loadingSpinner').style.display = 'none';
        });
}


function displayForecastTable(forecastData) {
    const cityDisplay = document.getElementById('cityNameDisplay');
    cityDisplay.textContent = city;
    
    const table = document.getElementById('forecastTable');
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const slicedData = forecastData.slice(startIndex, endIndex);
    
    let tableHTML = `<table>
        <tr>
            <th>Date</th>
            <th>Temperature</th>
            <th>Condition</th>
            <th>Humidity</th>
            <th>Wind Speed</th>
        </tr>`;
    
    slicedData.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleString();
        tableHTML += `
            <tr>
                <td>${date}</td>
                <td>${item.main.temp.toFixed(2)} °C</td>
                <td>${item.weather[0].main}</td>
                <td>${item.main.humidity}%</td>
                <td>${item.wind.speed} m/s</td>
            </tr>`;
    });

    tableHTML += `</table>`;
    table.innerHTML = tableHTML;
}

function updatePagination(totalRecords) {
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
}

function goToNextPage() {
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    if (currentPage < totalPages) {
        currentPage++;  
        displayForecastTable(window.storedForecastList);
        updatePagination(totalRecords);  
    }
}

function goToPreviousPage() {
    if (currentPage > 1) {
        currentPage--;  
        displayForecastTable(window.storedForecastList);
        updatePagination(totalRecords);  
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('nextPage').addEventListener('click', goToNextPage);
    document.getElementById('prevPage').addEventListener('click', goToPreviousPage);

    const searchInput = document.getElementById('cityInput');
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            currentPage = 1;  
            fetchForecast(searchInput.value);
        }
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const input = document.getElementById("chatInput");
    input.addEventListener("keypress", sendChatOnEnter);
});

function sendChatOnEnter(event) {
    if (event.key === "Enter") {
        event.preventDefault(); 
        const userQuery = event.target.value.trim(); 
        if (userQuery) {
            fetchChatbotResponse(userQuery);
            event.target.value = ""; 
        }
    }
}

async function fetchChatbotResponse(query) {
    const chatAnswers = document.getElementById("chatAnswers");
    chatAnswers.innerHTML += `<div>You: ${query}</div>`;

    if (query.toLowerCase().includes("weather")) {
        await fetchWeatherInformation(query);
    } else {
        await fetchGeminiResponse(query);
    }
}

async function fetchGeminiResponse(query) {
    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyBhafo6_z_9mC6KdWLTGmIf1aYw2IatrzY'; 
    const chatAnswers = document.getElementById("chatAnswers");
    try {
        chatAnswers.innerHTML += `<div><em>ChatBot is typing...</em></div>`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{"parts": [{"text": query}]}]
            }),
        });

        const data = await response.json();
        console.log('Full response data:', data); 

        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content.parts.length > 0) {
            const chatResponseData = data.candidates[0].content.parts[0].text;
            chatAnswers.innerHTML += `<div>ChatBot: ${chatResponseData}</div>`;
        } else {
            throw new Error('Received no text from Gemini');
        }
    } catch (error) {
        console.error('Error fetching Gemini response:', error);
        chatAnswers.innerHTML += `<div>ChatBot: ${error.message}</div>`;
    } finally {
        chatAnswers.innerHTML = chatAnswers.innerHTML.replace('<div><em>ChatBot is typing...</em></div>', '');
        chatAnswers.scrollTop = chatAnswers.scrollHeight;
    }
}

function displayChatAnswer(message) {
    const chatAnswers = document.getElementById('chatAnswers');
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    chatAnswers.appendChild(messageElement);
}

function fetchWeatherInformation(query) {
    const city = query.match(/weather in (.+)/i); 
    if (!city) {
        displayChatAnswer("Please specify a city to check the weather.");
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city[1])}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch weather data');
            }
            return response.json();
        })
        .then(data => {
            if (!data.weather || data.weather.length === 0) {
                throw new Error('Weather data is incomplete.');
            }
            displayChatAnswer("Weather info: " + data.weather[0].description + " with a temperature of " + data.main.temp + "°C.");
        })
        .catch(error => {
            console.error('Error with weather response:', error);
            displayChatAnswer('Failed to get weather data, please try again.');
        });
}

function displayChatAnswer(message) {
    const chatAnswers = document.getElementById('chatAnswers');
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    chatAnswers.appendChild(messageElement);
}

