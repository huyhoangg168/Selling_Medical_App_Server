const crypto = require('crypto');
const { User } = require('../models'); // Giả sử bạn có model User
const asyncErrorWrapper = require('../Utils/AsyncErrorWrapper');

const ALGORITHM = 'aes-256-gcm';
const MASTER_KEY = process.env.SERVER_MASTER_KEY; // 32 chars

// Hàm helper: Mã hóa UserKey bằng MasterKey để lưu xuống DB
const encryptWithMasterKey = (text) => {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, MASTER_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    // Format lưu DB: IV:AuthTag:EncryptedContent
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

// Hàm helper: Giải mã UserKey từ DB để dùng
const decryptWithMasterKey = (encryptedText) => {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    const decipher = crypto.createDecipheriv(ALGORITHM, MASTER_KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

// Hàm format Public Key từ Android (raw base64) sang định dạng PEM mà Node.js hiểu
const formatPublicKey = (base64Key) => {
    return `-----BEGIN PUBLIC KEY-----\n${base64Key}\n-----END PUBLIC KEY-----`;
};

exports.exchangeKey = asyncErrorWrapper(async (req, res) => {
    const { publicKey } = req.body; // Public Key từ Android gửi lên
    const userId = req.user.id; // Lấy từ Token xác thực (User phải login rồi mới exchange key)

    if (!publicKey) {
        throw new Error("Public Key is required");
    }

    // 1. Kiểm tra xem User này đã có Key trong DB chưa?
    const user = await User.findByPk(userId);
    let userAesKeyPlaintext;

    if (user.secret_key) {
        // CASE A: User cũ, đã có key => Lấy ra và giải mã bằng Master Key
        try {
            userAesKeyPlaintext = decryptWithMasterKey(user.secret_key);
        } catch (e) {
            // Nếu giải mã lỗi (do đổi Master Key hoặc data lỗi), tạo mới lại
            userAesKeyPlaintext = crypto.randomBytes(32).toString('base64');
            const encryptedForDB = encryptWithMasterKey(userAesKeyPlaintext);
            await User.update({ secret_key: encryptedForDB }, { where: { id: userId } });
        }
    } else {
        // CASE B: User mới => Tạo key mới
        userAesKeyPlaintext = crypto.randomBytes(32).toString('base64');
        
        // Mã hóa bằng Master Key trước khi lưu DB
        const encryptedForDB = encryptWithMasterKey(userAesKeyPlaintext);
        
        await User.update({ secret_key: encryptedForDB }, { where: { id: userId } });
    }

    // 2. Chuẩn bị gửi về cho Client (Mã hóa bằng RSA Public Key của Client)
    const userAesKeyBuffer = Buffer.from(userAesKeyPlaintext, 'base64');
    const encryptedForClientBuffer = crypto.publicEncrypt(
        {
            key: formatPublicKey(publicKey),
            padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        userAesKeyBuffer
    );

    // 3. Trả về
    res.json({
        encryptedKey: encryptedForClientBuffer.toString('base64')
    });
});

exports.decryptWithMasterKey = decryptWithMasterKey;