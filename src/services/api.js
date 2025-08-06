const { ENV_CONFIG, API_ENDPOINTS } = require('../constants');
const CryptoService = require('../utils/crypto');

class ApiService {
    constructor(cryptoService) {
        this.cryptoService = cryptoService || new CryptoService();
        this.baseUrl = ENV_CONFIG.API.BASE_URL;
    }

    getDefaultHeaders(userAppKey) {
        return {
            'user-agent': ENV_CONFIG.API.USER_AGENT,
            'accept-encoding': ENV_CONFIG.API.ACCEPT_ENCODING,
            'x-user-app': userAppKey,
            'host': new URL(this.baseUrl).hostname
        };
    }

    buildUrl(endpoint, params = {}) {
        const url = new URL(`/${ENV_CONFIG.API.VERSION}${endpoint}`, this.baseUrl);
        Object.keys(params).forEach(key => 
            url.searchParams.append(key, params[key])
        );
        return url.toString();
    }

    async fetchWithDecryption(url, options = {}) {
        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Fetch with decryption failed:', error);
            throw error;
        }
    }

    parseAndDecryptResponse(data) {
        try {
            const decryptedData = this.cryptoService.decryptResponse(data);
            return JSON.parse(decryptedData);
        } catch (error) {
            console.error('Failed to parse decrypted response:', error);
            throw error;
        }
    }

    async getScheduleBookings(userAppKey, branchId, month = null) {
        const targetMonth = month || new Date().toISOString().slice(0, 7);
        
        const url = this.buildUrl(API_ENDPOINTS.SCHEDULE_BOOKINGS, {
            branchId,
            month: targetMonth
        });

        const options = {
            method: 'GET',
            headers: this.getDefaultHeaders(userAppKey)
        };

        const data = await this.fetchWithDecryption(url, options);
        return this.parseAndDecryptResponse(data);
    }

    async getOnetimeBookings(userAppKey, branchId, date = null) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        
        const url = this.buildUrl(API_ENDPOINTS.ONETIME_BOOKINGS, {
            branchId,
            startDate: targetDate,
            endDate: targetDate
        });

        const options = {
            method: 'GET',
            headers: this.getDefaultHeaders(userAppKey)
        };

        const data = await this.fetchWithDecryption(url, options);
        return this.parseAndDecryptResponse(data);
    }

    async getLockYards(userAppKey, branchId) {
        const url = this.buildUrl(`${API_ENDPOINTS.LOCK_YARDS}/${branchId}`);

        const options = {
            method: 'GET',
            headers: this.getDefaultHeaders(userAppKey)
        };

        const data = await this.fetchWithDecryption(url, options);
        return this.parseAndDecryptResponse(data);
    }
}

module.exports = ApiService;