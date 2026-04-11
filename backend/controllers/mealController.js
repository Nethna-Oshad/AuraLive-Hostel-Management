const MealBooking = require('../models/mealBookingModel');
const MealSlot = require('../models/mealSlotModel');
const MealMenuItem = require('../models/mealMenuItemModel');
const MealSupplier = require('../models/mealSupplierModel');

const DEFAULT_KITCHEN_SLOTS = [
  { label: 'Breakfast Prep', timeRange: '06:00 - 07:00', capacity: 4 },
  { label: 'Lunch Prep', timeRange: '12:00 - 13:00', capacity: 5 },
  { label: 'Dinner Prep - Early', timeRange: '18:00 - 19:00', capacity: 5 },
  { label: 'Dinner Prep - Late', timeRange: '19:00 - 20:00', capacity: 4 },
];

const buildEtaFromName = (name = '') => {
  const seed = name.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const start = 20 + (seed % 4) * 5; // 20, 25, 30, 35
  return `${start}-${start + 10} min`;
};

const getDynamicThirdPartyShops = async () => {
  const suppliers = await MealSupplier.find({ status: 'Active' })
    .select('name logoUrl shopTagline')
    .sort({ name: 1 });
  if (suppliers.length === 0) return [];

  const supplierNames = suppliers.map((s) => s.name);
  const menuItems = await MealMenuItem.find({
    supplierName: { $in: supplierNames },
    isAvailable: true,
  }).select('supplierName category price');

  const bySupplier = menuItems.reduce((acc, item) => {
    if (!acc[item.supplierName]) acc[item.supplierName] = [];
    acc[item.supplierName].push(item);
    return acc;
  }, {});

  return suppliers.map((supplier) => {
    const items = bySupplier[supplier.name] || [];
    const basePrice =
      items.length > 0
        ? Math.min(...items.map((i) => Number(i.price) || 1200))
        : 1200;
    const cuisine =
      items.length > 0
        ? items[0].category || 'Meals'
        : 'Meals';

    return {
      name: supplier.name,
      logoUrl: supplier.logoUrl || '',
      tagline: supplier.shopTagline || '',
      eta: buildEtaFromName(supplier.name),
      cuisine,
      basePrice,
    };
  });
};

const getBookingDate = (dateParam) => {
  if (dateParam) return dateParam;
  return new Date().toISOString().slice(0, 10);
};

const ensureDefaultSlots = async () => {
  const existing = await MealSlot.countDocuments();
  if (existing > 0) return;
  await MealSlot.insertMany(DEFAULT_KITCHEN_SLOTS);
};

