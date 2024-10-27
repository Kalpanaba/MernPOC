// utils/monthHelper.js

// An array of month names
const monthNames = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
];

/**
 * Get the name of the month by number.
 * @param {number} monthNumber - Month number (1-12)
 * @returns {string} - Name of the month
 */
const getMonthName = (monthNumber) => {
    if (monthNumber < 1 || monthNumber > 12) {
        throw new Error('Month number must be between 1 and 12');
    }
    return monthNames[monthNumber - 1];
};

/**
 * Get the number of days in a month.
 * @param {number} monthNumber - Month number (1-12)
 * @param {number} year - Year (to account for leap years)
 * @returns {number} - Number of days in the month
 */
const getDaysInMonth = (monthNumber, year) => {
    if (monthNumber < 1 || monthNumber > 12) {
        throw new Error('Month number must be between 1 and 12');
    }

    // January, March, May, July, August, October, December have 31 days
    if ([1, 3, 5, 7, 8, 10, 12].includes(monthNumber)) {
        return 31;
    }

    // April, June, September, November have 30 days
    if ([4, 6, 9, 11].includes(monthNumber)) {
        return 30;
    }

    // February - Check for leap year
    if (monthNumber === 2) {
        return isLeapYear(year) ? 29 : 28;
    }

    return 0; // Should never reach here
};

/**
 * Check if a year is a leap year.
 * @param {number} year - Year to check
 * @returns {boolean} - True if leap year, false otherwise
 */
const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

/**
 * Convert a month name to its corresponding month number.
 * @param {string} monthName - The name of the month (e.g., 'January')
 * @returns {number} - The month number (1-12)
 */
const convertMonthToNumber = (monthName) => {
    const monthIndex = monthNames.findIndex(month => month.toLowerCase() === monthName.toLowerCase());
    if (monthIndex === -1) {
        throw new Error(`Invalid month name: ${monthName}`);
    }
    return monthIndex + 1; // Month numbers are 1-based
};

module.exports = {
    getMonthName,
    getDaysInMonth,
    isLeapYear,
    convertMonthToNumber
};
