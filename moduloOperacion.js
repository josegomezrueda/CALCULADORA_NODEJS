const mongoose = require('mongoose');
const { Schema } = mongoose;

const Operacion = new Schema({
    _id: Number,
    total: Number, 
    historico: String,
    ultimaMod: Number
});

module.exports = mongoose.model('Operacion', Operacion);