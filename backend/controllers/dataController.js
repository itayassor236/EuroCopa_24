const Data = require('../models/dataModel');

const dataController = {
  getAllData: async (req, res) => {
    try {
      const data = await Data.find();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  createData: async (req, res) => {
    const data = new Data(req.body);
    try {
      const newData = await data.save();
      res.status(201).json(newData);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  getDataById: async (req, res) => {
    try {
      const data = await Data.findById(req.params.id);
      if (data == null) {
        return res.status(404).json({ message: 'Data not found' });
      }
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  updateData: async (req, res) => {
    try {
      const updatedData = await Data.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updatedData);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  deleteData: async (req, res) => {
    try {
      await Data.findByIdAndDelete(req.params.id);
      res.json({ message: 'Data deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = dataController;
