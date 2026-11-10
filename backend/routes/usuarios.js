const express = require('express');
const db = require('../database');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/buscar', async (req, res) => {
  try {
    const termo = (req.query.q || '').replace(/^@/, '').trim();
    if (!termo) return res.json([]);
    const [rows] = await db.execute(
      `SELECT id, nome, usuario, foto_perfil FROM usuarios
       WHERE tipo='fotografo' AND (nome LIKE ? OR usuario LIKE ?) ORDER BY nome LIMIT 20`,
      [`%${termo}%`, `%${termo}%`]
    );
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ erro: 'Erro na pesquisa.' }); }
});

router.get('/:id/perfil', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [[perfil]] = await db.execute(
      `SELECT id, nome, usuario, foto_perfil,
       (SELECT COUNT(*) FROM publicacoes WHERE usuario_id=usuarios.id) AS publicacoes,
       (SELECT COUNT(*) FROM curtidas c JOIN publicacoes p ON p.id=c.publicacao_id WHERE p.usuario_id=usuarios.id) AS likes
       FROM usuarios WHERE id=? AND tipo='fotografo'`, [id]
    );
    if (!perfil) return res.status(404).json({ erro: 'Fotógrafo não encontrado.' });
    res.json(perfil);
  } catch (e) { console.error(e); res.status(500).json({ erro: 'Erro ao carregar perfil.' }); }
});

router.get('/minha-conta', auth, async (req, res) => {
  const [rows] = await db.execute(
    'SELECT id,nome,usuario,email,tipo,foto_perfil FROM usuarios WHERE id=?', [req.usuario.id]
  );
  if (!rows.length) return res.status(404).json({ erro: 'Usuário não encontrado.' });
  res.json(rows[0]);
});
module.exports = router;
