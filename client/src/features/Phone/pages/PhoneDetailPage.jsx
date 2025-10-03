import categoryApi from 'api/categoryApi';
import phoneApi from 'api/phoneApi';
import { addToCart } from 'app/cartSlice';
import { SplitButton } from 'components/Buttons/SplitButton';
import { useEffect, useState } from 'react';
import { Alert, Breadcrumb, Button, Carousel, Col, Row } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { formatToNumberString, formatToVND } from 'utils';

const PhoneDetailPage = () => {
	const history = useHistory();

	// Fetch phone
	const [loading, setLoading] = useState(false);
	const [phone, setPhone] = useState({});
	const { categoryMetaTitle, phoneMetaTitle } = useParams();

	useEffect(() => {
		const fetchPhone = async () => {
			setLoading(true);
			const res = await phoneApi.fetch(phoneMetaTitle);

			if (res.status) {
				const phone = res.data;
				console.log('Phone data:', phone); // Debug log
				setPhone(phone);
				setLoading(false);
			} else {
				history.push('/404');
			}
		};

		fetchPhone();
	}, [history, phoneMetaTitle]);

	// Fetch category
	const [category, setCategory] = useState({});
	useEffect(() => {
		const fetchCategory = async () => {
			if (categoryMetaTitle) {
				const res = await categoryApi.fetch(categoryMetaTitle);

				if (res.status) {
					setCategory(res.category);
				} else {
					history.push('/404');
				}
			}
		};

		fetchCategory();
	}, [history, categoryMetaTitle]);

	// Selected model
	const [selectedModel, setSelectedModel] = useState({});

	useEffect(() => {
		console.log('Phone models:', phone.models); // Debug log
		console.log('Phone photos:', phone.photos); // Debug log
		
		if (phone.models && phone.models.length > 0) {
			setSelectedModel({
				rom: phone.models[0].rom,
				ram: phone.models[0].ram,
				color: phone.models[0].color
			});

			// Set photos for the first color
			if (phone.photos && phone.photos.length > 0) {
				const firstColorPhotos = phone.photos.filter(
					photo => photo.title === phone.models[0].color
				);
				setPhotos(firstColorPhotos.length > 0 ? firstColorPhotos : phone.photos);
			}
		}
	}, [phone.models, phone.photos]);

	// Rom
	const handleSelectRom = rom => {
		const models = phone.models?.filter(x => x.rom === rom);

		setSelectedModel({
			rom,
			ram: models[0]?.ram || null,
			color: models[0]?.color || null
		});
	};

	// Rams
	const [rams, setRams] = useState([]);
	useEffect(() => {
		let newRams = [];

		for (let model of phone.models || []) {
			if (
				model.rom === selectedModel.rom &&
				newRams.findIndex(x => x === model.ram) < 0
			) {
				newRams.push(model.ram);
			}
		}

		setRams(newRams);
	}, [phone.models, selectedModel.rom]);

	const handleSelectRam = ram => {
		const models =
			phone.models?.filter(
				x => x.rom === selectedModel.rom && x.ram === selectedModel.ram
			) || [];

		setSelectedModel({
			...selectedModel,
			ram,
			color: models[0].color
		});
	};

	// Color
	const [colors, setColors] = useState([]);

	useEffect(() => {
		let newColors = [];

		for (let model of phone.models || []) {
			if (
				model.rom === selectedModel.rom &&
				model.ram === selectedModel.ram &&
				newColors.findIndex(x => x === model.color) < 0
			) {
				newColors.push(model.color);
			}
		}

		setColors(newColors);
	}, [phone.models, selectedModel.rom, selectedModel.ram]);

	const handleSelectColor = color => {
		setSelectedModel({ ...selectedModel, color });
		
		// Update photos when color changes
		if (phone.photos && phone.photos.length > 0) {
			const colorPhotos = phone.photos.filter(photo => photo.title === color);
			setPhotos(colorPhotos.length > 0 ? colorPhotos : phone.photos);
		}
	};

	// Quantity and Price
	const [selectedQuantity, setSelectedQuantity] = useState(1);
	const [stockQuantity, setStockQuantity] = useState(0);
	const [price, setPrice] = useState(0);

	useEffect(() => {
		console.log('Selected model:', selectedModel); // Debug log
		const models = phone.models?.filter(
			model =>
				model.rom === selectedModel.rom &&
				model.ram === selectedModel.ram &&
				model.color === selectedModel.color
		)?.[0];

		console.log('Filtered model:', models); // Debug log
		setStockQuantity(models?.quantity || 0);
		setPrice(models?.price || 0);
		setSelectedQuantity(1); // Reset về 1 khi chọn model mới
		console.log('Set price to:', models?.price || 0); // Debug log
	}, [phone.models, selectedModel]);

	// Photos
	const [photos, setPhotos] = useState([]);
	const [photoActiveIndex, setPhotoActiveIndex] = useState(0);
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const [isHovering, setIsHovering] = useState(false);

	useEffect(() => {
		const newPhotos = phone.photos?.filter(
			photo => photo.title === selectedModel.color
		);

		setPhotos(newPhotos || []);
	}, [phone.photos, selectedModel.color]);

	useEffect(() => {
		setPhotoActiveIndex(0);
	}, [photos]);

	// Description
	const [showFullDescription, setShowFullDescription] = useState(false);

	const handleShowDescription = () => {
		setShowFullDescription(!showFullDescription);
	};

	// Cart
	const dispatch = useDispatch();

	const handleAddCartItem = async () => {
		if (selectedQuantity <= 0) {
			toast.error('Không đủ số lượng!');
			return;
		}

		try {
			const result = await dispatch(
				addToCart({
					phoneId: phone._id,
					rom: selectedModel.rom,
					ram: selectedModel.ram,
					color: selectedModel.color,
					quantity: selectedQuantity
				})
			);
			
			if (addToCart.fulfilled.match(result)) {
				toast.success('Đã thêm sản phẩm vào giỏ hàng!');
			} else if (addToCart.rejected.match(result)) {
				toast.error(result.payload || 'Lỗi khi thêm vào giỏ hàng!');
			}
		} catch (error) {
			toast.error('Lỗi khi thêm vào giỏ hàng!');
		}
	};

	const handleBuyNow = async () => {
		if (selectedQuantity <= 0) {
			toast.error('Không đủ số lượng!');
			return;
		}

		// Thêm vào giỏ hàng trước
		try {
			const result = await dispatch(
				addToCart({
					phoneId: phone._id,
					rom: selectedModel.rom,
					ram: selectedModel.ram,
					color: selectedModel.color,
					quantity: selectedQuantity
				})
			);
			
			if (addToCart.fulfilled.match(result)) {
				// Chuyển đến trang giỏ hàng
				history.push('/gio-hang');
			} else if (addToCart.rejected.match(result)) {
				toast.error(result.payload || 'Lỗi khi thêm vào giỏ hàng!');
			}
		} catch (error) {
			toast.error('Lỗi khi thêm vào giỏ hàng!');
		}
	};

	// Return
	return (
		<div className="px-5 py-4">
			{!loading && (
				<div>
					<Breadcrumb className="bg-white p-3 pb-1 rounded shadow mb-3">
						<Breadcrumb.Item href="/">Trang chủ</Breadcrumb.Item>
						<Breadcrumb.Item href="/dien-thoai">
							Điện thoại
						</Breadcrumb.Item>
						<Breadcrumb.Item
							href={`/dien-thoai/${categoryMetaTitle}`}
						>
							{category.name}
						</Breadcrumb.Item>
						<Breadcrumb.Item active>{phone.name}</Breadcrumb.Item>
					</Breadcrumb>

					<div className="bg-white rounded shadow p-4">
						<Row>
							<Col xl={6}>
								{photos && photos.length > 0 ? (
									<>
										<div className="product-image-container">
											<Carousel
												variant="dark"
												indicators={false}
												interval={null}
												activeIndex={photoActiveIndex}
												onSelect={(selectedIndex, e) => {
													setPhotoActiveIndex(selectedIndex);
												}}
												prevIcon={
													<span className="carousel-nav-btn carousel-nav-prev">
														<i className="fas fa-chevron-left"></i>
													</span>
												}
												nextIcon={
													<span className="carousel-nav-btn carousel-nav-next">
														<i className="fas fa-chevron-right"></i>
													</span>
												}
											>
												{photos.map(photo => (
													<Carousel.Item key={photo._id}>
														<div 
															className="product-image-wrapper"
															onMouseMove={(e) => {
																const rect = e.currentTarget.getBoundingClientRect();
																const x = ((e.clientX - rect.left) / rect.width) * 100;
																const y = ((e.clientY - rect.top) / rect.height) * 100;
																setMousePosition({ x, y });
															}}
															onMouseEnter={() => setIsHovering(true)}
															onMouseLeave={() => setIsHovering(false)}
														>
															<img
																className="product-image"
																src={photo.url}
																alt={photo.title}
																style={{
																	transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
																	transform: isHovering ? 'scale(2)' : 'scale(1)'
																}}
																onError={(e) => {
																	e.target.src = '/images/no-phone-photo.png';
																}}
															/>
															<div 
																className="zoom-overlay"
																style={{
																	left: `${mousePosition.x}%`,
																	top: `${mousePosition.y}%`,
																	transform: 'translate(-50%, -50%)'
																}}
															>
																<i className="fas fa-search-plus"></i>
															</div>
														</div>
													</Carousel.Item>
												))}
											</Carousel>
											<div className="image-counter">
												{photoActiveIndex + 1} / {photos.length}
											</div>
										</div>
										
										{/* Thumbnail Gallery */}
										{photos.length > 1 && (
											<div className="thumbnail-gallery mt-3">
												{photos.map((photo, index) => (
													<div
														key={photo._id}
														className={`thumbnail-item ${index === photoActiveIndex ? 'active' : ''}`}
														onClick={() => setPhotoActiveIndex(index)}
													>
														<img
															src={photo.url}
															alt={photo.title}
															onError={(e) => {
																e.target.src = '/images/no-phone-photo.png';
															}}
														/>
													</div>
												))}
											</div>
										)}
									</>
								) : (
									<div className="d-flex align-items-center justify-content-center bg-light" style={{ height: '400px', borderRadius: '4px' }}>
										<div className="text-center">
											<img 
												src="/images/no-phone-photo.png" 
												alt="Chưa có hình ảnh" 
												style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }}
											/>
											<p className="text-muted mt-2">Chưa có hình ảnh</p>
										</div>
									</div>
								)}
								
								{/* Custom CSS for Product Images */}
								<style jsx>{`
									.product-image-container {
										position: relative;
										border-radius: 12px;
										overflow: hidden;
										box-shadow: 0 4px 20px rgba(0,0,0,0.1);
										background: #fff;
									}
									
									.product-image-wrapper {
										position: relative;
										height: 500px;
										overflow: hidden;
										cursor: zoom-in;
									}
									
									.product-image {
										width: 100%;
										height: 100%;
										object-fit: cover;
										transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
										cursor: zoom-in;
									}
									
									.zoom-overlay {
										position: absolute;
										background: rgba(0,0,0,0.8);
										color: white;
										width: 50px;
										height: 50px;
										border-radius: 50%;
										display: flex;
										align-items: center;
										justify-content: center;
										font-size: 18px;
										opacity: 0;
										transition: all 0.3s ease;
										pointer-events: none;
										z-index: 10;
										box-shadow: 0 4px 15px rgba(0,0,0,0.3);
									}
									
									.product-image-wrapper:hover .zoom-overlay {
										opacity: 1;
									}
									
									.carousel-nav-btn {
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
										cursor: pointer;
										box-shadow: 0 2px 10px rgba(0,0,0,0.1);
									}
									
									.carousel-nav-prev {
										left: 15px;
									}
									
									.carousel-nav-next {
										right: 15px;
									}
									
									.carousel-nav-btn:hover {
										background: rgba(255,255,255,1);
										transform: translateY(-50%) scale(1.1);
										box-shadow: 0 4px 15px rgba(0,0,0,0.2);
									}
									
									.image-counter {
										position: absolute;
										bottom: 15px;
										right: 15px;
										background: rgba(0,0,0,0.7);
										color: white;
										padding: 8px 12px;
										border-radius: 20px;
										font-size: 14px;
										font-weight: 500;
									}
									
									.thumbnail-gallery {
										display: flex;
										gap: 10px;
										overflow-x: auto;
										padding: 10px 0;
									}
									
									.thumbnail-item {
										flex-shrink: 0;
										width: 80px;
										height: 80px;
										border-radius: 8px;
										overflow: hidden;
										cursor: pointer;
										border: 3px solid transparent;
										transition: all 0.3s ease;
										position: relative;
									}
									
									.thumbnail-item img {
										width: 100%;
										height: 100%;
										object-fit: cover;
										transition: transform 0.3s ease;
									}
									
									.thumbnail-item:hover {
										border-color: #007bff;
										transform: translateY(-2px);
										box-shadow: 0 4px 15px rgba(0,123,255,0.3);
									}
									
									.thumbnail-item:hover img {
										transform: scale(1.1);
									}
									
									.thumbnail-item.active {
										border-color: #007bff;
										box-shadow: 0 0 0 2px rgba(0,123,255,0.3);
									}
									
									.thumbnail-item.active::after {
										content: '';
										position: absolute;
										top: 0;
										left: 0;
										right: 0;
										bottom: 0;
										background: rgba(0,123,255,0.2);
									}
									
									@media (max-width: 768px) {
										.product-image-wrapper {
											height: 300px;
										}
										
										.carousel-nav-btn {
											width: 40px;
											height: 40px;
											font-size: 14px;
										}
										
										.carousel-nav-prev {
											left: 10px;
										}
										
										.carousel-nav-next {
											right: 10px;
										}
										
										.thumbnail-item {
											width: 60px;
											height: 60px;
										}
									}
								`}</style>
							</Col>
							<Col xl={6}>
								<h5 className="fw-bold">{phone.name}</h5>
								<div>
									{phone.models && Array.isArray(phone.models) ? 
										[...new Set(phone.models.map(model => model.rom))].map(rom => (
											<Button
												key={rom}
												variant={
													rom === selectedModel.rom
														? 'outline-primary'
														: 'outline-secondary'
												}
												className="mt-3 me-2"
												onClick={() => handleSelectRom(rom)}
											>
												{rom}
											</Button>
										)) : null}
								</div>
								<div>
									{rams.map(ram => (
										<Button
											key={ram}
											variant={
												ram === selectedModel.ram
													? 'outline-primary'
													: 'outline-secondary'
											}
											className="mt-3 me-2"
											onClick={() => handleSelectRam(ram)}
										>
											{ram}
										</Button>
									))}
								</div>
								<div>
									{colors.map(color => (
										<Button
											key={color}
											variant={
												color === selectedModel.color
													? 'outline-primary'
													: 'outline-secondary'
											}
											className="mt-3 me-2"
											onClick={() =>
												handleSelectColor(color)
											}
										>
											{color}
										</Button>
									))}
								</div>
								<div className="my-3">
									{stockQuantity === 0 ? (
										<Button as="div" variant="danger">
											Hết hàng
										</Button>
									) : (
										<>
											Còn{' '}
											<b>
												{formatToNumberString(stockQuantity)}
											</b>{' '}
											chiếc
										</>
									)}
								</div>
								{/* Chọn số lượng */}
								<div className="mb-3">
									<label className="form-label fw-bold">Số lượng:</label>
									<div className="d-flex align-items-center">
										<button 
											className="btn btn-outline-secondary btn-sm"
											onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
											disabled={selectedQuantity <= 1}
										>
											<i className="fas fa-minus"></i>
										</button>
										<input 
											type="number" 
											className="form-control text-center mx-2" 
											style={{width: '80px'}}
											value={selectedQuantity}
											onChange={(e) => setSelectedQuantity(Math.max(1, Math.min(stockQuantity, parseInt(e.target.value) || 1)))}
											min="1"
											max={stockQuantity}
										/>
										<button 
											className="btn btn-outline-secondary btn-sm"
											onClick={() => setSelectedQuantity(Math.min(stockQuantity, selectedQuantity + 1))}
											disabled={selectedQuantity >= stockQuantity}
										>
											<i className="fas fa-plus"></i>
										</button>
									</div>
								</div>

								{/* Giá sản phẩm */}
								<div className="mb-3">
									{phone.promotionPrice &&
									phone.promotionPrice > 0 ? (
										<div className="mb-2">
											<span className="text-decoration-line-through me-2 text-secondary fs-5">
												{formatToVND(price * selectedQuantity)}
											</span>
											<span className="text-danger fs-5">
												Giảm {formatToVND(phone.promotionPrice * selectedQuantity)}
											</span>
										</div>
									) : null}
									<div className="fs-3 fw-bold text-danger">
										{price === 0
											? 'Miễn phí'
											: formatToVND(
													(price -
														(phone.promotionPrice ||
															0)) * selectedQuantity
											  )}
									</div>
									{selectedQuantity > 1 && (
										<div className="text-muted small">
											{formatToVND(price - (phone.promotionPrice || 0))} × {selectedQuantity} chiếc
										</div>
									)}
								</div>

								{/* Nút hành động */}
								<div className="d-grid gap-2">
									<Button
										variant="danger"
										size="lg"
										disabled={selectedQuantity <= 0 || stockQuantity <= 0}
										onClick={handleBuyNow}
										className="fw-bold"
									>
										<i className="fas fa-bolt me-2"></i>
										Mua ngay
									</Button>
									<Button
										variant="outline-primary"
										size="lg"
										disabled={selectedQuantity <= 0 || stockQuantity <= 0}
										onClick={handleAddCartItem}
										className="fw-bold"
									>
										<i className="fas fa-cart-plus me-2"></i>
										Thêm vào giỏ hàng
									</Button>
								</div>

								{/* Cam kết bảo hành */}
								<div className="mt-4">
									<div className="row g-3">
										<div className="col-12">
											<div className="d-flex align-items-start">
												<div className="me-3">
													<i className="fas fa-sync-alt text-primary" style={{fontSize: '20px'}}></i>
												</div>
												<div>
													<div className="fw-bold">1 đổi 1 trong 30 ngày</div>
													<div className="text-muted small">đối với sản phẩm lỗi tại 2965 siêu thị toàn quốc</div>
													<a href="#" className="text-primary small">Xem chi tiết</a>
												</div>
											</div>
										</div>
										<div className="col-12">
											<div className="d-flex align-items-start">
												<div className="me-3">
													<i className="fas fa-shield-alt text-primary" style={{fontSize: '20px'}}></i>
												</div>
												<div>
													<div className="fw-bold">Bảo hành chính hãng điện thoại 1 năm</div>
													<div className="text-muted small">tại các trung tâm bảo hành hãng</div>
													<a href="#" className="text-primary small">Xem địa chỉ bảo hành</a>
												</div>
											</div>
										</div>
										<div className="col-12">
											<div className="d-flex align-items-start">
												<div className="me-3">
													<i className="fas fa-box text-primary" style={{fontSize: '20px'}}></i>
												</div>
												<div>
													<div className="fw-bold">Bộ sản phẩm gồm:</div>
													<div className="text-muted small">
														Ốp lưng, Sách hướng dẫn, Hộp, Cáp Type C, Củ sạc nhanh rời đầu Type A, Cây lấy sim
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</Col>
						</Row>
					</div>

					<div className="bg-white rounded shadow mt-3">
						<div className="phdr">Bài viết đánh giá</div>
						<div className="p-3">
							{phone.description ? (
								<>
									<div style={{ position: 'relative' }}>
										<div
											dangerouslySetInnerHTML={{
												__html: phone.description
											}}
											style={
												showFullDescription
													? null
													: {
															height: 500,
															overflowY: 'hidden'
													  }
											}
										></div>
										{!showFullDescription && (
											<div
												style={{
													position: 'absolute',
													height: 30,
													bottom: 0,
													width: '100%',
													background:
														'linear-gradient(to bottom,rgba(255 255 255/0),rgba(255 255 255/62.5),rgba(255 255 255/1))'
												}}
											/>
										)}
									</div>

									<center>
										<SplitButton
											icon={
												showFullDescription
													? 'fas fa-eye-slash'
													: 'fas fa-eye'
											}
											size="sm"
											text={
												showFullDescription
													? 'Ẩn bớt'
													: 'Xem thêm'
											}
											className="my-2"
											onClick={handleShowDescription}
										/>
									</center>
								</>
							) : (
								<Alert variant="danger" className="mb-0">
									Không có!
								</Alert>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default PhoneDetailPage;
