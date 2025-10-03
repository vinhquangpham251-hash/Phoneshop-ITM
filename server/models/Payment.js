const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
	order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
	user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	amount: { type: Number, required: true, min: 0 },
	currency: { type: String, default: 'VND' },
	paymentMethod: { 
		type: String, 
		enum: ['cod', 'momo'], 
		required: true 
	},
	status: { 
		type: String, 
		enum: ['pending', 'success', 'failed', 'cancelled'], 
		default: 'pending' 
	},
	// MoMo specific fields
	partnerCode: { type: String },
	requestId: { type: String },
	transId: { type: String }, // MoMo transaction ID
	orderId: { type: String }, // Order ID for MoMo
	orderInfo: { type: String },
	payType: { type: String },
	responseTime: { type: String },
	resultCode: { type: Number },
	message: { type: String },
	extraData: { type: String },
	// Common fields
	gatewayResponse: { type: Schema.Types.Mixed }, // Phản hồi từ MoMo
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
	paidAt: { type: Date } // Thời gian thanh toán thành công
});

// Update updatedAt before save
PaymentSchema.pre('save', function(next) {
	this.updatedAt = new Date();
	next();
});

module.exports = mongoose.model('Payment', PaymentSchema);
