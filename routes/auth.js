const express = require('express');
const router = express.Router();

const { 
    registerUser, 
    loginUser, 
    forgotPassword, 
    resetPassword, 
    getUserProfile,
    updatePassword,
    updateProfile,
    logout,
    allUsers,
    getUserDetails,
    updateUser,
    deleteUser
} = require('../controllers/authController');


const multer  = require('multer');




const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });



const upload = multer({ storage });


router.route('/register').post(function (req, res, next) {
    next();   
}
)
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

router.route('/password/forgot').post(forgotPassword)
router.route('/password/reset/:token').put(resetPassword)

router.route('/logout').get(logout);


router.route('/me').post(getUserProfile)


router.route('/password/update').put(updatePassword)


router.route('/me/update').put(updateProfile)



 router.route('/admin/users').get(allUsers)
 router.route('/admin/user/:id')
                .get(getUserDetails)
                .put(updateUser)
                .delete(deleteUser)
 module.exports = router;