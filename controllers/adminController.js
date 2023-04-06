const userSchema = require('../models/userModel')
const categorySchema = require('../models/categoryModel')
const productSchema = require('../models/productModel')
const orderSchema = require('../models/orderModel')
const salesSchema = require('../models/salesReport')
const couponSchema = require('../models/couponModel')
const bannerSchema = require('../models/bannerModel')
const nodemailer = require('nodemailer')
const session = require('express-session')
const moment = require('moment');
const bcrypt = require('bcrypt')
const sharp = require('sharp')
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let msg
let message
let sw

////////LOGIN PAGE LODING////////////

const loginLoad = async (req, res) => {
    res.render('login', { msg })
    msg = null
}

/////////////ADMIN LOGIN////////////////////

const adminLogin = async (req, res) => {
    try {
        const adminMail = req.body.email
        const pass = req.body.password
        const adminData = await userSchema.findOne({ email: adminMail })

        if (adminMail.trim().length == 0 || pass.trim().length == 0) {
            res.redirect('/admin')
            msg = 'Fill all the fields'
        } else {
            if (adminData) {
                const comparePassword = await bcrypt.compare(pass, adminData.password)
                if (comparePassword) {
                    if (adminData.is_admin == 1) {
                        req.session.admin_id = adminData._id
                        res.redirect('/admin/home')
                    } else {
                        res.redirect('/admin')
                        msg = 'You are not an admin'
                    }
                } else {
                    res.redirect('/admin')
                    msg = 'Incorrect password'
                }
            } else {
                res.redirect('/admin')
                msg = 'Incorrect email'
            }
        }

    } catch (error) {
        console.log(error);
    }
}


///////////LOADIN HOME PAGE/////////////

const loadAdminHome = async (req, res) => {

    try {
        const users = await userSchema.find()
        const usersLength = users.length
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const weekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        const yearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

        const dailySalesReport = await salesSchema.aggregate([
            { $match: { date: { $gte: today } } },
            { $group: { _id: null, totalSales: { $sum: '$totalSales' }, totalItemsSold: { $sum: '$totalItemsSold' } } }
        ]);

        const weeklySalesReport = await salesSchema.aggregate([
            { $match: { date: { $gte: weekAgo } } },
            { $group: { _id: null, totalSales: { $sum: '$totalSales' }, totalItemsSold: { $sum: '$totalItemsSold' } } }
        ]);

        const yearlySalesReport = await salesSchema.aggregate([
            { $match: { date: { $gte: yearAgo } } },
            { $group: { _id: null, totalSales: { $sum: '$totalSales' }, totalItemsSold: { $sum: '$totalItemsSold' } } }
        ]);


    const yearlyStart = new Date(new Date().getFullYear(), 0, 1);
    const yearlyEnd = new Date(new Date().getFullYear(), 11, 31);
    let salesOfMonth
    let totalSalesOfMonth
    const yearlySalesData = await salesSchema.find({
    date: {
        $gte: yearlyStart,
        $lte: yearlyEnd,
      },
    })

    const monthlySalesDetails = [];
    const monthlyProducSales = []
    for (let i = 0; i < 12; i++) {
       salesOfMonth = yearlySalesData.filter((order) => {
        return order.date.getMonth() === i;
      });

     
      totalSalesOfMonth = salesOfMonth.reduce((total, order) => {
        return (
          total += order.totalSales
        )
      }, 0);
      let proCount
      proCount = 0
      productSalesOfMonth = salesOfMonth.reduce((total, order) => {
        
        return (
                proCount += order.totalItemsSold
        )
      }, 0);

      monthlySalesDetails.push(totalSalesOfMonth);
      monthlyProducSales.push(productSalesOfMonth)
    }
        const orders = await orderSchema.find().populate('userId').populate('item.product');
        res.render('home', { dailySalesReport, weeklySalesReport, yearlySalesReport, orders, message, usersLength ,monthlySalesReport:JSON.stringify(monthlySalesDetails),monthlyProductSales:JSON.stringify(monthlyProducSales)});
        message = null;
    } catch (error) {
        console.log(error);
    }

}

////////LOAD SALES REPORT PAGE//////////

