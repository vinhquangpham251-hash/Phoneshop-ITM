const express = require('express');
const Cart = require('../models/Cart');
const Phone = require('../models/Phone');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

// @route GET /api/cart
// @desc Get user's cart
// @access Private
router.get('/', verifyToken, async (req, res) => {
	try {
		let cart = await Cart.findOne({ user: req.userId });

		if (!cart) {
			cart = new Cart({ user: req.userId, items: [] });
			await cart.save();
		}

		// Populate phone data if cart has items
		if (cart.items && cart.items.length > 0) {
			await cart.populate({
				path: 'items.phone',
				populate: {
					path: 'category',
					model: 'Category'
				}
			});
		}

		console.log('After populate - First item phone:', cart?.items?.[0]?.phone);
		console.log('After populate - First item phone type:', typeof cart?.items?.[0]?.phone);

		console.log('=== FINAL CART DATA ===');
		console.log('Cart items count:', cart?.items?.length);
		if (cart.items && cart.items.length > 0) {
			console.log('First item phone:', cart.items[0].phone);
			console.log('First item phone name:', cart.items[0].phone?.name);
			console.log('First item phone metaTitle:', cart.items[0].phone?.metaTitle);
			console.log('First item phone category:', cart.items[0].phone?.category);
			console.log('First item phone photos:', cart.items[0].phone?.photos);
			console.log('First item phone type:', typeof cart.items[0].phone);
			console.log('First item phone is populated:', cart.items[0].phone && typeof cart.items[0].phone === 'object');
		}
		
		return res.json({
			status: true,
			cart
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: 'Lỗi máy chủ!'
		});
	}
});

// @route POST /api/cart/add
// @desc Add product to cart
// @access Private
router.post('/add', verifyToken, async (req, res) => {
	try {
		const { phoneId, rom, ram, color, quantity } = req.body;

		// Validate input
		if (!phoneId || !rom || !ram || !color || !quantity) {
			return res.status(400).json({
				status: false,
				message: 'Thiếu thông tin sản phẩm!'
			});
		}

		// Check if phone exists
		const phone = await Phone.findById(phoneId);
		if (!phone) {
			return res.status(400).json({
				status: false,
				message: 'Không tìm thấy sản phẩm!'
			});
		}

		// Find phone model to get price
		const phoneModel = phone.models.find(
			model => model.rom === rom && model.ram === ram && model.color === color
		);

		if (!phoneModel) {
			return res.status(400).json({
				status: false,
				message: 'Không tìm thấy cấu hình sản phẩm!'
			});
		}

		// Check stock
		if (phoneModel.quantity < quantity) {
			return res.status(400).json({
				status: false,
				message: 'Số lượng trong kho không đủ!'
			});
		}

		// Calculate final price (subtract promotionPrice from model price if available)
		const finalPrice = phone.promotionPrice && phone.promotionPrice > 0 
			? Math.max(0, phoneModel.price - phone.promotionPrice)
			: phoneModel.price;
		
		console.log('Phone:', phone.name);
		console.log('Model price:', phoneModel.price);
		console.log('Promotion price:', phone.promotionPrice);
		console.log('Final price (after discount):', finalPrice);

		// Find or create cart
		let cart = await Cart.findOne({ user: req.userId });
		if (!cart) {
			cart = new Cart({ user: req.userId, items: [] });
		}

		// Check if item already exists in cart
		const existingItemIndex = cart.items.findIndex(
			item => 
				item.phone.toString() === phoneId &&
				item.rom === rom &&
				item.ram === ram &&
				item.color === color
		);

		if (existingItemIndex > -1) {
			// Update existing item
			cart.items[existingItemIndex].quantity += quantity;
			cart.items[existingItemIndex].price = finalPrice;
		} else {
			// Add new item
			cart.items.push({
				phone: phoneId,
				rom,
				ram,
				color,
				quantity,
				price: finalPrice
			});
		}

		await cart.save();

		return res.json({
			status: true,
			message: 'Đã thêm sản phẩm vào giỏ hàng!',
			cart
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: 'Lỗi máy chủ!'
		});
	}
});

