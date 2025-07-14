const Notice = require("../models/notice");
const UserNotice = require("../models/UserNotice");
const User = require("../models/user");

// Create a new notice
exports.createNotice = async (req, res) => {
  try {
    const { title, description, categories } = req.body;
    
    console.log('Creating notice with data:', { title, description, categories });
    
    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    // Validate categories
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ error: "At least one category is required" });
    }

    // Validate each category
    const validCategories = ["User", "garbageCollector", "All"];
    const invalidCategories = categories.filter(cat => !validCategories.includes(cat));
    if (invalidCategories.length > 0) {
      return res.status(400).json({ error: `Invalid categories: ${invalidCategories.join(', ')}` });
    }

    // Create the notice
    const notice = new Notice({
      title,
      description,
      categories
    });

    // Save the notice
    const savedNotice = await notice.save();
    console.log('Notice saved successfully:', savedNotice);
    
    // Create UserNotice records for all users
    const users = await User.find({});
    console.log('Found users:', users.length);
    
    const userNotices = users.map(user => ({
      userId: user._id,
      noticeId: savedNotice._id
    }));
    
    const createdUserNotices = await UserNotice.insertMany(userNotices);
    console.log('Created UserNotice records:', createdUserNotices.length);
    
    res.status(201).json(savedNotice);
  } catch (err) {
    console.error("Error creating notice:", err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        error: "Validation error", 
        details: Object.values(err.errors).map(e => e.message)
      });
    }
    res.status(500).json({ error: "Failed to create notice" });
  }
};

// Get notices for a specific user
exports.getUserNotices = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    console.log('Fetching notices for user:', { userId, userRole });

    // Get all notices that match the user's role or are for all users
    const notices = await Notice.find({
      $or: [
        { categories: userRole },
        { categories: "All" }
      ]
    }).sort({ createdAt: -1 });
    
    console.log('Found notices:', notices.length);

    // Get the user's notice deletion status
    const userNotices = await UserNotice.find({
      userId,
      noticeId: { $in: notices.map(n => n._id) }
    });
    
    console.log('Found UserNotice records:', userNotices.length);

    // Create a map of notice IDs to their deletion status
    const noticeDeletionMap = userNotices.reduce((map, un) => {
      map[un.noticeId.toString()] = un.isDeleted;
      return map;
    }, {});

    // Filter out deleted notices
    const filteredNotices = notices.filter(notice => 
      !noticeDeletionMap[notice._id.toString()]
    );
    
    console.log('Filtered notices:', filteredNotices.length);

    res.status(200).json(filteredNotices);
  } catch (err) {
    console.error("Error in getUserNotices:", err);
    res.status(500).json({ error: "Failed to fetch notices" });
  }
};

// Delete a notice for a specific user
exports.deleteUserNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Find the notice to check its categories
    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({ error: "Notice not found" });
    }

    // Only allow deletion if the notice is for the user's role or is for all users
    if (!notice.categories.includes(userRole) && !notice.categories.includes("All")) {
      return res.status(403).json({ error: "Not authorized to delete this notice" });
    }

    // Find or create the UserNotice record
    const userNotice = await UserNotice.findOneAndUpdate(
      { userId, noticeId: id },
      { isDeleted: true },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Notice deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete notice" });
  }
};

// Admin: Delete a notice completely
exports.deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete the notice
    const deleted = await Notice.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Notice not found" });
    }
    
    // Delete all associated UserNotice records
    await UserNotice.deleteMany({ noticeId: id });
    
    res.status(200).json({ message: "Notice deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete notice" });
  }
};

// Get all notices (admin endpoint)
exports.getAllNotices = async (req, res) => {
  try {
    // Ensure the model is initialized
    const Notice = require('../models/notice');
    
    // Get all notices
    const notices = await Notice.find()
      .sort({ createdAt: -1 })  // newest first
      .limit(100);              // limit to 100 items
    
    res.status(200).json(notices || []);
  } catch (err) {
    console.error("Error fetching notices:", err);
    res.status(500).json({ 
      error: "Failed to fetch notices",
      details: err.message 
    });
  }
};

// Get the latest 10 notices for a specific category (plus 'All')
exports.getNoticesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const notices = await Notice.find({
      $or: [
        { categories: category },
        { categories: "All" }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json(notices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notices by category" });
  }
};

