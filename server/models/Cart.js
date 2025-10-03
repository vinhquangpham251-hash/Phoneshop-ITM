const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const CartItemSchema = new Schema({
	phone: { type: ObjectId, ref: 'Phone', required: true },
	rom: { type: String, required: true },
	ram: { type: String, required: true },
	color: { type: String, required: true },
	quantity: { type: Number, required: true, min: 1 },
	price: { type: Number, required: true, min: 0 },
	addedAt: { type: Date, default: Date.now }
});

const CartSchema = new Schema({
	user: { type: ObjectId, ref: 'User' },
	sessionId: { type: String },
	items: [CartItemSchema],
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now }
});

// Middleware để tự động cập nhật updatedAt
CartSchema.pre('save', function(next) {
	this.updatedAt = Date.now();
	next();
});

module.exports = mongoose.model('Cart', CartSchema);
