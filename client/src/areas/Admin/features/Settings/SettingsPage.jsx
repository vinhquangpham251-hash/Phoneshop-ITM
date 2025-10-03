import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

export const AdminSettingsPage = () => {
	const dispatch = useDispatch();
	const { user } = useSelector(state => state.auth);
	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState('password');
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
		setFormData({
			currentPassword: '',
			newPassword: '',
			confirmPassword: ''
		});
	};

	return (
		<div className="container-fluid">
			<div className="d-sm-flex align-items-center justify-content-between mb-4">
				<h1 className="h3 mb-0 text-gray-800">Cài đặt tài khoản</h1>
				<a href="/" className="btn btn-primary btn-sm">
					<i className="fas fa-store me-1"></i>
					Quay lại web bán hàng
				</a>
			</div>

			<Row>
				<Col lg={3}>
					<Card>
						<Card.Header className="bg-info text-white">
							<h5 className="mb-0">Menu cài đặt</h5>
						</Card.Header>
						<Card.Body className="p-0">
							<div className="list-group list-group-flush">
								<button
									className={`list-group-item list-group-item-action ${activeTab === 'password' ? 'active' : ''}`}
									onClick={() => setActiveTab('password')}
								>
									<i className="fas fa-key me-2"></i>
									Đổi mật khẩu
								</button>
								<button
									className={`list-group-item list-group-item-action ${activeTab === 'notifications' ? 'active' : ''}`}
									onClick={() => setActiveTab('notifications')}
								>
									<i className="fas fa-bell me-2"></i>
									Thông báo
								</button>
								<button
									className={`list-group-item list-group-item-action ${activeTab === 'theme' ? 'active' : ''}`}
									onClick={() => setActiveTab('theme')}
								>
									<i className="fas fa-palette me-2"></i>
									Giao diện
								</button>
							</div>
						</Card.Body>
					</Card>
				</Col>

				<Col lg={9}>
					{activeTab === 'password' && (
						<Card>
							<Card.Header className="bg-warning text-dark">
								<h5 className="mb-0">
									<i className="fas fa-key me-2"></i>
									Đổi mật khẩu
								</h5>
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

									<div className="d-flex justify-content-end">
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
					)}

					{activeTab === 'notifications' && (
						<Card>
							<Card.Header className="bg-info text-white">
								<h5 className="mb-0">
									<i className="fas fa-bell me-2"></i>
									Cài đặt thông báo
								</h5>
							</Card.Header>
							<Card.Body>
								<Form>
									<Form.Group className="mb-3">
										<Form.Check
											type="checkbox"
											label="Thông báo đơn hàng mới"
											defaultChecked
										/>
									</Form.Group>
									<Form.Group className="mb-3">
										<Form.Check
											type="checkbox"
											label="Thông báo phản hồi khách hàng"
											defaultChecked
										/>
									</Form.Group>
									<Form.Group className="mb-3">
										<Form.Check
											type="checkbox"
											label="Thông báo hệ thống"
											defaultChecked
										/>
									</Form.Group>
									<div className="d-flex justify-content-end">
										<Button variant="info">
											Lưu cài đặt
										</Button>
									</div>
								</Form>
							</Card.Body>
						</Card>
					)}

					{activeTab === 'theme' && (
						<Card>
							<Card.Header className="bg-secondary text-white">
								<h5 className="mb-0">
									<i className="fas fa-palette me-2"></i>
									Cài đặt giao diện
								</h5>
							</Card.Header>
							<Card.Body>
								<Form>
									<Form.Group className="mb-3">
										<Form.Label>Chủ đề</Form.Label>
										<Form.Select>
											<option value="light">Sáng</option>
											<option value="dark">Tối</option>
											<option value="auto">Tự động</option>
										</Form.Select>
									</Form.Group>
									<Form.Group className="mb-3">
										<Form.Label>Màu chủ đạo</Form.Label>
										<Form.Select>
											<option value="primary">Xanh dương</option>
											<option value="success">Xanh lá</option>
											<option value="warning">Vàng</option>
											<option value="danger">Đỏ</option>
										</Form.Select>
									</Form.Group>
									<div className="d-flex justify-content-end">
										<Button variant="secondary">
											Lưu cài đặt
										</Button>
									</div>
								</Form>
							</Card.Body>
						</Card>
					)}
				</Col>
			</Row>
		</div>
	);
};

export default AdminSettingsPage;
