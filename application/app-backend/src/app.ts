import express = require('express');
import cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Rota teste da API
app.get('/health', (req, res) => {
  res.json({ 
    status: 'online', 
    timestamp: new Date(),
    message: 'API do app de adegas rodando perfeitamente.' 
  });
});

export = app;