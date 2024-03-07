const express = require('express');
const controller = require('./../controllers/moodcontrollers');
const router = express.Router();
const validateApiKey = require('./../middleware/APIauth'); 


router.get('/selectedMood/:moodId/:trigger?',validateApiKey, controller.getSelectedMood);
router.delete('/deleteSnapshot/:moodId', controller.deleteMood);
router.put('/updateTriggers/:moodId', controller.updateMood);
router.post('/register', controller.postRegister);
router.get('/getcontextualtriggers', controller.getContextualTriggers);
router.post('/forgetpassword', controller.postForgetPassword);






module.exports = router;