const getKitchenSlots = async (req, res) => {
  try {
    const bookingDate = getBookingDate(req.query.date);
    await ensureDefaultSlots();
    const thirdPartyShops = await getDynamicThirdPartyShops();
    const slotsFromDb = await MealSlot.find({ isActive: true }).sort({ createdAt: 1 });

    const counts = await MealBooking.aggregate([
      { $match: { bookingDate, type: 'Kitchen', status: { $ne: 'Cancelled' } } },
      { $group: { _id: '$slotId', count: { $sum: 1 } } },
    ]);

    const countMap = counts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const slots = slotsFromDb.map((slot) => {
      const slotId = String(slot._id);
      const booked = countMap[slotId] || 0;
      const available = Math.max(slot.capacity - booked, 0);
      return {
        id: slotId,
        label: slot.label,
        timeRange: slot.timeRange,
        capacity: slot.capacity,
        booked,
        available,
        isFull: available === 0,
      };
    });

    const isAllSlotsFull = slots.every((slot) => slot.isFull);

    res.json({
      date: bookingDate,
      slots,
      isAllSlotsFull,
      thirdPartyShops,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createKitchenBooking = async (req, res) => {
  try {
    const { studentEmail, studentName, slotId, bookingDate, notes } = req.body;

    if (!studentEmail || !studentName || !slotId) {
      return res.status(400).json({ message: 'studentEmail, studentName and slotId are required.' });
    }

    const date = getBookingDate(bookingDate);
    const slot = await MealSlot.findById(slotId);

    if (!slot || !slot.isActive) {
      return res.status(400).json({ message: 'Invalid slot selected.' });
    }

    const existingStudentBooking = await MealBooking.findOne({
      studentEmail,
      bookingDate: date,
      type: 'Kitchen',
      slotId,
      status: { $ne: 'Cancelled' },
    });

    if (existingStudentBooking) {
      return res.status(400).json({ message: 'You already booked this kitchen slot.' });
    }

    const bookedCount = await MealBooking.countDocuments({
      bookingDate: date,
      type: 'Kitchen',
      slotId,
      status: { $ne: 'Cancelled' },
    });

    if (bookedCount >= slot.capacity) {
      const thirdPartyShops = await getDynamicThirdPartyShops();
      return res.status(409).json({
        message: 'This slot is already full. Please select another slot or order from third-party shops.',
        thirdPartyShops,
      });
    }

    const booking = await MealBooking.create({
      studentEmail,
      studentName,
      bookingDate: date,
      type: 'Kitchen',
      slotId: String(slot._id),
      slotLabel: `${slot.label} (${slot.timeRange})`,
      notes: notes || '',
      paymentStatus: 'NotRequired',
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createExternalOrder = async (req, res) => {
  try {
    const { studentEmail, studentName, bookingDate, shopName, menuItem, slotId, notes } = req.body;

    if (!studentEmail || !studentName || !shopName || !menuItem) {
      return res.status(400).json({ message: 'studentEmail, studentName, shopName and menuItem are required.' });
    }

    const date = getBookingDate(bookingDate);
    const thirdPartyShops = await getDynamicThirdPartyShops();
    const selectedSlot = slotId ? await MealSlot.findById(slotId) : null;
    const selectedShop = thirdPartyShops.find((shop) => shop.name === shopName);
    if (!selectedShop) {
      return res.status(400).json({ message: 'Selected shop is not available.' });
    }
    const externalAmount = selectedShop ? selectedShop.basePrice : 1200;
    const slotLabel = selectedSlot
      ? `${selectedSlot.label} (${selectedSlot.timeRange})`
      : 'External Order Window';

    const booking = await MealBooking.create({
      studentEmail,
      studentName,
      bookingDate: date,
      type: 'External',
      slotId: selectedSlot ? selectedSlot.id : 'external-order',
      slotLabel,
      notes: notes || '',
      externalShopName: shopName,
      externalMenuItem: menuItem,
      externalAmount,
      paymentStatus: 'Unpaid',
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentMealBookings = async (req, res) => {
  try {
    const bookings = await MealBooking.find({ studentEmail: req.params.email }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminMealOrders = async (req, res) => {
  try {
    const { date, shop } = req.query;
    const query = {};

    if (date) query.bookingDate = date;
    if (shop) query.externalShopName = shop;

    const orders = await MealBooking.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryStatus } = req.body;
    if (!deliveryStatus) {
      return res.status(400).json({ message: 'deliveryStatus is required.' });
    }

    const order = await MealBooking.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Meal order not found.' });

    order.deliveryStatus = deliveryStatus;
    if (deliveryStatus === 'Cancelled') {
      order.status = 'Cancelled';
    }
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const exportMealOrdersCsv = async (req, res) => {
  try {
    const { date, shop } = req.query;
    const query = {};
    if (date) query.bookingDate = date;
    if (shop) query.externalShopName = shop;

    const orders = await MealBooking.find(query).sort({ createdAt: -1 });
    const headers = [
      'Booking Date',
      'Student Name',
      'Student Email',
      'Type',
      'Slot',
      'External Shop',
      'Menu Item',
      'Amount',
      'Payment Status',
      'Delivery Status',
      'Order Status',
    ];

    const escapeCsv = (value) => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`;
    };

    const rows = orders.map((order) => [
      order.bookingDate,
      order.studentName,
      order.studentEmail,
      order.type,
      order.slotLabel,
      order.externalShopName || '-',
      order.externalMenuItem || '-',
      order.externalAmount || 0,
      order.paymentStatus,
      order.deliveryStatus,
      order.status,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="meal-orders-${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminMealOrderSummary = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const [totalOrdersToday, pendingDeliveries, deliveredCount, unpaidExternalOrders] = await Promise.all([
      MealBooking.countDocuments({ bookingDate: today }),
      MealBooking.countDocuments({
        bookingDate: today,
        deliveryStatus: { $in: ['Pending', 'Preparing', 'Out for Delivery'] },
        status: { $ne: 'Cancelled' },
      }),
      MealBooking.countDocuments({
        bookingDate: today,
        deliveryStatus: 'Delivered',
        status: { $ne: 'Cancelled' },
      }),
      MealBooking.countDocuments({
        bookingDate: today,
        type: 'External',
        paymentStatus: 'Unpaid',
        status: { $ne: 'Cancelled' },
      }),
    ]);

    res.json({
      date: today,
      totalOrdersToday,
      pendingDeliveries,
      deliveredCount,
      unpaidExternalOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelMealBooking = async (req, res) => {
  try {
    const booking = await MealBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Meal booking not found.' });
    booking.status = 'Cancelled';
    await booking.save();
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rescheduleMealBooking = async (req, res) => {
  try {
    const { bookingDate, slotId } = req.body;
    if (!bookingDate || !slotId) {
      return res.status(400).json({ message: 'bookingDate and slotId are required.' });
    }

    const booking = await MealBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Meal booking not found.' });
    if (booking.type !== 'Kitchen') {
      return res.status(400).json({ message: 'Only kitchen bookings can be rescheduled.' });
    }
    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Cancelled bookings cannot be rescheduled.' });
    }

    const slot = await MealSlot.findById(slotId);
    if (!slot || !slot.isActive) {
      return res.status(400).json({ message: 'Invalid slot selected.' });
    }

    const bookedCount = await MealBooking.countDocuments({
      bookingDate,
      type: 'Kitchen',
      slotId,
      status: { $ne: 'Cancelled' },
      _id: { $ne: booking._id },
    });

    if (bookedCount >= slot.capacity) {
      return res.status(409).json({ message: 'Selected reschedule slot is already full.' });
    }

    booking.bookingDate = bookingDate;
    booking.slotId = String(slot._id);
    booking.slotLabel = `${slot.label} (${slot.timeRange})`;
    await booking.save();

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminSlots = async (req, res) => {
  try {
    await ensureDefaultSlots();
    const slots = await MealSlot.find().sort({ createdAt: 1 });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAdminSlot = async (req, res) => {
  try {
    const { label, timeRange, capacity } = req.body;
    if (!label || !timeRange || !capacity) {
      return res.status(400).json({ message: 'label, timeRange and capacity are required.' });
    }
    const slot = await MealSlot.create({ label, timeRange, capacity });
    res.status(201).json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAdminSlot = async (req, res) => {
  try {
    const slot = await MealSlot.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!slot) return res.status(404).json({ message: 'Slot not found.' });
    res.json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAdminSlot = async (req, res) => {
  try {
    const slot = await MealSlot.findByIdAndDelete(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found.' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSupplierOrders = async (req, res) => {
  try {
    const { supplierName, date, deliveryStatus, paymentStatus } = req.query;
    const query = {};

    if (supplierName) query.externalShopName = supplierName;
    if (date) query.bookingDate = date;
    if (deliveryStatus) query.deliveryStatus = deliveryStatus;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    // Kitchen bookings have no shop, so supplier view focuses on external shop orders.
    query.type = 'External';

    const orders = await MealBooking.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSupplierSummary = async (req, res) => {
  try {
    const { supplierName } = req.query;
    if (!supplierName) {
      return res.status(400).json({ message: 'supplierName is required.' });
    }

    const today = new Date().toISOString().slice(0, 10);
    const baseQuery = { type: 'External', externalShopName: supplierName };

    const [todayOrders, pendingOrders, deliveredOrders, paidRevenue, unpaidOrders] = await Promise.all([
      MealBooking.countDocuments({ ...baseQuery, bookingDate: today }),
      MealBooking.countDocuments({
        ...baseQuery,
        bookingDate: today,
        deliveryStatus: { $in: ['Pending', 'Preparing', 'Out for Delivery'] },
        status: { $ne: 'Cancelled' },
      }),
      MealBooking.countDocuments({
        ...baseQuery,
        bookingDate: today,
        deliveryStatus: 'Delivered',
        status: { $ne: 'Cancelled' },
      }),
      MealBooking.aggregate([
        { $match: { ...baseQuery, bookingDate: today, paymentStatus: 'Paid', status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$externalAmount' } } },
      ]),
      MealBooking.countDocuments({
        ...baseQuery,
        bookingDate: today,
        paymentStatus: 'Unpaid',
        status: { $ne: 'Cancelled' },
      }),
    ]);

    res.json({
      date: today,
      todayOrders,
      pendingOrders,
      deliveredOrders,
      revenueToday: paidRevenue[0]?.total || 0,
      unpaidOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSupplierMenuItems = async (req, res) => {
  try {
    const { supplierEmail } = req.query;
    if (!supplierEmail) {
      return res.status(400).json({ message: 'supplierEmail is required.' });
    }
    const items = await MealMenuItem.find({ supplierEmail }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPublicShopMenuItems = async (req, res) => {
  try {
    const { supplierName } = req.query;
    if (!supplierName) {
      return res.status(400).json({ message: 'supplierName is required.' });
    }

    const supplier = await MealSupplier.findOne({ name: supplierName, status: 'Active' });
    if (!supplier) {
      return res.json([]);
    }

    const items = await MealMenuItem.find({
      supplierName,
      isAvailable: true,
    })
      .sort({ createdAt: -1 })
      .select('itemName category price prepTimeMinutes description');

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSupplierMenuItem = async (req, res) => {
  try {
    const { supplierName, supplierEmail, itemName, category, price, prepTimeMinutes, description, isAvailable } = req.body;
    if (!supplierName || !supplierEmail || !itemName || price === undefined) {
      return res.status(400).json({ message: 'supplierName, supplierEmail, itemName and price are required.' });
    }
    const item = await MealMenuItem.create({
      supplierName,
      supplierEmail,
      itemName,
      category: category || 'Main',
      price,
      prepTimeMinutes: prepTimeMinutes || 30,
      description: description || '',
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSupplierMenuItem = async (req, res) => {
  try {
    const item = await MealMenuItem.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!item) return res.status(404).json({ message: 'Menu item not found.' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSupplierMenuItem = async (req, res) => {
  try {
    const item = await MealMenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found.' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminMealSuppliers = async (req, res) => {
  try {
    const list = await MealSupplier.find({}).sort({ name: 1 }).select('-password');
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAdminMealSupplier = async (req, res) => {
  try {
    const { name, email, phone, password, status, logoUrl, shopTagline } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'name, email, phone and password are required.' });
    }
    if (await MealSupplier.findOne({ email })) {
      return res.status(400).json({ message: 'A meal supplier with this email already exists.' });
    }
    const user = await MealSupplier.create({
      name,
      email,
      phone,
      password,
      status: status || 'Inactive',
      logoUrl: logoUrl || '',
      shopTagline: shopTagline || '',
    });
    res.status(201).json(await MealSupplier.findById(user._id).select('-password'));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A meal supplier with this email already exists.' });
    }
    res.status(500).json({ message: error.message });
  }
};

const updateAdminMealSupplier = async (req, res) => {
  try {
    const supplier = await MealSupplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Meal supplier not found.' });

    const oldName = supplier.name;
    const oldEmail = supplier.email;
    const { name, email, phone, password, status, logoUrl, shopTagline } = req.body;

    if (email !== undefined && email !== oldEmail) {
      const taken = await MealSupplier.findOne({ email, _id: { $ne: supplier._id } });
      if (taken) return res.status(400).json({ message: 'Email already in use.' });
      supplier.email = email;
    }
    if (name !== undefined) supplier.name = name;
    if (phone !== undefined) supplier.phone = phone;
    if (status !== undefined) supplier.status = status;
    if (logoUrl !== undefined) supplier.logoUrl = logoUrl;
    if (shopTagline !== undefined) supplier.shopTagline = shopTagline;
    if (password && String(password).trim()) {
      supplier.password = password;
    }

    await supplier.save();

    const newName = supplier.name;
    const newEmail = supplier.email;
    if (newName !== oldName) {
      await MealMenuItem.updateMany({ supplierName: oldName }, { $set: { supplierName: newName } });
      await MealBooking.updateMany({ type: 'External', externalShopName: oldName }, { $set: { externalShopName: newName } });
    }
    if (newEmail !== oldEmail) {
      await MealMenuItem.updateMany({ supplierEmail: oldEmail }, { $set: { supplierEmail: newEmail } });
    }

    res.json(await MealSupplier.findById(supplier._id).select('-password'));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already in use.' });
    }
    res.status(500).json({ message: error.message });
  }
};

const deleteAdminMealSupplier = async (req, res) => {
  try {
    const supplier = await MealSupplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Meal supplier not found.' });

    const extCount = await MealBooking.countDocuments({
      type: 'External',
      externalShopName: supplier.name,
    });
    if (extCount > 0) {
      return res.status(400).json({
        message: `Cannot delete: ${extCount} external order(s) reference this shop. Suspend the account instead.`,
      });
    }

    await MealMenuItem.deleteMany({ supplierEmail: supplier.email });
    await MealSupplier.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminAllMenuItems = async (req, res) => {
  try {
    const { supplierEmail, activeSuppliersOnly } = req.query;

    if (supplierEmail) {
      const owner = await MealSupplier.findOne({ email: supplierEmail });
      if (owner && owner.status !== 'Active') {
        return res.json([]);
      }
      const items = await MealMenuItem.find({ supplierEmail }).sort({ createdAt: -1 });
      return res.json(items);
    }

    if (activeSuppliersOnly === 'true') {
      const active = await MealSupplier.find({ status: 'Active' }).select('email');
      const emails = active.map((s) => s.email);
      const items = await MealMenuItem.find({ supplierEmail: { $in: emails } }).sort({ createdAt: -1 });
      return res.json(items);
    }

    const items = await MealMenuItem.find({}).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminMealHubStats = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const [activeSlots, activePartners, todayKitchenBookings, pendingExternalOrders] = await Promise.all([
      MealSlot.countDocuments({ isActive: true }),
      MealSupplier.countDocuments({ status: 'Active' }),
      MealBooking.countDocuments({
        bookingDate: today,
        type: 'Kitchen',
        status: { $ne: 'Cancelled' },
      }),
      MealBooking.countDocuments({
        type: 'External',
        status: { $ne: 'Cancelled' },
        deliveryStatus: { $in: ['Pending', 'Preparing', 'Out for Delivery'] },
      }),
    ]);

    res.json({
      date: today,
      activeSlots,
      activePartners,
      todayKitchenBookings,
      pendingExternalOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSupplierDeliveryStatus = async (req, res) => {
  try {
    const { deliveryStatus, supplierName } = req.body;
    if (!deliveryStatus || !supplierName) {
      return res.status(400).json({ message: 'deliveryStatus and supplierName are required.' });
    }

    const order = await MealBooking.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Meal order not found.' });
    if (order.externalShopName !== supplierName) {
      return res.status(403).json({ message: 'You can only update your own shop orders.' });
    }

    order.deliveryStatus = deliveryStatus;
    if (deliveryStatus === 'Cancelled') {
      order.status = 'Cancelled';
    }
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
