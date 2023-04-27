const Product = require('../models/product')
const redis = require("redis");
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors') 
const APIFeatures = require('../utils/apiFeatures');

const cloudinary = require("cloudinary")
const client = require('../config/redis');


/**
 * @swagger
 * components:
 *   schemas:
 *     NewUser:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 *           format: password
 */

/**
 * @swagger
 * /api/v1/products
 *  get: 
 *   summary: Returns the list of products
 *   responses:
 *      200:
 *      description: The list of products 
 */







// Create new product => /api/v1/admin/product/new
exports.newProduct = catchAsyncErrors(async(req,res,next) => {
    console.log("****************************** Create New Product *************************");
    client.del("products")
    let images = []
    try{
        if(req.body.images){
            if(typeof req.body.images === 'string'){
                images.push(req.body.images)
            }
            else{
                images = req.body.images
            }
            let imageLinks = [];
            console.log(req.body);
            for(let i=0;i<images.length;i++){
              const result = await cloudinary.v2.uploader.upload(images[i],{
                folder:'petstore'
              });
              imageLinks.push({
                public_id : result.public_id,
                url : result.secure_url
              })
            }
            const product = await Product.create({
                name: req.body.name,
                price : req.body.price,
                description: req.body.description,
                category : req.body.category,
                ratings: 0,
                images: {
                    public_id: imageLinks.public_id,
                    url: (imageLinks[0].url)?imageLinks[0].url:"https://res.cloudinary.com/dzigorjli/image/upload/v1667126506/avatars/default_avatar_mzcyda.jpg"
                },
                animal : req.body.animal,
                stock : req.body.stock,
                seller : req.body.seller
            
            })
            console.log("DONE");
            res.status(201).json({
                success: true,
                product
            })
        }
        else{
            const product = await Product.create({
                name: req.body.name,
                price : req.body.price,
                description: req.body.description,
                category : req.body.category,
                ratings: 0,
                images: {
                    url:"https://res.cloudinary.com/dzigorjli/image/upload/v1667126506/avatars/default_avatar_mzcyda.jpg"
                },
                animal : req.body.animal,
                stock : req.body.stock,
                seller : req.body.seller
            
            })
            console.log("DONE");
            res.status(201).json({
                success: true,
                product
            })
        }
    }
    catch(e){
        console.log(e);
    }
   
   
})




//get all products => /api/v1/products 
exports.getProducts = catchAsyncErrors(async (req,res,next) =>{
    const resPerPage = 10;
    const productsCount = await Product.countDocuments();
    
    const apiFeatures = new APIFeatures(Product.find(), req.query)
                        .search()
                        .filter()
                        // .pagination(resPerPage)
    console.log(req.query);
    try{
       if(!req.query){
        const cached_data=await client.get("products");
        if(cached_data){
            console.log("Data is coming from redis")
            res.status(200).json(JSON.parse(cached_data))
        }
       
        else{
            console.log("Data is not coming from redis")
            let products = await apiFeatures.query;
            let filteredProductCount = products.length;
            apiFeatures.pagination(resPerPage )
            products = await apiFeatures.query.clone();
            const val = {
                
                    success: true,
                    productsCount,
                    resPerPage,
                    filteredProductCount,
                    products
                
            };
            client.set("products",JSON.stringify(val))
            res.status(200).json({
                success: true,
                productsCount,
                resPerPage,
                filteredProductCount,
                products
            })
        }
        
        }
        else{
            const cached_data=await client.get("products");
            if(cached_data){
                client.del("products")
            }
            client.del("products")
            console.log("Data is not coming from redis")
            let products = await apiFeatures.query;
            let filteredProductCount = products.length;
            apiFeatures.pagination(resPerPage )
            products = await apiFeatures.query.clone();
            const val = {
                
                    success: true,
                    productsCount,
                    resPerPage,
                    filteredProductCount,
                    products
                
            };
            client.set("products",JSON.stringify(val))
            res.status(200).json({
                success: true,
                productsCount,
                resPerPage,
                filteredProductCount,
                products
            })
        }
    }catch(error){
        res.status(500).json(error)
        console.log(error);
    }
    
    
})





