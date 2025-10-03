import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { formatToVND } from 'utils';
import orderApi from 'api/orderApi';
import { useDispatch } from 'react-redux';
import { clearCart } from 'app/cartSlice';

const PaymentSuccessPage = () => {
	const history = useHistory();
	const location = useLocation();
	const dispatch = useDispatch();
	const [order, setOrder] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const searchParams = new URLSearchParams(location.search);
		const orderId = searchParams.get('orderId');

		if (orderId) {
			fetchOrderDetails(orderId);
		} else {
			setLoading(false);
		}

		// Xóa giỏ hàng khi thanh toán thành công
		const pendingOrderId = localStorage.getItem('pendingOrderId');
		if (pendingOrderId && orderId && pendingOrderId === orderId) {
			dispatch(clearCart());
			localStorage.removeItem('pendingOrderId');
			localStorage.removeItem('pendingCartItems');
		}
	}, [location, dispatch]);

	const fetchOrderDetails = async (orderId) => {
		try {
			const res = await orderApi.getById(orderId);
			if (res.status) {
				setOrder(res.data);
			}
		} catch (error) {
			console.error('Error fetching order:', error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<Container className="py-5">
				<Row className="justify-content-center">
					<Col md={6}>
						<Card>
							<Card.Body className="text-center">
								<div className="spinner-border text-primary" role="status">
									<span className="visually-hidden">Loading...</span>
								</div>
								<p className="mt-3">Đang tải thông tin đơn hàng...</p>
							</Card.Body>
						</Card>
					</Col>
				</Row>
			</Container>
		);
	}

	return (
		<Container className="py-5">
			<Row className="justify-content-center">
				<Col md={8}>
					<Card className="border-success">
						<Card.Header className="bg-success text-white text-center">
							<h4 className="mb-0">
								<i className="fas fa-check-circle me-2"></i>
								Thanh toán thành công!
							</h4>
						</Card.Header>
						<Card.Body>
							<Alert variant="success" className="text-center">
								<h5>Cảm ơn bạn đã mua hàng!</h5>
								<p className="mb-0">
									Đơn hàng của bạn đã được thanh toán thành công qua MoMo và đang được xử lý.
								</p>
							</Alert>

							{order && (
								<div className="mt-4">
									<h6>Thông tin đơn hàng:</h6>
									<div className="row">
										<div className="col-md-6">
											<p><strong>Mã đơn hàng:</strong> {order._id}</p>
											<p><strong>Ngày đặt:</strong> {new Date(order.createdDate).toLocaleDateString('vi-VN')}</p>
											<p><strong>Trạng thái:</strong> 
												<span className="badge bg-success ms-2">Đã thanh toán</span>
											</p>
										</div>
										<div className="col-md-6">
											<p><strong>Tổng tiền:</strong> {formatToVND(order.finalPrice)}</p>
											<p><strong>Phương thức:</strong> Thanh toán MoMo</p>
											<p><strong>Địa chỉ giao hàng:</strong> {order.address}</p>
										</div>
									</div>

									<div className="mt-4">
										<h6>Sản phẩm đã mua:</h6>
										<div className="table-responsive">
											<table className="table table-sm">
												<thead>
													<tr>
														<th>Sản phẩm</th>
														<th>Cấu hình</th>
														<th>Số lượng</th>
														<th>Giá</th>
													</tr>
												</thead>
												<tbody>
													{order.details?.map((detail, index) => (
														<tr key={index}>
															<td>{detail.phone?.name || 'N/A'}</td>
															<td>{detail.rom} | {detail.ram} | {detail.color}</td>
															<td>{detail.quantity}</td>
															<td>{formatToVND(detail.price)}</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								</div>
							)}

							<div className="text-center mt-4">
								<Button 
									variant="primary" 
									className="me-2"
									onClick={() => history.push('/lich-su-dat-hang')}
								>
									<i className="fas fa-list me-2"></i>
									Xem lịch sử đơn hàng
								</Button>
								<Button 
									variant="outline-primary"
									onClick={() => history.push('/')}
								>
									<i className="fas fa-home me-2"></i>
									Về trang chủ
								</Button>
							</div>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</Container>
	);
};

export default PaymentSuccessPage;
