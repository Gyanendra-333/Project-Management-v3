import Project from '../models/Project.js';
import Activity from '../models/Activity.js';
import mongoose from 'mongoose';

// Get all projects - search, filter, pagination
export const getProjects = async (req, res) => {
  try {
    const { search = '', status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) query.title = { $regex: search, $options: 'i' };
    if (status) query.status = status;

    if (req.user.role === 'user') {
      // query.assignedUsers = req.user._id;
      query.assignedUsers = { $in: [new mongoose.Types.ObjectId(req.user._id)] };
    }

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .populate('assignedUsers', 'name email')
      .populate('createdBy', 'name email')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ projects, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single project
export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('assignedUsers', 'name email')
      .populate('createdBy', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper: map uploaded files to attachment objects (supports Cloudinary & local)
const mapFiles = (files) =>
  (files || []).slice(0, 3).map((f) => ({
    filename: f.filename || f.public_id || f.originalname,
    originalName: f.originalname,
    mimetype: f.mimetype,
    size: f.size,
    path: f.path || f.secure_url || '',   // Cloudinary gives secure_url via path field
    url: f.secure_url || f.path || '',    // explicit url field for frontend use
  }));

// Admin: Create project
export const createProject = async (req, res) => {
  try {
    const { title, description, startDate, endDate, status, assignedUsers } = req.body;

    const attachments = mapFiles(req.files);

    const project = await Project.create({
      title,
      description,
      startDate,
      endDate,
      status: status || 'Pending',
      assignedUsers: assignedUsers ? JSON.parse(assignedUsers) : [],
      attachments,
      createdBy: req.user._id,
    });

    await Activity.create({
      user: req.user._id,
      action: `Created project: ${project.title}`,
      entity: 'project',
      entityId: project._id,
    });

    const populated = await project.populate('assignedUsers', 'name email');
    populated.assignedUsers.forEach((u) => {
      req.io.to(u._id.toString()).emit('notification', {
        type: 'project_assigned',
        message: `You have been assigned to project "${project.title}"`,
        timestamp: new Date(),
      });
    });

    req.io.emit('notification', {
      type: 'project_created',
      message: `New project "${project.title}" created`,
      timestamp: new Date(),
    });

    res.status(201).json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Update project
export const updateProject = async (req, res) => {
  try {
    const { title, description, startDate, endDate, status, assignedUsers } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const newAttachments = mapFiles(req.files).slice(0, 3 - project.attachments.length);

    project.title = title || project.title;
    project.description = description || project.description;
    project.startDate = startDate || project.startDate;
    project.endDate = endDate || project.endDate;
    project.status = status || project.status;
    project.assignedUsers = assignedUsers ? JSON.parse(assignedUsers) : project.assignedUsers;
    project.attachments = [...project.attachments, ...newAttachments].slice(0, 3);

    await project.save();

    await Activity.create({
      user: req.user._id,
      action: `Updated project: ${project.title}`,
      entity: 'project',
      entityId: project._id,
    });

    req.io.emit('notification', {
      type: 'project_updated',
      message: `Project "${project.title}" updated`,
      timestamp: new Date(),
    });

    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// User: Update project status only
export const updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!project.assignedUsers.includes(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not assigned to this project' });
    }

    project.status = status;
    await project.save();

    await Activity.create({
      user: req.user._id,
      action: `Updated status of "${project.title}" to ${status}`,
      entity: 'project',
      entityId: project._id,
    });

    req.io.emit('notification', {
      type: 'status_updated',
      message: `Project "${project.title}" status changed to ${status}`,
      timestamp: new Date(),
    });

    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Delete project
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await Activity.create({
      user: req.user._id,
      action: `Deleted project: ${project.title}`,
      entity: 'project',
    });

    req.io.emit('notification', {
      type: 'project_deleted',
      message: `Project "${project.title}" deleted`,
      timestamp: new Date(),
    });

    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
