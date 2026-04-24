const mealDocs = {
  // ==========================================
  // STUDENT ROUTES
  // ==========================================
  '/api/meals/slots': {
    get: {
      summary: 'Get available kitchen slots and 3rd party shops',
      tags: ['Meals - Student'],
      parameters: [{ in: 'query', name: 'date', required: false, schema: { type: 'string' }, description: 'YYYY-MM-DD' }],
      responses: { 200: { description: 'List of slots and available shops' } }
    }
  },
  '/api/meals/book': {
    post: {
      summary: 'Book a kitchen prep slot',
      tags: ['Meals - Student'],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                studentEmail: { type: 'string' },
                studentName: { type: 'string' },
                slotId: { type: 'string' },
                bookingDate: { type: 'string' },
                notes: { type: 'string' }
              }
            }
          }
        }
      },
      responses: { 201: { description: 'Kitchen slot booked' } }
    }
  },
  '/api/meals/order-external': {
    post: {
      summary: 'Place a single 3rd-party meal order',
      tags: ['Meals - Student'],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                studentEmail: { type: 'string' },
                studentName: { type: 'string' },
                bookingDate: { type: 'string' },
                shopName: { type: 'string' },
                menuItem: { type: 'string' }
              }
            }
          }
        }
      },
      responses: { 201: { description: 'External order placed' } }
    }
  },
  '/api/meals/student/{email}': {
    get: {
      summary: 'Get all meal bookings for a student',
      tags: ['Meals - Student'],
      parameters: [{ in: 'path', name: 'email', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'List of student meal orders' } }
    }
  },

  // ==========================================
  // SUPPLIER ROUTES
  // ==========================================
  '/api/meals/supplier/orders': {
    get: {
      summary: 'Get orders for a specific supplier',
      tags: ['Meals - Supplier'],
      parameters: [
        { in: 'query', name: 'supplierEmail', required: true, schema: { type: 'string' } },
        { in: 'query', name: 'date', required: false, schema: { type: 'string' } }
      ],
      responses: { 200: { description: 'List of supplier orders' } }
    }
  },
  '/api/meals/supplier/summary': {
    get: {
      summary: 'Get daily summary stats for a supplier',
      tags: ['Meals - Supplier'],
      parameters: [
        { in: 'query', name: 'supplierEmail', required: true, schema: { type: 'string' } },
        { in: 'query', name: 'date', required: false, schema: { type: 'string' } }
      ],
      responses: { 200: { description: 'Supplier daily stats' } }
    }
  },
  '/api/meals/supplier/orders/{id}/status': {
    put: {
      summary: 'Supplier updates order delivery status',
      tags: ['Meals - Supplier'],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                supplierEmail: { type: 'string' },
                deliveryStatus: { type: 'string', description: 'Pending, Preparing, Out for Delivery, Delivered, Cancelled' }
              }
            }
          }
        }
      },
      responses: { 200: { description: 'Status updated' } }
    }
  },

  // ==========================================
  // ADMIN ROUTES
  // ==========================================
  '/api/meals/admin/hub-stats': {
    get: {
      summary: 'Get overall Meal Hub stats for Admin Dashboard',
      tags: ['Meals - Admin'],
      responses: { 200: { description: 'Meal Hub Admin Stats' } }
    }
  },
  '/api/meals/admin/suppliers': {
    get: {
      summary: 'Get all meal suppliers',
      tags: ['Meals - Admin'],
      responses: { 200: { description: 'List of all suppliers' } }
    },
    post: {
      summary: 'Create a new meal supplier',
      tags: ['Meals - Admin'],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
                password: { type: 'string' }
              }
            }
          }
        }
      },
      responses: { 201: { description: 'Supplier created' } }
    }
  }
};

module.exports = mealDocs;