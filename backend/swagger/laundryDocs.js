const laundryDocs = {
  '/api/laundry/estimate': {
    post: {
      summary: 'Get price estimates for laundry',
      tags: ['Laundry'],
      requestBody: {
        content: { 'application/json': { schema: { type: 'object', properties: { weightInKg: { type: 'number' }, expectedDate: { type: 'string' }, serviceType: { type: 'string' } } } } }
      },
      responses: { 200: { description: 'List of estimates from partners' } }
    }
  },
  '/api/laundry': {
    post: {
      summary: 'Create a final laundry order',
      tags: ['Laundry'],
      requestBody: {
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                studentId: { type: 'string' },
                weightInKg: { type: 'number' },
                isPremiumOrder: { type: 'boolean' },
                photo: { type: 'string', format: 'binary' } // Handles req.file
              }
            }
          }
        }
      },
      responses: { 201: { description: 'Order placed successfully' } }
    }
  },
  '/api/laundry/student/{studentId}': {
    get: {
      summary: 'Get orders for a student',
      tags: ['Laundry'],
      parameters: [{ in: 'path', name: 'studentId', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'List of student orders' } }
    }
  },
  '/api/laundry/partner/orders/{partnerId}': {
    get: {
      summary: 'Get orders for a partner',
      tags: ['Laundry'],
      parameters: [{ in: 'path', name: 'partnerId', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'List of partner orders' } }
    }
  },
  '/api/laundry/partner/{id}': {
    put: {
      summary: 'Update partner details (Admin)',
      tags: ['Laundry'],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Partner updated' } }
    }
  },
  '/api/laundry/{orderId}/status': {
    put: {
      summary: 'Update order status',
      tags: ['Laundry'],
      parameters: [{ in: 'path', name: 'orderId', required: true, schema: { type: 'string' } }],
      requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' } } } } } },
      responses: { 200: { description: 'Status updated' } }
    }
  },
  '/api/laundry/{orderId}/rate': {
    put: {
      summary: 'Rate a laundry order',
      tags: ['Laundry'],
      parameters: [{ in: 'path', name: 'orderId', required: true, schema: { type: 'string' } }],
      requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { rating: { type: 'number' }, comment: { type: 'string' } } } } } },
      responses: { 200: { description: 'Order rated' } }
    }
  }
};

module.exports = laundryDocs;