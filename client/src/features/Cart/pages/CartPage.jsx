import discountApi from 'api/discountApi';
import orderApi from 'api/orderApi';
import paymentApi from 'api/paymentApi';
import { selectCurrentUser } from 'app/authSlice';
import { 
	updateCartItem, 
	removeCartItem, 
	clearCart, 
	selectCart,
	selectCartItems,
	fetchCart
} from 'app/cartSlice';
import { SplitButton } from 'components/Buttons/SplitButton';
import { Confirm } from 'components/Common/Confirm';
import { useEffect, useState } from 'react';
import {
	Alert,
	Button,
	Col,
	FormControl,
	FormGroup,
	FormLabel,
	InputGroup,
	Row,
	Card,
	Badge
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { formatToVND, formatToNumberString } from 'utils';
import { CartList } from '../components/CartList';
import addressApi from 'api/addressApi';
import Select from 'react-select';

const CartPage = () => {
	const cart = useSelector(selectCart);
	const cartItems = useSelector(selectCartItems);
	const currentUser = useSelector(selectCurrentUser);
	

	const history = useHistory();
	const dispatch = useDispatch();

	// Fetch cart when component mounts
	useEffect(() => {
		if (currentUser) {
			dispatch(fetchCart());
		}
	}, [dispatch, currentUser]);


	const handleUpdateCartItem = ({ itemId, quantity }) => {
		dispatch(updateCartItem({ 
			itemId, 
			quantity 
		}));
	};

	const handleRemoveCartItem = cartItem => {
		setConfirm({
			show: true,
			message: (
				<>
					Xóa điện thoại{' '}
					<b>
						{cartItem.phone?.name || 'N/A'} - {cartItem.model?.rom || 'N/A'} |{' '}
						{cartItem.model?.ram || 'N/A'} | {cartItem.model?.color || 'N/A'}
					</b>{' '}
					khỏi giỏ hàng?
				</>
			),
			onSuccess: () => {
				dispatch(removeCartItem(cartItem._id));
				toast.success(
					<>
						Xóa thành công điện thoại{' '}
						<b>
							{cartItem.phone?.name || 'N/A'} - {cartItem.model?.rom || 'N/A'} |{' '}
							{cartItem.model?.ram || 'N/A'} | {cartItem.model?.color || 'N/A'}
						</b>{' '}
						khỏi giỏ hàng
					</>
				);
			}
		});
	};

	const [totalPrice, setTotalPrice] = useState(0);
	useEffect(() => {
		let newTotalPrice = 0;

		if (cartItems && Array.isArray(cartItems) && cartItems.length > 0) {
			for (let item of cartItems) {
				// item.price đã là giá cuối (sau khi giảm)
				newTotalPrice += item.quantity * item.price;
			}
		}

		setTotalPrice(newTotalPrice);
	}, [cartItems]);

	// Ship infor
	const [shipInfor, setShipInfor] = useState({
		address: {
			city: { value: '', label: 'Chọn tỉnh / thành phố' },
			district: { value: '', label: 'Chọn quận / huyện' },
			ward: { value: '', label: 'Chọn phường / thị xã / xã' },
			more: ''
		},
		phone: ''
	});

	const handleChangeShipInfor = (value, e) => {
		if (value.target?.name === 'phone') {
			setShipInfor({
				...shipInfor,
				phone: value.target.value
			});
		} else if (e?.name === 'city') {
			setShipInfor({
				...shipInfor,
				address: {
					...shipInfor.address,
					city: value,
					district: { value: '', label: 'Chọn quận / huyện' },
					ward: { value: '', label: 'Chọn phường / thị xã / xã' }
				}
			});
		} else if (e?.name === 'district') {
			setShipInfor({
				...shipInfor,
				address: {
					...shipInfor.address,
					district: value,
					ward: { value: '', label: 'Chọn phường / thị xã / xã' }
				}
			});
		} else if (e?.name === 'ward') {
			setShipInfor({
				...shipInfor,
				address: {
					...shipInfor.address,
					ward: value
				}
			});
		} else {
			setShipInfor({
				...shipInfor,
				address: {
					...shipInfor.address,
					more: value.target.value
				}
			});
		}
	};

	// Cities
	const [cityOptions, setCityOptions] = useState([
		{ label: 'Chọn tỉnh / thành phố', value: '' }
	]);
	useEffect(() => {
		let cities = addressApi
			.fetchCities()
			.map(city => ({ label: city.name, value: city.code }));

		cities.unshift({ label: 'Chọn tỉnh / thành phố', value: '' });
		setCityOptions(cities);
	}, []);

	// Districts
	const [districtOptions, setDistrictOptions] = useState([
		{ label: 'Chọn quận / huyện', value: '' }
	]);

	useEffect(() => {
		if (shipInfor.address.city.value !== '') {
			const districts = addressApi
				.fetchDistricts(shipInfor.address.city.value)
				.map(district => ({
					label: district.name,
					value: district.id,
					prefix: district.prefix
				}));

			districts.unshift({ label: 'Chọn quận / huyện', value: '' });
			setDistrictOptions(districts);
		} else {
			setDistrictOptions([{ label: 'Chọn quận / huyện', value: '' }]);
		}
	}, [shipInfor.address.city]);

	// Wards
	const [wardOptions, setWardOptions] = useState([
		{ label: 'Chọn phường / thị xã / xã', value: '' }
	]);

	useEffect(() => {
		if (shipInfor.address.city.value && shipInfor.address.district.value) {
			const wards = addressApi
				.fetchWards(
					shipInfor.address.city.value,
					shipInfor.address.district.value
				)
				.map(ward => ({ label: ward.name, value: ward.id }));

			wards.unshift({ label: 'Chọn phường / thị xã / xã', value: '' });
			setWardOptions(wards);
		} else {
			setWardOptions([{ label: 'Chọn phường / thị xã / xã', value: '' }]);
		}
	}, [shipInfor.address.city, shipInfor.address.district]);

	// Ship price
	const [shipPrice, setShipPrice] = useState(0);
	useEffect(() => {
		setShipPrice(25000);
	}, [shipInfor.address]);

	// discount price
	const [discountCode, setdiscountCode] = useState('');
	const [discountCard, setdiscountCard] = useState(null);

	// Payment method - COD và MoMo
	const [paymentMethod, setPaymentMethod] = useState('cod');
	const [loadingPayment, setLoadingPayment] = useState(false);

	const fetchDiscountCard = async () => {
		try {
			const res = await discountApi.fetch(discountCode);

			if (res.status) {
				setdiscountCard(res.discount);
			} else {
				setdiscountCard(null);
				toast.error(res.message);
			}
		} catch (error) {
			alert(error);
		}
	};

	// Final price
	const [finalPrice, setFinalPrice] = useState(0);
	useEffect(() => {
		let newFinalPrice = 0;

		const discountPrice =
			discountCard && discountCard.quantity > 0 && discountCard.status
				? discountCard.price
				: 0;
		newFinalPrice = totalPrice + shipPrice - discountPrice;

		setFinalPrice(newFinalPrice);
	}, [discountCard, shipPrice, totalPrice]);

	// Handle add order
	const handleAddOrder = async () => {
		if (!currentUser) {
			toast.error('Vui lòng đăng nhập để thêm mới đơn hàng!');
			history.push('/dang-nhap');
			return;
		}

		if (!shipInfor.phone) {
			toast.error('Vui lòng nhập số điện thoại nhận hàng!');
			return;
		}

		if (
			!shipInfor.address.city.value ||
			!shipInfor.address.district.value ||
			!shipInfor.address.ward.value ||
			!shipInfor.address.more
		) {
			toast.error('Vui lòng hoàn thành địa chỉ giao hàng!');
			return;
		}

		setLoadingPayment(true);

		try {
			let newOrderDetails = [];
			if (cartItems && Array.isArray(cartItems) && cartItems.length > 0) {
				for (let item of cartItems) {
					newOrderDetails.push({
						phone: item.phone._id,
						rom: item.rom,
						ram: item.ram,
						color: item.color,
						quantity: item.quantity,
						price: item.price
					});
				}
			} else {
				toast.error('Giỏ hàng trống! Vui lòng thêm sản phẩm vào giỏ hàng.');
				setLoadingPayment(false);
				return;
			}

			const newOrder = {
				user: currentUser._id,
				phone: shipInfor.phone,
				address: `${shipInfor.address.more}, ${shipInfor.address.ward.label}, ${shipInfor.address.district.label}, ${shipInfor.address.city.label}`,
				details: newOrderDetails,
				shipPrice,
				discount: discountCard?._id || undefined,
				paymentMethod: paymentMethod
			};

			const res = await orderApi.add(newOrder);

			if (res.status) {
				if (paymentMethod === 'momo') {
					// Tạo payment URL MoMo
					const paymentRes = await paymentApi.createMoMoPaymentUrl({
						orderId: res.order._id,
						amount: res.order.finalPrice,
						orderInfo: `Thanh toan don hang ${res.order._id}`,
						items: cartItems.map(item => ({
							name: item.phone.name,
							quantity: item.quantity,
							price: item.price
						}))
					});

					if (paymentRes.success) {
						// Lưu thông tin đơn hàng để xóa giỏ hàng sau khi thanh toán thành công
						localStorage.setItem('pendingOrderId', res.order._id);
						localStorage.setItem('pendingCartItems', JSON.stringify(cartItems));
						
						// Chuyển hướng đến MoMo payment
						window.location.href = paymentRes.data.payUrl;
					} else {
						toast.error('Lỗi tạo payment MoMo: ' + paymentRes.message);
						setLoadingPayment(false);
					}
				} else {
					// COD - chỉ tạo đơn hàng khi chọn COD
					toast.success(res.message);
					dispatch(clearCart());
					history.push('/lich-su-dat-hang');
					setLoadingPayment(false);
				}
			} else {
				toast.error(res.message);
				setLoadingPayment(false);
			}
		} catch (error) {
			console.log(error);
			toast.error('Lỗi hệ thống! Thêm mới đơn hàng không thành công!');
			setLoadingPayment(false);
		}
	};

	// Confirm
	const [confirm, setConfirm] = useState({});

	const handleCloseConfirm = () => setConfirm({ ...confirm, show: false });

	// Return
	return (
		<div className="p-5">
			<Confirm
				show={confirm.show}
				title={confirm.title}
				message={confirm.message}
				onSuccess={confirm.onSuccess}
				onClose={confirm.onCancel || handleCloseConfirm}
			/>
			<Row className="g-4">
				<Col xl={cartItems && cartItems.length > 0 ? 8 : 12}>
					<div className="bg-white rounded shadow">
						<div className="phdr">Giỏ hàng</div>
						<div className="p-3">
							{cartItems && Array.isArray(cartItems) && cartItems.length > 0 ? (
								<CartList
									cart={cart}
									cartItems={cartItems}
									handleUpdateCartItem={handleUpdateCartItem}
									handleRemoveCartItem={handleRemoveCartItem}
								/>
							) : (
								<Alert variant="info" className="mb-0">
									<i className="fas fa-shopping-cart me-2"></i>
									Giỏ hàng trống! Hãy thêm sản phẩm vào giỏ hàng.
								</Alert>
							)}
						</div>
					</div>
				</Col>
				{cartItems && cartItems.length > 0 && (
					<Col>
						<div className="bg-white rounded shadow mb-3">
							<div className="phdr">Thông tin giao hàng</div>
							<div className="p-3">
								<div>
									<FormGroup className="mb-3">
										<FormLabel>Số điện thoại</FormLabel>
										<FormControl
											name="phone"
											value={shipInfor.phone || ''}
											onChange={handleChangeShipInfor}
										/>
									</FormGroup>
									<FormGroup>
										<FormLabel>Địa chỉ</FormLabel>

										<div className="border rounded p-3">
											<FormGroup className="mb-3">
												<FormLabel>
													Tỉnh / Thành phố
												</FormLabel>
												<Select
													name="city"
													options={cityOptions}
													value={
														shipInfor.address.city
													}
													onChange={
														handleChangeShipInfor
													}
												/>
											</FormGroup>

											<FormGroup className="mb-3">
												<FormLabel>
													Quận / Huyện
												</FormLabel>
												<Select
													name="district"
													options={districtOptions}
													value={
														shipInfor.address
															.district
													}
													onChange={
														handleChangeShipInfor
													}
												/>
											</FormGroup>

											<FormGroup className="mb-3">
												<FormLabel>
													Phường / Thị xã / Xã
												</FormLabel>
												<Select
													name="ward"
													options={wardOptions}
													value={
														shipInfor.address.ward
													}
													onChange={
														handleChangeShipInfor
													}
												/>
											</FormGroup>

											<FormGroup className="mb-3">
												<FormLabel>
													Số nhà, tổ
												</FormLabel>
												<FormControl
													name="more"
													value={
														shipInfor.address.more
													}
													onChange={
														handleChangeShipInfor
													}
												/>
											</FormGroup>

											<Alert
												variant="primary"
												className="d-flex justify-content-between mb-0"
											>
												Phí vận chuyển{' '}
												<span className="fw-bold">
													{formatToVND(shipPrice)}
												</span>
											</Alert>
										</div>
									</FormGroup>
								</div>
							</div>
						</div>

						<div className="bg-white rounded shadow mb-4">
							<div className="phdr">Mã giảm giá</div>
							<div className="p-3">
								<InputGroup>
									<FormControl
										name="discountCode"
										placeholder="Nhập mã giảm giá"
										value={discountCode}
										onChange={e =>
											setdiscountCode(e.target.value)
										}
									/>
									<SplitButton
										icon="fas fa-code"
										text="Kiểm tra"
										onClick={fetchDiscountCard}
									/>
								</InputGroup>
								<div className="mt-3">
									{discountCard ? (
										<Card
											className={
												discountCard.quantity > 0 &&
												discountCard.status
													? 'alert-primary'
													: 'alert-danger'
											}
										>
											<Card.Body className="p-0">
												<div className="fw-bold d-flex justify-content-between">
													<div>
														<i className="fas fa-code me-2"></i>
														{discountCard.code}
													</div>
													<div>
														<Badge
															bg={
																discountCard.status
																	? 'primary'
																	: 'danger'
															}
														>
															{discountCard.status
																? 'Khả dụng'
																: 'Đã khóa'}
														</Badge>
													</div>
												</div>
												<div className="d-flex justify-content-between mt-3">
													<div className="text-center">
														<div
															style={{
																fontSize: 11
															}}
														>
															Tên
														</div>
														<div className="fw-bold">
															{discountCard.name}
														</div>
													</div>

													<div className="text-center">
														<div
															style={{
																fontSize: 11
															}}
														>
															Số lượng
														</div>
														<div className="fw-bold">
															{formatToNumberString(
																discountCard.quantity
															)}
														</div>
													</div>

													<div className="text-center">
														<div
															style={{
																fontSize: 11
															}}
														>
															Giảm
														</div>
														<div className="fw-bold">
															{formatToVND(
																discountCard.price
															)}
														</div>
													</div>
												</div>
											</Card.Body>
										</Card>
									) : (
										<Alert
											variant="danger"
											className="my-0"
										>
											Không có mã giảm giá!
										</Alert>
									)}
								</div>
							</div>
						</div>

						<div className="bg-white rounded shadow mb-3">
							<div className="phdr">Phương thức thanh toán</div>
							<div className="p-3">
								<FormGroup className="mb-3">
									<FormLabel>Chọn phương thức thanh toán</FormLabel>
									<div className="d-flex gap-3">
										<FormGroup className="form-check">
											<input
												className="form-check-input"
												type="radio"
												name="paymentMethod"
												id="cod"
												value="cod"
												checked={paymentMethod === 'cod'}
												onChange={(e) => setPaymentMethod(e.target.value)}
											/>
											<label className="form-check-label" htmlFor="cod">
												<i className="fas fa-money-bill-wave me-2"></i>
												Thanh toán khi nhận hàng (COD)
											</label>
										</FormGroup>
										<FormGroup className="form-check">
											<input
												className="form-check-input"
												type="radio"
												name="paymentMethod"
												id="momo"
												value="momo"
												checked={paymentMethod === 'momo'}
												onChange={(e) => setPaymentMethod(e.target.value)}
											/>
											<label className="form-check-label" htmlFor="momo">
												<i className="fas fa-mobile-alt me-2"></i>
												Thanh toán MoMo (Sandbox)
											</label>
										</FormGroup>
									</div>
								</FormGroup>

								{paymentMethod === 'momo' && (
									<div className="alert alert-info">
										<i className="fas fa-info-circle me-2"></i>
										<strong>MoMo Sandbox:</strong> Sử dụng môi trường test chính thức của MoMo. 
										Bạn sẽ được chuyển đến trang thanh toán MoMo để hoàn tất giao dịch.
									</div>
								)}

								{paymentMethod === 'cod' && (
									<div className="alert alert-info">
										<i className="fas fa-info-circle me-2"></i>
										<strong>COD:</strong> Bạn sẽ thanh toán cho nhân viên giao hàng khi nhận sản phẩm.
									</div>
								)}
							</div>
						</div>

						<div className="bg-white rounded shadow">
							<div className="phdr">Thành tiền</div>
							<div className="p-3">
								<div className="d-flex justify-content-between mb-1">
									<span>Tiền hàng</span>
									<span>{formatToVND(totalPrice)}</span>
								</div>
								<div className="d-flex justify-content-between mb-1">
									<span>Vận chuyển</span>
									<span>{formatToVND(shipPrice)}</span>
								</div>
								<div className="d-flex justify-content-between mb-1">
									<span>Giảm giá</span>
									<span>
										{formatToVND(
											discountCard &&
												discountCard.quantity > 0 &&
												discountCard.status
												? discountCard.price
												: 0
										)}
									</span>
								</div>
								<div className="d-flex justify-content-between mb-3">
									<span className="fw-bold">Thành tiền</span>
									<span className="fw-bold text-danger">
										{formatToVND(finalPrice)}
									</span>
								</div>
								<div className="d-grid gap-2">
									<Button 
										onClick={handleAddOrder} 
										variant="primary" 
										size="lg"
										disabled={loadingPayment}
									>
										{loadingPayment ? (
											<>
												<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
												Đang xử lý...
											</>
										) : (
											<>
												<i className="fas fa-list-alt me-2" />
												Đặt hàng (COD)
											</>
										)}
									</Button>
								</div>
							</div>
						</div>
					</Col>
				)}
			</Row>
		</div>
	);
};

export default CartPage;
