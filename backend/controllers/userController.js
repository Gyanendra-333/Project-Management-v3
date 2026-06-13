import User from '../models/User.js';
import Activity from '../models/Activity.js';

// Admin: Get all users with search, filter, pagination
export const getAllUsers = async (req, res) => {
  try {
    const { search = '', role, page = 1, limit = 10 } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (role) query.role = role;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Create user
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already exists' });

    const user = await User.create({ name, email, password, role: role || 'user' });

    await Activity.create({
      user: req.user._id,
      action: `Created user: ${user.name}`,
      entity: 'user',
      entityId: user._id,
    });

    req.io.emit('notification', {
      type: 'user_created',
      message: `New user "${user.name}" created`,
      timestamp: new Date(),
    });

    res.status(201).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Update user
export const updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    await Activity.create({
      user: req.user._id,
      action: `Updated user: ${user.name}`,
      entity: 'user',
      entityId: user._id,
    });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await Activity.create({
      user: req.user._id,
      action: `Deleted user: ${user.name}`,
      entity: 'user',
    });

    req.io.emit('notification', {
      type: 'user_deleted',
      message: `User "${user.name}" deleted`,
      timestamp: new Date(),
    });

    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// User: Update own profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, runValidators: true }
    );
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single user
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
