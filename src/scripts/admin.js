//Khỏi tạo admin
const User = require('../models/User');

(async () => {
  await User.create({
    phone: '0900000000',
    password: 'admin123',
    confirmPassword: 'admin123',
    username: 'Admin',
    role: 'admin',
    status: 1
  });
  console.log('Admin created');
  process.exit(0);
})();
