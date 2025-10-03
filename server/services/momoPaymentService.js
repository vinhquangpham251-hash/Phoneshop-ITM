const crypto = require('crypto');

// MoMo Payment Service - Sandbox Environment
class MoMoPaymentService {
    constructor() {
        this.config = {
            // MoMo Sandbox URLs
            baseUrl: process.env.MOMO_BASE_URL || 'https://test-payment.momo.vn/v2/gateway/api',
            partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMOBKUN20180529',
            accessKey: process.env.MOMO_ACCESS_KEY || 'klm05TvNBzhg7h7j',
            secretKey: process.env.MOMO_SECRET_KEY || 'at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa',
            returnUrl: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/payment/momo/return`,
            notifyUrl: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/payment/momo/callback`,
            requestType: process.env.MOMO_REQUEST_TYPE || 'payWithATM'
        };
    }

    // Tạo payment URL
    async createPaymentUrl(orderInfo) {
        try {
            const {
                orderId,
                amount,
                orderInfo: orderDescription,
                items = []
            } = orderInfo;

            console.log('Creating MoMo Payment URL:', {
                orderId,
                amount,
                orderDescription,
                items: items.length
            });

            // Tạo request ID duy nhất
            const requestId = `REQ-${orderId}-${Date.now()}`;
            const extraData = `merchantName=PhoneShop&merchantId=${this.config.partnerCode}`;

            // Tạo description từ items
            const description = items.length > 0 
                ? `Order ${orderId}: ${items.map(item => `${item.name} x${item.quantity}`).join(', ')}`
                : orderDescription || `Thanh toan don hang ${orderId}`;

            // Tạo raw signature string theo đúng format MoMo
            const rawSignature = `accessKey=${this.config.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${this.config.notifyUrl}&orderId=${orderId}&orderInfo=${description}&partnerCode=${this.config.partnerCode}&redirectUrl=${this.config.returnUrl}&requestId=${requestId}&requestType=${this.config.requestType}`;

            console.log('Raw Signature String:', rawSignature);

            // Tạo signature
            const signature = crypto.createHmac('sha256', this.config.secretKey)
                .update(rawSignature)
                .digest('hex');

            console.log('Generated Signature:', signature);

            // Tạo request body
            const requestBody = {
                partnerCode: this.config.partnerCode,
                accessKey: this.config.accessKey,
                requestId: requestId,
                amount: amount,
                orderId: orderId,
                orderInfo: description,
                redirectUrl: this.config.returnUrl,
                ipnUrl: this.config.notifyUrl,
                extraData: extraData,
                requestType: this.config.requestType,
                signature: signature
            };

            console.log('MoMo Request Body:', requestBody);

            // Gọi MoMo API
            const response = await fetch(this.config.baseUrl + '/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();
            console.log('MoMo API Response:', result);

            if (result.resultCode === 0) {
                return {
                    success: true,
                    payUrl: result.payUrl,
                    orderId: orderId,
                    requestId: requestId,
                    amount: amount,
                    message: 'Tạo URL thanh toán MoMo thành công'
                };
            } else {
                return {
                    success: false,
                    message: `Lỗi tạo payment MoMo: ${result.message || 'Unknown error'}`,
                    error: result
                };
            }

        } catch (error) {
            console.error('MoMo Payment URL Error:', error);
            return {
                success: false,
                message: 'Lỗi tạo URL thanh toán MoMo: ' + error.message,
                error: error
            };
        }
    }

    // Xử lý callback từ MoMo
    async handleCallback(callbackData) {
        try {
            console.log('MoMo Callback Data:', callbackData);

            // Kiểm tra signature
            const isValid = this.verifySignature(callbackData);
            if (!isValid) {
                return {
                    success: false,
                    message: 'Invalid MoMo signature'
                };
            }

            return {
                success: true,
                message: 'Xử lý callback MoMo thành công',
                data: {
                    orderId: callbackData.orderId,
                    amount: callbackData.amount,
                    status: callbackData.resultCode === 0 ? 'success' : 'failed',
                    transId: callbackData.transId,
                    resultCode: callbackData.resultCode,
                    message: callbackData.message
                }
            };

        } catch (error) {
            console.error('MoMo Callback Error:', error);
            return {
                success: false,
                message: 'Lỗi xử lý callback MoMo: ' + error.message,
                error: error
            };
        }
    }

    // Kiểm tra trạng thái giao dịch
    async checkTransactionStatus(orderId, requestId) {
        try {
            console.log('Checking MoMo Transaction:', { orderId, requestId });

            const rawSignature = `accessKey=${this.config.accessKey}&orderId=${orderId}&partnerCode=${this.config.partnerCode}&requestId=${requestId}`;
            const signature = crypto.createHmac('sha256', this.config.secretKey)
                .update(rawSignature)
                .digest('hex');

            const requestBody = {
                partnerCode: this.config.partnerCode,
                accessKey: this.config.accessKey,
                requestId: requestId,
                orderId: orderId,
                signature: signature
            };

            const response = await fetch(this.config.baseUrl + '/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();
            console.log('MoMo Query Response:', result);

            return {
                success: true,
                data: result
            };

        } catch (error) {
            console.error('MoMo Query Error:', error);
            return {
                success: false,
                message: 'Lỗi kiểm tra trạng thái giao dịch MoMo: ' + error.message,
                error: error
            };
        }
    }

    // Xác thực signature
    verifySignature(data) {
        try {
            const {
                partnerCode,
                accessKey,
                requestId,
                amount,
                orderId,
                orderInfo,
                orderType,
                transId,
                resultCode,
                message,
                payType,
                responseTime,
                extraData,
                signature
            } = data;

            const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

            const expectedSignature = crypto.createHmac('sha256', this.config.secretKey)
                .update(rawSignature)
                .digest('hex');

            return signature === expectedSignature;
        } catch (error) {
            console.error('Signature verification error:', error);
            return false;
        }
    }
}

module.exports = new MoMoPaymentService();