// @route PUT /api/cart/update/:itemId
// @desc Update cart item quantity
// @access Private
router.put('/update/:itemId', verifyToken, async (req, res) => {
	try {
		const { quantity } = req.body;
		const { itemId } = req.params;

		if (!quantity || quantity < 1) {
			return res.status(400).json({
				status: false,
				message: 'Số lượng không hợp lệ!'
			});
		}

		const cart = await Cart.findOne({ user: req.userId });
		if (!cart) {
			return res.status(400).json({
				status: false,
				message: 'Không tìm thấy giỏ hàng!'
			});
		}

		const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
		if (itemIndex === -1) {
			return res.status(400).json({
				status: false,
				message: 'Không tìm thấy sản phẩm trong giỏ hàng!'
			});
		}

		// Check stock and update price
		const phone = await Phone.findById(cart.items[itemIndex].phone);
		const phoneModel = phone.models.find(
			model => 
				model.rom === cart.items[itemIndex].rom &&
				model.ram === cart.items[itemIndex].ram &&
				model.color === cart.items[itemIndex].color
		);

		if (phoneModel.quantity < quantity) {
			return res.status(400).json({
				status: false,
				message: 'Số lượng trong kho không đủ!'
			});
		}

		// Calculate final price (subtract promotionPrice from model price if available)
		const finalPrice = phone.promotionPrice && phone.promotionPrice > 0 
			? Math.max(0, phoneModel.price - phone.promotionPrice)
			: phoneModel.price;

		cart.items[itemIndex].quantity = quantity;
		cart.items[itemIndex].price = finalPrice;
		await cart.save();

		// Populate phone data before returning
		await cart.populate({
			path: 'items.phone',
			populate: {
				path: 'category',
				model: 'Category'
			}
		});

		console.log('Update cart - Final cart data:', JSON.stringify(cart, null, 2));
		console.log('Update cart - First item phone:', cart.items[0]?.phone);
		console.log('Update cart - First item phone name:', cart.items[0]?.phone?.name);

		return res.json({
			status: true,
			message: 'Đã cập nhật số lượng!',
			cart
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: 'Lỗi máy chủ!'
		});
	}
});

// @route DELETE /api/cart/remove/:itemId
// @desc Remove item from cart
// @access Private
router.delete('/remove/:itemId', verifyToken, async (req, res) => {
	try {
		const { itemId } = req.params;

		const cart = await Cart.findOne({ user: req.userId });
		if (!cart) {
			return res.status(400).json({
				status: false,
				message: 'Không tìm thấy giỏ hàng!'
			});
		}

		cart.items = cart.items.filter(item => item._id.toString() !== itemId);
		await cart.save();

		// Populate phone data before returning
		await cart.populate({
			path: 'items.phone',
			populate: {
				path: 'category',
				model: 'Category'
			}
		});

		return res.json({
			status: true,
			message: 'Đã xóa sản phẩm khỏi giỏ hàng!',
			cart
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: 'Lỗi máy chủ!'
		});
	}
});

// @route DELETE /api/cart/clear
// @desc Clear entire cart
// @access Private
router.delete('/clear', verifyToken, async (req, res) => {
	try {
		const cart = await Cart.findOne({ user: req.userId });
		if (!cart) {
			return res.status(400).json({
				status: false,
				message: 'Không tìm thấy giỏ hàng!'
			});
		}

		cart.items = [];
		await cart.save();

		// Populate phone data before returning (even though items is empty)
		await cart.populate({
			path: 'items.phone',
			populate: {
				path: 'category',
				model: 'Category'
			}
		});

		return res.json({
			status: true,
			message: 'Đã xóa toàn bộ giỏ hàng!',
			cart
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: 'Lỗi máy chủ!'
		});
	}
});

// @route GET /api/cart/total
// @desc Calculate cart total
// @access Private
router.get('/total', verifyToken, async (req, res) => {
	try {
		const cart = await Cart.findOne({ user: req.userId }).populate({
			path: 'items.phone',
			populate: {
				path: 'category',
				model: 'Category'
			}
		});
		if (!cart || cart.items.length === 0) {
			return res.json({
				status: true,
				total: 0,
				itemCount: 0
			});
		}

		const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
		const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

		return res.json({
			status: true,
			total,
			itemCount
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: 'Lỗi máy chủ!'
		});
	}
});

module.exports = router;
