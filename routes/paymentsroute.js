const express = require('express');
const { Create_Checkout_Payment, CreateSUBSCRIPTION, CreateFreeSubscription, OneTimePayment, ConfirmOneTimePayment } = require("../controllers/paymentController");
const getUser = require('../middlewares/getuser');

const router = express.Router();




router.post("/create-payment", getUser, CreateSUBSCRIPTION)
router.post('/create-free-sub', getUser, CreateFreeSubscription)
router.post("/one-time-payment", getUser, OneTimePayment);

router.get('/confirm/:id', ConfirmOneTimePayment)







module.exports = router;