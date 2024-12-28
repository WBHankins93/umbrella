const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;

app.get('/', (req,res) => {
    res.send('Weather Dashboard Backend');
});

app.get('/api/weather', async (req,res) => {
    const { city } = req.query;
    const apiKey = process.env.WEATHER_API_KEY;

    if (!city) {
        return res.status(400).json({error: 'City is required'});
    }

    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: {
                q: city,
                appid: apiKey,
                units: 'metric',
            },
        });
        
        res.json(response.data)

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Failed to fetch weather data'})
    }

})

app.listen(PORT, () => console.log(`Server running on ${PORT}`));