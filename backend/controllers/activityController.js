import Activity from '../models/Activity.js';

export const getActivities = async (req, res) => {
  try {
    const { page = 1, limit = 20, entity } = req.query;
    const query = {};
    if (entity) query.entity = entity;

    const total = await Activity.countDocuments(query);
    const activities = await Activity.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ activities, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