//get Admin products 
exports.getAdminProducts = catchAsyncErrors(async (req,res,next) =>{
   
     const products = await Product.find();
    //  console.log(products);
        res.status(200).json({
            success: true,
            products
        })

    
    
})






//get single products details => /api/v1/product/:id


exports.getSingleProduct = catchAsyncErrors(async(req,res,next)=>{

    const product =await Product.findById(req.params.id)

    if(!product){
        return next(new ErrorHandler('Product not found', 404));
    }


    res.status(200).json({
        success: true,
        product
    })
})

//update Product => /api/v1/admin/product/:id
exports.updateProduct = catchAsyncErrors(async(req,res,next) =>{
    client.del("products")
    console.log("I'm in Update");
    let product =await Product.findById(req.params.id)
    console.log(product);
    if(!product){
        return next(new ErrorHandler('Product Not found', 404));
    }
    let images = []
    let imageLinks = [];

  if(req.body.images){
    if(typeof req.body.images === 'string'){
        images.push(req.body.images)
    }
    else{
        images = req.body.images
    }
    for(let i=0;i<images.length;i++){
      const result = await cloudinary.v2.uploader.upload(images[i],{
        folder:'petstore'
      });
      imageLinks.push({
        public_id : result.public_id,
        url : result.secure_url
      })
    }
}else{
    imageLinks.push({
        public_id : product.images[0].public_id,
        url : product.images[0].url
      })
}
    console.log("---------------------------------------------------------------------------");
    console.log(req.body);
    product = await Product.findByIdAndUpdate(req.params.id, { name: req.body.name,
        price : req.body.price,
        description: req.body.description,
        category : req.body.category,
        ratings: 0,  
        images: {
            public_id: imageLinks.public_id,
            url: (imageLinks[0].url)?imageLinks[0].url:"https://res.cloudinary.com/dzigorjli/image/upload/v1667126506/avatars/default_avatar_mzcyda.jpg"
        },
        animal : req.body.animal,
        stock : req.body.stock,
        seller : req.body.seller},
        {
        new:true,
        runValidators:true,
        useFindAndModify:false
    });

    res.status(200).json({
        success:true,
        product
    })
})

//Delete Product => /api/v1/admin/product/:id
exports.deleteProduct = catchAsyncErrors(async(req,res,next)=>{
    client.del("products")
    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler('Product not found', 404));
    }
    
    // for(let i=0;i<product.images.length;i++){
    //     const result = await cloudinary.v2.uploader.destroy(product.images[i].public_id)
    // }


    await product.remove();

    res.status(200).json({
        success: true,
        message: 'product is deleted'
    })

})


// create new review   => /api/v1/review
exports.createProductReview = catchAsyncErrors( async (req, res, next) => {
    client.del("products")
    const { rating, comment, productId} = req.body;
    const review = {
        user: req.body.userId,
        name: req.body.userName,
        rating: Number(rating),
        comment
    }
    console.log("---------------\n\n");
    console.log(productId);
    const product = await Product.findById(productId);
    console.log(product);
    product.reviews.push(review);
    product.numOfReview = product.reviews.length
    product.ratings = product.reviews.reduce((acc,item) => item.rating + acc, 0) / product.reviews.length
    await product.save({ validateBeforeSave: false});
    console.log("DOne!");
    res.status(200).json({
        success: true
    })
    
})


// get product reviews   => /api/v1/ reviews
  exports.getProductReviews = catchAsyncErrors(async (req,res,next) => {
    const product = await Product.findById(req.query.id);
     
    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
  })
  // delete product reviews   => /api/v1/ reviews
  exports.deleteReview = catchAsyncErrors(async (req,res,next) => {
    client.del("products")
    const product = await Product.findById(req.query.productId);
    console.log(product);
    const reviews = product.reviews.filter( review => review._id.toString()  !== req.query.id.
     toString());
    
     const numOfReviews =  reviews.length;

    const ratings = product.reviews.reduce((acc,item) => item.rating + acc, 0) /reviews.lenght
     await Products.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews},
        {
            new: true,
            runValidators: true,
            useFindAndModify: false
     })

    res.status(200).json({
        success: true,
       
    })
  })