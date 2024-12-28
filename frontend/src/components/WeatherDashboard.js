import React, { useState } from "react";
import axios from 'axios';
import { Box, Typography } from '@mui/material';

function WeatherDashboard() {
    const [city, setCity] = useState('');
    const [weather, setWeather] = useState(null);

    const fetchWeather = async () => {
        try{
            const response = await axios.get('http://localhost:5001/api/weather', {
                params: { city },
            });
            setWeather(response.data.weatherData);
        } catch (error) {
            console.error('Error fetching weather:', error);
            alert('Failed to fetch weather data.');
        }
    };

    return (
        <>
        <Typography variant="body1" align="center" sx={{ marginTop: '20px' }}>
            <h1>Weather Dashboard</h1>
            <input
                type="text"
                placeholder="Enter city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
            />
            <button onClick={fetchWeather}>Get Weather</button>
        </Typography>
            
        {!weather ? (
    <Typography variant="body1" align="center" sx={{ marginTop: '20px' }}>
        Enter a city and click "Get Weather" to view the weather data.
    </Typography>
) : (
    <Box
        sx={{
            margin: '20px auto',
            maxWidth: '800px',
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '10px',
            backgroundColor: '#f9f9f9',
        }}
    >
        <Typography variant="h4" align="center">
            {weather.name}, {weather.sys?.country}
        </Typography>
        {weather.main && (
            <>
                <Typography variant="body1"><strong>Temperature:</strong> {weather.main.temp} °F</Typography>
                <Typography variant="body1"><strong>Feels Like:</strong> {weather.main.feels_like} °F</Typography>
                <Typography variant="body1"><strong>Min Temperature:</strong> {weather.main.temp_min} °F</Typography>
                <Typography variant="body1"><strong>Max Temperature:</strong> {weather.main.temp_max} °F</Typography>
                <Typography variant="body1"><strong>Humidity:</strong> {weather.main.humidity}%</Typography>
                <Typography variant="body1"><strong>Pressure:</strong> {weather.main.pressure} hPa</Typography>
                {weather.main.sea_level && (
                    <Typography variant="body1"><strong>Sea Level Pressure:</strong> {weather.main.sea_level} hPa</Typography>
                )}
                {weather.main.grnd_level && (
                    <Typography variant="body1"><strong>Ground Level Pressure:</strong> {weather.main.grnd_level} hPa</Typography>
                )}
            </>
        )}
        {weather.visibility && (
            <Typography variant="body1"><strong>Visibility:</strong> {weather.visibility} meters</Typography>
        )}
        {weather.wind && (
            <>
                <Typography variant="body1"><strong>Wind Speed:</strong> {weather.wind.speed} mph</Typography>
                <Typography variant="body1"><strong>Wind Direction:</strong> {weather.wind.deg}°</Typography>
            </>
        )}
        {weather.clouds && (
            <Typography variant="body1"><strong>Cloudiness:</strong> {weather.clouds.all}%</Typography>
        )}
        {weather.weather && weather.weather[0] && (
            <>
                <Typography variant="body1"><strong>Weather Condition:</strong> {weather.weather[0].main}</Typography>
                <Typography variant="body1"><strong>Description:</strong> {weather.weather[0].description}</Typography>
            </>
        )}
        {weather.sys && (
            <>
                <Typography variant="body1"><strong>Sunrise:</strong> {new Date(weather.sys.sunrise * 1000).toLocaleTimeString()}</Typography>
                <Typography variant="body1"><strong>Sunset:</strong> {new Date(weather.sys.sunset * 1000).toLocaleTimeString()}</Typography>
            </>
        )}
    </Box>
)}
        </>
    );
    
};

export default WeatherDashboard;