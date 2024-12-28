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

app.listen(PORT, () => console.log(`Server running on ${PORT}`));