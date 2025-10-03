import { SplitButton } from 'components/Buttons/SplitButton';
import { Button, Col, InputGroup, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { formatToVND, getImageUrl } from 'utils';

export const CartList = props => {
	const { cart, cartItems, handleUpdateCartItem, handleRemoveCartItem } = props;
	
	// Debug logs
	console.log('CartList - cart:', cart);
	console.log('CartList - cartItems:', cartItems);

	const handleReduceQuantity = item => {
		if (item.quantity === 1) {
			handleRemoveCartItem(item);
			return;
		}

		handleUpdateCartItem({
			itemId: item._id,
			quantity: item.quantity - 1
		});
	};

	const handleIncreaseQuantity = item => {
		handleUpdateCartItem({
			itemId: item._id,
			quantity: item.quantity + 1
		});
	};

	return cartItems && Array.isArray(cartItems) ? cartItems.map((item, index) => {
		console.log('CartList - item:', item);
		console.log('CartList - item.phone:', item.phone);
		console.log('CartList - item.model:', item.model);
		console.log('CartList - item.phone.name:', item.phone?.name);
		console.log('CartList - item.phone.metaTitle:', item.phone?.metaTitle);
		console.log('CartList - item.phone.category:', item.phone?.category);
		console.log('CartList - item.phone.photos:', item.phone?.photos);
		console.log('CartList - item.phone:', JSON.stringify(item.phone, null, 2));
		
		return (
		<div className="border rounded g-2 mb-3 p-4 shadow-sm" key={index}>
			<Row>
				<Col md="auto" className="d-flex justify-content-center">
					<Link
						to={`/dien-thoai/${item.phone?.category?.metaTitle || 'uncategorized'}/${item.phone?.metaTitle || 'unknown'}`}
					>
						<img
							src={
								item.phone?.photos && Array.isArray(item.phone.photos) && item.phone.photos.length > 0
									? getImageUrl(item.phone.photos.filter(
										photo => photo.title === item.color
									)[0]?.url || item.phone.photos[0]?.url)
									: getImageUrl(null, 'no-phone-photo.png')
							}
							alt={item.phone?.name || 'Sản phẩm'}
							width={120}
							height={80}
							style={{ objectFit: 'cover', borderRadius: '4px' }}
							onError={(e) => {
								console.log('Image load error:', e.target.src);
								e.target.src = getImageUrl(null, 'no-phone-photo.png');
							}}
						/>
					</Link>
				</Col>
				<Col>
					<div className="fw-bold">{item.phone?.name || 'Không có tên sản phẩm'}</div>
					<div className="d-flex justify-content-between">
						<div className="mt-1 d-flex">
							<div className="me-4">
								<div className="small" style={{ fontSize: 11 }}>
									Rom
								</div>
								<div
									className="fw-bold"
									style={{ fontSize: 13 }}
								>
									{item.rom || 'N/A'}
								</div>
							</div>

							<div className="me-4">
								<div className="small" style={{ fontSize: 11 }}>
									Ram
								</div>
								<div
									className="fw-bold"
									style={{ fontSize: 13 }}
								>
									{item.ram || 'N/A'}
								</div>
							</div>

							<div className="me-4">
								<div className="small" style={{ fontSize: 11 }}>
									Màu
								</div>
								<div
									className="fw-bold"
									style={{ fontSize: 13 }}
								>
									{item.color || 'N/A'}
								</div>
							</div>

							<div className="me-4">
								<div className="small" style={{ fontSize: 11 }}>
									Giá
								</div>
								<div
									className="fw-bold"
									style={{ fontSize: 13 }}
								>
									{item.phone?.promotionPrice && item.phone.promotionPrice > 0 ? (
										<>
											<div className="text-decoration-line-through text-secondary">
												{formatToVND(item.price + item.phone.promotionPrice)}
											</div>
											<div className="text-danger">
												{formatToVND(item.price)}
											</div>
										</>
									) : (
										formatToVND(item.price)
									)}
								</div>
							</div>

							<div>
								<div className="small" style={{ fontSize: 11 }}>
									Thành tiền
								</div>
								<div
									className="fw-bold text-danger"
									style={{ fontSize: 13 }}
								>
									{formatToVND(item.price * item.quantity)}
								</div>
							</div>
						</div>
					</div>
					<div className="mt-2 d-flex">
						<span>
							<InputGroup size="sm">
								<Button
									variant="outline-primary"
									className="px-3"
									onClick={() => handleReduceQuantity(item)}
								>
									-
								</Button>
								<InputGroup.Text className="bg-white border border-primary text-primary px-3">
									{item.quantity}
								</InputGroup.Text>
								<Button
									variant="outline-primary"
									className="px-3"
									onClick={() => handleIncreaseQuantity(item)}
								>
									+
								</Button>
							</InputGroup>
						</span>
						<SplitButton
							size="sm"
							icon="fas fa-trash"
							variant="danger"
							text="Xóa"
							className="ms-2"
							onClick={() => handleRemoveCartItem(item)}
						/>
					</div>
				</Col>
			</Row>
		</div>
		);
	}) : null;
};
