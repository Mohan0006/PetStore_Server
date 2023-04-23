const mongoose = require('mongoose')

const productSchema=new mongoose.Schema({
     name: {
        type: String,
        required: [true,'please enter product name'],
        trim: true,
        maxLength: [100,'Product name cannot exceed 100 characters']
     },
     price: {
        type: Number,
        required: [true,'please enter product Price'],
        maxLength: [5,'Product name cannot exceed 100 characters'],
        default: 0.0
     },
     description: {
        type:String,
        required: [true,'please enter product description'],
     },
     ratings: {
        type: Number,
        default: 0
     },
     images: [
        {
            public_id: {
                type: String,
                required: false
            },
            url: {
                type: String,
                required: false
            },
        }
     ],
     category: {
        type: String,
        required: true,
        
     },
     animal: {
      type: String,
      required: true,
   },
     stock: {
        type: Number,
        required: true,
        default: 0
     },
     numofReviews: {
        type: Number,
        default: 0
     },
     reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: false
            },
            name: {
                type: String,
                required: false
            },
            rating: {
                type: Number,
                required: false
            },
            comment: {
                type: String,
                required: false
            }
        }    
     ],
   //   user: {
   //      type: mongoose.Schema.ObjectId,
   //      ref: 'User',
   //      required: true
   //  },
     createdAt: {
        type: Date,
        default: Date.now
     }
})

module.exports = mongoose.model('product',productSchema)