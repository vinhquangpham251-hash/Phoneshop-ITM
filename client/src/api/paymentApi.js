import axiosClient from './axiosClient';

const paymentApi = {
    // Tạo payment URL MoMo
    createMoMoPaymentUrl: (data) => {
        const url = '/payment/momo/create-payment-url';
        return axiosClient.post(url, data);
    },

    // Kiểm tra trạng thái giao dịch MoMo
    checkMoMoTransaction: (data) => {
        const url = '/payment/momo/check-transaction';
        return axiosClient.post(url, data);
    },

    // Test MoMo payment connection
    testMoMo: () => {
        const url = '/payment/momo/test';
        return axiosClient.get(url);
    }
};

export default paymentApi;
