import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

export const AdminProfilePage = () => {
	const dispatch = useDispatch();
	const { user } = useSelector(state => state.auth);
	const [loading, setLoading] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		name: user?.name || '',
		email: user?.email || '',
		phone: user?.phone || '',
		address: user?.address || '',
		gender: user?.gender || '',
		dateOfBirth: user?.dateOfBirth || ''
	});

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};

	const handleEdit = () => {
		setIsEditing(true);
		setFormData({
			name: user?.name || '',
			email: user?.email || '',
			phone: user?.phone || '',
			address: user?.address || '',
			gender: user?.gender || '',
			dateOfBirth: user?.dateOfBirth || ''
		});
	};

	const handleCancel = () => {
		setIsEditing(false);
		setFormData({
			name: user?.name || '',
			email: user?.email || '',
			phone: user?.phone || '',
			address: user?.address || '',
			gender: user?.gender || '',
			dateOfBirth: user?.dateOfBirth || ''
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		
		// TODO: Implement profile update
		toast.success('Cập nhật hồ sơ thành công!');
		setLoading(false);
		setIsEditing(false);
	};

	return (
		<div className="container-fluid">
			<div className="d-sm-flex align-items-center justify-content-between mb-4">
				<h1 className="h3 mb-0 text-gray-800">Hồ sơ cá nhân</h1>
				<a href="/" className="btn btn-primary btn-sm">
					<i className="fas fa-store me-1"></i>
					Quay lại web bán hàng
				</a>
			</div>

			<Row>
				<Col lg={8}>
					<Card>
						<Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
							<h5 className="mb-0">
								<i className="fas fa-user me-2"></i>
								Thông tin cá nhân
							</h5>
							{!isEditing && (
								<Button
									variant="light"
									size="sm"
									onClick={handleEdit}
								>
									<i className="fas fa-edit me-1"></i>
									Chỉnh sửa
								</Button>
							)}
						</Card.Header>
						<Card.Body>
							<Form onSubmit={handleSubmit}>
								<Row>
									<Col md={6}>
										<Form.Group className="mb-3">
											<Form.Label>Tên đăng nhập</Form.Label>
											<Form.Control
												type="text"
												value={user?.username || ''}
												disabled
											/>
										</Form.Group>
									</Col>
									<Col md={6}>
										<Form.Group className="mb-3">
											<Form.Label>Email</Form.Label>
											<Form.Control
												type="email"
												name="email"
												value={formData.email}
												onChange={handleChange}
												disabled={!isEditing}
											/>
										</Form.Group>
									</Col>
								</Row>

								<Row>
									<Col md={6}>
										<Form.Group className="mb-3">
											<Form.Label>Họ và tên</Form.Label>
											<Form.Control
												type="text"
												name="name"
												value={formData.name}
												onChange={handleChange}
												disabled={!isEditing}
											/>
										</Form.Group>
									</Col>
									<Col md={6}>
										<Form.Group className="mb-3">
											<Form.Label>Số điện thoại</Form.Label>
											<Form.Control
												type="text"
												name="phone"
												value={formData.phone}
												onChange={handleChange}
												disabled={!isEditing}
											/>
										</Form.Group>
									</Col>
								</Row>

								<Form.Group className="mb-3">
									<Form.Label>Địa chỉ</Form.Label>
									<Form.Control
										type="text"
										name="address"
										value={formData.address}
										onChange={handleChange}
										disabled={!isEditing}
									/>
								</Form.Group>

								<Row>
									<Col md={6}>
										<Form.Group className="mb-3">
											<Form.Label>Giới tính</Form.Label>
											<Form.Select
												name="gender"
												value={formData.gender}
												onChange={handleChange}
												disabled={!isEditing}
											>
												<option value="">Chọn giới tính</option>
												<option value="Nam">Nam</option>
												<option value="Nữ">Nữ</option>
												<option value="Khác">Khác</option>
											</Form.Select>
										</Form.Group>
									</Col>
									<Col md={6}>
										<Form.Group className="mb-3">
											<Form.Label>Ngày sinh</Form.Label>
											<Form.Control
												type="date"
												name="dateOfBirth"
												value={formData.dateOfBirth}
												onChange={handleChange}
												disabled={!isEditing}
											/>
										</Form.Group>
									</Col>
								</Row>

								<div className="d-flex justify-content-end gap-2">
									{isEditing ? (
										<>
											<Button
												variant="outline-secondary"
												onClick={handleCancel}
											>
												Hủy
											</Button>
											<Button
												variant="primary"
												type="submit"
												disabled={loading}
											>
												{loading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
											</Button>
										</>
									) : null}
								</div>
							</Form>
						</Card.Body>
					</Card>
				</Col>

				<Col lg={4}>
					<Card>
						<Card.Header className="bg-info text-white">
							<h5 className="mb-0">
								<i className="fas fa-cog me-2"></i>
								Cài đặt
							</h5>
						</Card.Header>
						<Card.Body>
							<div className="d-grid gap-2">
								<Link to="/admin/settings" className="btn btn-outline-info">
									<i className="fas fa-key me-2"></i>
									Đổi mật khẩu
								</Link>
								<Link to="/admin/settings" className="btn btn-outline-warning">
									<i className="fas fa-bell me-2"></i>
									Cài đặt thông báo
								</Link>
								<Link to="/admin/settings" className="btn btn-outline-secondary">
									<i className="fas fa-palette me-2"></i>
									Giao diện
								</Link>
							</div>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</div>
	);
};

export default AdminProfilePage;
