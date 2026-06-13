import Project from '../models/Project.js';
import User from '../models/User.js';

export const getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();

    const statusCounts = await Project.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    const endingSoon = await Project.find({
      endDate: { $lte: sevenDaysLater, $gte: new Date() },
      status: { $ne: 'Completed' },
    })
      .populate('assignedUsers', 'name')
      .select('title endDate status');

    const recentProjects = await Project.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('assignedUsers', 'name')
      .select('title status createdAt');

    res.json({
      totalUsers,
      totalProjects,
      statusCounts: statusCounts.reduce((acc, s) => {
        acc[s._id] = s.count;
        return acc;
      }, {}),
      endingSoon,
      recentProjects,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
