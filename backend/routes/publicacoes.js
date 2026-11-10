const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database');
const auth = require('../middleware/auth');
const router = express.Router();

const pasta = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(pasta, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, pasta),
  filename: (_req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random()*1e9) + path.extname(file.originalname).toLowerCase())
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, ['.jpg','.jpeg','.png','.gif','.webp'].includes(ext));
  }
});

router.get('/', async (req, res) => {
  try {
    const userId = Number(req.query.usuario || 0);
    const [rows] = await db.execute(`
      SELECT p.id, p.titulo, p.local, p.imagem, p.criado_em,
             u.id AS fotografo_id, u.nome AS fotografo, u.usuario,
             COUNT(DISTINCT c.id) AS curtidas,
             MAX(CASE WHEN c.usuario_id = ? THEN 1 ELSE 0 END) AS curtida_por_mim
      FROM publicacoes p
      JOIN usuarios u ON u.id = p.usuario_id
      LEFT JOIN curtidas c ON c.publicacao_id = p.id
      GROUP BY p.id, p.titulo, p.local, p.imagem, p.criado_em, u.id, u.nome, u.usuario
      ORDER BY p.criado_em DESC`, [userId]);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ erro: 'Erro ao carregar publicações.' }); }
});

router.post('/', auth, upload.single('imagem'), async (req, res) => {
  try {
    if (req.usuario.tipo !== 'fotografo') return res.status(403).json({ erro: 'Somente fotógrafos podem publicar.' });
    const { titulo, local } = req.body;
    if (!titulo || !local || !req.file) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ erro: 'Preencha título, local e selecione uma imagem válida.' });
    }
    const imagem = '/uploads/' + req.file.filename;
    const [r] = await db.execute(
      'INSERT INTO publicacoes (usuario_id, titulo, local, imagem) VALUES (?, ?, ?, ?)',
      [req.usuario.id, titulo.trim(), local.trim(), imagem]
    );
    res.status(201).json({ mensagem: 'Fotografia publicada!', id: r.insertId });
  } catch (e) { console.error(e); res.status(500).json({ erro: 'Erro ao publicar fotografia.' }); }
});

router.post('/:id/curtir', auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [existe] = await db.execute('SELECT id FROM curtidas WHERE usuario_id=? AND publicacao_id=?', [req.usuario.id, id]);
    let curtida;
    if (existe.length) {
      await db.execute('DELETE FROM curtidas WHERE usuario_id=? AND publicacao_id=?', [req.usuario.id, id]);
      curtida = false;
    } else {
      await db.execute('INSERT INTO curtidas (usuario_id, publicacao_id) VALUES (?, ?)', [req.usuario.id, id]);
      curtida = true;
    }
    const [[total]] = await db.execute('SELECT COUNT(*) AS total FROM curtidas WHERE publicacao_id=?', [id]);
    res.json({ curtida, total: total.total });
  } catch (e) { console.error(e); res.status(500).json({ erro: 'Não foi possível atualizar a curtida.' }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const [r] = await db.execute('DELETE FROM publicacoes WHERE id=? AND usuario_id=?', [req.params.id, req.usuario.id]);
    if (!r.affectedRows) return res.status(404).json({ erro: 'Publicação não encontrada ou não pertence a você.' });
    res.json({ mensagem: 'Publicação excluída.' });
  } catch (e) { console.error(e); res.status(500).json({ erro: 'Erro ao excluir publicação.' }); }
});
module.exports = router;
