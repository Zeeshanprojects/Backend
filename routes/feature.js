const express = require('express');
const router = express.Router();
const Feature = require('../models/Feature');

// Create a new feature
router.post('/', async (req, res) => {
  try {
    const newFeature = new Feature({
      name: req.body.name,
      code: req.body.code,
      schema: req.body.schema,
    });

    const savedFeature = await newFeature.save();
    res.status(201).json(savedFeature);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create feature', error: err });
  }
});

// Get all features
router.get('/', async (req, res) => {
  try {
    const features = await Feature.find();
    res.status(200).json(features);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve features', error: err });
  }
});

// Get a single feature by ID
router.get('/:id', async (req, res) => {
  try {
    const feature = await Feature.findById(req.params.id);
    if (!feature) {
      return res.status(404).json({ message: 'Feature not found' });
    }
    res.status(200).json(feature);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve feature', error: err });
  }
});

// Update a feature by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedFeature = await Feature.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        code: req.body.code,
        schema: req.body.schema,
      },
      { new: true }
    );

    if (!updatedFeature) {
      return res.status(404).json({ message: 'Feature not found' });
    }

    res.status(200).json(updatedFeature);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update feature', error: err });
  }
});

// Delete a feature by ID
router.delete('/:id', async (req, res) => {
  try {
    const feature = await Feature.findById(req.params.id);

    if (feature) {
        await Feature.deleteOne({ _id: req.params.id });
        res.json({ message: 'feature removed' });
    }else {
        res.status(404).json({ message: 'feature not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete feature', error: err });
  }
});
module.exports = router;
