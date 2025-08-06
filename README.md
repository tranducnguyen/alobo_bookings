# Alobo Bookings - Yard Booking Management System

## Overview

A modular Node.js application for managing sports yard bookings, checking availability, and displaying booking schedules. The system handles encrypted API communication, processes multiple booking types, and generates availability reports.

## Architecture

The application follows a clean architecture pattern with clear separation of concerns:

```
src/
├── config/          # Configuration management
├── constants/       # Application constants  
├── services/        # Business logic layer
│   ├── api.js      # API communication service
│   ├── booking.js  # Booking processing logic
│   └── yard.js     # Yard availability management
├── utils/          # Utility functions
│   ├── auth.js     # Authentication utilities
│   ├── crypto.js   # AES encryption/decryption
│   ├── display.js  # Display formatting
│   ├── error-handler.js # Error handling
│   ├── logger.js   # Logging utilities
│   └── time.js     # Time slot calculations
└── index.js        # Main application entry
```

## Features

### Core Functionality
- **Real-time Availability Checking**: Check yard availability across multiple branches
- **Multi-source Booking Management**: Process schedule bookings, one-time bookings, and locked yards
- **Time Slot Management**: 30-minute slot system with 48 slots per day
- **Encrypted Communication**: AES encryption/decryption for secure API communication
- **Concurrent Processing**: Parallel processing with configurable concurrency limits

### Technical Features
- **Modular Architecture**: Clean separation of concerns for maintainability
- **Error Handling**: Comprehensive error handling with custom error classes
- **Logging System**: Structured logging with multiple log levels
- **Configuration Management**: Centralized configuration with environment variables
- **Dependency Injection**: Loosely coupled components for testability

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd alobo_bookings
```

2. Install dependencies:
```bash
npm install
```

3. Ensure configuration files are in place:
- `branchs.json` - List of branches/yards
- `input.json` - Input data (if needed)

## Usage

### Basic Usage

Run the main application to process all configured brands:
```bash
node main.js
```

This will:
1. Load all brands from configuration
2. Fetch booking data for each brand
3. Process availability for current date
4. Generate output file (`output.txt`)

### Programmatic Usage

```javascript
const Application = require('./src');

const app = new Application();

// Process all brands
await app.run('output.txt');

// Process single brand
await app.runSingleBrand('brand_id', 'output.txt');

// Process with filters
await app.runByFilter({
    type: 2,
    provinceId: 79,
    status: 1
}, 'filtered_output.txt');
```

### Services API

#### Yard Service
```javascript
const YardService = require('./src/services/yard');
const yardService = new YardService();

// Get available yards for a branch
const result = await yardService.getAvailableYards({
    branchId: 'sport_son_ta',
    brandName: 'Sport Center',
    address: '123 Main St',
    targetDate: new Date()
});
```

#### Booking Service
```javascript
const BookingService = require('./src/services/booking');
const bookingService = new BookingService();

// Fill yard bookings
const schedule = bookingService.fillYardBookings(
    lockYards,
    scheduleBookings,
    onetimeBookings,
    targetDate
);

// Get available slots for a yard
const slots = bookingService.getAvailableSlots('yard_1');
```

## Configuration

### Environment Constants (`src/constants/index.js`)

```javascript
{
    ENCRYPTION: {
        KEY: "encryption_key",
        MODE: 'CBC',
        PADDING: 'Pkcs7'
    },
    API: {
        BASE_URL: "https://api.example.com",
        VERSION: "v2"
    },
    CONCURRENCY: {
        LIMIT: 5  // Max parallel requests
    },
    TIME_SLOTS: {
        TOTAL_SLOTS: 48,  // 24 hours * 2 slots/hour
        SLOT_DURATION_MINUTES: 30
    }
}
```

### Brands Configuration (`branchs.json`)

```json
[
    {
        "id": "branch_id",
        "name": "Branch Name",
        "address": "Branch Address",
        "type": 2,
        "status": 1,
        "provinceId": 79
    }
]
```

## Output Format

The application generates a formatted table showing yard availability:

```
==================================================

Sân           18:00  18:30  19:00  19:30  20:00  
-------------------------------------------------
Sport Center Main St
------------
yard_1        ⬜     ⬜     ✅     ✅     ⬜     
yard_2        ✅     ⬜     ⬜     ⬜     ✅     
```

- ⬜ Available slot
- ✅ Booked slot

## Error Handling

The application includes comprehensive error handling:

- **ApiError**: API communication errors
- **CryptoError**: Encryption/decryption errors
- **ConfigError**: Configuration loading errors
- **ValidationError**: Input validation errors

All errors are logged with appropriate context and stack traces.

## Logging

Structured logging with different levels:
- **ERROR**: Critical errors
- **WARN**: Warning messages
- **INFO**: General information
- **DEBUG**: Detailed debugging information

## Performance

- Concurrent processing with configurable limits
- Efficient time slot calculations
- Optimized data structures for booking management
- Batch API requests where possible

## Development

### Running Tests
```bash
npm test
```

### Code Structure Guidelines
- Follow modular architecture pattern
- Use dependency injection for services
- Implement proper error handling
- Add logging for debugging
- Keep business logic in service layer
- Use utilities for reusable functions

## License

This project is for educational purposes only. Do not use for unauthorized commercial purposes or illegal activities.

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes with clear messages
4. Push to branch
5. Create Pull Request

## Support

For issues or questions, please create an issue in the repository.

---

**Note:** This project is intended for learning purposes only. Do not use for unauthorized, commercial, or illegal purposes.