const express = require('express')
const router = express.Router()
const { userRegistration, userLogin, activateUser, forgotPassword, resetPassword, protected, UserProfile, UpdateUser, UpdateUserPassword } = require('../controller/userController')
const upload = require('../utils/multer')

router.post('/register', userRegistration)
router.post('/login', userLogin)
router.get('/:id/verify/:token', activateUser)
router.post('/forgotpassword', forgotPassword)
router.patch('/resetpassword/:token', resetPassword)


router.get('/profile', protected, UserProfile)
router.patch('/user/update', protected, upload.single('image'), UpdateUser)
router.patch('/update/password', protected, UpdateUserPassword)

module.exports = router