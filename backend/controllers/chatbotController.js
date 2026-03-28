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

    // 2. Format the data so the AI can read it easily AND has the ID for links!
    const roomContext = availableRooms.map(r => 
      `Room ${r.roomNumber} (ID: ${r._id}): Type: ${r.roomType}, Gender: ${r.designatedGender}, Rent: Rs.${r.monthlyRent}, Key Money: Rs.${r.keyMoney}, AC: ${r.airConditioning}.`
    ).join('\n');

    // 3. Create the Smarter System Prompt with Strict Formatting & Aggressive Matching
    const systemPrompt = `
      You are the official AI Assistant for 'AuraLive Student Living', a premium hostel in Malabe, Sri Lanka.
      Be friendly, professional, concise, and helpful. Use emojis occasionally.
      
      LIVE AVAILABLE ROOMS DATA:
      ${roomContext || "Currently, there are no rooms available."}
      
      CRITICAL CONVERSATION RULES:
      1. IF THE USER GIVES EVEN ONE PREFERENCE (e.g., "boys", "shared", "AC", "girls"), IMMEDIATELY STOP ASKING QUESTIONS AND SHOW 1 OR 2 MATCHING ROOMS. 
      2. Do not interrogate the user. Only ask a clarifying question if their message is completely vague (like "I need a room" with no details at all).
      3. If they ask for something you don't have (like an AC room for boys), politely tell them it is unavailable, BUT immediately show them the closest alternative you DO have (like a Non-AC room for boys).
      4. DO NOT list all available rooms at once. Never do a massive data dump.
      
      FORMATTING RULES FOR ROOM RECOMMENDATIONS:
      Whenever you show room details, you MUST use this exact clean format and include the markdown link at the bottom:
      
      **Room [Number]** - [Type] ([Gender])
      ❄️ [AC/Non-AC] | 💰 Rent: Rs. [Rent]
      [Book Room [Number]](/book/[ID])
      
      (Example output):
      **Room A-102** - Shared Dorm (Boys Only)
      ❄️ Non-AC | 💰 Rent: Rs. 9500
      [Book Room A-102](/book/65f9a3b2...)
      
      Keep the text outside of the room details very short and conversational. Do not answer questions unrelated to the hostel.

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