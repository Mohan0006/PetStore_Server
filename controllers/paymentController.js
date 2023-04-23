const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
 
console.log(process.env.STRIPE_SECRET_KEY);
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Process Stripe Payments => /api/v1/payment/process

exports.processPayment = catchAsyncErrors(async(req,res,next)=>{

    console.log(req.body);

    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: 'inr',

        metadata: { integration_check: 'accept_a_payment' }
    });

    res.status(200).json({
        success : true,
        client_secret: paymentIntent.client_secret
    })

}) 


// Send Stripe API Key => /api/v1/stripeapi

exports.sendStripeAPI = catchAsyncErrors(async(req,res,next)=>{
   
    res.status(200).json({
        stripeAPIKey:process.env.STRIPE_API_KEY
    })

}) 