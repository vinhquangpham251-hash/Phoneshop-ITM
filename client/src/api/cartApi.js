import axiosClient from './axiosClient';

const apiUrl = '/cart';

const cartApi = {
	// Lấy giỏ hàng của user
	getCart() {
		return axiosClient.get(apiUrl);
	},

	// Thêm sản phẩm vào giỏ hàng
	addToCart(params) {
		const { phoneId, rom, ram, color, quantity } = params;
		return axiosClient.post(`${apiUrl}/add`, {
			phoneId,
			rom,
			ram,
			color,
			quantity
		});
	},

	// Cập nhật số lượng sản phẩm
	updateQuantity(itemId, quantity) {
		return axiosClient.put(`${apiUrl}/update/${itemId}`, { quantity });
	},

	// Xóa sản phẩm khỏi giỏ hàng
	removeItem(itemId) {
		return axiosClient.delete(`${apiUrl}/remove/${itemId}`);
	},

	// Xóa toàn bộ giỏ hàng
	clearCart() {
		return axiosClient.delete(`${apiUrl}/clear`);
	},

	// Tính tổng giá trị giỏ hàng
	getTotal() {
		return axiosClient.get(`${apiUrl}/total`);
	}
};

export default cartApi;
