const express = require('express');
const { Create_Trial_User } = require('../controllers/trialuserController')
const { check, validationResult } = require("express-validator");

const getUser = require("../middlewares/getuser")

const router = express.Router();


router.post("/start-trial", [
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
}, Create_Trial_User)





module.exports = router;