const loadSalesPage = async (req, res) => {
    try {
  
      let filter = '';
      if (req.query.filter) {
        filter = req.query.filter;
      }

      let page = 1;
      if (req.query.page) {
        page = req.query.page;
      }
  
      let sales = [];
      let count
      if(filter === 'all'){
        sales = await salesSchema.find({}).populate('userId').limit(6).skip((page - 1) * 6).exec();
        count = await salesSchema.find({}).countDocuments()
      }else if (filter === 'weekly') {
        const startOfWeek = moment().startOf('week').toDate();
        const endOfWeek = moment().endOf('week').toDate();

        sales = await salesSchema
          .find({
            date: {
              $gte: startOfWeek,
              $lte: endOfWeek,
            },
          })
          .populate('userId').limit(6).skip((page - 1) * 6).exec();

          count = await salesSchema
          .find({
            date: {
              $gte: startOfWeek,
              $lte: endOfWeek,
            },
          }).countDocuments()

        }else if(filter === 'yearly'){
            const startOfYear = moment().startOf('year').toDate();
            const endOfYear = moment().endOf('year').toDate();
      
            sales = await salesSchema
              .find({
                date: {
                  $gte: startOfYear,
                  $lte: endOfYear,
                },
              })
              .populate('userId').limit(6).skip((page - 1) * 6).exec();
              count = await salesSchema
              .find({
                date: {
                  $gte: startOfYear,
                  $lte: endOfYear,
                },
              }).countDocuments()
        }else{
            sales = await salesSchema.find().populate('userId').limit(6).skip((page - 1) * 6).exec()
            count = await salesSchema.find().countDocuments()
        }
      res.render('salesReport', { sales,totalPages: Math.ceil(count / 6)});
    } catch (error) {
      console.log(error.message);
    }
  };



/////////////LOGOUT/////////////////

const adminLogOut = async (req, res) => {
    try {
        req.session.admin_id = null
        res.redirect('/admin')
    } catch (error) {
        console.log(error);
    }
}

///////////LOAD USERDATA/////////////

const loadUserData = async (req, res) => {
    try {
        let search = ''
        if (req.query.search) {
            search = req.query.search
        }
        var page = 1
        if (req.query.page) {
            page = req.query.page
        }

        const limit = 6

        const userData = await userSchema.find(
            {
                is_admin: 0,
                $or: [
                    { username: { $regex: '.*' + search + '.*', $options: 'i' } },
                    { email: { $regex: '.*' + search + '.*', $options: 'i' } }
                ]
            }).limit(limit).skip((page - 1) * limit).exec();

        const count = await userSchema.find(
            {
                is_admin: 0,
                $or: [
                    { username: { $regex: '.*' + search + '.*', $options: 'i' } },
                    { email: { $regex: '.*' + search + '.*', $options: 'i' } }
                ]
            }).countDocuments()

        for (i = 0; i < userData.length; i++) {
            if (userData[i].is_verified == 0) {
                userData[i].Status = 'Not verified'
            }
            else if (userData[i].is_blocked == 0) {
                userData[i].Status = 'Active'
            } else {
                userData[i].Status = 'Blocked'
            }
        }
        res.render('userData', { users: userData, totalPages: Math.ceil(count / limit), currentPage: page })
    } catch (error) {
        console.log(error);
    }
}


/////////////BLOCK USER///////////////

const blockUser = async (req, res) => {
    try {
        const id = req.query.id
        await userSchema.updateOne({ _id: new Object(id) }, { $set: { is_blocked: 1 } })
        const userData = await userSchema.findOne({ _id: id })
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'trendsetterfas@gmail.com',
                pass: process.env.EMAILPASS
            },
        });

        const mailOption = {
            from: 'trendsetterfas@gmail.com',
            to: userData.email,
            subject: 'Your Account has been Blocked',
            html: `<p>Hii ${userData.username}, Your account has been blocked by the Admin</p>`,
        };

        transporter.sendMail(mailOption, (error, info) => {
            if (error) {
                console.log(error.message);
                console.log('Email could not be sent');
            } else {
                console.log('Email has been sent:', info.response);
            }
        });
        res.redirect('/logOutIn')
    } catch (error) {
        console.log(error);
    }
}


//////////UNBLOCK USER////////////

const unblockUser = async (req, res) => {
    try {
        const id = req.query.id
        await userSchema.updateOne({ _id: new Object(id) }, { $set: { is_blocked: 0 } })
        res.redirect('/admin/userData')
    } catch (error) {
        console.log(error);
    }
}

///////////////SHOW PRODUCTS///////////////////

