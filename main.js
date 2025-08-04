const CryptoJS = require('crypto-js');
const { fillYardBookings, createScheduleTable } = require('./fill.util.js');
const { BRANDS } = require('./config.js');



const fs = require('fs')

const pLimit = require('p-limit');

// Configuration
const ENV_KEYS = {
    encryptKey: "Al0b0@Doczy2025_5679_Secret_1107",
    xUserAppKey: "3486977e89f9031fb0ffe429b6dd252f"
};

/**
 * Response Interceptor để giải mã dữ liệu AES
 * @param {Object} response - HTTP response object
 * @returns {Object} - Modified response với dữ liệu đã giải mã
 */
function responseDecryptionInterceptor(response) {
    try {
        const responseData = response.data;

        if (!responseData || typeof responseData !== 'object') {
            console.log('Response data is not an object, skipping decryption');
            return response;
        }

        if (responseData.enc !== true) {
            console.log('Response not marked for decryption (enc !== true)');
            return response;
        }

        if (!responseData.data || !responseData.iv) {
            console.log('Missing required fields for decryption (data or iv)');
            return response;
        }

        const decryptedData = decryptAESData(
            responseData.data,
            responseData.iv,
            ENV_KEYS.encryptKey
        );
        return decryptedData;

    } catch (error) {
        console.error('Error in response decryption interceptor:', error);
        // Trả về response gốc nếu có lỗi
        return response;
    }
}

/**
 * Hàm giải mã AES
 * @param {string} encryptedData - Dữ liệu đã mã hóa (base64)
 * @param {string} ivBase64 - Initialization Vector (base64)
 * @param {string} encryptionKey - Encryption key
 * @returns {string} - Dữ liệu đã giải mã
 */
function decryptAESData(encryptedData, ivBase64, encryptionKey) {
    try {
        // Convert key thành WordArray
        const key = CryptoJS.enc.Utf8.parse(encryptionKey);

        // Decode IV từ base64
        const iv = CryptoJS.enc.Base64.parse(ivBase64);
        // Giải mã dữ liệu
        const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        // Convert về string
        const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

        if (!decryptedString) {
            throw new Error('Decryption resulted in empty string');
        }

        return decryptedString;

    } catch (error) {
        throw new Error(`AES decryption failed: ${error.message}`);
    }
}

/**
 * Fetch wrapper với tự động giải mã
 * @param {string} url - URL để fetch
 * @param {Object} options - Fetch options
 * @returns {Promise} - Promise với response đã giải mã
 */
async function fetchWithDecryption(url, options = {}) {
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Fetch with decryption failed:', error);
        throw error;
    }
}

async function getUserAppKey(xUserAppKey) {
    // Step 1: Get current DateTime and convert to UTC
    const now = new Date();

    // Step 2: Format date as "MM/dd/yyyy, HH:mm"
    const formatDateTime = (date) => {
        const utcPlus7 = new Date(date.getTime());

        const month = String(utcPlus7.getUTCMonth() + 1).padStart(2, '0');
        const day = String(utcPlus7.getUTCDate()).padStart(2, '0');
        const year = utcPlus7.getUTCFullYear();
        const hours = String(utcPlus7.getUTCHours()).padStart(2, '0');
        const minutes = String(utcPlus7.getUTCMinutes()).padStart(2, '0');

        return `${month}/${day}/${year}, ${hours}:${minutes}`;
        // return `08/03/2025, 15:04`;
    };

    const formattedDate = formatDateTime(now);
    // Step 3: Concatenate "@" + formatted date + xUserAppKey
    const combinedString = formattedDate + "@" + xUserAppKey;

    // Step 4: Convert to UTF-8 bytes and hash with SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(combinedString);

    // Step 5: Calculate SHA-256 hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Step 6: Convert to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
}


async function get_schedule_bookings(userAppKey, branchId = 'sport_son_ta') {
    const options = {
        method: 'GET',
        headers: {
            'user-agent': 'Dart/3.7 (dart:io)',
            'accept-encoding': 'gzip',
            'x-user-app': userAppKey,
            host: 'user-global-ootprnz4oa-uc.a.run.app'
        }
    };
    const month = new Date().toISOString().split('T')[0].slice(0, 7); // Lấy tháng hiện tại
    const data = await fetchWithDecryption(`https://user-global-ootprnz4oa-uc.a.run.app/v2/user/branch/get_schedule_bookings?branchId=${branchId}&month=${month}`, options);
    return response = {
        data: data,
        status: 200,
        statusText: 'OK'
    };
}

async function get_onetime_bookings(userAppKey, branchId = 'sport_son_ta') {
    const options = {
        method: 'GET',
        headers: {
            'user-agent': 'Dart/3.7 (dart:io)',
            'accept-encoding': 'gzip',
            'x-user-app': userAppKey,
            host: 'user-global-ootprnz4oa-uc.a.run.app'
        }
    };
    // Lấy ngày hiện tại
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    const data = await fetchWithDecryption(`https://user-global-ootprnz4oa-uc.a.run.app/v2/user/branch/get_onetime_bookings?branchId=${branchId}&startDate=${todayString}&endDate=${todayString}`, options);
    return response = {
        data: data,
        status: 200,
        statusText: 'OK'
    };
}


async function get_lock_yards(userAppKey, branchId = 'sport_son_ta') {
    const options = {
        method: 'GET',
        headers: {
            'user-agent': 'Dart/3.7 (dart:io)',
            'accept-encoding': 'gzip',
            'x-user-app': userAppKey,
            host: 'user-global-ootprnz4oa-uc.a.run.app'
        }
    };
    const data = await fetchWithDecryption(`https://user-global-ootprnz4oa-uc.a.run.app/v2/user/branch/get_lock_yards/${branchId}`, options);
    return response = {
        data: data,
        status: 200,
        statusText: 'OK'
    };
}


async function getAvailableYards({ userAppKey, branchId, brandName, address, isShowTimeHeader = true }) {
    const schedule_bookings = await get_schedule_bookings(userAppKey, branchId);
    const decryptedResponse = responseDecryptionInterceptor(schedule_bookings);
    const schedule_bookings_data = JSON.parse(decryptedResponse);

    const onetime_bookings = await get_onetime_bookings(userAppKey, branchId);
    const decryptedOnetimeResponse = responseDecryptionInterceptor(onetime_bookings);
    const onetime_bookings_data = JSON.parse(decryptedOnetimeResponse);

    const lock_yards = await get_lock_yards(userAppKey, branchId);
    const decryptedLockResponse = responseDecryptionInterceptor(lock_yards);
    const lock_yards_data = JSON.parse(decryptedLockResponse);
    const targetDate = new Date();
    const schedule = fillYardBookings(lock_yards_data, schedule_bookings_data, onetime_bookings_data, targetDate);

    const displayResult = createScheduleTable(schedule, brandName, address, isShowTimeHeader);
    return displayResult;
}


async function main() {
    try {
        const limit = pLimit.default(5)

        const results = await Promise.all(BRANDS.map((brand, index) =>
            limit(async () => {
                console.log(`Fetching ${brand.name}`);
                const userAppKey = await getUserAppKey(ENV_KEYS.xUserAppKey);
                const displayResult = await getAvailableYards({
                    userAppKey,
                    branchId: brand.id,
                    brandName: brand.name,
                    isShowTimeHeader: index === 0,
                    address: brand.address

                })
                return displayResult;
            })));
        fs.writeFileSync('output.txt', results.join(""))
    } catch (error) {
        console.error('Test failed:', error);
    }
}

(async () => {
    await main();
})();
