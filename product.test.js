const mongoose = require("mongoose");
const request = require("supertest");
const app = require("./app");

console.log("***************************** Testing Phase *****************************");

require("dotenv").config();

/* Connecting to the database before each test. */
beforeEach(async () => {
    mongoose.connect(process.env.DB_LOCAL_URI,{
         useNewUrlParser:true,
         useUnifiedTopology:true,
        
    })
    .then(con =>{
        console.log(`MongoDB Database connected with Host :${con.connection.host}`)
    })
  });
  


describe("GET /api/v1/products", () => {
    it("should return all products", async () => {
      const res = await request(app).get("/api/v1/products");
      expect(res.statusCode).toBe(200);
      expect(res.body.productsCount).toBeGreaterThan(0);
    });
  });

  describe("GET /api/v1/product/:id", () => {
    it("should return a product", async () => {
      const res = await request(app).get("/api/v1/product/635d5437aa2f80660653f747");
      expect(res.statusCode).toBe(200);
      expect(res.body.product.name).toBe("fish tank");
    });
  });
  
  describe("GET /api/v1/admin/orders", () => {
    it("should return a product", async () => {
      const res = await request(app).get("/api/v1/admin/orders");
      expect(res.statusCode).toBe(200);
    });
  });


  describe("GET /api/v1/admin/orders" ,()=>{
    it("should return all orders", async () => {
        const res = await request(app).get("/api/v1/admin/orders");
        expect(res.statusCode).toBe(200);
      });
  })

  describe("GET /api/v1/order/:id" ,()=>{
    it("should return all orders", async () => {
        const res = await request(app).get("/api/v1/order/635f51cfe650d867bcba299d");
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
      });
  })



  describe("GET /api/v1/order/:id" ,()=>{
    it("should return the specific mentioned order", async () => {
        const res = await request(app).get("/api/v1/order/635f51cfe650d867bcba299d");
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
      });
  })
  

  describe("GET /api/v1/admin/users" ,()=>{
    it("should return all users registered", async () => {
        const res = await request(app).get("/api/v1/admin/users");
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
      });
  })

   
  describe("GET /api/v1/admin/user/:id" ,()=>{
    it("should return the specific user", async () => {
        const res = await request(app).get("/api/v1/admin/user/643f91ea5dc7a472b59b547c");
        expect(res.statusCode).toBe(200);
        expect(res.body.user.name).toBe('Mohan');
      });
  })

  describe("GET /api/v1/me/:id" ,()=>{
    it("should return the specific user", async () => {
        const res = await request(app).get("/api/v1/admin/user/643f91ea5dc7a472b59b547c");
        console.log(res.body.user);
        expect(res.statusCode).toBe(200);
        expect(res.body.user.name).toBe('Mohan');
      });
  })

  




//   /* Closing database connection after each test. */
//   afterEach(async () => {
//     await mongoose.connection.close();
//   });