const loadProducts = async (req, res) => {
    try {
        let search = ''
        if (req.query.search) {
            search = req.query.search
        }
        var page = 1
        if (req.query.page) {
            page = req.query.page
        }

        const limit = 4
        const products = await productSchema.find(
            {
                $or: [
                    { title: { $regex: '.*' + search + '.*', $options: 'i' } },
                    { brand: { $regex: '.*' + search + '.*', $options: 'i' } }
                ]
            }).limit(limit).skip((page - 1) * limit).populate('category').exec();

        const count = await productSchema.find(
            {
                $or: [
                    { title: { $regex: '.*' + search + '.*', $options: 'i' } },
                    { brand: { $regex: '.*' + search + '.*', $options: 'i' } }
                ]
            }).countDocuments()
        res.render('products', { product: products, message, totalPages: Math.ceil(count / limit) })
        message = null
    } catch (error) {
        console.log(error);
    }
}

///////////DELETE PRODUCT//////////////////

const deleteProduct = async (req, res) => {
    try {
        const id = req.query.id
        const product = await productSchema.findOne({_id:id})
        if(product.is_show===true){
            await productSchema.updateOne({ _id: new Object(id) },{$set:{is_show:false}})
            res.redirect('/admin/products')
            message = 'Product Unlisted successfully'
        }else{
            await productSchema.updateOne({ _id: new Object(id) },{$set:{is_show:true}})
        res.redirect('/admin/products')
        message = 'Product Listed successfully'
        }
    } catch (error) {
        console.log(error);
    }
}
///////////////////LOAD EDIT PRODUCT PAGE//////////////////

const loadEditPage = async (req, res) => {
    try {
        const id = req.query.id
        const products = await productSchema.findOne({ _id: new Object(id) }).populate('category')
        const category = await categorySchema.find()
        res.render('editProduct', { product: products, category: category, msg })
        msg = null
    } catch (error) {
        console.log(error);
    }
}

///////////////ADD PRODUCT//////////////////

const newProduct = async (req, res) => {
    try {
        const category = await categorySchema.find()
        res.render('addProduct', { category: category, message, msg })
        message = null
        msg = null
    } catch (error) {
        console.log(error);
    }
}

///////////ADD PRODUCT///////////

const addProduct = async (req, res) => {
    try {
        const pro = req.body
        
        if (pro.title.trim().length == 0 || pro.brand.trim().length == 0 || pro.description.trim().length == 0 || req.files == 0) {
            msg = 'Full field should be filled'
            res.redirect('/admin/addProduct')
        } else {

            let image = req.files.map(file => file);
            for (i = 0; i < image.length; i++) {
                let path = image[i].path
                const processImage = new Promise((resolve, reject) => {
                    sharp(path).rotate().resize(270, 360).toFile('public/proImage/' + image[i].filename,(err) => {
                        sharp.cache(false);
                        if (err) {
                            console.log(err);
                            reject(err);
                        } else {
                            console.log(`Processed file: ${path}`);
                            resolve();
                        }
                    })
                });
                processImage.then(() => {
                    fs.unlink(path, (err) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(`Deleted file: ${path}`);
                        }
                    });
                }).catch((err) => {
                    console.log(err);
                });
            }

            const product = new productSchema({
                title: pro.title,
                brand: pro.brand,
                stocks: pro.stocks,
                price: pro.price,
                description: pro.description,
                category: pro.category,
                image: req.files.map(file => file.filename)
            })
            await product.save()

            message = 'Product added successfully'
            res.redirect('/admin/addProduct')
            
        }
    } catch (error) {
        console.log(error);
    }
}
////////EDIT PRODUCTS/////////////

const editProduct = async (req, res) => {
    try {
        const prod = req.body
        const id = req.query.id
        const catId = await categorySchema.findOne({category:prod.category})
        if (prod.title.trim().length == 0 || prod.price.trim().length == 0 || prod.stocks.trim().length == 0 || prod.category.length == 0 || prod.brand.trim().length == 0 || prod.description.trim().length == 0) {
            msg = 'Full field should be filled'
            res.redirect('/admin/products')
        } else {
            let newprod
            if (req.files !== 0) {
                let image = req.files.map(file => file);
                for (i = 0; i < image.length; i++) {
                    let path = image[i].path
                    const processImage = new Promise((resolve, reject) => {
                        sharp(path).rotate().resize(270, 360).toFile('public/proImage/' + image[i].filename,(err) => {
                            sharp.cache(false);
                            if (err) {
                                console.log(err);
                                reject(err);
                            } else {
                                console.log(`Processed file: ${path}`);
                                resolve();
                            }
                        })
                    });
                    processImage.then(() => {
                        fs.unlink(path, (err) => {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(`Deleted file: ${path}`);
                            }
                        });
                    }).catch((err) => {
                        console.log(err);
                    });
                    
                }
                newprod = await productSchema.updateOne({ _id: new Object(id) }, {
                    $set: {
                        title: prod.title,
                        brand: prod.brand,
                        description: prod.description,
                        category: catId._id,
                        stocks: prod.stocks,
                        price: prod.price,
                        image: req.files.map(file => file.filename)
                    }
                })
            } 
            message = 'Product edited successfully'
            res.redirect('/admin/products')
        }
    } catch (error) {
        console.log(error);
    }
}

