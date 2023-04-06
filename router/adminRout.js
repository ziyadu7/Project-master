const express = require("express")
const multer = require('../config/multer')
const adminController = require('../controllers/adminController')
const auth = require('../middleware/authAdmin')

const upload = multer.createMulter()
const admin_rout = express()

admin_rout.set('view engine', 'ejs')
admin_rout.set('views', './views/admin')

admin_rout.get('/', auth.adminLogin, adminController.loginLoad)

admin_rout.post('/',auth.adminLogin,adminController.adminLogin)

admin_rout.get('/home', auth.logOutSession, adminController.loadAdminHome)

admin_rout.get('/logout', auth.logOutSession, adminController.adminLogOut)

admin_rout.get('/userData', auth.logOutSession, adminController.loadUserData)

admin_rout.get('/blockUser', auth.logOutSession, adminController.blockUser)

admin_rout.get('/unblockUser', auth.logOutSession, adminController.unblockUser)

admin_rout.get('/addProduct', auth.logOutSession, adminController.newProduct)

admin_rout.post('/addProduct',auth.logOutSession,upload.array('image',4),adminController.addProduct)

admin_rout.get('/addCategory',auth.logOutSession,adminController.loadAddCategory)

admin_rout.post('/addCategory',auth.logOutSession,adminController.addCategory)

admin_rout.get('/editCategory',auth.logOutSession,adminController.loadEditCategory)

admin_rout.post('/editCategory',auth.logOutSession,adminController.editCategory)

admin_rout.get('/deleteCategory',auth.logOutSession,adminController.categoryDelete)

admin_rout.get('/products',auth.logOutSession,adminController.loadProducts)

admin_rout.get('/deleteProduct',auth.logOutSession,adminController.deleteProduct)

admin_rout.get('/editProduct',auth.logOutSession,adminController.loadEditPage)

admin_rout.post('/editProduct',upload.array('image',4),adminController.editProduct)

admin_rout.get('/category',auth.logOutSession,adminController.categoryManage)

admin_rout.get('/cancelOrder',auth.logOutSession,adminController.cancelOrder)

admin_rout.get('/orderStatus',auth.logOutSession,adminController.orderStatus)

admin_rout.get('/coupon',auth.logOutSession,adminController.loadCoupons)

admin_rout.get('/addCoupon',auth.logOutSession,adminController.loadAddCoupon)

admin_rout.post('/addCoupon',auth.logOutSession,adminController.addCoupon)

admin_rout.get('/editCoupon',auth.logOutSession,adminController.loadEditCoupon)

admin_rout.post('/editCoupon',auth.logOutSession,adminController.editCoupon)

admin_rout.get('/deleteCoupon',auth.logOutSession,adminController.deleteCoupon)

admin_rout.get('/salesReport',auth.logOutSession,adminController.loadSalesPage)

admin_rout.get('/banner',auth.logOutSession,adminController.bannersPage)

admin_rout.get('/addBanner',auth.logOutSession,adminController.loadAddBanner)

admin_rout.post('/addBanner',upload.single('image'),adminController.addBanner)

admin_rout.get('/deleteBanner',auth.logOutSession,adminController.deleteBanner)



module.exports = admin_rout