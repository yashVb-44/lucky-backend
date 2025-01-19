const BiddingSession = require("../models/biddingSession");

// utils.js
const generateImageUrls = (document, req) => {
    if (!document) {
        return
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // Process only the fields that are image URLs
    const imageFields = ['backgroundImage', 'vehicleRepairImage', 'insideImage', 'outsideImage', 'image', "dentImage", "afterServiceImage", "beforeServiceImage", "bannerImage"];
    imageFields.forEach((field) => {
        if (document[field]) {
            document[field] = `${baseUrl}/${document[field].replace(/\\/g, '/')}`; // Handle both Unix and Windows paths
        }
    });

    return document;
};

const ganerateOneLineImageUrls = (document, req) => {
    if (!document) {
        return
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return `${baseUrl}/${document.replace(/\\/g, '/')}`
}

// Helper function to convert 24-hour time to 12-hour AM/PM format
function convertToAmPm(time) {
    if (time === null) {
        return
    }
    const [hour, minute] = time?.split(':');
    let hours = parseInt(hour);
    const amPm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert hour '0' to '12'
    return `${hours}:${minute} ${amPm}`;
}

function getDayName(dayIndex) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
}

module.exports = { generateImageUrls, ganerateOneLineImageUrls, convertToAmPm, getDayName };
