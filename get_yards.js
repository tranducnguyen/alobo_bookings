const fs = require('fs');


function fixEncoding(str) {
    try {
        // Giả lập encode Latin1 rồi decode về UTF-8
        return decodeURIComponent(escape(str));
    } catch (e) {
        return str;
    }
}
const input = fs.readFileSync('input.json', 'utf8');

const inputData = JSON.parse(input);
const output = inputData.branches.filter(item => item.type==2 && item.status==1 && item.provinceId==79).map(item => {
    return {
        id: item.id,
        name: fixEncoding(item.name),
        nameEn: fixEncoding(item.nameEn),
        address: fixEncoding(item.address),
        addressEn: fixEncoding(item.addressEn),
        type: item.type,
        avatar: item.avatar,
        cover: item.cover,
        phone: item.phone,
        email: item.email,
        latitude: item.latitude,
        longitude: item.longitude,
    }});

fs.writeFileSync('output.json', JSON.stringify(output, null, 2), 'utf8');