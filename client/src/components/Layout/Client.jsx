import { NotFound } from 'components/Common';
import { Footer } from 'components/Common/Footer';
import { Header } from 'components/Common/Header';
import LoginPage from 'features/Auth/pages/LoginPage';
import ProfilePage from 'features/Auth/pages/ProfilePage';
import RegisterPage from 'features/Auth/pages/RegisterPage';
import SettingsPage from 'features/Auth/pages/SettingsPage';
import CartPage from 'features/Cart/pages/CartPage';
import AboutPage from 'features/Home/pages/AboutPage';
import ContactPage from 'features/Home/pages/ContactPage';
import HomePage from 'features/Home/pages/HomePage';
import OrderHistoryPage from 'features/Order/pages/OrderHistoryPage';
import PhoneFeature from 'features/Phone';
import SearchPage from 'features/Phone/pages/SearchPage';
import PaymentSuccessPage from 'features/Payment/pages/PaymentSuccessPage';
import PaymentFailedPage from 'features/Payment/pages/PaymentFailedPage';
import { Route, Switch } from 'react-router-dom';

export const ClientLayout = () => {
	return (
		<div>
			<Header />

			<div style={{ marginTop: 63 }} className="bg-light">
				<Switch>
					<Route exact path="/" component={HomePage} />
					<Route exact path="/gioi-thieu" component={AboutPage} />
					<Route exact path="/lien-he" component={ContactPage} />
					<Route exact path="/gio-hang" component={CartPage} />
					<Route exact path="/lich-su-dat-hang" component={OrderHistoryPage} />
					<Route exact path="/tim-kiem" component={SearchPage} />
					<Route path="/dang-nhap">
						<LoginPage isLogin={true} />
					</Route>
					<Route path="/dang-xuat">
						<LoginPage isLogin={false} />
					</Route>
					<Route path="/dang-ky" component={RegisterPage} />
					<Route path="/ho-so" component={ProfilePage} />
					<Route path="/cai-dat" component={SettingsPage} />
					<Route path="/payment/success" component={PaymentSuccessPage} />
					<Route path="/payment/failed" component={PaymentFailedPage} />
					<Route path="/" component={PhoneFeature} />

					<Route component={NotFound} />
				</Switch>
			</div>

			<Footer />
		</div>
	);
};
