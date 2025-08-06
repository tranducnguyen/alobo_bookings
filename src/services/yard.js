const ApiService = require('./api');
const BookingService = require('./booking');
const DisplayService = require('../utils/display');
const AuthService = require('../utils/auth');

class YardService {
    constructor() {
        this.apiService = new ApiService();
        this.bookingService = new BookingService();
        this.displayService = new DisplayService();
        this.authService = new AuthService();
    }

    async getAvailableYards({ branchId, brandName, address, isShowTimeHeader = true, targetDate = new Date() }) {
        try {
            const userAppKey = await this.authService.generateUserAppKey();
            
            const [scheduleBookings, onetimeBookings, lockYards] = await Promise.all([
                this.apiService.getScheduleBookings(userAppKey, branchId),
                this.apiService.getOnetimeBookings(userAppKey, branchId, targetDate),
                this.apiService.getLockYards(userAppKey, branchId)
            ]);

            const schedule = this.bookingService.fillYardBookings(
                lockYards,
                scheduleBookings,
                onetimeBookings,
                targetDate
            );

            const displayResult = this.displayService.createScheduleTable(
                schedule,
                brandName,
                address,
                isShowTimeHeader
            );

            return {
                schedule,
                display: displayResult,
                summary: this.displayService.displayScheduleSummary(schedule)
            };
        } catch (error) {
            console.error(`Failed to get available yards for ${brandName}:`, error);
            throw error;
        }
    }

    async getAvailableYardsForBrand(brand, isShowTimeHeader = true, targetDate = new Date()) {
        return this.getAvailableYards({
            branchId: brand.id,
            brandName: brand.name,
            address: brand.address,
            isShowTimeHeader,
            targetDate
        });
    }

    async checkYardAvailability(branchId, yardId, startTime, endTime, targetDate = new Date()) {
        try {
            const userAppKey = await this.authService.generateUserAppKey();
            
            const [scheduleBookings, onetimeBookings, lockYards] = await Promise.all([
                this.apiService.getScheduleBookings(userAppKey, branchId),
                this.apiService.getOnetimeBookings(userAppKey, branchId, targetDate),
                this.apiService.getLockYards(userAppKey, branchId)
            ]);

            const schedule = this.bookingService.fillYardBookings(
                lockYards,
                scheduleBookings,
                onetimeBookings,
                targetDate
            );

            const startSlot = TimeUtils.timeToSlot(startTime);
            const endSlot = TimeUtils.timeToSlot(endTime);
            
            const availableYards = this.bookingService.getAvailableYards(startSlot, endSlot);
            
            return {
                isAvailable: availableYards.includes(yardId),
                availableYards,
                allSlots: this.bookingService.getAvailableSlots(yardId)
            };
        } catch (error) {
            console.error(`Failed to check yard availability:`, error);
            throw error;
        }
    }
}

module.exports = YardService;