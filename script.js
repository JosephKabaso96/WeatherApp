let unit = "metric"; // Default unit for temperature measurement is set to Celsius ("metric" unit).

// Function to fetch and display the current weather and forecast based on the selected province.
function getWeather() {
  const apiKey = "613d08789796745747b4305b05f01df6"; // OpenWeatherMap API key.
  const province = document.getElementById("province").value; // Get the selected province from the dropdown.

  // If no province is selected, show an error message.
  if (!province) {
    document.getElementById("error-message").innerText =
      "Please select a province.";
    return; // Stop the function if no province is selected.
  }

  // API URLs for current weather and 5-day weather forecast for the selected province.
  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${province},Zambia&units=${unit}&appid=${apiKey}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${province},Zambia&units=${unit}&appid=${apiKey}`;

  // Fetch the current weather data.
  fetch(currentWeatherUrl)
    .then((response) => {
      if (!response.ok) throw new Error("Province not found"); // If the response is not OK, throw an error.
      return response.json(); // Parse the JSON response.
    })
    .then((data) => {
      displayWeather(data); // Display the current weather data.
      updateBackground(data.weather[0].main); // Update the background based on the weather condition.
      return fetch(forecastUrl); // Fetch the 5-day forecast data.
    })
    .then((response) => {
      if (!response.ok) throw new Error("Forecast not found"); // Handle any errors in fetching forecast data.
      return response.json(); // Parse the forecast JSON response.
    })
    .then((data) => {
      displayForecast(data.list); // Display the forecast data.
    })
    .catch((error) => {
      console.error("Error:", error); // Log any errors.
      document.getElementById("error-message").innerText = error.message; // Show error message to the user.
    });

  updateTime(); // Update the current time display.
}

// Function to change the background image based on the weather condition.
function updateBackground(weatherCondition) {
  const body = document.body;
  const currentHour = new Date().getHours(); // Get the current hour (to determine day or night).

  // Change the background image based on the weather condition.
  switch (weatherCondition.toLowerCase()) {
    case "clear":
      body.style.backgroundImage = "url('images/sunny.jpg')";
      break;
    case "clouds":
      body.style.backgroundImage = "url('images/cloudy.jpg')";
      break;
    case "rain":
      body.style.backgroundImage = "url('images/rainy.jpg')";
      break;
    case "snow":
      body.style.backgroundImage = "url('images/snowy.jpg')";
      break;
    case "thunderstorm":
      body.style.backgroundImage = "url('images/thunderstorm.jpg')";
      break;
    default:
      body.style.backgroundImage = "url('images/default.jpg')"; // Default background for other conditions.
  }

  // Adjust background color based on the time of day (darker at night).
  if (currentHour < 6 || currentHour >= 18) {
    body.style.backgroundColor = "rgba(0, 0, 0, 0.5)"; // Dark background for nighttime.
  } else {
    body.style.backgroundColor = "rgba(255, 255, 255, 0.5)"; // Lighter background for daytime.
  }

  body.style.backgroundSize = "cover"; // Ensure the background image covers the whole page.
}

// Function to display the current weather data on the page.
function displayWeather(data) {
  const tempDivInfo = document.getElementById("temp-div"); // Element to show the temperature.
  const weatherInfoDiv = document.getElementById("weather-info"); // Element to show weather description and city name.
  const humidityWindspeedDiv = document.getElementById("humidity-windspeed"); // Element for humidity and windspeed.
  const weatherIcon = document.getElementById("weather-icon"); // Weather icon element.

  const cityName = data.name; // Name of the city.
  const temperature = Math.round(data.main.temp); // Round the temperature value.
  const description = data.weather[0].description; // Weather description (e.g., "clear sky").
  const iconCode = data.weather[0].icon; // Weather icon code from OpenWeatherMap.
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`; // URL for the weather icon.

  // Display the temperature in Celsius or Fahrenheit based on the selected unit.
  tempDivInfo.innerHTML = `${temperature}°${unit === "metric" ? "C" : "F"}`;
  weatherInfoDiv.innerHTML = `<p>${cityName}</p><p>${description}</p>`; // Show city and description.
  humidityWindspeedDiv.innerHTML = `Humidity: ${data.main.humidity}% | Windspeed: ${data.wind.speed} m/s`; // Show humidity and windspeed.
  weatherIcon.src = iconUrl; // Set the weather icon image.
  weatherIcon.alt = description; // Set the alt text for accessibility.
  weatherIcon.style.display = "block"; // Make the weather icon visible.
}

// Function to display the 5-day weather forecast.
function displayForecast(hourlyData) {
  const forecastDiv = document.getElementById("forecast");
  forecastDiv.innerHTML = ""; // Clear any previous forecast data.

  const dailyData = {}; // Object to store daily forecast data.

  // Process the hourly data and group it by day.
  hourlyData.forEach((item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString(); // Convert the timestamp to a local date.
    const day = new Date(item.dt * 1000).toLocaleDateString("en-US", {
      weekday: "long",
    }); // Get the day of the week.

    // If the date doesn't exist in dailyData, initialize it.
    if (!dailyData[date]) {
      dailyData[date] = { temperatures: [], icons: [], descriptions: [] };
    }
    // Store temperature, weather icon, and description for each day.
    dailyData[date].temperatures.push(item.main.temp);
    dailyData[date].icons.push(item.weather[0].icon);
    dailyData[date].descriptions.push(item.weather[0].description);
  });

  // Loop through each date and display the forecast for that day.
  for (const date in dailyData) {
    const avgTemp = Math.round(
      dailyData[date].temperatures.reduce((a, b) => a + b) /
        dailyData[date].temperatures.length
    ); // Calculate the average temperature for the day.

    const iconUrl = `https://openweathermap.org/img/wn/${dailyData[date].icons[0]}.png`; // Use the first icon for the day.
    const weatherDescription = dailyData[date].descriptions[0]; // Get the first description for the day.

    // Create the HTML for each forecast item.
    const forecastItemHtml = `
      <div class="forecast-item">
        <span>${new Date(date).toLocaleDateString("en-US", {
          weekday: "long",
        })} ${date}</span>y
        <img src="${iconUrl}" alt="Weather Icon">
        <span>${avgTemp}°${unit === "metric" ? "C" : "F"}</span>
        <p>${
          weatherDescription.charAt(0).toUpperCase() +
          weatherDescription.slice(1)
        }</p> <!-- Capitalize first letter -->
      </div>
    `;

    forecastDiv.innerHTML += forecastItemHtml; // Add the forecast item to the forecast div.
  }
}

// Function to toggle between Celsius (metric) and Fahrenheit (imperial).
function toggleUnit() {
  const checkbox = document.getElementById("unit-toggle");
  unit = checkbox.checked ? "imperial" : "metric"; // Change the unit based on the checkbox state.
  getWeather(); // Fetch the weather again with the updated unit.
}

// Function to update and display the current time.
function updateTime() {
  const now = new Date();
  const timeDisplay = document.getElementById("time-display"); // Element to display the time.
  timeDisplay.innerText = now.toLocaleTimeString(); // Display the current time in a localized format.
}

// Update the time every second.
setInterval(updateTime, 1000); // Call updateTime every 1000ms (1 second) to keep the time display updated.
