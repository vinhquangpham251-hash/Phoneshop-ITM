const express = require('express');
const router = express.Router();
const momoPaymentService = require('../services/momoPaymentService');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

// Tạo payment URL MoMo
router.post('/momo/create-payment-url', async (req, res) => {
    try {
        const { orderId, amount, orderInfo, items } = req.body;

        console.log('Creating MoMo Payment URL:', {
            orderId,
            amount,
            orderInfo,
            items: items?.length || 0
        });

        // Kiểm tra order tồn tại
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Cập nhật paymentMethod của order thành momo
        order.paymentMethod = 'momo';
        await order.save();
        console.log('Order payment method updated to momo');

        // Tạo payment URL
        const result = await momoPaymentService.createPaymentUrl({
            orderId,
            amount,
            orderInfo,
            items
        });

        if (result.success) {
            // Lưu payment vào database
            const payment = new Payment({
                order: orderId,
                user: order.user,
                amount: amount,
                currency: 'VND',
                paymentMethod: 'momo',
                status: 'pending',
                orderId: orderId,
                requestId: result.requestId,
                orderInfo: orderInfo,
                gatewayResponse: result
            });

            await payment.save();
            console.log('Payment created successfully:', payment._id);

            res.json({
                success: true,
                message: result.message,
                data: {
                    payUrl: result.payUrl,
                    orderId: result.orderId,
                    requestId: result.requestId,
                    amount: result.amount
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message,
                error: result.error
            });
        }
    } catch (error) {
        console.error('Create MoMo Payment URL Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Xử lý callback từ MoMo
router.post('/momo/callback', async (req, res) => {
    try {
        console.log('MoMo Payment Callback:', req.body);

        const result = await momoPaymentService.handleCallback(req.body);

        if (result.success) {
            // Cập nhật payment status trong database
            const payment = await Payment.findOne({ orderId: result.data.orderId });
            if (payment) {
                payment.status = result.data.status === 'success' ? 'success' : 'failed';
                payment.paidAt = result.data.status === 'success' ? new Date() : null;
                payment.transId = result.data.transId;
                payment.resultCode = result.data.resultCode;
                payment.message = result.data.message;
                payment.gatewayResponse = {
                    ...payment.gatewayResponse,
                    callback: result.data
                };
                await payment.save();

                // Cập nhật order status
                const order = await Order.findById(payment.order);
                if (order) {
                    order.paymentStatus = result.data.status === 'success' ? 'paid' : 'failed';
                    order.paymentTime = result.data.status === 'success' ? new Date() : null;
                    // Đảm bảo paymentMethod được giữ nguyên
                    if (order.paymentMethod !== 'momo') {
                        order.paymentMethod = 'momo';
                    }
                    await order.save();
                }
            }

            res.json({
                success: true,
                message: result.message,
                data: result.data
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message,
                error: result.error
            });
        }
    } catch (error) {
        console.error('MoMo Payment Callback Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Xử lý return URL từ MoMo
router.get('/momo/return', async (req, res) => {
    try {
        console.log('MoMo Payment Return:', req.query);

        // Kiểm tra nếu có resultCode = 1001 (User cancel)
        if (req.query.resultCode === '1001') {
            console.log('User cancelled payment');
            res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/failed?error=${encodeURIComponent('Bạn đã hủy thanh toán')}`);
            return;
        }

        // Kiểm tra nếu có resultCode = 0 (Success)
        if (req.query.resultCode === '0') {
            console.log('Payment successful');
            console.log('OrderId from MoMo:', req.query.orderId);
            console.log('All query params:', req.query);
            
            // Tìm payment bằng orderId
            let payment = await Payment.findOne({ orderId: req.query.orderId });
            console.log('Found payment by orderId:', payment);
            
            // Nếu không tìm thấy, thử tìm bằng order ID
            if (!payment) {
                console.log('Payment not found by orderId, trying to find by order...');
                const order = await Order.findById(req.query.orderId);
                console.log('Found order by ID:', order);
                
                if (order) {
                    payment = await Payment.findOne({ order: req.query.orderId });
                    console.log('Found payment by order:', payment);
                }
            }
            
            // Nếu vẫn không tìm thấy payment, tạo mới
            if (!payment) {
                console.log('Creating new payment record...');
                const order = await Order.findById(req.query.orderId);
                if (order) {
                    payment = new Payment({
                        order: req.query.orderId,
                        user: order.user,
                        amount: req.query.amount || 0,
                        currency: 'VND',
                        paymentMethod: 'momo',
                        status: 'success',
                        orderId: req.query.orderId,
                        transId: req.query.transId,
                        resultCode: req.query.resultCode,
                        message: req.query.message,
                        paidAt: new Date(),
                        gatewayResponse: { return: req.query }
                    });
                    await payment.save();
                    console.log('New payment created:', payment._id);
                }
            }
            
            // Cập nhật payment nếu tìm thấy
            if (payment) {
                payment.status = 'success';
                payment.paidAt = new Date();
                payment.transId = req.query.transId;
                payment.resultCode = req.query.resultCode;
                payment.message = req.query.message;
                payment.gatewayResponse = {
                    ...payment.gatewayResponse,
                    return: req.query
                };
                await payment.save();
                console.log('Payment updated successfully');

                // Cập nhật order status
                const order = await Order.findById(payment.order);
                if (order) {
                    order.status = true;  // Đánh dấu đơn hàng đã thanh toán
                    order.paymentStatus = 'paid';
                    order.paymentTime = new Date();
                    // Đảm bảo paymentMethod được giữ nguyên
                    if (order.paymentMethod !== 'momo') {
                        order.paymentMethod = 'momo';
                    }
                    await order.save();
                    console.log('Order updated successfully - status: true, paymentStatus: paid, paymentMethod: momo');
                }

                // Chuyển hướng đến trang thành công
                res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/success?orderId=${payment.order}`);
                return;
            } else {
                console.log('Could not find or create payment record');
                res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/failed?error=${encodeURIComponent('Không thể cập nhật trạng thái thanh toán')}`);
                return;
            }
        }

        // Các trường hợp khác (failed, error, etc.)
        console.log('Payment failed or error');
        
        // Cập nhật payment status trong database
        const payment = await Payment.findOne({ orderId: req.query.orderId });
        if (payment) {
            payment.status = 'failed';
            payment.resultCode = req.query.resultCode;
            payment.message = req.query.message;
            payment.gatewayResponse = {
                ...payment.gatewayResponse,
                return: req.query
            };
            await payment.save();

            // Cập nhật order status
            const order = await Order.findById(payment.order);
            if (order) {
                order.paymentStatus = 'failed';
                // Đảm bảo paymentMethod được giữ nguyên
                if (order.paymentMethod !== 'momo') {
                    order.paymentMethod = 'momo';
                }
                await order.save();
            }
        }

        // Chuyển hướng đến trang thất bại
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/failed?error=${encodeURIComponent(req.query.message || 'Thanh toán thất bại')}`);

    } catch (error) {
        console.error('MoMo Payment Return Error:', error);
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/failed?error=${encodeURIComponent(error.message)}`);
    }
});

// Sửa trạng thái đơn hàng đã thanh toán
router.post('/fix-order-status', async (req, res) => {
    try {
        console.log('Fixing order status for paid orders...');
        
        // Find orders with paymentStatus: 'paid' but status: false
        const orders = await Order.find({
            paymentStatus: 'paid',
            status: false
        });
        
        console.log(`Found ${orders.length} orders to fix`);
        
        // Update status to true for all paid orders
        let fixedCount = 0;
        for (const order of orders) {
            order.status = true;
            await order.save();
            fixedCount++;
            console.log(`Fixed order ${order._id} - status: true`);
        }
        
        res.json({
            success: true,
            message: `Fixed ${fixedCount} orders successfully!`,
            fixedCount
        });
        
    } catch (error) {
        console.error('Fix Order Status Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ!',
            error: error.message
        });
    }
});

// Kiểm tra trạng thái giao dịch MoMo
router.post('/momo/check-transaction', async (req, res) => {
    try {
        const { orderId, requestId } = req.body;

        console.log('Checking MoMo Payment Transaction:', { orderId, requestId });

        const result = await momoPaymentService.checkTransactionStatus(orderId, requestId);

        if (result.success) {
            res.json({
                success: true,
                message: 'Kiểm tra trạng thái giao dịch MoMo thành công',
                data: result.data
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message,
                error: result.error
            });
        }
    } catch (error) {
        console.error('Check MoMo Payment Transaction Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Test endpoint
router.get('/momo/test', async (req, res) => {
    try {
        console.log('Testing MoMo Payment connection...');

        // Test tạo payment URL với dữ liệu mẫu
        const testResult = await momoPaymentService.createPaymentUrl({
            orderId: 'test-order-123',
            amount: 100000, // 100,000 VND
            orderInfo: 'Test payment MoMo Sandbox',
            items: [
                {
                    name: 'Test Product',
                    quantity: 1,
                    price: 100000
                }
            ]
        });

        if (testResult.success) {
            res.json({
                success: true,
                message: 'MoMo Payment connection successful',
                data: {
                    payUrl: testResult.payUrl,
                    orderId: testResult.orderId,
                    requestId: testResult.requestId,
                    amount: testResult.amount
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'MoMo Payment connection failed',
                error: testResult.message
            });
        }
    } catch (error) {
        console.error('MoMo Payment Test Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

module.exports = router;
