import {
	fetchPhones,
	phoneActions,
	selectPhoneFilter,
	selectPhoneLoading,
	selectPhonePagination,
	selectPhones
} from 'app/phoneSlice';
import Banner from 'components/Common/Banner';
import { ITMPagination } from 'components/Common/ITMPagination';
import { useEffect, useState } from 'react';
import { Alert, Card, Col, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { PhoneList } from '../components';

const SearchPage = () => {
	const dispatch = useDispatch();
	const location = useLocation();
	
	// Get search query from URL
	const searchParams = new URLSearchParams(location.search);
	const query = searchParams.get('q') || '';
	
	const [searchQuery, setSearchQuery] = useState(query);

	// Loading
	const loading = useSelector(selectPhoneLoading);

	// Filter
	const filter = useSelector(selectPhoneFilter);

	// Fetch phones
	const phones = useSelector(selectPhones);

	// Pagination
	const pagination = useSelector(selectPhonePagination);

	// Set search filter when component mounts or query changes
	useEffect(() => {
		if (query) {
			setSearchQuery(query);
			dispatch(
				phoneActions.setFilter({
					key: query,
					status: true,
					_page: 1,
					_limit: 12
				})
			);
		}
	}, [dispatch, query]);

	// Fetch phones when filter changes
	useEffect(() => {
		if (filter.key) {
			dispatch(fetchPhones(filter));
		}
	}, [dispatch, filter]);

	// Handle pagination
	const handlePageChange = (page) => {
		dispatch(
			phoneActions.setFilter({
				...filter,
				_page: page
			})
		);
	};

	// Return
	return (
		<div className="p-5">
			<Banner />

			<div className="bg-white rounded shadow">
				<div className="phdr">
					Kết quả tìm kiếm cho: "{searchQuery}"
				</div>

				<div className="p-3">
					{loading ? (
						<div className="text-center py-5">
							<div className="spinner-border text-primary" role="status">
								<span className="visually-hidden">Loading...</span>
							</div>
						</div>
					) : phones.length > 0 ? (
						<>
							<PhoneList phones={phones} />
							
							{pagination._totalPages > 1 && (
								<div className="mt-4">
									<ITMPagination
										pagination={pagination}
										onPageChange={handlePageChange}
									/>
								</div>
							)}
						</>
					) : (
						<Alert variant="info" className="mb-0">
							Không tìm thấy điện thoại nào với từ khóa "{searchQuery}". 
							Hãy thử với từ khóa khác!
						</Alert>
					)}
				</div>
			</div>
		</div>
	);
};

export default SearchPage;
