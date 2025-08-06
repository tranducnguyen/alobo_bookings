const CryptoJS = require('crypto-js');
const { ENV_CONFIG } = require('../constants');

class CryptoService {
    constructor(encryptionKey = ENV_CONFIG.ENCRYPTION.KEY) {
        this.encryptionKey = encryptionKey;
    }

    decryptAESData(encryptedData, ivBase64) {
        try {
            const key = CryptoJS.enc.Utf8.parse(this.encryptionKey);
            const iv = CryptoJS.enc.Base64.parse(ivBase64);
            
            const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
                iv: iv,
                mode: CryptoJS.mode[ENV_CONFIG.ENCRYPTION.MODE],
                padding: CryptoJS.pad[ENV_CONFIG.ENCRYPTION.PADDING]
            });

            const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

            if (!decryptedString) {
                throw new Error('Decryption resulted in empty string');
            }

            return decryptedString;
        } catch (error) {
            throw new Error(`AES decryption failed: ${error.message}`);
        }
    }

    decryptResponse(responseData) {
        try {
            if (!this.isEncryptedResponse(responseData)) {
                return responseData;
            }

            const decryptedData = this.decryptAESData(
                responseData.data,
                responseData.iv
            );

            return decryptedData;
        } catch (error) {
            console.error('Error in response decryption:', error);
            throw error;
        }
    }

    isEncryptedResponse(responseData) {
        if (!responseData || typeof responseData !== 'object') {
            return false;
        }

        if (responseData.enc !== true) {
            return false;
        }

        if (!responseData.data || !responseData.iv) {
            console.log('Missing required fields for decryption (data or iv)');
            return false;
        }

        return true;
    }
}

module.exports = CryptoService;