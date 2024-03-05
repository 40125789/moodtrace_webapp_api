const express = require('express');
const controller = require('../controllers/usercontroller');
const router = express.Router();
const bcrypt = require('bcrypt');
const validateApiKey = require('./../middleware/APIauth'); // Import the middleware function
//const { generateApiKey } = require('./../middleware/apiKeyGenerator'); 

router.get('/record/:userid', validateApiKey,controller.getRecord);
router.post('/login', controller.postLogin);
router.post('/postSnapshot/:userid',validateApiKey, controller.postNewSnapshot);
router.get('/history/:userid',validateApiKey, controller.getHistory);
router.get('/dashboard/:userid', validateApiKey, controller.getDashboard);
router.get('/getemotionalvalues/:userid',validateApiKey, controller.getemotionalValues)
router.get('/api/apiKey', controller.getAPIkey);




module.exports = router;