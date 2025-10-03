const express = require('express');
const User = require('../models/User');
const Discount = require('../models/Discount');
const router = express.Router();
const Order = require('../models/Order');
const Phone = require('../models/Phone');

// @route GET /api/orders
// @desc Get all orders
// @access Public
router.get('/', async (req, res) => {
	try {
		const { key, user, phone, status } = req.query;

		// Query
		let query = {};

		if (user) query = { user };
		if (status !== undefined) query = { ...query, status };

		let orders = await Order.find(query)
			.populate('user', 'username avatar name avatar phone email')
			.populate('details.phone', 'name photos');

		if (key) {
			orders = orders.filter(
				order =>
					order._id.toString().toUpperCase() === key.toUpperCase() ||
					order.user.name.search(key) >= 0 ||
					order.address.search(key) >= 0 ||
					order.phone.search(key) >= 0
			);
		}

		if (phone) {
			orders = orders.filter(
				order =>
					order.details.findIndex(
						detail => detail.phone._id.toString() === phone
					) >= 0
			);
		}

		// Pagination
		let { _page, _limit } = req.query;

		_page = !_page && _limit ? 1 : parseInt(_page);
		_limit = _page && !_limit ? 5 : parseInt(_limit);

		const _skip = _page ? (_page - 1) * _limit : undefined;
		const _totalRows = orders.length;
		const pagination = _page ? { _page, _limit, _totalRows } : undefined;

		orders = orders.skip(_skip).limit(_limit);

		// Return
		return res.json({
			status: true,
			data: orders,
			pagination
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: 'Lỗi máy chủ! Lấy danh sách đơn hàng không thành công!'
		});
	}
});

// @route GET /api/orders/topcustomers
// @desc Get top customers (only paid orders)
// @access Public
router.get('/topcustomers', async (req, res) => {
	try {
		const _limit = parseInt(req.query._limit) || 5;

		// Find all paid orders - either status: true OR paymentStatus: 'paid'
		const paidOrders = await Order.find({
			$or: [
				{ status: true },
				{ paymentStatus: 'paid' }
			]
		}).populate('user', 'name avatar');

		// Group by user and sum prices
		const userTotals = {};
		paidOrders.forEach(order => {
			const userId = order.user._id.toString();
			if (!userTotals[userId]) {
				userTotals[userId] = {
					_id: order.user._id,
					user: order.user,
					price: 0
				};
			}
			userTotals[userId].price += order.finalPrice;
		});

		const orders = Object.values(userTotals)
			.sort((a, b) => b.price - a.price)
			.slice(0, _limit);

		// All good
		return res.json({
			status: true,
			data: orders,
			_limit
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: 'Lỗi máy chủ!'
		});
	}
});

// @route GET /api/orders/topphones
// @desc Get top phones (only paid orders)
// @access Public
router.get('/topphones', async (req, res) => {
	try {
		const _limit = parseInt(req.query._limit) || 5;

		// Use aggregation pipeline - find all paid orders
		const topPhones = await Order.aggregate([
			{
				$match: {
					$or: [
						{ status: true },
						{ paymentStatus: 'paid' }
					]
				}
			},
			{ $unwind: '$details' },
			{
				$group: {
					_id: '$details.phone',
					quantity: { $sum: '$details.quantity' }
				}
			},
			{
				$lookup: {
					from: 'phones',
					localField: '_id',
					foreignField: '_id',
					as: 'phone'
				}
			},
			{ $unwind: '$phone' },
			{
				$project: {
					_id: 1,
					phone: {
						_id: '$phone._id',
						name: '$phone.name',
						photos: '$phone.photos'
					},
					quantity: 1
				}
			},
			{ $sort: { quantity: -1 } },
			{ $limit: _limit }
		]);

		return res.json({
			status: true,
			data: topPhones,
			_limit
		});
	} catch (error) {
		console.log('TopPhones error:', error);
		return res.status(500).json({
			status: false,
			message: 'Lỗi máy chủ!'
		});
	}
});

// @route POST /api/orders
// @desc Add order
// @access Public
router.post('/', async (req, res) => {
	try {
		const { user, address, phone, details, shipPrice, discount, paymentMethod } = req.body;

		// Check user
		const userValid = await User.findById(user);

		if (!userValid)
			return res.status(400).json({
				status: false,
				message: 'Không tìm thấy người dùng!'
			});

		// Check for discount exists
		let discountPrice = 0;

		if (discount) {
			let discountValid = await Discount.findById(discount);

			if (!discountValid)
				return res.status(400).json({
					status: false,
					message: 'Không tìm thấy phiếu giảm giá!'
				});

			if (discountValid.quantity <= 0 || !discountValid.status)
				return res.status(400).json({
					status: false,
					message: 'Không tìm thấy phiếu giảm giá!'
				});

			await Discount.findByIdAndUpdate(discount, {
				quantity: discountValid.quantity - 1
			});

			discountPrice = discountValid.price;
		}

		// Cal total price
		let totalPrice = 0;
		for (let item of details) {
			totalPrice += item.quantity * item.price;
		}

		// Cal finalPrice
		const finalPrice = totalPrice + shipPrice - discountPrice;

		// All good
		const newOrder = new Order({
			user,
			address,
			phone,
			details,
			totalPrice,
			shipPrice,
			discountPrice,
			finalPrice,
			paymentMethod: paymentMethod || 'cod' // Đảm bảo có giá trị mặc định
		});

		await newOrder.save();

		// Return
		return res.json({
			status: true,
			message: 'Thêm mới đơn hàng thành công!',
			order: newOrder
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: 'Lỗi máy chủ! Thêm mới đơn hàng không thành công!'
		});
	}
});

// @route GET /api/orders/:id
// @desc Get order by ID
// @access Public
router.get('/:id', async (req, res) => {
	try {
		const { id } = req.params;

		const order = await Order.findById(id)
			.populate('user', 'username avatar name avatar phone email')
			.populate('details.phone', 'name photos');

		if (!order) {
			return res.status(400).json({
				status: false,
				message: 'Không tìm thấy đơn hàng!'
			});
		}

		// All good
		return res.json({
			status: true,
			data: order
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: 'Lỗi máy chủ! Lấy thông tin đơn hàng không thành công!'
		});
	}
});

// @route PUT /api/orders
// @desc Update order status
// @access Private
router.put('/:id', async (req, res) => {
	try {
		// Check order exists
		const { id } = req.params;

		const orderValid = await Order.findById(id);

		if (!orderValid)
			return res.status(400).json({
				status: false,
				message: 'Không tìm thấy đơn hàng!'
			});

		// All good
		const { status } = req.body;

		const updatedOrder = await Order.findByIdAndUpdate(
			id,
			{ status },
			{ new: true }
		)
			.populate('user', 'username avatar name avatar phone email')
			.populate('details.phone', 'name photos');

		// Return
		return res.json({
			status: true,
			message: 'Cập nhật trạng thái đơn hàng thành công!',
			category: updatedOrder
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message:
				'Lỗi máy chủ! Cập nhật trạng thái đơn hàng không thành công!'
		});
	}
});

module.exports = router;
