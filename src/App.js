import './App.css';
import { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';

function App() {
  const [latitude, setLatitude] = useState('0');
  const [longitude, setLongitude] = useState('0');
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedHour, setSelectedHour] = useState(0);
  const [displayMode, setDisplayMode] = useState('all');

  const fetchData = async (latitude, longitude) => {
    if (isNaN(latitude) || isNaN(longitude)) {
      setError('Invalid latitude or longitude value');
      return;
    }

    try {
      const tempLat = parseFloat(latitude);
      const tempLong = parseFloat(longitude);

      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${tempLat}&longitude=${tempLong}&hourly=temperature_2m,precipitation_probability,surface_pressure,visibility&timezone=America%2FChicago&forecast_days=1`);

      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();
      setWeatherData(data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch weather data. Please try again.');
    }
  };

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude))) {
        await fetchData(latitude, longitude);
      } else {
        setError('Invalid latitude or longitude value');
      }
    };

    fetchWeatherData();
  }, [latitude, longitude]);

  useEffect(() => {
    if (weatherData && displayMode === 'all') {
      drawLineChart();
    }
  }, [weatherData, displayMode]);

  const handleLatitudeChange = (event) => {
    setLatitude(event.target.value);
  };

  const handleLongitudeChange = (event) => {
    setLongitude(event.target.value);
  };

  const handleHourChange = (event) => {
    setSelectedHour(parseInt(event.target.value));
  };

  const handleDisplayModeChange = (event) => {
    setDisplayMode(event.target.value);
  };

  const handleLocationClick = (location) => {
    switch (location) {
      case 'houston':
        setLatitude('29.7604');
        setLongitude('-95.3698');
        break;
      case 'austin':
        setLatitude('30.2672');
        setLongitude('-97.7431');
        break;
      case 'dallas':
        setLatitude('32.7767');
        setLongitude('-96.7970');
        break;
      default:
        break;
    }
  };

  const drawLineChart = () => {
    const ctx = document.getElementById('weatherChart');

    if (!ctx) return;

    if (ctx.chart) {
      ctx.chart.destroy();
    }

    const labels = [...Array(24).keys()];
    const temperatureData = weatherData.hourly.temperature_2m;
    const precipitationData = weatherData.hourly.precipitation_probability;

    const chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Temperature (°C)',
            data: temperatureData,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
          },
          {
            label: 'Precipitation Probability (%)',
            data: precipitationData,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    ctx.chart = chartInstance;
  };

  return (
    <div>
      <div>
        <div>
          Latitude: <input type="text" value={latitude} onChange={handleLatitudeChange} placeholder="Enter latitude" />
        </div>
        <div>
          Longitude: <input type="text" value={longitude} onChange={handleLongitudeChange} placeholder="Enter longitude" />
        </div>
        {error && <div>Error: {error}</div>}
      </div>
      <div>
        <button onClick={() => handleLocationClick('houston')}>Houston</button>
        <button onClick={() => handleLocationClick('austin')}>Austin</button>
        <button onClick={() => handleLocationClick('dallas')}>Dallas</button>
      </div>
      <div>
        <label>Select Display Mode: </label>
        <select value={displayMode} onChange={handleDisplayModeChange}>
          <option value="all">All</option>
          <option value="one">One</option>
        </select>
      </div>
      {displayMode === 'one' && (
        <div>
          <label>Select Hour: </label>
          <select value={selectedHour} onChange={handleHourChange}>
            {[...Array(24).keys()].map(hour => (
              <option key={hour} value={hour}>{hour}</option>
            ))}
          </select>
        </div>
      )}
      {displayMode === 'all' && weatherData && (
        <div className='chart-container'>
          <canvas id="weatherChart"></canvas>
        </div>
      )}
      {displayMode === 'one' && weatherData && (
        <div className='weatherInfoText'>
          <p>Hour {selectedHour}: </p>
          <p>Temperature: {weatherData.hourly.temperature_2m[selectedHour]}°C</p>
          <p>Precipitation Probability: {weatherData.hourly.precipitation_probability[selectedHour]}%</p>
          <p>Surface Pressure: {weatherData.hourly.surface_pressure[selectedHour]} hPa</p>
          <p>Visibility: {weatherData.hourly.visibility[selectedHour]} km</p>
        </div>
      )}
    </div>
  );
}

export default App;
