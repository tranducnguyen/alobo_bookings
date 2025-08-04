/**
 * Hàm filter các sân còn trống theo giờ
 * @param {Date} checkDate - Ngày cần kiểm tra
 * @param {string} startTime - Giờ bắt đầu (format: "HH:mm")
 * @param {string} endTime - Giờ kết thúc (format: "HH:mm")
 * @param {Array} lockYards - Danh sách sân bị khóa
 * @param {Array} scheduleBookings - Đặt lịch theo lịch trình
 * @param {Array} onetimeBookings - Đặt lịch một lần
 * @returns {Array} Danh sách sân còn trống
 */
function getAvailableYards(checkDate, startTime, endTime, lockYards, scheduleBookings, onetimeBookings) {
    // Danh sách tất cả các sân (có thể điều chỉnh theo hệ thống)
    const allYards = [
        "san_1", "san_2", "san_3", "san_4", "san_5", 
        "san_6", "san_7", "san_8", "san_9", "san_10"
    ];
    
    // Chuyển đổi thời gian kiểm tra
    const checkDateTime = new Date(checkDate);
    const dayOfWeek = checkDateTime.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
    const checkStartTime = parseTime(startTime);
    const checkEndTime = parseTime(endTime);
    
    // Tập hợp các sân bị chiếm
    const occupiedYards = new Set();
    
    // 1. Kiểm tra sân bị khóa
    checkLockedYards(lockYards, checkDateTime, checkStartTime, checkEndTime, dayOfWeek, occupiedYards);
    
    // 2. Kiểm tra đặt lịch theo lịch trình
    checkScheduleBookings(scheduleBookings, checkDateTime, checkStartTime, checkEndTime, dayOfWeek, occupiedYards);
    
    // 3. Kiểm tra đặt lịch một lần
    checkOnetimeBookings(onetimeBookings, checkDateTime, checkStartTime, checkEndTime, occupiedYards);
    
    // Trả về danh sách sân còn trống
    return allYards.filter(yard => !occupiedYards.has(yard));
}

/**
 * Chuyển đổi string thời gian thành minutes từ 00:00
 */
function parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Chuyển đổi ISO string thành minutes từ 00:00
 */
function parseISOTime(isoString) {
    const date = new Date(isoString);
    return date.getHours() * 60 + date.getMinutes();
}

/**
 * Kiểm tra xem thời gian có trùng lặp không
 */
function isTimeOverlap(start1, end1, start2, end2) {
    return start1 < end2 && start2 < end1;
}

/**
 * Kiểm tra sân bị khóa
 */
function checkLockedYards(lockYards, checkDateTime, checkStartTime, checkEndTime, dayOfWeek, occupiedYards) {
    lockYards.forEach(lock => {
        const lockStart = new Date(lock.startTime);
        const lockEnd = new Date(lock.endTime);
        
        // Kiểm tra ngày có trong khoảng thời gian khóa
        if (checkDateTime >= lockStart && checkDateTime <= lockEnd) {
            // Kiểm tra thứ trong tuần
            if (lock.frequency.includes(dayOfWeek)) {
                // Kiểm tra skipDates
                const dateString = checkDateTime.toISOString().split('T')[0];
                if (!lock.skipDates.includes(dateString)) {
                    const lockStartTime = parseISOTime(lock.startTime);
                    const lockEndTime = parseISOTime(lock.endTime);
                    
                    if (isTimeOverlap(checkStartTime, checkEndTime, lockStartTime, lockEndTime)) {
                        lock.servicesId.forEach(yardId => occupiedYards.add(yardId));
                    }
                }
            }
        }
    });
}

/**
 * Kiểm tra đặt lịch theo lịch trình
 */
function checkScheduleBookings(scheduleBookings, checkDateTime, checkStartTime, checkEndTime, dayOfWeek, occupiedYards) {
    scheduleBookings.forEach(booking => {
        if (booking.status !== 1) return; // Chỉ kiểm tra booking đã confirm
        
        booking.services.forEach(service => {
            const serviceStart = new Date(service.startDate);
            const serviceEnd = new Date(service.endDate);
            
            // Kiểm tra ngày có trong khoảng thời gian đặt lịch
            if (checkDateTime >= serviceStart && checkDateTime <= serviceEnd) {
                // Kiểm tra thứ trong tuần
                if (service.frequently.includes(dayOfWeek)) {
                    // Kiểm tra skipDates
                    const dateString = checkDateTime.toISOString().split('T')[0];
                    if (!service.skipDates || !service.skipDates[dateString]) {
                        const serviceStartTime = parseISOTime(service.startTime);
                        const serviceEndTime = serviceStartTime + service.duration;
                        
                        if (isTimeOverlap(checkStartTime, checkEndTime, serviceStartTime, serviceEndTime)) {
                            occupiedYards.add(service.serviceId);
                        }
                    }
                }
            }
        });
    });
}

/**
 * Kiểm tra đặt lịch một lần
 */
function checkOnetimeBookings(onetimeBookings, checkDateTime, checkStartTime, checkEndTime, occupiedYards) {
    const checkDateString = checkDateTime.toISOString().split('T')[0];
    
    onetimeBookings.forEach(booking => {
        if (booking.status !== 1) return; // Chỉ kiểm tra booking đã confirm
        
        const bookingDate = new Date(booking.time).toISOString().split('T')[0];
        
        // Kiểm tra cùng ngày
        if (bookingDate === checkDateString) {
            booking.services.forEach(service => {
                const serviceStartTime = parseISOTime(service.startTime);
                const serviceEndTime = serviceStartTime + service.duration;
                
                if (isTimeOverlap(checkStartTime, checkEndTime, serviceStartTime, serviceEndTime)) {
                    occupiedYards.add(service.serviceId);
                }
            });
        }
    });
}

function quickCheck(date, time, duration = 120) {
    const [hours, minutes] = time.split(':').map(Number);
    const endHours = hours + Math.floor((minutes + duration) / 60);
    const endMinutes = (minutes + duration) % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    
    return getAvailableYards(
        new Date(date), 
        time, 
        endTime, 
        get_lock_yards, 
        get_schedule_bookings, 
        get_onetime_bookings
    );
}

module.exports = {
    getAvailableYards,
    quickCheck
}