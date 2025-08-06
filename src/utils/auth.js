const crypto = require('crypto');
const { ENV_CONFIG } = require('../constants');

class AuthService {
    constructor(xUserAppKey = ENV_CONFIG.API.USER_APP_KEY) {
        this.xUserAppKey = xUserAppKey;
    }

    formatDateTime(date) {
        const utcPlus7 = new Date(date.getTime());
        
        const month = String(utcPlus7.getUTCMonth() + 1).padStart(2, '0');
        const day = String(utcPlus7.getUTCDate()).padStart(2, '0');
        const year = utcPlus7.getUTCFullYear();
        const hours = String(utcPlus7.getUTCHours()).padStart(2, '0');
        const minutes = String(utcPlus7.getUTCMinutes()).padStart(2, '0');
        
        return `${month}/${day}/${year}, ${hours}:${minutes}`;
    }

    async generateUserAppKey() {
        const now = new Date();
        const formattedDate = this.formatDateTime(now);
        const combinedString = formattedDate + "@" + this.xUserAppKey;
        
        const encoder = new TextEncoder();
        const data = encoder.encode(combinedString);
        
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        return hashHex;
    }
}

module.exports = AuthService;