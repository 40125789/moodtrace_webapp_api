

const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key']; // Assuming API key is passed in the 'x-api-key' header

    // Check if API key is provided
    if (!apiKey) {
        return res.status(401).json({ error: 'API key is required' });
    }

    // Check if API key is valid
    if (apiKey !== process.env.API_KEY) { 
        return res.status(403).json({ error: 'Invalid API key' });
    }

    // API key is valid, proceed to the next middleware or route handler
    next();
};

module.exports = validateApiKey;
