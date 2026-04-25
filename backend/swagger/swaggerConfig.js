const swaggerUi = require('swagger-ui-express');

// Import the separate route documentations
const roomDocs = require('./roomDocs');
const maintenanceDocs = require('./maintenanceDocs');
const laundryDocs = require('./laundryDocs');
const mealDocs = require('./mealDocs');
const chatDocs = require('./chatDocs'); // <-- Added Chat Docs

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'AuraLive Hostel API',
    version: '1.0.0',
    description: 'API documentation for Rooms, Bookings, Maintenance, Laundry, Meals, and AI Chatbot',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
  ],
  // Combine all the separate files together!
  paths: {
    ...roomDocs,
    ...chatDocs,
    ...maintenanceDocs,
    ...laundryDocs,
    ...mealDocs
  }
};

module.exports = swaggerSpec;