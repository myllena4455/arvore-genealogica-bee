const mongoose = require('mongoose');

const membroSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  sobrenome: { type: String, required: true },
  foto: { type: String }, // URL ou base64 da foto
  status: { type: String, enum: ['Membro', 'Patriarca', 'Matriarca'], default: 'Membro' },
  familia: { type: String, required: true },
  pai: { type: mongoose.Schema.Types.ObjectId, ref: 'Membro' },
  mae: { type: mongoose.Schema.Types.ObjectId, ref: 'Membro' },
  conjuge: { type: mongoose.Schema.Types.ObjectId, ref: 'Membro' },
  filhos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Membro' }],
  criadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Membro', membroSchema);