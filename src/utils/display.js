const { ENV_CONFIG, SLOT_STATUS } = require('../constants');
const TimeUtils = require('./time');

class DisplayService {
    constructor() {
        this.paddingRow = 12;
        this.columnWidth = 7;
    }

    createScheduleTable(yardSchedule, branchName, address, showTimeHeader = true) {
        const yards = Object.keys(yardSchedule).sort();
        const timeSlots = TimeUtils.generateTimeSlots(
            ENV_CONFIG.TIME_SLOTS.DISPLAY_START_INDEX,
            ENV_CONFIG.TIME_SLOTS.DISPLAY_END_INDEX
        );

        let table = this.createHeader();

        if (showTimeHeader) {
            table += this.createTimeHeader(timeSlots);
        }

        table += this.createBranchInfo(branchName, address);
        table += this.createYardRows(yards, yardSchedule, timeSlots);

        return table;
    }

    createHeader() {
        return '='.repeat(50) + '\n\n';
    }

    createTimeHeader(timeSlots) {
        let header = 'Sân'.padEnd(this.paddingRow);
        let count = 0;

        timeSlots.forEach(time => {
            count = (count + 1) % 3;
            if (count > 0) {
                header += " " + time.padEnd(this.columnWidth);
            } else {
                header += time.padEnd(this.columnWidth - 1);
            }
        });

        header += '\n';
        header += '-'.repeat(this.paddingRow + timeSlots.length * this.columnWidth) + '\n';

        return header;
    }

    createBranchInfo(branchName, address) {
        let info = `Sân ${branchName} ${address}`.padEnd(8) + '\n';
        info += '-'.repeat(this.paddingRow) + '\n';
        return info;
    }

    createYardRows(yards, yardSchedule, timeSlots) {
        let rows = '';

        yards.forEach(yard => {
            rows += yard.padEnd(this.paddingRow);

            timeSlots.forEach((time, timeIndex) => {
                const originalIndex = timeIndex + ENV_CONFIG.TIME_SLOTS.DISPLAY_START_INDEX;
                const slot = yardSchedule[yard][originalIndex];
                const status = this.getSlotStatus(slot);
                rows += status + ' '.repeat(this.columnWidth - 1);
            });

            rows += '\n';
        });

        return rows;
    }

    getSlotStatus(slot) {
        if (slot && slot !== SLOT_STATUS.AVAILABLE) {
            return '✅';
        }
        return '⬜';
    }

    displayScheduleSummary(yardSchedule) {
        const result = {};
        const timeSlots = TimeUtils.generateTimeSlots();

        Object.keys(yardSchedule).forEach(yard => {
            result[yard] = {};
            yardSchedule[yard].forEach((slot, index) => {
                if (slot && slot !== SLOT_STATUS.AVAILABLE) {
                    result[yard][timeSlots[index]] = slot.reason || 'booked';
                }
            });
        });

        return result;
    }

    formatAvailableSlots(availableSlots) {
        if (availableSlots.length === 0) {
            return 'No available slots';
        }

        const grouped = this.groupConsecutiveSlots(availableSlots);
        
        return grouped.map(group => {
            if (group.length === 1) {
                return group[0].time;
            }
            return `${group[0].time} - ${TimeUtils.slotToTime(group[group.length - 1].index + 1)}`;
        }).join(', ');
    }

    groupConsecutiveSlots(slots) {
        if (slots.length === 0) return [];

        const groups = [];
        let currentGroup = [slots[0]];

        for (let i = 1; i < slots.length; i++) {
            if (slots[i].index === slots[i - 1].index + 1) {
                currentGroup.push(slots[i]);
            } else {
                groups.push(currentGroup);
                currentGroup = [slots[i]];
            }
        }

        groups.push(currentGroup);
        return groups;
    }
}

module.exports = DisplayService;