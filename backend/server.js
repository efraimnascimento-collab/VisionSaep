/*
PROJETO: SAEPVision
ALUNA: Efraim dos Santos Nascimento
CURSO: Técnico em Informática para Internet
INSTITUIÇÃO: SENAI
*/
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const db = require('./database');

const app = express();

// Configurações gerais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Rotas da API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/publicacoes', require('./routes/publicacoes'));
app.use('/api/usuarios', require('./routes/usuarios'));

// Verificar servidor e banco de dados
app.get('/api/status', async (req, res) => {
    try {
        await db.query('SELECT 1');

        res.json({
            servidor: 'online',
            banco: 'conectado'
        });

    } catch (error) {
        console.error('Erro na conexão com o banco:', error.message);

        res.status(500).json({
            servidor: 'online',
            banco: 'desconectado',
            erro: error.message
        });
    }
});

// Rota principal e páginas do frontend
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Tratamento de erros
app.use((error, req, res, next) => {
    console.error('Erro no servidor:', error);

    res.status(500).json({
        mensagem: 'Erro interno do servidor.'
    });
});

// Inicialização do servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('====================================');
    console.log('       SAEPVISION INICIADO');
    console.log('====================================');
    console.log(`Servidor: http://localhost:${PORT}`);
    console.log(`Status:   http://localhost:${PORT}/api/status`);
    console.log('====================================');
});
