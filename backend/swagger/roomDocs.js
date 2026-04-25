const roomDocs = {
  // ==========================================
  // ROOM ROUTES
  // ==========================================
  '/api/rooms': {
    get: {
      summary: 'Get all rooms',
      tags: ['Rooms'],
      responses: { 200: { description: 'A list of rooms' } }
    },
    post: {
      summary: 'Create a new room',
      tags: ['Rooms'],
      requestBody: {
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                roomNumber: { type: 'string' },
                roomType: { type: 'string' },
                image: { type: 'string', format: 'binary' } 
              }
            }
          }
        }
      },
      responses: { 201: { description: 'Room created successfully' } }
    }
  },
  '/api/rooms/{id}': {
    put: {
      summary: 'Update an existing room',
      tags: ['Rooms'],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      requestBody: {
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                roomNumber: { type: 'string' },
                image: { type: 'string', format: 'binary' }
              }
            }
          }
        }
      },
      responses: { 200: { description: 'Room updated successfully' } }
    },
    delete: {
      summary: 'Delete a room',
      tags: ['Rooms'],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Room deleted successfully' } }
    }
  },

  // ==========================================
  // BOOKING ROUTES
  // ==========================================
  '/api/bookings': {
    post: {
      summary: 'Create a room booking',
      tags: ['Bookings'],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                studentEmail: { type: 'string' },
                studentName: { type: 'string' },
                roomId: { type: 'string' },
                roomNumber: { type: 'string' },
                agreedToTerms: { type: 'boolean' },
                nicNumber: { type: 'string' },
                emergencyContactName: { type: 'string' },
                emergencyContactPhone: { type: 'string' },
                expectedMoveInDate: { type: 'string' },
                specialRequests: { type: 'string' }
              }
            }
          }
        }
      },
      responses: { 201: { description: 'Booking created successfully' } }
    }
  },
  '/api/bookings/{email}': {
    get: {
      summary: 'Get student booking and roommates by email',
      tags: ['Bookings'],
      parameters: [{ in: 'path', name: 'email', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Student booking and roommate data' } }
    }
  },
  '/api/bookings/{id}': {
    put: {
      summary: 'Update booking info (and profile picture)',
      tags: ['Bookings'],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      requestBody: {
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                nicNumber: { type: 'string' },
                emergencyContactName: { type: 'string' },
                profileImage: { type: 'string', format: 'binary' } // Handles req.file
              }
            }
          }
        }
      },
      responses: { 200: { description: 'Booking updated successfully' } }
    }
  }
};

module.exports = roomDocs;