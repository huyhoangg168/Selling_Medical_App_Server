const sequelize = require('../config/database');

const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false }); // `force: true` sẽ xóa bảng cũ và tạo bảng mới
    console.log('Database & tables created!');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
};

module.exports = syncDatabase;