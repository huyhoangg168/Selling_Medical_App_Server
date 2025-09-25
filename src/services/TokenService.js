const { Token } = require('../models/index');
const asyncErrorWrapper = require('../Utils/AsyncErrorWrapper');

exports.saveToken = asyncErrorWrapper(async (userId, refreshToken) => {
  await Token.upsert({ id_user: userId, refresh_token: refreshToken });
});

exports.destroyToken = asyncErrorWrapper(async (userId) => {
  await Token.destroy({ where: { id_user: userId }});
});

exports.getRefreshTokenByUserId = asyncErrorWrapper(async (userId) => {
  const refreshToken = await Token.findOne({ where: { id_user: userId }});
  return refreshToken;
});