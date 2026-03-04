const { GoogleGenerativeAI } = require('@google/generative-ai');
const Room = require('../models/roomModel');

const handleChatQuery = async (req, res) => {
  try {
    const { message } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("API key is missing from the .env file");
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // 1. Fetch live available data from MongoDB
    const availableRooms = await Room.find({ status: 'Available', display: true });

    // 2. Format the data so the AI can read it easily
    const roomContext = availableRooms.map(r => 
      `Room ${r.roomNumber}: Type: ${r.roomType}, Gender: ${r.designatedGender}, Rent: Rs.${r.monthlyRent}, Key Money: Rs.${r.keyMoney}, AC: ${r.airConditioning}, Capacity: ${r.maxCapacity}.`
    ).join('\n');

    // 3. Create the Smarter System Prompt
    const systemPrompt = `
      You are the official AI Assistant for 'AuraLive Student Living', a premium hostel in Malabe, Sri Lanka.
      Be friendly, professional, concise, and helpful. Use emojis occasionally.
      
      LIVE AVAILABLE ROOMS DATA:
      ${roomContext || "Currently, there are no rooms available."}
      
      CRITICAL CONVERSATION RULES:
      1. DO NOT list all available rooms at once. Never do a massive data dump.
      2. If a student asks a general question (like "I want a room", "best room", or "show me rooms"), DO NOT give room details yet. Instead, ask 1 or 2 short clarifying questions to narrow it down (e.g., "Are you looking for an AC or Non-AC room?", "Do you prefer a single room or a shared dorm?", or "Are you looking for boys, girls, or mixed accommodation?").
      3. ONLY provide specific room details (Price, Key Money, Room Number) AFTER the student has given you their preference.
      4. Once you know what they want, recommend 1 or 2 rooms that match their exact needs.
      5. Keep responses short and conversational.
      6. Do not answer questions unrelated to the hostel.

      Student's Message: "${message}"
    `;

    // 4. Call the AI Model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();

    // 5. Send back to frontend
    res.json({ reply: responseText });

  } catch (error) {
    console.error("Chatbot Error:", error);
    res.status(500).json({ reply: "I'm sorry, my systems are currently updating. Please try again in a moment." });
  }
};

module.exports = { handleChatQuery };