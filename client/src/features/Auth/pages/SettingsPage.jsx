import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { toast } from 'react-toastify';

export const SettingsPage = () => {
	const dispatch = useDispatch();
	const { user } = useSelector(state => state.auth);
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: ''
	});

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		
		// TODO: Implement password change
		toast.success('Đổi mật khẩu thành công!');
		setLoading(false);
	};

	return (
		<Container className="py-5">
			<Row className="justify-content-center">
				<Col md={8} lg={6}>
					<Card>
						<Card.Header className="bg-warning text-dark">
							<h4 className="mb-0">
								<i className="fas fa-cog me-2"></i>
								Cài đặt tài khoản
							</h4>
						</Card.Header>
						<Card.Body>
							<Form onSubmit={handleSubmit}>
								<Form.Group className="mb-3">
									<Form.Label>Mật khẩu hiện tại</Form.Label>
									<Form.Control
										type="password"
										name="currentPassword"
										value={formData.currentPassword}
										onChange={handleChange}
										placeholder="Nhập mật khẩu hiện tại"
										required
									/>
								</Form.Group>

								<Form.Group className="mb-3">
									<Form.Label>Mật khẩu mới</Form.Label>
									<Form.Control
										type="password"
										name="newPassword"
										value={formData.newPassword}
										onChange={handleChange}
										placeholder="Nhập mật khẩu mới"
										required
									/>
								</Form.Group>

								<Form.Group className="mb-3">
									<Form.Label>Xác nhận mật khẩu mới</Form.Label>
									<Form.Control
										type="password"
										name="confirmPassword"
										value={formData.confirmPassword}
										onChange={handleChange}
										placeholder="Nhập lại mật khẩu mới"
										required
									/>
								</Form.Group>

								<div className="d-grid gap-2 d-md-flex justify-content-md-end">
									<Button
										variant="outline-secondary"
										onClick={() => window.history.back()}
									>
										Quay lại
									</Button>
									<Button
										variant="warning"
										type="submit"
										disabled={loading}
									>
										{loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
									</Button>
								</div>
							</Form>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</Container>
	);
};

export default SettingsPage;
