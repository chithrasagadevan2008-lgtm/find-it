const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({

    type: {
        type: String
    },

    title: {
        type: String
    },

    description: {
        type: String
    },

    category: {
        type: String
    },

    location: {
        type: String
    },

    image: {
        type: String
    },

    contact: {
        type: String
    },

    date: {
        type: String
    },

    status: {
        type: String,
        default: 'open'
    }

}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);