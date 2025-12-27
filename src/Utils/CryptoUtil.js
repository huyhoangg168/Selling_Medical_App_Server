const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';

/**
 * Hàm giải mã dữ liệu từ Android
 * @param {string} encryptedString - Chuỗi dạng "AES_ENCRYPTED:base64..."
 * @param {string} base64Key - Key AES (32 bytes) dạng Base64
 */
const decryptData = (encryptedString, base64Key) => {
    try {
        // 1. Kiểm tra format
        if (!encryptedString || typeof encryptedString !== 'string' || !encryptedString.startsWith('AES_ENCRYPTED:')) {
            return encryptedString; // Nếu không phải dữ liệu mã hóa, trả về nguyên gốc
        }

        // 2. Lấy phần Base64
        const base64Payload = encryptedString.replace('AES_ENCRYPTED:', '');
        const combined = Buffer.from(base64Payload, 'base64');

        // 3. Tách các thành phần (Khớp với Java CryptoManager)
        // - IV: 12 bytes đầu
        const iv = combined.subarray(0, 12);
        // - AuthTag: 16 bytes cuối (Mặc định GCM tag length là 128 bit = 16 bytes)
        const authTag = combined.subarray(combined.length - 16);
        // - CipherText: Phần nằm giữa
        const encryptedText = combined.subarray(12, combined.length - 16);

        // 4. Khởi tạo Decipher
        const key = Buffer.from(base64Key, 'base64');
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        // 5. Giải mã
        let decrypted = decipher.update(encryptedText, null, 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;

    } catch (error) {
        // Đây là chỗ bắt được hacker modify
        console.error("CẢNH BÁO: Phát hiện dữ liệu bị can thiệp (Integrity Check Failed)!");
        return "⛔ DỮ LIỆU ĐÃ BỊ THAY ĐỔI TRÁI PHÉP";
    }
};

module.exports = { decryptData };