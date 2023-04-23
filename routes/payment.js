const express =  require('express')
const router =  express.Router();

const { 
    processPayment,
    sendStripeAPI
    } = require('../controllers/paymentController')



router.route('/payment/process').post(processPayment);
router.route('/stripeapi').get(sendStripeAPI);


module.exports = router;