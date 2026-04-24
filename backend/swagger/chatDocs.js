const chatDocs = {
  '/api/chat': {
    post: {
      summary: 'Chat with the Gemini AI Assistant',
      tags: ['AI Chatbot'],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { 
                  type: 'string', 
                  description: "The user's chat message to the AI" 
                }
              }
            }
          }
        }
      },
      responses: { 
        200: { description: 'AI Response string' },
        500: { description: 'Server Error / API Key Missing' }
      }
    }
  }
};

module.exports = chatDocs;