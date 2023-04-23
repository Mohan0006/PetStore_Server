const Order = require('../models/order');
const Product = require('../models/product');

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const order = require('../models/order');

// Create a new order  => api/v1/order/new
exports.newOrder = catchAsyncErrors( async(req, res, next) =>{
   
    // console.log(req.body.user);
    console.log(req.body);

    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxprice,
        shippingPrice,
        totalPrice,
        paymentInfo

    } = req.body.order;

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxprice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
         user: req.body.user._id
    })

    res.status(200).json({
      success: true,
      order
    })
})

// get single order  => /api/v1/order/:id
exports.getSingleOrder =  catchAsyncErrors(async(req, res, next) =>{
    const order = await Order.findById(req.params.id).populate('user', 'name email')

    if(!order){
        return next(new ErrorHandler('no order found with this ID', 404))
    }
    res.status(200).json({
        success: true,
        order
    })
})
// get logged in user orders  => /api/v1/orders/me
exports.myOrders =  catchAsyncErrors(async(req, res, next) =>{

    console.log(req.body);
    const orders = await Order.find({user: req.body._id})
    console.log(orders);

    res.status(200).json({
        success: true,
        orders
    })
})
// get all orders  => /api/v1/admin/orders
exports.allOrders =  catchAsyncErrors(async(req, res, next) =>{
    const orders = await Order.find()

     let totalAmount = 0;

     orders.forEach(order => {
        totalAmount += order.totalPrice
     })

    
    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
})

// update / process order - ADMIN  => /api/v1/admin/order/:id
exports.updateOrder =  catchAsyncErrors(async(req, res, next) =>{
    const order = await Order.findById(req.params.id)


if(order.orderStatus === 'Deliverd') {
    return next(new ErrorHandler('order already deliverd',400))
}
    order.orderItems.forEach(async item =>{
        await updateStock(item.product, item.quantity)
    })
     order.orderStatus =  req.body.status,
     order.deliveredAt = Date.now()
     await order.save()


    res.status(200).json({
        success: true,
       
    })
})

async function updateStock(id, quantity){
    const product = await Product.findById(id);
    product.stock = product.stock - quantity;
    await product.save({ validateBeforeSave: false  })
}

// delete order  => /api/v1/admin/order/:id
exports.deleteOrder =  catchAsyncErrors(async(req, res, next) =>{
    const order = await Order.findById(req.params.id)


    if(!order){
        return next(new ErrorHandler('no order foung with this ID', 404))
    }

     await order.remove()
    res.status(200).json({
        success: true,
        order
    })
})