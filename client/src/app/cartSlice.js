import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartApi from 'api/cartApi';

// Async thunks
export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
	try {
		const response = await cartApi.getCart();
		return response.cart;
	} catch (error) {
		return rejectWithValue(error.message || 'Lỗi khi lấy giỏ hàng');
	}
});

export const addToCart = createAsyncThunk(
	'cart/addToCart',
	async (params, { rejectWithValue }) => {
		try {
			const response = await cartApi.addToCart(params);
			return response.cart;
		} catch (error) {
			return rejectWithValue(error.message || 'Lỗi khi thêm vào giỏ hàng');
		}
	}
);

export const updateCartItem = createAsyncThunk(
	'cart/updateCartItem',
	async ({ itemId, quantity }, { rejectWithValue }) => {
		try {
			const response = await cartApi.updateQuantity(itemId, quantity);
			return response.cart;
		} catch (error) {
			return rejectWithValue(error.message || 'Lỗi khi cập nhật giỏ hàng');
		}
	}
);

export const removeCartItem = createAsyncThunk(
	'cart/removeCartItem',
	async (itemId, { rejectWithValue }) => {
		try {
			const response = await cartApi.removeItem(itemId);
			return response.cart;
		} catch (error) {
			return rejectWithValue(error.message || 'Lỗi khi xóa sản phẩm');
		}
	}
);

export const clearCart = createAsyncThunk('cart/clearCart', async (_, { rejectWithValue }) => {
	try {
		const response = await cartApi.clearCart();
		return response.cart;
	} catch (error) {
		return rejectWithValue(error.message || 'Lỗi khi xóa giỏ hàng');
	}
});

export const getCartTotal = createAsyncThunk('cart/getCartTotal', async (_, { rejectWithValue }) => {
	try {
		const response = await cartApi.getTotal();
		return response;
	} catch (error) {
		return rejectWithValue(error.message || 'Lỗi khi tính tổng giỏ hàng');
	}
});

// Initial state
const initialState = {
	cart: {
		user: null,
		sessionId: null,
		items: [],
		createdAt: null,
		updatedAt: null
	},
	total: 0,
	itemCount: 0,
	loading: false,
	error: null
};

// Cart slice
const cartSlice = createSlice({
	name: 'cart',
	initialState,
	reducers: {
		clearError: (state) => {
			state.error = null;
		},
		resetCart: (state) => {
			state.cart = initialState.cart;
			state.total = 0;
			state.itemCount = 0;
		},
		clearCartState: (state) => {
			state.cart = initialState.cart;
			state.total = 0;
			state.itemCount = 0;
			state.error = null;
		}
	},
	extraReducers: (builder) => {
		builder
			// Fetch cart
			.addCase(fetchCart.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchCart.fulfilled, (state, action) => {
				state.loading = false;
				state.cart = action.payload;
				state.error = null;
			})
			.addCase(fetchCart.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Add to cart
			.addCase(addToCart.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(addToCart.fulfilled, (state, action) => {
				state.loading = false;
				state.cart = action.payload;
				state.error = null;
			})
			.addCase(addToCart.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Update cart item
			.addCase(updateCartItem.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateCartItem.fulfilled, (state, action) => {
				state.loading = false;
				state.cart = action.payload;
				state.error = null;
			})
			.addCase(updateCartItem.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Remove cart item
			.addCase(removeCartItem.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(removeCartItem.fulfilled, (state, action) => {
				state.loading = false;
				state.cart = action.payload;
				state.error = null;
			})
			.addCase(removeCartItem.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Clear cart
			.addCase(clearCart.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(clearCart.fulfilled, (state, action) => {
				state.loading = false;
				state.cart = action.payload;
				state.error = null;
			})
			.addCase(clearCart.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Get cart total
			.addCase(getCartTotal.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(getCartTotal.fulfilled, (state, action) => {
				state.loading = false;
				state.total = action.payload.total;
				state.itemCount = action.payload.itemCount;
				state.error = null;
			})
			.addCase(getCartTotal.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});
	}
});

// Export actions
export const { clearError, resetCart, clearCartState } = cartSlice.actions;

// Export selectors
export const selectCart = (state) => state.cart.cart;
export const selectCartItems = (state) => state.cart.cart?.items || [];
export const selectCartTotal = (state) => state.cart.total;
export const selectCartItemCount = (state) => state.cart.itemCount;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;

// Export reducer
export default cartSlice.reducer;
