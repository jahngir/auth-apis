const express = require('express');
const router = express();
const bodyParser = require('body-parser')

//data will be transfered in JSON Format
router.use(express.json());

//adding body parser to fetch data from form body
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }))

//importing Controller 
const userController = require('../controllers/userController');


//importing Helpers



//Creating User API 

router.get('/mail-verification', userController.mailVerification)


//Creating reset pass API
router.get('/reset-password', userController.resetPassword)

router.post('/reset-password', userController.updatePassword)
router.get('/reset-success', userController.resetSuccess)



module.exports = router