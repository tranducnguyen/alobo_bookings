const fs = require('fs');
const BRANDS = JSON.parse(fs.readFileSync('branchs.json', 'utf8'));

module.exports = {
    BRANDS
};