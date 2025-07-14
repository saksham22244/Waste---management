const ContactMessage = require('../models/ContactMessage');

// Submit a contact message
exports.submitContactMessage = async (req, res) => {
  const { subject, message, name, email, role } = req.body;

  if (!subject || !message || !name || !email || !role) {
    return res.status(400).json({ error: 'All fields (subject, message, name, email, role) are required.' });
  }

  try {
    const newMessage = new ContactMessage({
      subject,
      message,
      name,
      email,
      role,
    });

    await newMessage.save();
    res.status(200).json({ message: 'Your message has been sent successfully.' });
  } catch (error) {
    console.error("Error saving contact message:", error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// View all contact messages
exports.getAllContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    res.status(500).json({ error: 'Failed to fetch contact messages' });
  }
};

// Delete a contact message by ID
exports.deleteContactMessage = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Message ID is required.' });
  }

  try {
    const deletedMessage = await ContactMessage.findByIdAndDelete(id);
    if (!deletedMessage) {
      return res.status(404).json({ error: 'Message not found.' });
    }
    res.status(200).json({ message: 'Message deleted successfully.' });
  } catch (error) {
    console.error("Error deleting contact message:", error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};
