const mongoose = require("mongoose");

const rowEntrySchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
});

module.exports = mongoose.model("RowEntry", rowEntrySchema);
