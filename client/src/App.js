import { getMe } from 'app/authSlice';
import { fetchCart, clearCartState } from 'app/cartSlice';
import AdminFeature from 'areas/Admin';
import { PrivateRoute } from 'areas/Admin/components/Common/PrivateRoute';
import { ClientLayout } from 'components/Layout/Client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Switch } from 'react-router-dom';

const App = () => {
	const dispatch = useDispatch();
	const { user } = useSelector(state => state.auth);

	useEffect(() => {
		dispatch(getMe());
	}, [dispatch]);

	// Fetch cart when user is logged in, clear when logged out
	useEffect(() => {
		if (user) {
			console.log('User logged in, fetching cart...'); // Debug log
			dispatch(fetchCart());
		} else {
			console.log('User logged out, clearing cart...'); // Debug log
			dispatch(clearCartState());
		}
	}, [dispatch, user]);

	return (
		<Switch>
			<PrivateRoute path="/admin" component={AdminFeature} />
			<ClientLayout />
		</Switch>
	);
};

export default App;
