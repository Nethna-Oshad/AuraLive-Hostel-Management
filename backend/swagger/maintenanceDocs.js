const maintenanceDocs = {
  '/api/maintenance': {
    get: {
      summary: 'Get all tickets (Admin)',
      tags: ['Maintenance'],
      responses: { 200: { description: 'List of all maintenance tickets' } }
    },
    post: {
      summary: 'Create a new maintenance ticket',
      tags: ['Maintenance'],
      requestBody: {
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                studentId: { type: 'string' },
                roomNumber: { type: 'string' },
                description: { type: 'string' },
                photo: { type: 'string', format: 'binary' } // Handles req.file
              }
            }
          }
        }
      },
      responses: { 201: { description: 'Ticket created successfully' } }
    }
  },
  '/api/maintenance/student/{studentId}': {
    get: {
      summary: 'Get tickets for a specific student',
      tags: ['Maintenance'],
      parameters: [{ in: 'path', name: 'studentId', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'List of student tickets' } }
    }
  },
  '/api/maintenance/partner/{partnerId}': {
    get: {
      summary: 'Get tickets assigned to a partner',
      tags: ['Maintenance'],
      parameters: [{ in: 'path', name: 'partnerId', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'List of partner tickets' } }
    }
  },
  '/api/maintenance/{id}': {
    put: {
      summary: 'Update a ticket',
      tags: ['Maintenance'],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Ticket updated' } }
    },
    delete: {
      summary: 'Delete a ticket',
      tags: ['Maintenance'],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Ticket deleted' } }
    }
  },
  '/api/maintenance/{id}/rate': {
    put: {
      summary: 'Rate a resolved ticket',
      tags: ['Maintenance'],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      requestBody: {
        content: { 'application/json': { schema: { type: 'object', properties: { studentRating: { type: 'number' } } } } }
      },
      responses: { 200: { description: 'Rating submitted' } }
    }
  }
};

module.exports = maintenanceDocs;