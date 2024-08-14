const { check } = require('express-validator')

exports.registerValidator = [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include valid email').isEmail(),
    check('phone', 'Insert Correct Phone no').isLength({
        min: 11,
        max: 11
    }),
    check('password', 'Pass must be greater than 6 Characters (must conatin : 1 Uppercase , 1 Lowercase , 1 number & 1 special character)').isStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
    }),
    check('image').custom((value, { req }) => {
        if (req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/png') {
            return true;

        } else {
            return false;
        }
    }).withMessage("Please Upload : jpeg & PNG")
]


exports.mailVerificationValidator = [
    check('email', 'Please include valid email').isEmail(),

]

exports.passwordResetValidator = [
    check('email', 'Please include valid email').isEmail(),

]

exports.loginValidator = [
    check('email', 'Please include valid email').isEmail().normalizeEmail({ gmail_remove_dots: true }),
    check('password', 'Password is required').not().isEmpty(),
]

exports.updateProfileValidator = [
    check('name', 'Name is required').not().isEmpty(),
    check('phone', 'Insert Correct Phone no').isLength({
        min: 11,
        max: 11
    }),
    
  
]
