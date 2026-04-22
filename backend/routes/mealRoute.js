const express = require('express');
const router = express.Router();
const {
  getKitchenSlots,
  createKitchenBooking,
  createExternalOrder,
  createExternalCartOrder,
  getStudentMealBookings,
  deleteStudentCompletedExternalOrder,
  deleteStudentCompletedExternalOrdersBulk,
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
  getPublicShopMenuItems,
  createSupplierMenuItem,
  updateSupplierMenuItem,
  deleteSupplierMenuItem,
  updateSupplierDeliveryStatus,
  getAdminMealSuppliers,
  createAdminMealSupplier,
  updateAdminMealSupplier,
  deleteAdminMealSupplier,
  getAdminAllMenuItems,
  getAdminMealHubStats,
} = require('../controllers/mealController');

router.get('/slots', getKitchenSlots);
router.post('/book-kitchen', createKitchenBooking);
router.post('/order-external', createExternalOrder);
router.post('/order-external-cart', createExternalCartOrder);
router.get('/student/:email', getStudentMealBookings);
router.delete('/student/orders/:id', deleteStudentCompletedExternalOrder);
router.delete('/student/orders', deleteStudentCompletedExternalOrdersBulk);
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
router.get('/public/menu', getPublicShopMenuItems);
router.post('/supplier/menu', createSupplierMenuItem);
router.put('/supplier/menu/:id', updateSupplierMenuItem);
router.delete('/supplier/menu/:id', deleteSupplierMenuItem);

router.get('/admin/suppliers', getAdminMealSuppliers);
router.post('/admin/suppliers', createAdminMealSupplier);
router.put('/admin/suppliers/:id', updateAdminMealSupplier);
router.delete('/admin/suppliers/:id', deleteAdminMealSupplier);
router.get('/admin/menu-items', getAdminAllMenuItems);
router.get('/admin/hub-stats', getAdminMealHubStats);

module.exports = router;
