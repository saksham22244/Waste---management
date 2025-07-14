const ScheduledCollection = require("../models/scheduledCollection");
const UserHistory = require("../models/UserHistory");
const User = require("../models/user");
const nodemailer = require("nodemailer");

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Helper function to send email notifications
const sendEmailNotification = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error("Email notification error:", error);
  }
};

// User schedules a pickup
exports.addScheduledCollection = async (req, res) => {
  try {
    const { date, location, description, wasteType = "Recyclable", notes } = req.body;
    const userId = req.user._id;

    // Validate date is in the future
    if (new Date(date) <= new Date()) {
      return res.status(400).json({ message: "Collection date must be in the future" });
    }

    // Check for existing booking on the same date
    const existingBooking = await ScheduledCollection.findOne({
      clientId: userId,
      date: {
        $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(date).setHours(23, 59, 59, 999))
      },
      status: { $in: ["Pending", "Assigned", "Not Arrived", "On the Way"] }
    });

    if (existingBooking) {
      return res.status(400).json({ message: "You already have a booking for this date" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newCollection = new ScheduledCollection({
      date,
      location,
      description,
      wasteType,
      notes,
      clientId: userId,
      clientName: user.name,
      clientEmail: user.email,
      clientPhone: user.phoneNumber,
      clientAddress: user.address,
      status: "Pending"
    });

    await newCollection.save();

    // Send confirmation email to user
    await sendEmailNotification(
      user.email,
      "Collection Scheduled",
      `<h1>Your collection has been scheduled</h1>
       <p>Date: ${new Date(date).toLocaleDateString()}</p>
       <p>Location: ${location}</p>
       <p>Status: Pending</p>`
    );

    res.status(201).json({ message: "Collection scheduled successfully", collection: newCollection });
  } catch (error) {
    console.error("Error scheduling collection:", error);
    res.status(500).json({ message: "Error scheduling collection", error: error.message });
  }
};

// Get user's pending tasks (reminders)
exports.getRemainders = async (req, res) => {
  try {
    const userId = req.user._id;
    const collections = await ScheduledCollection.find({
      clientId: userId,
      status: { $in: ["Pending", "Assigned", "Not Arrived", "On the Way"] },
      date: { $gte: new Date() }
    })
    .populate({
      path: 'collectorId',
      select: 'name phoneNumber',
      model: 'User'
    })
    .sort({ date: 1 });

    // Transform the data to include collector information
    const transformedCollections = collections.map(collection => {
      const collectionObj = collection.toObject();
      if (collectionObj.collectorId) {
        collectionObj.collectorName = collectionObj.collectorId.name;
        collectionObj.collectorPhone = collectionObj.collectorId.phoneNumber;
        delete collectionObj.collectorId;
      }
      return collectionObj;
    });

    res.status(200).json({
      success: true,
      data: transformedCollections,
    });
  } catch (error) {
    console.error("Error fetching reminders:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching reminders", 
      error: error.message,
    });
  }
};

// Get user's completed pickups (history)
exports.getUserHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("Fetching history for user:", userId);

    // Get only UserHistory entries
    const historyEntries = await UserHistory.find({ userId }).sort({ date: -1 });

    console.log("Found history entries:", historyEntries.length);

    res.status(200).json({
      success: true,
      data: historyEntries
    });
  } catch (error) {
    console.error("Error fetching user history:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching user history", 
      error: error.message 
    });
  }
};

// Admin views pending requests
exports.getPendingRequests = async (req, res) => {
  try {
    const collections = await ScheduledCollection.find({
      status: { $in: ["Pending", "Assigned"] }
    }).sort({ date: 1 });

    res.status(200).json(collections);
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({ message: "Error fetching pending requests", error: error.message });
  }
};

// Admin fetches Garbage Collectors list
exports.getGarbageCollectors = async (req, res) => {
  try {
    const collectors = await User.find({ 
      role: "garbageCollector", 
      isVerified: true 
    }).select("name email phoneNumber address pickups");

    res.status(200).json(collectors);
  } catch (error) {
    console.error("Error fetching garbage collectors:", error);
    res.status(500).json({ message: "Error fetching garbage collectors", error: error.message });
  }
};

// Admin assigns collector
exports.assignCollector = async (req, res) => {
  try {
    const { collectionId, collectorId } = req.body;

    const collection = await ScheduledCollection.findById(collectionId);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const collector = await User.findById(collectorId);
    if (!collector || collector.role !== "garbageCollector") {
      return res.status(400).json({ message: "Invalid collector" });
    }

    // Store the previous collector's ID if it exists
    const previousCollectorId = collection.collectorId;

    // Update only the collector-related fields
    collection.collectorId = collectorId;
    collection.status = "Assigned";
    
    // Convert 'General' waste type to 'Recyclable'
    if (collection.wasteType === 'General') {
      collection.wasteType = 'Recyclable';
    }
    
    // Ensure we don't overwrite client information
    if (!collection.clientEmail) {
      const client = await User.findById(collection.clientId);
      if (client) {
        collection.clientEmail = client.email;
        collection.clientName = client.name;
        collection.clientPhone = client.phoneNumber;
        collection.clientAddress = client.address;
      }
    }

    // Save the collection first
    await collection.save();

    // Try to send notifications after saving
    try {
      // If there was a previous collector, send them a notification about the reassignment
      if (previousCollectorId) {
        const previousCollector = await User.findById(previousCollectorId);
        if (previousCollector) {
          await sendEmailNotification(
            previousCollector.email,
            "Collection Reassigned",
            `<h1>Your collection has been reassigned</h1>
             <p>The following collection has been reassigned to another collector:</p>
             <p>Date: ${new Date(collection.date).toLocaleDateString()}</p>
             <p>Location: ${collection.location}</p>
             <p>Client: ${collection.clientName}</p>
             <p>This collection is no longer assigned to you.</p>`
          );
        }
      }

      // Send notification to new collector
      await sendEmailNotification(
        collector.email,
        "New Collection Assigned",
        `<h1>You have been assigned a new collection</h1>
         <p>Date: ${new Date(collection.date).toLocaleDateString()}</p>
         <p>Location: ${collection.location}</p>
         <p>Client: ${collection.clientName}</p>
         <p>Please check your dashboard for more details.</p>`
      );

      // Send notification to user
      await sendEmailNotification(
        collection.clientEmail,
        "Collector Assigned",
        `<h1>A collector has been assigned to your request</h1>
         <p>Date: ${new Date(collection.date).toLocaleDateString()}</p>
         <p>Location: ${collection.location}</p>
         <p>Collector: ${collector.name}</p>
         <p>You will be notified when the collection is completed.</p>`
      );
    } catch (emailError) {
      console.error("Error sending email notifications:", emailError);
      // Continue with the response even if email sending fails
    }

    res.status(200).json({ message: "Collector assigned successfully", collection });
  } catch (error) {
    console.error("Error assigning collector:", error);
    res.status(500).json({ message: "Error assigning collector", error: error.message });
  }
};

