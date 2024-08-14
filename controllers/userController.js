const { validationResult } = require("express-validator");
const bcrypt = require('bcrypt');
const randomstring = require('randomstring')
const jwt = require('jsonwebtoken')
const path = require('path');



//importing models
const User = require("../models/userModel");
const PasswordReset = require("../models/passReset");
const Blacklist = require("../models/blacklist");


//importing helpers 

const mailer = require("../helpers/mailer");
const { deleteFile } = require("../helpers/deleteFile");


//User Register
const userRegister = async (req, res) => {
    try {
        const errors = validationResult(req);


        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: "Errors Found",
                errors: errors.array()
            });

        }
        //getting data through body
        const { name, email, phone, password } = req.body;

        //checking if email already exist in DB or not
        const isExists = await User.findOne({ email })

        if (isExists) {
            return res.status(400).json({
                success: false,
                msg: "Email Already Exists"
            });

        }


        //hashing pass (10 is SaltRounds defining level of password encryption 10 is highest)
        const hashPass = await bcrypt.hash(password, 10)

        //sending data and storing in DB

        const user = new User({
            //if key and value are same then use only once
            name,
            email,
            phone,
            password: hashPass,
            image: 'images/' + req.file.filename
        })
        const userData = await user.save();

        //Email Verification
        const msg = '<p>Hi ! ,' + name + ' Please <a href="http://localhost:3001/mail-verification?id=' + userData._id + '">Verify Your Email</a> </p>'


        mailer.sendMail(email, 'Mail Verification', msg);


        return res.status(200).json({
            success: true,
            msg: "User Created Successfully!",
            user: userData

        });
    }
    catch (err) {
        return res.status(400).json({
            success: false,
            msg: err.message
        });
    }

}


//Email Verification
const mailVerification = async (req, res) => {
    try {
        if (req.query.id == undefined) {
            return res.render('404')

        }
        const userData = await User.findOne({ _id: req.query.id })
        if (userData) {
            //if mail already verfied
            if (userData.is_Verified == 1) {
                return res.render('mail-verification', { message: 'already verified' })
            }
            //update verfied user in DB 
            await User.findByIdAndUpdate({ _id: req.query.id }, {

                $set: {
                    is_Verified: 1
                }
            })
            return res.render('mail-verification', { message: 'Mail has been verified' })

        }
        else {
            //if user not found
            return res.render('mail-verification', { message: 'User Not Found' })
        }
    }
    catch (err) {
        //if user id is not correct 
        console.log(err);
        return res.render('404')


    }
}


//Send Mail Verification

const sendMailVerification = async (req, res) => {
    try {
        const errors = validationResult(req);


        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: "Errors Found",
                errors: errors.array()
            });
        }
        const { email } = req.body;

        const userData = await User.findOne({ email });

        if (!userData) {
            return res.status(400).json({
                success: false,
                msg: "Email doesnt exist"
            });
        }

        if (userData.is_Verified == 1) {
            return res.status(400).json({
                success: false,
                msg: userData.email + "Already Verfied !"
            });
        }

        //after checking all cases sending verification email

        const msg = '<p>Hi ! ,' + userData.name + ' Please <a href="http://localhost:3001/mail-verification?id=' + userData._id + '">Verify Your Email</a> </p>'

        mailer.sendMail(email, 'Mail Verification', msg);


        return res.status(200).json({
            success: true,
            msg: "Verification link send to Email !",
            user: userData

        });

    }
    catch (err) {
        //if user id is not correct 
        return res.status(400).json({
            success: false,
            msg: err.message
        });


    }


}


//Send Forgot pass mail

const forgotPassword = async (req, res) => {
    try {
        const errors = validationResult(req);


        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: "Errors Found",
                errors: errors.array()
            });
        }
        const { email } = req.body;

        const userData = await User.findOne({ email });

        if (!userData) {
            return res.status(400).json({
                success: false,
                msg: "Email doesnt exist"
            });
        }

        //after checking all cases sending forgot pass email

        const generatedString = randomstring.generate();

        const msg = '<p>Hi ! ,' + userData.name + ' Please <a href="http://localhost:3001/reset-password?token=' + generatedString + '">Click Here</a> to reset your password </p>'
        await PasswordReset.deleteMany({ user_id: userData._id })
        const passwordReset = new PasswordReset({
            user_id: userData._id,
            token: generatedString
        })

        await passwordReset.save();

        mailer.sendMail(userData.email, 'Reset Pasword', msg);


        return res.status(200).json({
            success: true,
            msg: "Password Link Sent !",
            user: userData

        });

    }
    catch (err) {
        //if user id is not correct 
        return res.status(400).json({
            success: false,
            msg: err.message
        });


    }
}

//Reset Pass

const resetPassword = async (req, res) => {
    try {

        if (req.query.token == undefined) {
            return res.render('404')
        }
        const resetData = await PasswordReset.findOne({ token: req.query.token })

        if (!resetData) {
            return res.render('404')
        }

        return res.render('reset-password', { resetData })

    }
    catch (err) {
        //if user id is not correct 
        console.log(err);
        return res.render('404')



    }
}

