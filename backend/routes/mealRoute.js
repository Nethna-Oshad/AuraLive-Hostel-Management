const express = require('express');
const router = express.Router();
const {
  getKitchenSlots,
  createKitchenBooking,
  createExternalOrder,
  getStudentMealBookings,
  cancelMealBooking,
  rescheduleMealBooking,
  getAdminSlots,
  createAdminSlot,
  updateAdminSlot,
  deleteAdminSlot,
  getAdminMealOrders,
  updateDeliveryStatus,
  exportMealOrdersCsv,
  getAdminMealOrderSummary,
  getSupplierOrders,
  getSupplierSummary,
  getSupplierMenuItems,
  createSupplierMenuItem,
  updateSupplierMenuItem,
  deleteSupplierMenuItem,
  updateSupplierDeliveryStatus,
} = require('../controllers/mealController');

router.get('/slots', getKitchenSlots);
router.post('/book-kitchen', createKitchenBooking);
router.post('/order-external', createExternalOrder);
router.get('/student/:email', getStudentMealBookings);
router.patch('/:id/cancel', cancelMealBooking);
router.patch('/:id/reschedule', rescheduleMealBooking);
router.get('/admin/slots', getAdminSlots);
router.post('/admin/slots', createAdminSlot);
router.put('/admin/slots/:id', updateAdminSlot);
router.delete('/admin/slots/:id', deleteAdminSlot);
router.get('/admin/orders', getAdminMealOrders);
router.patch('/admin/orders/:id/delivery-status', updateDeliveryStatus);
router.get('/admin/orders-export', exportMealOrdersCsv);
router.get('/admin/orders-summary', getAdminMealOrderSummary);
router.get('/supplier/orders', getSupplierOrders);
router.patch('/supplier/orders/:id/delivery-status', updateSupplierDeliveryStatus);
router.get('/supplier/summary', getSupplierSummary);
router.get('/supplier/menu', getSupplierMenuItems);
router.post('/supplier/menu', createSupplierMenuItem);
router.put('/supplier/menu/:id', updateSupplierMenuItem);
router.delete('/supplier/menu/:id', deleteSupplierMenuItem);

module.exports = router;