//////////LOAD ADD CATEGORY////////////

const loadAddCategory = async(req,res)=>{
    try {
        res.render('addCategory',{msg})
        msg=null
    } catch (error) {
        console.log(error.message);
    }
}

////////////ADD CATEGORY///////////////

const addCategory = async (req, res) => {
    const newCat = req.body.newcategory
    const category = categorySchema({
        category: newCat
    })
    const checkCat = await categorySchema.findOne({ category: newCat })
    if (newCat.trim().length === 0) {
        res.redirect('/admin/addCategory')
        msg = 'Please fill submited area'
    } else {
        if (checkCat) {
            res.redirect('/admin/addCategory')
            msg = 'Category already exist'
        } else {
            const cat = await category.save()
            res.redirect('/admin/Category')
            message = 'Category added successfully'
        }
    }
}

////////LOAD EDIT CATEGORY PAGE///////////

const loadEditCategory = async(req,res)=>{
    try {
        const id = req.query.id
        const category = await categorySchema.findOne({_id:id})
        res.render('editCategory',{category,msg})
        msg=null
    } catch (error) {
        console.log(error.message);
    }
}


////////////EDIT CATEGORY///////////

const editCategory = async (req, res) => {
    try {
        const Cat = req.query.id
        const newCat = req.body.newcategory
        const checkNew = await categorySchema.findOne({category:newCat})
            if (checkNew) {
                res.redirect("/admin/Category")
                msg = 'New edited category already exist'
            } else {
                await categorySchema.updateOne({_id:Cat},{$set:{ category: newCat }})
                message = 'Category updated successfully'
                res.redirect('/admin/Category')
            }
        
    } catch (error) {
        console.log(error);
    }
}

////////////CATEGORY MANAGE///////////////////

const categoryManage = async (req, res) => {
    try {
        const category = await categorySchema.find()
        res.render('categoryManage', { category: category, msg, message })
        msg = null
        message = null
    } catch (error) {
        console.log(error);
    }
}

////////////////////DELETE CATEGORY////////////

const categoryDelete = async (req, res) => {
    try {
        const delCat = req.query.id
        const product = await productSchema.findOne({category:delCat})
        if (product) {
            res.redirect('/admin/Category')
            msg = 'Category used in product'
        } else {
            await categorySchema.deleteOne({_id: delCat })
            res.redirect('/admin/Category')
            message = 'Category deleted successfully'
        }
    } catch (error) {
        console.log(error);
    }
}


////////////CANCEL ORDER/////////

const cancelOrder = async (req, res) => {
    try {
        const orderId = req.query.orderid
        await orderSchema.updateOne({ _id: orderId }, { $set: { admin_cancelled: true } })
        const orders = await orderSchema.findOne({_id:orderId}).populate('item.product')
        orders.item.forEach(async (item) => {
            const productId = item.product._id
            const quantity = item.quantity
            await productSchema.updateOne({ _id: productId }, { $inc: { stocks: quantity } })
        });
        res.redirect('/admin/home')
        message = 'Orderd canelled successfully'
    } catch (error) {
        console.log(error.message);
    }
}


////////ORDER STATUS///////////

const orderStatus = async (req, res) => {
    try {
        const orderId = req.query.orderid
        const order = await orderSchema.findOne({ _id: orderId })
        if (order.is_delivered === false) {
            await orderSchema.updateOne({ _id: orderId }, { $set: { is_delivered: true, delivered_date: new Date().toLocaleDateString() } })
            const updatedOrder = await orderSchema.findOne({ _id: orderId })
            if (updatedOrder.is_delivered === true) {
                let product = []
                let totalprice = 0
                let soldCount = 0
                updatedOrder.item.forEach(item => {
                    product.push(item.product)
                    totalprice += item.price * item.quantity
                    soldCount += item.quantity 
                });

                const newSalesReport = new salesSchema({
                    date: new Date(),
                    orders: updatedOrder._id,
                    products: product,
                    totalSales: updatedOrder.totalPrice,
                    totalItemsSold: parseInt(soldCount),
                    userId:updatedOrder.userId,
                    location:updatedOrder.address[0].city
                })
                await newSalesReport.save()
            }
            res.redirect('/admin/home')
            message = 'Orderd status changed successfully'
        }
    } catch (error) {
        console.log(error.message);
    }
}


