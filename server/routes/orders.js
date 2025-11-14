const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// POST /api/orders - Create new order
router.post('/', async (req, res) => {
  try {
    const {
      orderItems,
      totalAmount,
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress
    } = req.body;

    // Validate order items and get product details
    for (let item of orderItems) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(400).json({
          success: false,
          error: `Product with ID ${item.product_id} not found`
        });
      }

      // Update product stock
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for product: ${product.name}`
        });
      }

      product.stock -= item.quantity;
      await product.save();
    }

    // Create order
    const order = new Order({
      orderItems,
      totalAmount,
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      billingDate: new Date()
    });

    const savedOrder = await order.save();

    res.status(201).json({
      success: true,
      data: savedOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create order'
    });
  }
});

// GET /api/orders/:id - Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order'
    });
  }
});

// GET /api/orders/user/:email - Get orders by customer email
router.get('/user/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ customerEmail: email })
      .sort({ billingDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ customerEmail: email });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user orders'
    });
  }
});

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;

    const updateData = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update order status'
    });
  }
});

// PUT /api/orders/:id/payment - Update payment ID
router.put('/:id/payment', async (req, res) => {
  try {
    const { paymentId } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        paymentId,
        paymentStatus: 'paid'
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update payment'
    });
  }
});

module.exports = router;