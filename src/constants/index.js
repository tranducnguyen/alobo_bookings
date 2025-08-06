const ENV_CONFIG = {
    ENCRYPTION: {
        KEY: "Al0b0@Doczy2025_5679_Secret_1107",
        MODE: 'CBC',
        PADDING: 'Pkcs7'
    },
    API: {
        USER_APP_KEY: "3486977e89f9031fb0ffe429b6dd252f",
        BASE_URL: "https://user-global-ootprnz4oa-uc.a.run.app",
        VERSION: "v2",
        USER_AGENT: "Dart/3.7 (dart:io)",
        ACCEPT_ENCODING: "gzip"
    },
    CONCURRENCY: {
        LIMIT: 5
    },
    TIME_SLOTS: {
        TOTAL_SLOTS: 48,
        SLOT_DURATION_MINUTES: 30,
        DISPLAY_START_INDEX: 36,
        DISPLAY_END_INDEX: 46
    }
};

const API_ENDPOINTS = {
    SCHEDULE_BOOKINGS: '/user/branch/get_schedule_bookings',
    ONETIME_BOOKINGS: '/user/branch/get_onetime_bookings',
    LOCK_YARDS: '/user/branch/get_lock_yards'
};

const BOOKING_STATUS = {
    CONFIRMED: 1,
    PENDING: 0,
    CANCELLED: -1
};

const SLOT_STATUS = {
    AVAILABLE: false,
    BOOKED: true
};

const BOOKING_REASONS = {
    LOCKED: 'locked',
    SCHEDULED: 'scheduled',
    ONETIME: 'onetime',
    BOOKED: 'booked'
};

module.exports = {
    ENV_CONFIG,
    API_ENDPOINTS,
    BOOKING_STATUS,
    SLOT_STATUS,
    BOOKING_REASONS
};