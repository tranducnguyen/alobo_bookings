const { ENV_CONFIG } = require('../constants');

class TimeUtils {
    static timeToSlot(timeStr) {
        const time = new Date(timeStr);
        const hours = time.getHours();
        const minutes = time.getMinutes();
        return hours * 2 + Math.floor(minutes / ENV_CONFIG.TIME_SLOTS.SLOT_DURATION_MINUTES);
    }

    static durationToSlots(durationMinutes) {
        return Math.ceil(durationMinutes / ENV_CONFIG.TIME_SLOTS.SLOT_DURATION_MINUTES);
    }

    static slotToTime(slotIndex) {
        const hour = Math.floor(slotIndex / 2);
        const minute = (slotIndex % 2) * ENV_CONFIG.TIME_SLOTS.SLOT_DURATION_MINUTES;
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }

    static generateTimeSlots(startIndex = 0, endIndex = ENV_CONFIG.TIME_SLOTS.TOTAL_SLOTS) {
        const timeSlots = [];
        for (let i = startIndex; i < endIndex; i++) {
            timeSlots.push(this.slotToTime(i));
        }
        return timeSlots;
    }

    static parseTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }

    static parseISOTime(isoString) {
        const date = new Date(isoString);
        return date.getHours() * 60 + date.getMinutes();
    }

    static isTimeOverlap(start1, end1, start2, end2) {
        return start1 < end2 && start2 < end1;
    }

    static getDayOfWeek(date) {
        const dayOfWeek = date.getDay();
        return dayOfWeek === 0 ? 7 : dayOfWeek;
    }

    static getDateString(date) {
        return date.toISOString().split('T')[0];
    }
}

module.exports = TimeUtils;