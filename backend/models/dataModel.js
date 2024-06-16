const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
  // Define your schema fields here
});

module.exports = mongoose.model('Data', dataSchema);
