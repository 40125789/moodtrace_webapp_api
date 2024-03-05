const crypto = require('crypto');

function generateApiKey(length = 32) {
    // Define the characters to use for generating the key
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    // Generate a random key using the defined characters
    let apiKey = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(characters.length);
        apiKey += characters[randomIndex];
    }

    return apiKey;
}

module.exports = {generateApiKey};