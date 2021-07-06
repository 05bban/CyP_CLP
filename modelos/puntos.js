const { model, Schema } = require("mongoose");

module.exports = model("puntos", new Schema({

    id: { type: String },
    logPuntos: { type: Array, default: [] },
    registrado: { type: Number, default: Date.now() },
    puntosTotales: { type: Number, default: 0 }

}));