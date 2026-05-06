const mongoose = require('mongoose');

const vagaSchema = new mongoose.Schema({
  personagem: { type: String, required: true },
  obra: { type: String, required: true },
  idadePersonagem: { type: String },
  familia: { type: String }, // Se vai entrar com família e qual
  foto: { type: String },
  status: { type: String, enum: ['Livre', 'Reservado', 'Ocupado'], default: 'Livre' },
  // Informações do Usuário (Dono da reserva/ocupação)
  usuarioNome: { type: String },
  usuarioIdade: { type: String },
  usuarioPronomes: { type: String },
  usuarioWhatsapp: { type: String }, // Novo campo para o número do WhatsApp
  reservadoEm: { type: Date },
  ocupadoPor: { type: String }, 
  criadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vaga', vagaSchema);