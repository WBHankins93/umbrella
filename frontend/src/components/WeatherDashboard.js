import React, { useState } from "react";
import axios from 'axios';
import { Box, Typography, Card, CardContent, TextField, Button, Stack, Paper } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WbSunny, Opacity, Air, Cloud, ThermostatAutoOutlined, Visibility, Speed, WbTwilight, ThermostatAuto } from '@mui/icons-material';

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

    const convertToFahrenheit = (celsius) => {
        return ((celsius * 9/5) + 32).toFixed(1);
    };

    const tempData = weather ? [
        { name: 'Current', temp: convertToFahrenheit(weather.main.temp) },
        { name: 'Feels Like', temp: convertToFahrenheit(weather.main.feels_like) },
        { name: 'Min', temp: convertToFahrenheit(weather.main.temp_min) },
        { name: 'Max', temp: convertToFahrenheit(weather.main.temp_max) }
    ] : [];

    return (
        <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', padding: 3 }}>
            <Typography variant="h3" align="center" sx={{ 
                color: '#1976d2',
                fontWeight: 'bold',
                mb: 4 
            }}>
                Weather Dashboard
            </Typography>

            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 4 }}>
                <TextField
                    variant="outlined"
                    placeholder="Enter city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    sx={{ bgcolor: 'white' }}
                />
                <Button 
                    variant="contained" 
                    onClick={fetchWeather}
                    sx={{ px: 4 }}
                >
                    Get Weather
                </Button>
            </Stack>
            
            {!weather ? (
                <Typography variant="h6" align="center" sx={{ mt: 4 }}>
                    Enter a city and click "Get Weather" to view the weather data.
                </Typography>
            ) : (
                <Stack spacing={3}>
                    {/* Main Weather Card */}
                    <Card elevation={3}>
                        <CardContent>
                            <Typography variant="h4" align="center" gutterBottom>
                                {weather.name}, {weather.sys?.country}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                                <ThermostatAutoOutlined color="primary" sx={{ fontSize: 40 }} />
                                <Typography variant="h3">
                                    {convertToFahrenheit(weather.main.temp)}°F
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Temperature Chart and Current Conditions */}
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                        <Card elevation={3} sx={{ flex: 2, height: '400px', p: 2 }}>
                            <Typography variant="h6" gutterBottom>Temperature Overview</Typography>
                            <ResponsiveContainer width="100%" height="85%">
                                <LineChart data={tempData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis unit="°F" />
                                    <Tooltip />
                                    <Line 
                                        type="monotone" 
                                        dataKey="temp" 
                                        stroke="#1976d2" 
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>

                        <Card elevation={3} sx={{ flex: 1 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Current Conditions</Typography>
                                <Stack spacing={2}>
                                    <Stack direction="row" spacing={2}>
                                        <Paper elevation={1} sx={{ p: 2, flex: 1, textAlign: 'center' }}>
                                            <Opacity color="primary" />
                                            <Typography variant="body2">Humidity</Typography>
                                            <Typography variant="h6">{weather.main.humidity}%</Typography>
                                        </Paper>
                                        <Paper elevation={1} sx={{ p: 2, flex: 1, textAlign: 'center' }}>
                                            <Air color="primary" />
                                            <Typography variant="body2">Wind Speed</Typography>
                                            <Typography variant="h6">{weather.wind.speed} mph</Typography>
                                        </Paper>
                                    </Stack>
                                    <Stack direction="row" spacing={2}>
                                        <Paper elevation={1} sx={{ p: 2, flex: 1, textAlign: 'center' }}>
                                            <Cloud color="primary" />
                                            <Typography variant="body2">Cloudiness</Typography>
                                            <Typography variant="h6">{weather.clouds.all}%</Typography>
                                        </Paper>
                                        <Paper elevation={1} sx={{ p: 2, flex: 1, textAlign: 'center' }}>
                                            <Visibility color="primary" />
                                            <Typography variant="body2">Visibility</Typography>
                                            <Typography variant="h6">{(weather.visibility / 1000).toFixed(1)} km</Typography>
                                        </Paper>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Stack>

                    {/* Sun Times */}
                    <Card elevation={3}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Sun Schedule</Typography>
                            <Stack 
                                direction={{ xs: 'column', sm: 'row' }} 
                                spacing={4} 
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <WbSunny sx={{ color: '#ffa726' }} />
                                    <Box>
                                        <Typography variant="body2">Sunrise</Typography>
                                        <Typography variant="h6">
                                            {new Date(weather.sys.sunrise * 1000).toLocaleTimeString()}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <WbTwilight sx={{ color: '#ff7043' }} />
                                    <Box>
                                        <Typography variant="body2">Sunset</Typography>
                                        <Typography variant="h6">
                                            {new Date(weather.sys.sunset * 1000).toLocaleTimeString()}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            )}
        </Box>
    ); 
};

export default WeatherDashboard;