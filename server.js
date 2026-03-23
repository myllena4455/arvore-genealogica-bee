const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const Membro = require('./models/Membro');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Servir arquivos estáticos

// Conectar ao MongoDB (use sua string de conexão)
mongoose.connect('mongodb://localhost:27017/arvore_genealogica', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Configuração para upload de fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Rotas
app.get('/api/membros', async (req, res) => {
  try {
    const membros = await Membro.find().populate('pai mae conjuge filhos');
    res.json(membros);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/membros', upload.single('foto'), async (req, res) => {
  try {
    const { nome, sobrenome, status, familia, pai, mae } = req.body;
    const foto = req.file ? `/uploads/${req.file.filename}` : req.body.foto;

    // Validações
    const existe = await Membro.findOne({ nome: new RegExp(`^${nome}$`, 'i') });
    if (existe) {
      return res.status(400).json({ error: `${nome} já pertence à família ${existe.familia}!` });
    }

    const novoMembro = new Membro({ nome, sobrenome, foto, status, familia, pai, mae });
    await novoMembro.save();
    res.json(novoMembro);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/membros/:id/casar', async (req, res) => {
  try {
    const { conjugeId } = req.body;
    const membro = await Membro.findById(req.params.id);
    const conjuge = await Membro.findById(conjugeId);

    if (!membro || !conjuge) return res.status(404).json({ error: 'Membro não encontrado' });

    // Trava 1: Só órfãos podem casar
    if (membro.pai || membro.mae || conjuge.pai || conjuge.mae) {
      return res.status(400).json({ error: 'Apenas órfãos podem se casar!' });
    }

    // Trava 2: Nenhum pode ter filhos
    if (membro.filhos.length > 0 || conjuge.filhos.length > 0) {
      return res.status(400).json({ error: 'Pessoas com filhos não podem se casar!' });
    }

    membro.conjuge = conjugeId;
    conjuge.conjuge = req.params.id;
    await membro.save();
    await conjuge.save();
    res.json({ message: 'Casamento realizado!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/membros/:id/filho', async (req, res) => {
  try {
    const { nome, sobrenome, foto } = req.body;
    const pai = await Membro.findById(req.params.id);
    const mae = pai.conjuge ? await Membro.findById(pai.conjuge) : null;

    if (!pai) return res.status(404).json({ error: 'Pai não encontrado' });

    const filho = new Membro({
      nome,
      sobrenome,
      foto,
      familia: pai.familia,
      pai: pai._id,
      mae: mae ? mae._id : null
    });
    await filho.save();

    pai.filhos.push(filho._id);
    if (mae) mae.filhos.push(filho._id);
    await pai.save();
    if (mae) await mae.save();
    res.json(filho);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/membros/:id', async (req, res) => {
  try {
    await Membro.findByIdAndDelete(req.params.id);
    res.json({ message: 'Membro removido e tornado órfão' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});