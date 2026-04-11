const Contact = require('../models/Contact');

// @desc    Submit a new contact message
// @route   POST /api/contact
exports.submitMessage = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newContact = new Contact({ name, email, phone, message });
    await newContact.save();
    
    res.status(201).json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Get all messages (For Admin)
// @route   GET /api/contact
exports.getMessages = async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 }); // Newest first
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Update message status (Mark as Read)
// @route   PATCH /api/contact/:id
exports.updateMessageStatus = async (req, res) => {
  try {
    const updatedMsg = await Contact.findByIdAndUpdate(
      req.params.id, 
      { status: req.body.status }, 
      { new: true }
    );
    res.status(200).json(updatedMsg);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};