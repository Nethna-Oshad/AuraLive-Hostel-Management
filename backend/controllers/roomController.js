const Room = require('../models/roomModel');

// @desc    Get all rooms
// @route   GET /api/rooms
const getRooms = async (req, res) => {
  try {
    // Admin gets all rooms. You can filter this later for students (display: true)
    const rooms = await Room.find({}).sort({ createdAt: -1 });
    res.json(rooms);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Create a room
// @route   POST /api/rooms
const createRoom = async (req, res) => {
  try {
    const roomData = { ...req.body };
    // Parse the furnishing array if it comes as a string from FormData
    if (typeof roomData.furnishing === 'string') roomData.furnishing = JSON.parse(roomData.furnishing);
    
    // If multer uploaded a file, save the path
    if (req.file) roomData.image = `/roomImage/${req.file.filename}`;

    const room = await Room.create(roomData);
    res.status(201).json(room);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

// @desc    Update a room
// @route   PUT /api/rooms/:id
const updateRoom = async (req, res) => {
  try {
    const roomData = { ...req.body };
    if (typeof roomData.furnishing === 'string') roomData.furnishing = JSON.parse(roomData.furnishing);
    if (req.file) roomData.image = `/roomImage/${req.file.filename}`;

    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, roomData, { new: true });
    if (!updatedRoom) return res.status(404).json({ message: 'Room not found' });
    res.json(updatedRoom);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ message: 'Room deleted successfully' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getRooms, createRoom, updateRoom, deleteRoom };