//Update Pass

const updatePassword = async (req, res) => {
    try {

        const { user_id, password, c_password } = req.body;
        const resetData = await PasswordReset.findOne({ user_id })


        if (password != c_password) {
            return res.render('reset-password', { resetData, error: 'Confirm Password must be same' })
        }

        const hashedPass = await bcrypt.hash(c_password, 10)
        await User.findByIdAndUpdate({ _id: user_id }, {
            $set: {
                password: hashedPass
            }
        })

        await PasswordReset.deleteMany({ user_id });

        return res.redirect('/reset-success')

    }
    catch (err) {
        //if user id is not correct 
        console.log(err);
        return res.render('404')



    }
}

//reset success 
const resetSuccess = async (req, res) => {
    try {


        return res.render('reset-success')

    }
    catch (err) {
        //if user id is not correct 
        console.log(err);
        return res.render('404')



    }
}

//JWT Access Token Generate 

const generateAccessToken = async (user) => {
    const token = jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: "2h"
    })
    return token;
}

const generateRefreshToken = async (user) => {
    const token = jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: "12h"
    })
    return token;
}

//Login User 
const loginUser = async (req, res) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {

            return res.status(400).json({
                success: false,
                msg: 'Errors Found',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        const userData = await User.findOne({ email })

        if (!userData) {
            return res.status(400).json({
                success: false,
                msg: 'Email or Password is Incorrect'
            });

        }

        const passMatch = await bcrypt.compare(password, userData.password)

        if (!passMatch) {
            return res.status(400).json({
                success: false,
                msg: 'Email or Password is Incorrect'
            });
        }

        if (userData.is_Verified == 0) {
            return res.status(400).json({
                success: false,
                msg: 'Please Verify Email First'
            });

        }

        //generating token for specific user

        const accessToken = await generateAccessToken({ user: userData });
        const resfreshToken = await generateRefreshToken({ user: userData });

        return res.status(200).json({
            success: true,
            msg: "Login Seccessfully!",
            user: userData,
            accessToken: accessToken,
            resfreshToken: resfreshToken,
            tokenType: "Bearer"
            // The "Bearer" is simply the person or entity that presents the token to the server or resource.
        });



    }
    catch (err) {
        //if user id is not correct 
        return res.status(400).json({
            success: false,
            msg: err.message
        });


    }
}

//User Profile

const userProfile = async (req, res) => {
    try {

        const userData = req.user.user
        return res.status(200).json({
            success: true,
            msg: 'User Profile',
            data: userData
        });



    }
    catch (err) {
        //if user id is not correct 
        console.log(err);
        return res.status(400).json({
            success: false,
            msg: err.message
        });



    }
}

//Update Profile

const updateProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {

            return res.status(400).json({
                success: false,
                msg: 'Errors Found',
                errors: errors.array()
            });
        }

        const { name, phone } = req.body;
        const data = {
            name,
            phone
        }

        if (req.file !== undefined) {
            data.image = 'images/' + req.file.filename;
            const oldUser = await User.findOne({ _id: req.user.user._id })
            const oldFilePath = path.join(__dirname, '../public/' + oldUser.image);

            deleteFile(oldFilePath);
        }

        const userData = await User.findByIdAndUpdate({ _id: req.user.user._id }, {
            $set: data


        }, {
            new: true
            //this will provide new updated data
        })
        return res.status(400).json({
            success: true,
            msg: "User Updated Succesfully",
            user: userData

        });



    }
    catch (err) {
        //if user id is not correct 
        console.log(err);
        return res.status(400).json({
            success: false,
            msg: err.message
        });



    }
}

//Refresh Token

const refreshToken = async (req, res) => {
    try {

        const userId = req.user.user._id;

        const userData = await User.findOne({ _id: userId })

        const accessToken = await generateAccessToken({ user: userData });

        const resfreshToken = await generateRefreshToken({ user: userData });

        return res.status(200).json({
            success: true,
            msg: 'Token Resfreshed',
            accessToken: accessToken,
            resfreshToken: resfreshToken,
        });



    }
    catch (err) {
        //if user id is not correct 
        console.log(err);
        return res.status(400).json({
            success: false,
            msg: err.message
        });



    }
}


//Logout

const logout = async (req, res) => {
    try {



        const token = req.body.token || req.query.token || req.headers["authorization"]


        const bearer = token.split(' ');
        //after spliting [bearer] [Token_Value]

        //storing splitied token value
        const bearerToken = bearer[1];

        const newBlacklist = new Blacklist({
            token: bearerToken
        });

        await newBlacklist.save();
        res.setHeader('Clear-Site-Data', '"cookies","storage"')


        return res.status(200).json({
            success: true,
            msg: 'Logged out !',

        });



    }
    catch (err) {
        //if user id is not correct 
        console.log(err);
        return res.status(400).json({
            success: false,
            msg: err.message
        });



    }
}


module.exports = {
    userRegister,
    mailVerification,
    sendMailVerification,
    forgotPassword,
    resetPassword,
    updatePassword,
    resetSuccess,
    loginUser,
    userProfile,
    updateProfile,
    refreshToken,
    logout
}