/////////////LOAD COUPONS PAGE////////////

const loadCoupons = async(req,res)=>{
    try {
        const coupons = await couponSchema.find()
        res.render('coupons',{msg,message,coupons})
        msg=null
        message=null
    } catch (error) {
        console.log(error.message);
    }
}

///////////LOAD ADD COUPON///////////////

const loadAddCoupon = async(req,res)=>{
    try {
        res.render('addCoupon',{msg,message})
        msg=null
        message=null
    } catch (error) {
        console.log(error.message);
    }
}

//////////////ADD COUPON////////////////

const addCoupon = async(req,res)=>{
    try {
        const coupon = req.body
        
        const newCoupon = new couponSchema({
            couponName:coupon.Name,
            couponCode:coupon.Code,
            startDate:coupon.StartDate,
            endDate:coupon.endDate,
            maxDiscount:coupon.maxDiscount,
            minPurchase:coupon.minPurchase
        })
        await newCoupon.save()
        res.redirect('/admin/coupon')
        message='Coupon added successfully'
    } catch (error) {
        console.log(error.message);
    }
}

//////////LOAD EDIT COUPON///////////////

const loadEditCoupon = async(req,res)=>{
    try {
        const id = req.query.id
        const coupon = await couponSchema.findOne({_id:id})
        res.render('editCoupon',{coupon,msg})
        msg=null
    } catch (error) {
        console.log(error.message);
    }
}


/////////////// EDIT COUPON/////////////

const editCoupon = async(req,res)=>{
    try {
        const coupon = req.body
        const id=req.query.id

        await couponSchema.updateOne({_id:id},{$set:{couponName:coupon.Name,couponCode:coupon.Code,startDate:coupon.StartDate,endDate:coupon.endDate,maxDiscount:coupon.maxDiscount,minPurchase:coupon.minPurchase}})
        res.redirect("/admin/coupon")
        message='Coupon edited successfully'
    } catch (error) {
        console.log(error.message);
    }
}


///////////////DELETE COUPON////////////

const deleteCoupon = async(req,res)=>{
    try {
        const id = req.query.id

        await couponSchema.deleteOne({_id:id})
        res.redirect('/admin/coupon')
        message = 'Coupon delted successfully'
    } catch (error) {
        console.log(error.message);
    }
}


////////////LOAD BANNER SHOWING PAGE/////////

const bannersPage = async(req,res)=>{
    try {
        const banners = await bannerSchema.find()
        res.render('banners',{message,banners,msg})
        msg = null,
        message = null
    } catch (error) {
        console.log(error.message);
    }
}

////////LOAD ADD BANNER PAGE////////

const loadAddBanner = async(req,res)=>{
    try {
        res.render('addBanner')
    } catch (error) {
        console.log(error.message);
    }
}


//////////ADD BANNER//////////

const addBanner = async(req,res)=>{
    try {
        const ban = req.body
        const old = await bannerSchema.find()
        console.log(old);
        if(old==null){
            const banner = new bannerSchema({
                heading1:ban.heading1,
                heading2:ban.heading2,
                heading3:ban.heading3,
                description1:ban.description1,
                description2:ban.description2,
                description3:ban.description3,
                image:req.file.filename
            })
    
            banner.save()
            res.redirect('/admin/banner')
            message = 'Banner added successfully'
        }else{
            res.redirect('/admin/banner')
            msg='There is already have a banner'
        }
    } catch (error) {
        console.log(error.message);
    }
}


////////////DELETE BANNER/////////////////

const deleteBanner = async(req,res)=>{
    try {
        const id = req.query.id
        await bannerSchema.deleteOne({_id:id})
        res.redirect('/admin/banner')
        message = 'banner delted successfully'
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loginLoad,
    adminLogin,
    loadAdminHome,
    adminLogOut,
    loadUserData,
    blockUser,
    unblockUser,
    newProduct,
    addCategory,
    addProduct,
    loadProducts,
    deleteProduct,
    loadEditPage,
    editProduct,
    categoryManage,
    editCategory,
    categoryDelete,
    cancelOrder,
    orderStatus,
    loadEditCategory,
    loadAddCategory,
    loadCoupons,
    loadAddCoupon,
    addCoupon,
    loadEditCoupon,
    editCoupon,
    deleteCoupon,
    loadSalesPage,
    bannersPage,
    loadAddBanner,
    addBanner,
    deleteBanner
}