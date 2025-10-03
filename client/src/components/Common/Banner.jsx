import bannerApi from 'api/bannerApi';
import React, { useEffect, useState } from 'react';
import { Carousel, Container, Row, Col } from 'react-bootstrap';

const Banner = () => {
	const [banners, setBanners] = useState([]);
	
	useEffect(() => {
		const fetchBanners = async () => {
			const res = await bannerApi.fetchList({ status: true });
			setBanners(res.data || []);
		};

		fetchBanners();
	}, []);

	const [index, setIndex] = useState(0);

	const handleSelect = (selectedIndex, e) => {
		setIndex(selectedIndex);
	};


	return (
		<div className="mb-4">
			<Carousel
				activeIndex={index}
				onSelect={handleSelect}
				className="banner-carousel"
				variant="dark"
				interval={5000}
				fade={true}
				indicators={true}
				prevIcon={
					<span className="carousel-control-prev-icon-custom">
						<i className="fas fa-chevron-left"></i>
					</span>
				}
				nextIcon={
					<span className="carousel-control-next-icon-custom">
						<i className="fas fa-chevron-right"></i>
					</span>
				}
			>
				{banners.length > 0 ? (
					banners.map((banner, bannerIndex) => (
						<Carousel.Item key={banner._id}>
							<div className="banner-item position-relative">
								<img
									className="d-block w-100 banner-image"
									src={banner.image}
									alt={banner.title}
									onError={(e) => {
										e.target.src = '/images/no-phone-photo.png';
									}}
								/>
								<div className="banner-overlay">
									<Container>
										<Row className="align-items-center h-100">
											<Col md={6}>
												{/* Content removed */}
											</Col>
										</Row>
									</Container>
								</div>
							</div>
						</Carousel.Item>
					))
				) : (
					<Carousel.Item>
						<div className="banner-item position-relative default-banner">
							<div className="banner-gradient-bg">
								<div className="banner-pattern"></div>
							</div>
							<div className="banner-overlay">
								<Container>
									<Row className="align-items-center h-100">
										<Col md={6}>
											{/* Content removed */}
										</Col>
									</Row>
								</Container>
							</div>
						</div>
					</Carousel.Item>
				)}
			</Carousel>
			
			{/* Custom CSS */}
			<style jsx>{`
				.banner-carousel {
					border-radius: 12px;
					overflow: hidden;
					box-shadow: 0 10px 30px rgba(0,0,0,0.1);
				}
				
				.banner-item {
					height: 500px;
					overflow: hidden;
				}
				
				.banner-image {
					height: 100%;
					object-fit: cover;
					transition: transform 0.5s ease;
				}
				
				.banner-item:hover .banner-image {
					transform: scale(1.05);
				}
				
				.banner-overlay {
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					background: linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%);
					display: flex;
					align-items: center;
				}
				
				.banner-content {
					display: flex;
					justify-content: center;
					align-items: center;
					width: 100%;
					height: 100%;
				}
				
				/* Title and description styles removed */
				
				.banner-btn {
					border-radius: 50%;
					width: 60px;
					height: 60px;
					padding: 0;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 20px;
					transition: all 0.3s ease;
					box-shadow: 0 4px 15px rgba(0,123,255,0.3);
				}
				
				.banner-btn:hover {
					transform: translateY(-2px);
					box-shadow: 0 6px 20px rgba(0,123,255,0.4);
				}
				
				.carousel-control-prev-icon-custom,
				.carousel-control-next-icon-custom {
					position: absolute;
					top: 50%;
					transform: translateY(-50%);
					width: 50px;
					height: 50px;
					background: rgba(255,255,255,0.9);
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 18px;
					color: #333;
					transition: all 0.3s ease;
					z-index: 10;
				}
				
				.carousel-control-prev-icon-custom {
					left: 20px;
				}
				
				.carousel-control-next-icon-custom {
					right: 20px;
				}
				
				.carousel-control-prev-icon-custom:hover,
				.carousel-control-next-icon-custom:hover {
					background: rgba(255,255,255,1);
					transform: translateY(-50%) scale(1.1);
				}
				
				.carousel-indicators {
					bottom: 20px;
				}
				
				.carousel-indicators button {
					width: 12px;
					height: 12px;
					border-radius: 50%;
					margin: 0 5px;
					background: rgba(255,255,255,0.5);
					border: none;
					transition: all 0.3s ease;
				}
				
				.carousel-indicators button.active {
					background: #fff;
					transform: scale(1.2);
				}
				
				.default-banner {
					background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				}
				
				.banner-gradient-bg {
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				}
				
				.banner-pattern {
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					background-image: 
						radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
						radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
						radial-gradient(circle at 40% 80%, rgba(255,255,255,0.1) 0%, transparent 50%);
					animation: float 6s ease-in-out infinite;
				}
				
				/* slideInLeft animation removed */
				
				@keyframes float {
					0%, 100% {
						transform: translateY(0px);
					}
					50% {
						transform: translateY(-20px);
					}
				}
				
				@media (max-width: 768px) {
					.banner-item {
						height: 300px;
					}
					
					/* Mobile title and description styles removed */
					
					.carousel-control-prev-icon-custom,
					.carousel-control-next-icon-custom {
						width: 40px;
						height: 40px;
						font-size: 14px;
					}
					
					.carousel-control-prev-icon-custom {
						left: 10px;
					}
					
					.carousel-control-next-icon-custom {
						right: 10px;
					}
					
					.banner-btn {
						width: 50px;
						height: 50px;
						font-size: 18px;
					}
				}
			`}</style>
		</div>
	);
};

export default Banner;