// Garbage Collector updates task status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const collectorId = req.user._id;

    console.log("Updating status for collection:", id);
    console.log("New status:", status);
    console.log("Collector ID:", collectorId);

    const collection = await ScheduledCollection.findById(id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    console.log("Found collection:", collection);

    if (collection.collectorId.toString() !== collectorId.toString()) {
      return res.status(403).json({ message: "Not authorized to update this collection" });
    }

    // Validate status
    const validStatuses = ["Not Arrived", "On the Way", "Picked Up", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Update the status
    collection.status = status;
    
    // If status is "On the Way", send a notification to the client
    if (status === "On the Way") {
      try {
        await sendEmailNotification(
          collection.clientEmail,
          "Garbage Collector is On the Way",
          `<h1>Your garbage collector is on the way!</h1>
           <p>Date: ${new Date(collection.date).toLocaleDateString()}</p>
           <p>Location: ${collection.location}</p>
           <p>Please be ready for the collection.</p>`
        );
      } catch (emailError) {
        console.error("Error sending email notification:", emailError);
        // Continue with the response even if email fails
      }
    }
    
    // If status is Picked Up, add to user history and remove from active collections
    if (status === "Picked Up") {
      try {
        collection.actualPickupTime = new Date();
        
        console.log("Creating history entry for user:", collection.clientId);
        
        // Add to user history with all necessary fields
        const history = new UserHistory({
          userId: collection.clientId,
          location: collection.location,
          wasteType: collection.wasteType,
          date: collection.date,
          status: "Completed",
          description: collection.description,
          actualPickupTime: collection.actualPickupTime,
          clientName: collection.clientName,
          clientEmail: collection.clientEmail,
          clientPhone: collection.clientPhone,
          clientAddress: collection.clientAddress,
          collectorId: collection.collectorId,
          notes: collection.notes
        });

        console.log("History entry to be saved:", history);
        const savedHistory = await history.save();
        console.log("History entry saved successfully:", savedHistory);

        // Remove the collection from active collections
        await ScheduledCollection.findByIdAndDelete(id);
        
        res.status(200).json({ 
          success: true,
          message: "Collection completed and moved to history", 
          history: savedHistory
        });
        return;
      } catch (historyError) {
        console.error("Error creating history:", historyError);
        // Continue with the status update even if history creation fails
      }
    }

    // Save the collection status update for other statuses
    await collection.save();
    console.log("Collection status updated successfully");

    res.status(200).json({ 
      success: true,
      message: "Status updated successfully", 
      collection
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ 
      success: false,
      message: "Error updating status", 
      error: error.message,
      details: error.stack
    });
  }
};

// Garbage Collector gets assigned tasks
exports.getAssignedCollections = async (req, res) => {
  try {
    const collectorId = req.user._id;
    const collections = await ScheduledCollection.find({
      collectorId,
      status: { $ne: "Pending" },
      date: { $gte: new Date() }
    }).sort({ date: 1 });

    res.status(200).json(collections);
  } catch (error) {
    console.error("Error fetching assigned collections:", error);
    res.status(500).json({ message: "Error fetching assigned collections", error: error.message });
  }
};

// GC: Get task details by ID
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await ScheduledCollection.findById(id);
    
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    res.status(200).json(collection);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ message: "Error fetching task", error: error.message });
  }
};

// GC: View completed pickups
exports.getCollectorHistory = async (req, res) => {
  try {
    const collectorId = req.user._id;
    const collections = await UserHistory.find({
      collectorId,
      status: "Completed"
    }).sort({ date: -1 });

    res.status(200).json(collections);
  } catch (error) {
    console.error("Error fetching collector history:", error);
    res.status(500).json({ message: "Error fetching collector history", error: error.message });
  }
};

// Delete a scheduled task
exports.deletePendingTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const collection = await ScheduledCollection.findById(id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    // Allow admin to delete any collection
    if (userRole === "admin") {
      await ScheduledCollection.findByIdAndDelete(id);
      return res.status(200).json({ message: "Collection deleted successfully" });
    }

    // For non-admin users, only allow deletion of their own pending collections
    if (collection.clientId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this collection" });
    }

    if (collection.status !== "Pending") {
      return res.status(400).json({ message: "Can only delete pending collections" });
    }

    await ScheduledCollection.findByIdAndDelete(id);
    res.status(200).json({ message: "Collection deleted successfully" });
  } catch (error) {
    console.error("Error deleting collection:", error);
    res.status(500).json({ message: "Error deleting collection", error: error.message });
  }
};
