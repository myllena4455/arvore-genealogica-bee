require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve arquivos da raiz (index.html, css/, js/)

// Rota principal para servir o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Verificação simples de ambiente
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'online', 
        message: 'Servidor House Bee rodando',
        database: 'Firebase Realtime DB (Client-side)'
    });
});

app.listen(PORT, () => {
    console.log('Servidor House Bee rodando na porta ' + PORT);
});
