import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';

const PaymentFailedPage = () => {
	const history = useHistory();
	const location = useLocation();
	const [message, setMessage] = useState('Thanh toán thất bại');
	const [orderId, setOrderId] = useState('');

	useEffect(() => {
		const searchParams = new URLSearchParams(location.search);
		const msg = searchParams.get('message') || searchParams.get('error');
		const oId = searchParams.get('orderId');

		if (msg) {
			setMessage(decodeURIComponent(msg));
		}
		if (oId) {
			setOrderId(oId);
		}

		// Xóa thông tin pending nếu thanh toán thất bại
		localStorage.removeItem('pendingOrderId');
		localStorage.removeItem('pendingCartItems');
	}, [location]);

	return (
		<Container className="py-5">
			<Row className="justify-content-center">
				<Col md={8}>
					<Card className="border-danger">
						<Card.Header className="bg-danger text-white text-center">
							<h4 className="mb-0">
								<i className="fas fa-times-circle me-2"></i>
								Thanh toán thất bại
							</h4>
						</Card.Header>
						<Card.Body>
							<Alert variant="danger" className="text-center">
								<h5>Rất tiếc!</h5>
								<p className="mb-0">{message}</p>
							</Alert>

							{orderId && (
								<div className="mt-4">
									<p><strong>Mã đơn hàng:</strong> {orderId}</p>
									<p className="text-muted">
										Đơn hàng của bạn đã được tạo nhưng chưa thanh toán. 
										Bạn có thể thử thanh toán lại hoặc chọn phương thức thanh toán khác.
									</p>
								</div>
							)}

							{!orderId && (
								<div className="mt-4">
									<p className="text-muted">
										Bạn đã hủy quá trình thanh toán. 
										Vui lòng thử lại nếu muốn hoàn tất đơn hàng.
									</p>
								</div>
							)}

							<div className="text-center mt-4">
								<Button 
									variant="primary" 
									className="me-2"
									onClick={() => history.push('/gio-hang')}
								>
									<i className="fas fa-shopping-cart me-2"></i>
									Quay lại giỏ hàng
								</Button>
								<Button 
									variant="outline-primary"
									onClick={() => history.push('/lich-su-dat-hang')}
								>
									<i className="fas fa-list me-2"></i>
									Xem lịch sử đơn hàng
								</Button>
								<Button 
									variant="outline-secondary"
									className="ms-2"
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

export default PaymentFailedPage;
