const Detection = require('../models/detection');

async function listDetections(req, res) {
  const { limit = 50 } = req.query;
  const items = await Detection.find({ userId: req.user.id })
    .sort({ detectedAt: -1 })
    .limit(Number(limit));
  res.json(items);
}

async function createDetection(req, res) {
  const { label, probability, source, detectedAt } = req.body;
  if (!label || typeof probability !== 'number') {
    return res.status(400).json({ message: 'label and probability are required' });
  }
  const det = await Detection.create({ userId: req.user.id, label, probability, source: source || 'video', detectedAt: detectedAt ? new Date(detectedAt) : new Date() });
  res.status(201).json(det);
}

module.exports = { listDetections, createDetection };








