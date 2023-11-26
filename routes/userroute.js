const express = require('express');
const { Create_User, Login_User, Get_User, GoogleUser, GoogleUserSignUp ,Create_DemoUser} = require('../controllers/authController');
const { check, validationResult } = require("express-validator");

const getUser = require("../middlewares/getuser")

const router = express.Router();



router.post("/signup", [
    check("name").isLength({ min: 3 }).withMessage("Name Must have atleast 3 Characters"),
    check("email").isEmail().withMessage("Provide a Valid Email "),
    check("password").isLength({ min: 5 }).withMessage("Password must be at least 5 characters")
], (req, res, next) => {
    const errors = validationResult(req);

    const hasErors = !errors.isEmpty();

    if (hasErors) {
        return res.status(422).json(errors)
    }
    else {
        next()
    }
}, Create_User)

router.post("/signin", [check("email").isEmail().withMessage("Provide a Valid Email "),
check("password").isLength({ min: 5 }).withMessage("Password must be at least 5 characters")], (req, res, next) => {
    const errors = validationResult(req);

    const hasErors = !errors.isEmpty();

    if (hasErors) {
        return res.status(422).json(errors)
    }
    else {
        next()
    }
}, Login_User)

router.get("/getuser", getUser, Get_User);
router.put("/update", getUser,)


router.post("/googlesignup", GoogleUserSignUp)

router.post("/storedemouser", [
    check("name").isLength({ min: 3 }).withMessage("Name Must have atleast 3 Characters"),
    check("email").isEmail().withMessage("Provide a Valid Email "),
], (req, res, next) => {
    const errors = validationResult(req);

    const hasErors = !errors.isEmpty();

    if (hasErors) {
        return res.status(422).json(errors)
    }
    else {
        next()
    }
}, Create_DemoUser)

module.exports = router;