const fs = require('fs');

function generateRandomString(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generateEmail() {
    const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
    const username = generateRandomString(8);
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${username}@${domain}`;
}

function generatePassword() {
    return generateRandomString(12);
}

const rows = [];
for (let i = 0; i < 1000; i++) {
    const email = generateEmail();
    const password = generatePassword();
    rows.push(`${email},${password}`);
}

fs.writeFileSync('large_email_password_template.csv', rows.join('\n'));
console.log('Generated large_email_password_template.csv with 1000 rows'); ``;