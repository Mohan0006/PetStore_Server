const express =  require('express')
const router =  express.Router();

const { newOrder,
     getSingleOrder,
      myOrders ,
     allOrders, 
     updateOrder, 
     deleteOrder
    } = require('../controllers/orderController')

// const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth')

router.route('/order/new').post(newOrder);
router.route('/order/:id').get(getSingleOrder);
router.route('/orders/me').post(myOrders);
-
router.route('/admin/orders/').get(allOrders);
router.route('/admin/order/:id')
                     .put(updateOrder)
                     .delete(deleteOrder);

module.exports = router;