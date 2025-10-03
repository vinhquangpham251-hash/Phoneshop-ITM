import orderApi from 'api/orderApi';
import phoneApi from 'api/phoneApi';
import { fetchPhones, selectPhoneLoading, selectPhones } from 'app/phoneSlice';
import Banner from 'components/Common/Banner';
import { PhoneList } from 'features/Phone/components/PhoneList';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

const HomePage = () => {
	const dispatch = useDispatch();

	// Hot phones
	const [hotPhoneLoading, setHotPhoneLoading] = useState(false);
	const [hotPhones, setHotPhones] = useState([]);

	useEffect(() => {
		const fetchHotPhones = async () => {
			setHotPhoneLoading(true);
			try {
				const res = await orderApi.fetchTopPhones(5);
				
				let newHotPhones = [];
				if (res && res.data && Array.isArray(res.data)) {
					for (let item of res.data) {
						try {
							const resPhone = await phoneApi.fetch(item.phone.metaTitle);
							if (resPhone && resPhone.data) {
								newHotPhones.push(resPhone.data);
							}
						} catch (error) {
							console.error('Error fetching phone:', error);
						}
					}
				}

				setHotPhones(newHotPhones);
			} catch (error) {
				console.error('Error fetching hot phones:', error);
				setHotPhones([]);
			} finally {
				setHotPhoneLoading(false);
			}
		};

		fetchHotPhones();
	}, [dispatch]);

	// New phones
	const newPhoneLoading = useSelector(selectPhoneLoading);
	const newPhones = useSelector(selectPhones);

	useEffect(() => {
		dispatch(
			fetchPhones({
				status: true,
				_page: 1,
				_limit: 8
			})
		);
	}, [dispatch]);

	// Return
	return (
		<div className="p-5">
			<Banner />

			{hotPhoneLoading
				? null
				: hotPhones.length > 0 && (
						<div className="bg-white rounded shadow mb-4">
							<div className="phdr">Điện thoại hot</div>

							<div className="p-3">
								<PhoneList phones={hotPhones} />
							</div>
						</div>
				  )}

			<div className="bg-white rounded shadow">
				<div className="phdr">Điện thoại mới</div>

				<div className="p-3">
					{newPhoneLoading ? null : newPhones.length > 0 ? (
						<PhoneList phones={newPhones} />
					) : (
						<Alert variant="danger" className="mb-0">
							Không có điện thoại mới!
						</Alert>
					)}
				</div>
			</div>
		</div>
	);
};

export default HomePage;
