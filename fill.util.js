function fillYardBookings(lockYards, scheduleBookings, onetimeBookings, targetDate = new Date()) {
    const yardsSet = new Set();


    lockYards.forEach(lock => {
        if (lock && lock.serviceName) {
            lock.serviceName.forEach(yardId => yardsSet.add(yardId));
        }

    });

    scheduleBookings.forEach(booking => {
        if (booking && booking.services) {
            booking.services.forEach(service => {
                if (service && service.serviceName) {
                    yardsSet.add(service.serviceName);
                }

            });
        }

    });


    onetimeBookings.forEach(booking => {
        if (booking && booking.services) {
            booking.services.forEach(service => {
                if (service && service.serviceName) {
                    yardsSet.add(service.serviceName);
                }
            });
        }

    });


    const yards = Array.from(yardsSet).sort();

    // mỗi sân có 48 slot (24h * 2 slot/h = 48 slot 30p)
    const yardSchedule = {};
    yards.forEach(yard => {
        yardSchedule[yard] = new Array(48).fill(false); // false = trống, true = đã đặt
    });


    const target = new Date(targetDate);
    const targetDayOfWeek = target.getDay(); // 0=CN, 1=T2, 2=T3, 3=T4, 4=T5, 5=T6, 6=T7

    function timeToSlot(timeStr) {
        const time = new Date(timeStr);
        const hours = time.getHours();
        const minutes = time.getMinutes();
        return hours * 2 + Math.floor(minutes / 30);
    }

    function durationToSlots(durationMinutes) {
        return Math.ceil(durationMinutes / 30);
    }

    // Helper function: điền slot cho sân
    function fillSlots(yardId, startSlot, numSlots, reason = 'booked') {
        if (yardSchedule[yardId]) {
            for (let i = startSlot; i < Math.min(startSlot + numSlots, 48); i++) {
                yardSchedule[yardId][i] = {
                    status: true,
                    reason: reason
                };
            }
        }
    }

    lockYards.forEach(lock => {
        const startTime = new Date(lock.startTime);
        const endTime = new Date(lock.endTime);

        if (target >= startTime.toDateString() && target <= endTime.toDateString()) {
            const targetFreq = targetDayOfWeek === 0 ? 7 : targetDayOfWeek;

            if (lock.frequency.includes(targetFreq)) {
                const targetDateStr = target.toISOString().split('T')[0];
                if (!lock.skipDates.includes(targetDateStr)) {
                    const startSlot = timeToSlot(lock.startTime);
                    const endSlot = timeToSlot(lock.endTime);
                    const numSlots = endSlot - startSlot;

                    lock.serviceName.forEach(yardId => {
                        fillSlots(yardId, startSlot, numSlots, 'locked');
                    });
                }
            }
        }
    });

    scheduleBookings.forEach(booking => {
        if (booking.status !== 1) return;

        booking.services.forEach(service => {
            const startTime = new Date(service.startTime);
            const startDate = new Date(service.startDate);
            const endDate = new Date(service.endDate);

            if (target >= startDate && target <= endDate) {
                const targetFreq = targetDayOfWeek === 0 ? 7 : targetDayOfWeek;

                if (service.frequently.includes(targetFreq)) {
                    const targetDateStr = target.toISOString().split('T')[0];
                    const skipDates = service.skipDates || {};

                    if (!skipDates[targetDateStr]) {
                        const startSlot = timeToSlot(service.startTime);
                        const numSlots = durationToSlots(service.duration);

                        fillSlots(service.serviceName, startSlot, numSlots, 'scheduled');
                    }
                }
            }
        });
    });

    onetimeBookings.forEach(booking => {
        if (booking.status !== 1) return;

        const bookingDate = new Date(booking.time);
        const bookingDateStr = bookingDate.toISOString().split('T')[0];
        const targetDateStr = target.toISOString().split('T')[0];

        if (bookingDateStr === targetDateStr) {
            booking.services.forEach(service => {
                const startSlot = timeToSlot(service.startTime);
                const numSlots = durationToSlots(service.duration);

                fillSlots(service.serviceName, startSlot, numSlots, 'onetime');
            });
        }
    });

    return yardSchedule;
}

function displaySchedule(yardSchedule) {
    const timeSlots = [];
    for (let i = 0; i < 48; i++) {
        const hour = Math.floor(i / 2);
        const minute = (i % 2) * 30;
        timeSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }

    const result = {};
    Object.keys(yardSchedule).forEach(yard => {
        result[yard] = {};
        yardSchedule[yard].forEach((slot, index) => {
            if (slot) {
                result[yard][timeSlots[index]] = slot.reason || 'booked';
            }
        });
    });

    return result;
}

function createScheduleTable(yardSchedule, branchId, address, showTimeHeader = true) {
    const indexStart = 36
    const paddingRow = 12
    const yards = Object.keys(yardSchedule).sort();
    const timeSlots = [];

    for (let i = indexStart; i < 46; i++) {
        const hour = Math.floor(i / 2);
        const minute = (i % 2) * 30;
        timeSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }

    let table = '='.repeat(50) + '\n\n';

    if (showTimeHeader) {
        table += 'Sân'.padEnd(paddingRow);
        let count = 0;
        timeSlots.forEach(time => {
            count = (count + 1) % 3
            if (count > 0) {
                table += " " + time.padEnd(7);
            } else {
                table += time.padEnd(6);
            }

        });
        table += '\n';
        table += '-'.repeat(paddingRow + timeSlots.length * 7) + '\n';
    }
    table += `Sân ${branchId} ${address}`.padEnd(8) + '\n';
    table += '-'.repeat(paddingRow) + '\n';

    yards.forEach(yard => {
        table += yard.padEnd(paddingRow);
        timeSlots.forEach((time, timeIndex) => {
            const originalIndex = timeIndex + indexStart;
            const slot = yardSchedule[yard][originalIndex];
            let status = '';

            if (slot) {
                status = '✅';
            } else {
                status = '⬜';
            }

            table += status + '     ';
        });
        table += '\n';
    });

    return table;
}


module.exports = {
    fillYardBookings,
    displaySchedule,
    createScheduleTable,
};