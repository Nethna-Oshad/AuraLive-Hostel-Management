const LaundryOrder = require('../models/laundryOrderModel');
const Laundry = require('../models/laundryModel');

// ==========================================
// 1. Get Estimates (Dynamic Pricing Logic)
// ==========================================
const getEstimates = async (req, res) => {
  try {
    const { weightInKg, expectedDate, serviceType } = req.body;

    const targetDate = new Date(expectedDate);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    const allPartners = await Laundry.find({ status: 'Active' });

    // Filter premium partners if it's urgent (<= 1 day)
    let availablePartners = allPartners;
    const isUrgent = diffDays <= 1;

    if (isUrgent) {
      availablePartners = allPartners.filter(partner => partner.isPremium === true);
    }

    const partnersWithPrices = availablePartners.map(partner => {
      // 1. Base Price calculation
      let total = (partner.pricePerKg || 200) * weightInKg;

      // 2. Add Service Specific Extra Costs
      if (serviceType === 'Wash & Iron') {
        total += Number(partner.washIronPrice || 0);
      } else if (serviceType === 'Dry Clean Only') {
        total += Number(partner.dryCleanPrice || 0);
      }

      // 3. Add Urgency Fee if applicable
      if (isUrgent) {
        total += Number(partner.oneDayDeliveryFee || 0);
      }

      // 4. Discount for long-term (>= 5 days) - Optional 20% off
      if (diffDays >= 5) {
        total = total * 0.8;
      }

      return {
        partnerId: partner._id,
        name: partner.name,
        isPremium: partner.isPremium,
        rating: partner.rating,
        basePricePerKg: partner.pricePerKg,
        estimatedTotal: Math.round(total) 
      };
    });

    res.status(200).json({
      daysUntilDelivery: diffDays,
      isUrgent,
      availablePartners: partnersWithPrices
    });

  } catch (error) {
    res.status(500).json({ message: "Error calculating estimates", error: error.message });
  }
};

// ==========================================
// 2. Create Final Order (FIXED TO SAVE ISPREMIUMORDER)
// ==========================================
const createOrder = async (req, res) => {
  try {
    const { 
      studentId, weightInKg, expectedDate, 
      serviceType, assignedPartner, finalPrice,
      isPremiumOrder // 👈 Get this from frontend body
    } = req.body;

    const photo = req.file ? `/laundryImages/${req.file.filename}` : null;

    const newOrder = await LaundryOrder.create({
      studentId,
      weightInKg,
      expectedDate,
      serviceType: serviceType || 'Wash & Fold', 
      assignedPartner,
      finalPrice,
      photo,
      status: 'Pending',
      // ✅ Boolean validation - ensure it saves correctly
      isPremiumOrder: isPremiumOrder === 'true' || isPremiumOrder === true 
    });

    res.status(201).json({ message: "Order placed successfully!", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};

// ==========================================
// 3. Get Orders for a Student
// ==========================================
const getStudentOrders = async (req, res) => {
  try {
    const { studentId } = req.params;
    const orders = await LaundryOrder.find({ studentId })
      .populate({
        path: 'assignedPartner',
        select: 'name phone pricePerKg isPremium'
      })
      .sort({ createdAt: -1 });

    res.status(200).json(orders || []);
  } catch (error) {
    console.error("Fetch Student Orders Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// ==========================================
// 4. Update Partner Details (Admin/Settings)
// ==========================================
const updatePartnerByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    // Updated to use $set to allow partial updates for pricing settings
    const updatedPartner = await Laundry.findByIdAndUpdate(
      id, 
      { $set: req.body }, 
      { new: true }
    );
    if (!updatedPartner) return res.status(404).json({ message: "Partner not found" });
    res.status(200).json({ message: "Partner details updated!", partner: updatedPartner });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 5. Get Partner Dashboard Orders
// ==========================================
const getPartnerOrders = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const orders = await LaundryOrder.find({ assignedPartner: partnerId })
      .populate('studentId', 'name phone') 
      .sort({ createdAt: -1 });

    console.log(`>>> FETCHED ${orders.length} ORDERS FOR PARTNER: ${partnerId}`);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Fetch Partner Orders Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// ==========================================
// 6. Update Order Status
// ==========================================
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const updatedOrder = await LaundryOrder.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: `Order status updated to ${status}`, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 7. Rate an Order
// ==========================================
const rateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { rating, comment } = req.body;

    const updatedOrder = await LaundryOrder.findByIdAndUpdate(
      orderId,
      { 
        rating: Number(rating), 
        reviewComment: comment, 
        isRated: true 
      },
      { new: true }
    );

    if (!updatedOrder) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Rating submitted successfully!", order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEstimates,
  createOrder,
  getStudentOrders,
  updatePartnerByAdmin,
  getPartnerOrders,
  updateOrderStatus,
  rateOrder
};