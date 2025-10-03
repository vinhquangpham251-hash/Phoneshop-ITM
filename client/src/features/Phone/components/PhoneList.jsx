import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { formatToVND } from 'utils';

// Component for individual phone card
const PhoneCard = ({ phone, priceJSX }) => {
	const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
	const [isHovered, setIsHovered] = React.useState(false);

	return (
		<Col key={phone._id} sm={6} md={4} xl={3} className="mb-4">
			<Link
				to={`/dien-thoai/${phone.category?.metaTitle || 'uncategorized'}/${phone.metaTitle}`}
				className="text-dark"
			>
				<div className="text-center product-card">
					<div 
						className="product-image-container"
						onMouseMove={(e) => {
							const rect = e.currentTarget.getBoundingClientRect();
							const x = ((e.clientX - rect.left) / rect.width) * 100;
							const y = ((e.clientY - rect.top) / rect.height) * 100;
							setMousePos({ x, y });
						}}
						onMouseEnter={() => setIsHovered(true)}
						onMouseLeave={() => setIsHovered(false)}
					>
						<img
							className="product-image"
							src={phone.photos && phone.photos.length > 0 ? phone.photos[0].url : '/images/no-phone-photo.png'}
							alt={phone.name}
							style={{
								transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
								transform: isHovered ? 'scale(1.2)' : 'scale(1)'
							}}
							onError={(e) => {
								e.target.src = '/images/no-phone-photo.png';
							}}
						/>
						<div className="product-overlay">
							<div className="product-actions">
								<button className="btn btn-primary btn-sm">
									<i className="fas fa-eye"></i>
								</button>
							</div>
						</div>
					</div>
					<div className="product-info">
						<h6 className="product-title">{phone.name}</h6>
						
						{/* Thông số kỹ thuật */}
						<div className="product-specs">
							{phone.rams && phone.rams.length > 0 && (
								<div className="spec-item">
									<i className="fas fa-memory me-1"></i>
									<span>{phone.rams.join(', ')}</span>
								</div>
							)}
							{phone.roms && phone.roms.length > 0 && (
								<div className="spec-item">
									<i className="fas fa-hdd me-1"></i>
									<span>{phone.roms.join(', ')}</span>
								</div>
							)}
							{phone.colors && phone.colors.length > 0 && (
								<div className="spec-item">
									<i className="fas fa-palette me-1"></i>
									<span>{phone.colors.join(', ')}</span>
								</div>
							)}
						</div>
						
						<div className="product-price">{priceJSX}</div>
					</div>
					
					{/* Custom CSS for Product Cards */}
					<style jsx>{`
						.product-card {
							transition: all 0.3s ease;
							border-radius: 12px;
							overflow: hidden;
							background: #fff;
							box-shadow: 0 2px 10px rgba(0,0,0,0.1);
						}
					
						.product-card:hover {
							transform: translateY(-5px);
							box-shadow: 0 8px 25px rgba(0,0,0,0.15);
						}
					
						.product-image-container {
							position: relative;
							height: 200px;
							overflow: hidden;
							cursor: pointer;
						}
					
						.product-image {
							width: 100%;
							height: 100%;
							object-fit: cover;
							transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
							cursor: zoom-in;
						}
					
						.product-overlay {
							position: absolute;
							top: 0;
							left: 0;
							right: 0;
							bottom: 0;
							background: rgba(0,0,0,0.7);
							display: flex;
							align-items: center;
							justify-content: center;
							opacity: 0;
							transition: all 0.3s ease;
						}
					
						.product-actions {
							display: flex;
							gap: 10px;
						}
					
						.product-actions .btn {
							width: 40px;
							height: 40px;
							border-radius: 50%;
							display: flex;
							align-items: center;
							justify-content: center;
							padding: 0;
							transition: all 0.3s ease;
						}
					
						.product-actions .btn:hover {
							transform: scale(1.1);
						}
					
						.product-card:hover .product-overlay {
							opacity: 1;
						}
					
						.product-info {
							padding: 15px;
						}
					
						.product-title {
							font-size: 14px;
							font-weight: 600;
							margin-bottom: 8px;
							color: #333;
							line-height: 1.3;
							height: 36px;
							overflow: hidden;
							display: -webkit-box;
							-webkit-line-clamp: 2;
							-webkit-box-orient: vertical;
						}
					
						.product-specs {
							margin: 10px 0;
							font-size: 14px;
							color: #666;
							display: flex;
							flex-wrap: wrap;
							gap: 10px;
						}
					
						.spec-item {
							display: flex;
							align-items: center;
							background: #f8f9fa;
							padding: 6px 10px;
							border-radius: 14px;
							border: 1px solid #e9ecef;
						}
					
						.spec-item i {
							color: #007bff;
							width: 16px;
							font-size: 12px;
							margin-right: 6px;
						}
					
						.spec-item span {
							font-size: 12px;
							font-weight: 600;
							color: #495057;
						}
					
						.product-price {
							font-weight: 700;
							color: #e74c3c;
							margin-top: 8px;
						}
					
						@media (max-width: 768px) {
							.product-image-container {
								height: 150px;
							}
						
							.product-actions .btn {
								width: 35px;
								height: 35px;
								font-size: 12px;
							}
						}
					`}</style>
				</div>
			</Link>
		</Col>
	);
};

export const PhoneList = ({ phones }) => {
	return (
		<Row className="py-4">
			{phones.map(phone => {
				// Min max price
				const getPrice = () => {
					let minPrice = phone.models[0].price;
					let maxPrice = phone.models[0].price;

					for (let model of phone.models) {
						if (model.price < minPrice) minPrice = model.price;
						if (model.price > maxPrice) maxPrice = model.price;
					}

					return { minPrice, maxPrice };
				};

				const { minPrice, maxPrice } = getPrice();
				const promotionPrice = phone.promotionPrice;

				// Price JSX
				let priceJSX;

				if (minPrice === maxPrice) {
					if (promotionPrice) {
						priceJSX = (
							<>
								<div className="fw-bold">
									{formatToVND(minPrice - promotionPrice)}
								</div>
								<div className="fs-7 text-decoration-line-through">
									{formatToVND(minPrice)}
								</div>
							</>
						);
					} else {
						priceJSX = (
							<div className="fw-bold">
								{formatToVND(minPrice)}
							</div>
						);
					}
				} else {
					if (promotionPrice) {
						priceJSX = (
							<>
								<div className="fw-bold">
									{formatToVND(minPrice - promotionPrice)}
									&nbsp;-&nbsp;
									{formatToVND(maxPrice - promotionPrice)}
								</div>
								<div className="fs-7 text-decoration-line-through">
									{formatToVND(minPrice)} -{' '}
									{formatToVND(maxPrice)}
								</div>
							</>
						);
					} else {
						priceJSX = (
							<div className="fw-bold">
								{formatToVND(minPrice)} -{' '}
								{formatToVND(maxPrice)}
							</div>
						);
					}
				}

				return (
					<PhoneCard 
						key={phone._id} 
						phone={phone} 
						priceJSX={priceJSX} 
					/>
				);
			})}
		</Row>
	);
};