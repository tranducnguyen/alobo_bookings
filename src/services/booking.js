const { BOOKING_STATUS, SLOT_STATUS, BOOKING_REASONS, ENV_CONFIG } = require('../constants');
const TimeUtils = require('../utils/time');

class BookingService {
    constructor() {
        this.yardSchedule = {};
    }

    extractYards(lockYards, scheduleBookings, onetimeBookings) {
        const yardsSet = new Set();

        lockYards.forEach(lock => {
            if (lock?.serviceName) {
                lock.serviceName.forEach(yardId => yardsSet.add(yardId));
            }
        });

        scheduleBookings.forEach(booking => {
            if (booking?.services) {
                booking.services.forEach(service => {
                    if (service?.serviceName) {
                        yardsSet.add(service.serviceName);
                    }
                });
            }
        });

        onetimeBookings.forEach(booking => {
            if (booking?.services) {
                booking.services.forEach(service => {
                    if (service?.serviceName) {
                        yardsSet.add(service.serviceName);
                    }
                });
            }
        });

        return Array.from(yardsSet).sort();
    }

    initializeYardSchedule(yards) {
        const schedule = {};
        yards.forEach(yard => {
            schedule[yard] = new Array(ENV_CONFIG.TIME_SLOTS.TOTAL_SLOTS).fill(SLOT_STATUS.AVAILABLE);
        });
        return schedule;
    }

    fillSlots(yardId, startSlot, numSlots, reason = BOOKING_REASONS.BOOKED) {
        if (!this.yardSchedule[yardId]) {
            return;
        }

        const endSlot = Math.min(startSlot + numSlots, ENV_CONFIG.TIME_SLOTS.TOTAL_SLOTS);
        
        for (let i = startSlot; i < endSlot; i++) {
            this.yardSchedule[yardId][i] = {
                status: SLOT_STATUS.BOOKED,
                reason: reason
            };
        }
    }

    processLockYards(lockYards, targetDate) {
        const targetDayOfWeek = TimeUtils.getDayOfWeek(targetDate);
        const targetDateStr = TimeUtils.getDateString(targetDate);

        lockYards.forEach(lock => {
            const startTime = new Date(lock.startTime);
            const endTime = new Date(lock.endTime);

            if (targetDate >= startTime && targetDate <= endTime) {
                if (lock.frequency.includes(targetDayOfWeek)) {
                    if (!lock.skipDates.includes(targetDateStr)) {
                        const startSlot = TimeUtils.timeToSlot(lock.startTime);
                        const endSlot = TimeUtils.timeToSlot(lock.endTime);
                        const numSlots = endSlot - startSlot;

                        lock.serviceName.forEach(yardId => {
                            this.fillSlots(yardId, startSlot, numSlots, BOOKING_REASONS.LOCKED);
                        });
                    }
                }
            }
        });
    }

    processScheduleBookings(scheduleBookings, targetDate) {
        const targetDayOfWeek = TimeUtils.getDayOfWeek(targetDate);
        const targetDateStr = TimeUtils.getDateString(targetDate);

        scheduleBookings.forEach(booking => {
            if (booking.status !== BOOKING_STATUS.CONFIRMED) return;

            booking.services.forEach(service => {
                const startDate = new Date(service.startDate);
                const endDate = new Date(service.endDate);

                if (targetDate >= startDate && targetDate <= endDate) {
                    if (service.frequently.includes(targetDayOfWeek)) {
                        const skipDates = service.skipDates || {};

                        if (!skipDates[targetDateStr]) {
                            const startSlot = TimeUtils.timeToSlot(service.startTime);
                            const numSlots = TimeUtils.durationToSlots(service.duration);

                            this.fillSlots(service.serviceName, startSlot, numSlots, BOOKING_REASONS.SCHEDULED);
                        }
                    }
                }
            });
        });
    }

    processOnetimeBookings(onetimeBookings, targetDate) {
        const targetDateStr = TimeUtils.getDateString(targetDate);

        onetimeBookings.forEach(booking => {
            if (booking.status !== BOOKING_STATUS.CONFIRMED) return;

            const bookingDate = new Date(booking.time);
            const bookingDateStr = TimeUtils.getDateString(bookingDate);

            if (bookingDateStr === targetDateStr) {
                booking.services.forEach(service => {
                    const startSlot = TimeUtils.timeToSlot(service.startTime);
                    const numSlots = TimeUtils.durationToSlots(service.duration);

                    this.fillSlots(service.serviceName, startSlot, numSlots, BOOKING_REASONS.ONETIME);
                });
            }
        });
    }

    fillYardBookings(lockYards, scheduleBookings, onetimeBookings, targetDate = new Date()) {
        const yards = this.extractYards(lockYards, scheduleBookings, onetimeBookings);
        this.yardSchedule = this.initializeYardSchedule(yards);

        this.processLockYards(lockYards, targetDate);
        this.processScheduleBookings(scheduleBookings, targetDate);
        this.processOnetimeBookings(onetimeBookings, targetDate);

        return this.yardSchedule;
    }

    getAvailableSlots(yardId) {
        if (!this.yardSchedule[yardId]) {
            return [];
        }

        const availableSlots = [];
        this.yardSchedule[yardId].forEach((slot, index) => {
            if (!slot || slot === SLOT_STATUS.AVAILABLE) {
                availableSlots.push({
                    index,
                    time: TimeUtils.slotToTime(index)
                });
            }
        });

        return availableSlots;
    }

    getAvailableYards(startSlot, endSlot) {
        const availableYards = [];
        
        Object.keys(this.yardSchedule).forEach(yardId => {
            let isAvailable = true;
            
            for (let i = startSlot; i < endSlot && i < ENV_CONFIG.TIME_SLOTS.TOTAL_SLOTS; i++) {
                if (this.yardSchedule[yardId][i] && this.yardSchedule[yardId][i] !== SLOT_STATUS.AVAILABLE) {
                    isAvailable = false;
                    break;
                }
            }
            
            if (isAvailable) {
                availableYards.push(yardId);
            }
        });
        
        return availableYards;
    }
}

module.exports = BookingService;