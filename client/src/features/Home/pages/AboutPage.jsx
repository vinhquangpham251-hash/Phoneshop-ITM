import { Col, Container, Row } from 'react-bootstrap';

export const AboutPage = () => {
	return (
		<Container className="py-5">
			<Row>
				<Col>
					<div className="text-center mb-5">
						<h1 className="display-4 fw-bold text-primary">Giới thiệu về ITM PhoneShop</h1>
						<p className="lead text-muted">
							Chuyên cung cấp điện thoại chính hãng với giá tốt nhất
						</p>
					</div>
				</Col>
			</Row>

			<Row className="mb-5">
				<Col md={6}>
					<h2 className="h3 mb-4">Về chúng tôi</h2>
					<p className="mb-4">
						ITM PhoneShop là cửa hàng điện thoại uy tín, chuyên cung cấp các sản phẩm 
						điện thoại chính hãng từ các thương hiệu nổi tiếng như Samsung, iPhone, 
						Xiaomi, Oppo, Vivo và nhiều thương hiệu khác.
					</p>
					<p className="mb-4">
						Với hơn 5 năm kinh nghiệm trong lĩnh vực bán lẻ điện thoại, chúng tôi 
						luôn cam kết mang đến cho khách hàng những sản phẩm chất lượng cao 
						với giá cả hợp lý nhất.
					</p>
				</Col>
				<Col md={6}>
					<div className="bg-light p-4 rounded">
						<h3 className="h5 mb-3">Tại sao chọn ITM PhoneShop?</h3>
						<ul className="list-unstyled">
							<li className="mb-2">
								<i className="fas fa-check text-success me-2"></i>
								Sản phẩm chính hãng 100%
							</li>
							<li className="mb-2">
								<i className="fas fa-check text-success me-2"></i>
								Giá cả cạnh tranh nhất thị trường
							</li>
							<li className="mb-2">
								<i className="fas fa-check text-success me-2"></i>
								Bảo hành chính hãng đầy đủ
							</li>
							<li className="mb-2">
								<i className="fas fa-check text-success me-2"></i>
								Hỗ trợ kỹ thuật 24/7
							</li>
							<li className="mb-2">
								<i className="fas fa-check text-success me-2"></i>
								Giao hàng nhanh chóng
							</li>
						</ul>
					</div>
				</Col>
			</Row>

			<Row className="mb-5">
				<Col>
					<h2 className="h3 mb-4 text-center">Sứ mệnh của chúng tôi</h2>
					<div className="text-center">
						<p className="lead">
							"Đem đến trải nghiệm mua sắm điện thoại tốt nhất cho mọi khách hàng, 
							với sản phẩm chất lượng cao và dịch vụ chuyên nghiệp."
						</p>
					</div>
				</Col>
			</Row>

			<Row>
				<Col md={4} className="text-center mb-4">
					<div className="bg-primary text-white p-4 rounded">
						<i className="fas fa-mobile-alt fa-3x mb-3"></i>
						<h4>Đa dạng sản phẩm</h4>
						<p className="mb-0">
							Hàng trăm mẫu điện thoại từ các thương hiệu nổi tiếng
						</p>
					</div>
				</Col>
				<Col md={4} className="text-center mb-4">
					<div className="bg-success text-white p-4 rounded">
						<i className="fas fa-shield-alt fa-3x mb-3"></i>
						<h4>Bảo hành uy tín</h4>
						<p className="mb-0">
							Bảo hành chính hãng đầy đủ, hỗ trợ sửa chữa tận tình
						</p>
					</div>
				</Col>
				<Col md={4} className="text-center mb-4">
					<div className="bg-warning text-white p-4 rounded">
						<i className="fas fa-headset fa-3x mb-3"></i>
						<h4>Hỗ trợ 24/7</h4>
						<p className="mb-0">
							Đội ngũ tư vấn chuyên nghiệp, sẵn sàng hỗ trợ mọi lúc
						</p>
					</div>
				</Col>
			</Row>
		</Container>
	);
};

export default AboutPage;
