const MaintenanceTicket = require('../models/maintenanceModel');

// 1. Create Ticket
const createTicket = async (req, res) => {
  try {
    const { studentId, roomNumber, issueType, description, priority } = req.body;
    const photo = req.file ? `/maintenanceImages/${req.file.filename}` : null;

    const ticket = await MaintenanceTicket.create({
      studentId,
      roomNumber,
      issueType,
      description,
      photo,
      priority
    });

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Get Student Tickets
const getStudentTickets = async (req, res) => {
  try {
    const { studentId } = req.params;
    const tickets = await MaintenanceTicket.find({ studentId })
      .populate('assignedTo', 'name') 
      .sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ 3. ALUTH: Maintainer (Partner) kenekta eyage tickets witharak ganna function eka
// Frontend eke dashboard eka load wenna meka aniwareyen oni
const getPartnerTickets = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const tickets = await MaintenanceTicket.find({ assignedTo: partnerId })
      .populate('studentId', 'name phone') // Student ge info gannawa
      .sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Get All Tickets (Admin use eka)
const getAllTickets = async (req, res) => {
  try {
    const tickets = await MaintenanceTicket.find({})
      .populate('studentId', 'name email')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Update Ticket
const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedTicket = await MaintenanceTicket.findByIdAndUpdate(id, updates, { new: true })
      .populate('studentId', 'name')
      .populate('assignedTo', 'name');

    if (!updatedTicket) return res.status(404).json({ message: 'Ticket not found' });

    res.status(200).json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Rate Ticket
const rateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentRating } = req.body;

    const ticket = await MaintenanceTicket.findById(id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (ticket.status !== 'Resolved' && ticket.status !== 'Closed') {
      return res.status(400).json({ message: 'Can only rate resolved or closed tickets' });
    }

    ticket.studentRating = studentRating;
    await ticket.save();

    res.status(200).json({ message: 'Rating submitted successfully', ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 7. Delete Ticket
const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await MaintenanceTicket.findByIdAndDelete(id);
    
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    
    res.status(200).json({ message: 'Maintenance ticket cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  createTicket, 
  getStudentTickets, 
  getPartnerTickets, // ✅ Export kala
  getAllTickets, 
  updateTicket, 
  rateTicket,
  deleteTicket 
};