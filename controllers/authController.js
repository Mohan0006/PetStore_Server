const User = require('../models/user');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const cloudinary = require('cloudinary')
const crypto = require('crypto');
const { send } = require('process');








// Register a user  => /api/v1/register
exports.registerUser = (async(req, res,next) => {
    
    let result = '';
    try{ 
     if (req.body.avatar) {
        result = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: 'profiles',
            width: 150,
            crop: "scale"
        })
     }
    }
    catch(e){
        Error("Bad Image Found!");
    }

    const { name, email, password ,phone} = req.body;
    // console.log(name,email,password);
    let user;
    // console.log(result);
    if (result) {
        user = await User.create({
            name,
            email,
            password,
            avatar: {
                public_id: result.public_id,
                url: (result.secure_url)?result.secure_url:"https://res.cloudinary.com/dzigorjli/image/upload/v1667126506/avatars/default_avatar_mzcyda.jpg"
            },
            phone
        })
    }
    else {

        user = await User.create({
            name,
            email,
            password,
            phone
        })
    }
    // try{
    //     next(upload.single(req.body.avatar));
    // }
    // catch(e){
    //     console.log(e);
    // }
    
    sendToken(user, 200, res)
    });
    

//Login user => /api/v1/login
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    //Checks if email and password is entered by user
    if (!email || !password) {
        return next(new ErrorHandler('Please enter email & password', 400))
    }

    // Finding user in database
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
        return next(new ErrorHandler('Invalid Email or Password', 401));
    }

    //Check if password is corrector not 
    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid Email or Password', 401));
    }

    sendToken(user, 200, res)
})

// Forgot password  => /api/v1/password/forgot
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler('User not found with this email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset Password url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;

    const message = `Your Password reset token is as follows:\n\n${resetUrl}\n\nIfyou have not requestes this email, then ignore it.`

    try {

        await sendEmail({
            email: user.email,
            subject: 'Petstore password Recovery',
            message
        })

        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`
        })

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500))

    }
})

// Reset Password   =>  /api/v1/password/reset/:token
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {

    // Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
        return next(new ErrorHandler('Password reset token is invalid or has been expired', 400))
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('Password does not match', 400))
    }

    // Setup new password
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res)

})

// get currently logged in user detailes  =>  /api/v1/me
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.body._id);
    if(!user.avatar){
      user.avatar = {
        
            public_id: 'petstore/Photo-Oct-29-4-00-33-PM-copy_oihbz0',
            url: 'https://res.cloudinary.com/dzigorjli/image/upload/v1667036446/petstore/Photo-Oct-29-4-00-33-PM-copy_oihbz0.jpg'
          
      }
    }
    console.log(user);
    res.status(200).json({
        success: true,
        user
    })
})
// Update  / change password  =>  /api/v1/password/update

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {


    const user = await User.findById(req.body._id).select('+password')
    // check previous users password    


    const isMatched = await user.comparePassword(req.body.oldPassword)


    if (!isMatched) {

        return next(new ErrorHandler('old password is incorrect'));
    }

    user.password = req.body.password;

    await user.save();

    sendToken(user, 200, res)
})


// update user profile   =>  /api/v1/me/update

exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone
    }
    console.log(req.body._id);
    // Update avatar
    if (req.body.avatar) {
        const user = await User.findById(req.body._id)

        const image_id = user.avatar.public_id;
        if(image_id){
        const res = await cloudinary.v2.uploader.destroy(image_id);
        }
        const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: 'avatars',
            width: 150,
            crop: "scale"
        })

        newUserData.avatar = {
            public_id: result.public_id,
            url: result.secure_url
        }
    }

    const user = await User.findByIdAndUpdate(req.body._id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    res.status(200).json({
        success: true
    })


})



// Logout user   => /api/v1/logout
exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: 'Logged out'
    })


})


// Admin Routers

// Get all users  => /api/v1/admin/users
exports.allUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    })

})



//get user details  =>   /api/v1/admin/user/:id


exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);



    if (!user) {
        return next(new ErrorHandler(`user does not found with id: ${req.params.id} `))
    }

    res.status(200).json({
        success: true,
        user
    })

})
// update user profile   =>  /api/v1/admin/user/:id

exports.updateUser = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    // if (req.body.avatar !== '') {
        const user_ = await User.findById(req.params.id)
        
        newUserData.avatar = {
            public_id: user_.avatar.public_id,
            url: user_.avatar.secure_url
        }
    // }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    res.status(200).json({
        success: true
    }) 


})

// Delete user =>   /api/v1/admin/user/:id


exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`user does not found with id: ${req.params.id} `))
    }

    // remove avatar from cloudinary -todo

    await user.remove();

    res.status(200).json({
        success: true,

    })

})

