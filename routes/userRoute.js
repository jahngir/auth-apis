const express = require('express');
const path = require('path');
const multer = require('multer');
const router = express();

//data will be transfered in JSON Format
router.use(express.json());

//configure multer for file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //validation added to check File Type
        if (file.mimetype === 'image/jpeg' | file.mimetype === 'image/png') {
            cb(null, path.join(__dirname, '../public/Images'))
        }
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name)
    }

})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' | file.mimetype === 'image/png') {

        cb(null, true);
        console.log("File check done")
    } else {
        cb(null, false);
        console.log("File check failed")
    }
}

//defining multer to use storage as storage created above to save files
const upload = multer({
    storage: storage,
    fileFilter: fileFilter

})


//importing Middlewares
const auth = require('../middleware/auth');

//importing Controller 
const userController = require('../controllers/userController');

//importing Helpers
const { registerValidator, mailVerificationValidator, passwordResetValidator, loginValidator, updateProfileValidator } = require('../helpers/validation');




// *********** ---------------------------------*********** 

//Creating User API 
router.post('/register', upload.single('image'), registerValidator, userController.userRegister)


//creting mail verification API

router.post('/send-mail-verification', mailVerificationValidator, userController.sendMailVerification)


//Creating Pass Reset API
router.post('/forgot-password', passwordResetValidator, userController.forgotPassword)

//Creating Login API
router.post('/login', loginValidator, userController.loginUser)


//*********** Authenticated Routes ***********

//Creating Profile API
router.get('/profile', auth, userController.userProfile)

//Creating Update Profile API
router.post('/update-profile', auth, upload.single('image'), updateProfileValidator, userController.updateProfile)

//Creating Refresh Token  API
router.get('/refresh-token', auth, userController.refreshToken)

//Creating Logout  API
router.get('/logout', auth, userController.logout)

module.exports = router