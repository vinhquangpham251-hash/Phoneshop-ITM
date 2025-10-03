require('dotenv').config();
const argon2 = require('argon2');

// Mongoose
const mongoose = require('mongoose');

// Chọn connection string - thay đổi giá trị này để chuyển đổi giữa local và Atlas
const USE_LOCAL_MONGODB = false; // true = local, false = Atlas (đang dùng Atlas)

const getConnectionString = () => {
	if (process.env.USE_LOCAL_MONGODB === 'true') {
		return process.env.MONGODB_LOCAL || 'mongodb://localhost:27017/shopphone';
	} else {
		return process.env.MONGODB_ATLAS || 'mongodb+srv://vinhkjo:vinhkj123@cluster0.iks2xum.mongodb.net/shopphone?retryWrites=true&w=majority&appName=Cluster0';
	}
};

const connectDB = async () => {
	try {
		const connectionString = getConnectionString();
		console.log(`Đang kết nối với: ${process.env.USE_LOCAL_MONGODB === 'true' ? 'MongoDB Local' : 'MongoDB Atlas'}`);
		
		await mongoose.connect(connectionString);

		checkUserGroup();
		console.log('Đã kết nối với MongoDB!');
	} catch (error) {
		console.log('Không thể kết nối với MongoDB!');
		console.log('Lỗi:', error.message);
	}
};

const checkUserGroup = async () => {
	try {
		// Check customer group
		let group = await UserGroup.findOne({ name: 'CUSTOMER' });

		if (!group) {
			const customerGroup = new UserGroup({
				name: 'CUSTOMER'
			});

			await customerGroup.save();
		}

		// Check admin group
		group = await UserGroup.findOne({ name: 'ADMIN' });

		if (!group) {
			const adminGroup = new UserGroup({
				name: 'ADMIN'
			});

			await adminGroup.save();
		}

		// Check admin user - Xóa user cũ nếu có lỗi hash
		const user = await User.findOne({ username: 'admin' });

		if (user) {
			// Kiểm tra xem password hash có hợp lệ không
			try {
				await argon2.verify(user.password, '12345678');
			} catch (error) {
				// Nếu hash không hợp lệ, xóa user cũ
				console.log('Xóa admin user cũ do hash không hợp lệ...');
				await User.deleteOne({ username: 'admin' });
			}
		}

		// Tạo admin user mới
		const existingUser = await User.findOne({ username: 'admin' });
		if (!existingUser) {
			const hashedPassword = await argon2.hash('12345678');
			const adminGroupId = (await UserGroup.findOne({ name: 'ADMIN' }))
				._id;

			const adminUser = new User({
				username: 'admin',
				password: hashedPassword,
				userGroup: adminGroupId.toString(),
				name: 'Admin',
				gender: 'Nam',
				dateOfBirth: '1998-11-21',
				address: 'TDM, Bình Dương',
				phone: '0385968197',
				email: 'admin@gmail.com',
				status: true
			});

			await adminUser.save();
			console.log('Đã tạo admin user mới!');
		}
	} catch (error) {
		console.log(error);
		console.log('Lỗi kiểm tra nhóm tài khoản');
	}
};

connectDB();

// Express
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Router
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const uploadRouter = require('./routes/upload');
const categoryRouter = require('./routes/category');
const phoneRouter = require('./routes/phone');
const orderRouter = require('./routes/order');
const discountRouter = require('./routes/discount');
const feedbackRouter = require('./routes/feedback');
const bannerRouter = require('./routes/banner');
const cartRouter = require('./routes/cart');
const paymentRouter = require('./routes/payment');
const UserGroup = require('./models/UserGroup');
const User = require('./models/User');

app.use(express.static('public'));
app.use('/uploads', express.static('public/uploads'));
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/phones', phoneRouter);
app.use('/api/uploads', uploadRouter);
app.use('/api/orders', orderRouter);
app.use('/api/discounts', discountRouter);
app.use('/api/feedbacks', feedbackRouter);
app.use('/api/banners', bannerRouter);
app.use('/api/cart', cartRouter);
app.use('/api/payment', paymentRouter);

// Listen
app.listen(PORT, () => console.log(`Đã kết nối với cổng ${PORT}!`));
