const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');
const router = express.Router();

router.post('/cadastro', async (req, res) => {
  try {
    const { nome, usuario, email, senha, tipo } = req.body;
    if (!nome || !usuario || !email || !senha || !tipo)
      return res.status(400).json({ erro: 'Preencha todos os campos.' });
    if (!['comum', 'fotografo'].includes(tipo))
      return res.status(400).json({ erro: 'Tipo de usuário inválido.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ erro: 'Informe um e-mail válido.' });
    if (senha.length < 6)
      return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
    const [existente] = await db.execute(
      'SELECT id FROM usuarios WHERE email = ? OR usuario = ?', [email, usuario.replace(/^@/, '')]
    );
    if (existente.length) return res.status(409).json({ erro: 'E-mail ou nome de usuário já cadastrado.' });
    const hash = await bcrypt.hash(senha, 10);
    const [result] = await db.execute(
      'INSERT INTO usuarios (nome, usuario, email, senha, tipo) VALUES (?, ?, ?, ?, ?)',
      [nome.trim(), usuario.replace(/^@/, '').trim(), email.trim().toLowerCase(), hash, tipo]
    );
    res.status(201).json({ mensagem: 'Conta criada com sucesso!', id: result.insertId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Não foi possível cadastrar. Verifique o banco de dados.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ erro: 'Informe e-mail e senha.' });
    const [rows] = await db.execute(
      'SELECT id, nome, usuario, email, senha, tipo, foto_perfil FROM usuarios WHERE email = ?',
      [email.trim().toLowerCase()]
    );
    if (!rows.length || !(await bcrypt.compare(senha, rows[0].senha)))
      return res.status(401).json({ erro: 'Usuário não encontrado ou senha incorreta.' });
    const u = rows[0];
    const token = jwt.sign({ id: u.id, tipo: u.tipo }, process.env.JWT_SECRET, { expiresIn: '8h' });
    delete u.senha;
    res.json({ token, usuario: u });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao realizar login.' });
  }
});
module.exports = router;
