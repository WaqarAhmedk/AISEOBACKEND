const UserModel = require('../models/usermodel');
const TrailUser = require('../models/trialmodel');

const DemoModel=require('../models/demouser');
const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const SECRET_KEY = "thisis@secret";
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


exports.Create_User = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const already = await UserModel.find({ email: email });

        if (already.length < 1) {

            const salt = await bycrypt.genSalt(10);

            const securepassword = await bycrypt.hash(password, salt);
            console.log(securepassword);

            const newUser = await UserModel.create({
                name: name,
                email: email,
                password: securepassword
            });
            if (newUser) {

                return res.status(200).json({
                    success: true,
                    message: "User created successfully"
                })
            }

        }
        else {
            return res.send({
                success: false,
                message: "User already exists."
            })
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error,

        })
    }







}

exports.Login_User = async (req, res) => {
    const { email, password } = req.body;


    try {

        const user = await UserModel.findOne({ email: email });
        if (!user) {
            return res.status(200).json({ success: false, message: "Please Provide valid email and password" });

        }


        const comparePassword = await bycrypt.compare(password, user.password);
        if (!comparePassword) {
            return res.status(200).json({ success: false, message: "Please Provide valid email and password" });

        }

        const data = {
            id: user._id
        }


        const AuthToken = jwt.sign(data, SECRET_KEY);
        const userdetails = await UserModel.findOne({ email: email }).select("-password");


        res.status(200).json({ success: true, authToken: AuthToken, user: userdetails, message: "Successfully loggedin" })








    } catch (error) {
        console.log("catch error in login", error);

    }
}
exports.Create_DemoUser = async (req, res) => {
    const { name, email, phno } = req.body;

    try {
        const already = await DemoModel.find({ email: email });

        if (already.length < 1) {

          

            const newUser = await DemoModel.create({
                name: name,
                email: email,
            phno: phno            });
            if (newUser) {

                return res.status(200).json({
                    success: true,
                    message: "User Registered for demo successfully"
                })
            }

        }
        else {
            return res.send({
                success: false,
                message: "User already asked for a demo"
            })
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error,

        })
    }







}


exports.Get_User = async (req, res) => {

    try {

        const id = req.id;

        const user = await UserModel.findById(id).select("-password");

        if (!user) {
            console.log('sws');
            return res.json({ success: false, message: "Please provide correct auth toke" });
        }

        return res.status(200).json({ success: true, user: user });

    } catch (error) {
        console.log("catch error in getuser", error);

    }
}




exports.Update_User = async (req, res) => {

    const userid = req.id;

    const { name, email, password } = req.body;



    try {
        const finduser = UserModel.findById(userid);
        if (!finduser) {
            return res.json({ success: false, message: "No User found against this Auth Token" });
        }


        const updateuser = await UserModel.findByIdAndUpdate(userid, { name: name, email: email, password: password });

        //TODO   complete   update user       



    } catch (error) {

    }
}







exports.GoogleUserSignUp = async (req, res) => {
    const { name, email } = req.body;
    console.log(name, email
    );


    try {



        const user = await UserModel.findOne({ email: email }).select('-password');

        console.log(user);
        if (user) {
            const data = {
                id: user._id
            }


            const AuthToken = jwt.sign(data, SECRET_KEY);
            return res.send({
                success: true,
                already: true,
                authToken: AuthToken,
                user: user,
                message: "User already exists Please Signin"
            })
        }

        const newUser = await UserModel.create({
            name: name,
            email: email,

        });
        const data = {
            id: user._id
        }


        const AuthToken = jwt.sign(data, SECRET_KEY);
        if (newUser) {

            return res.status(200).json({
                success: true,
                user: newUser,
                already: false,
                authToken: AuthToken,
                message: "User created successfully",
            })
        }

    } catch (error) {
        console.log(error);

    }
}

exports.GoogleUserSignin = async (req, res) => {
    console.log();
    const { name, email } = req.body;
    try {

        const user = await UserModel.findOne({ email: email });
        if (user) {
            return res.send({
                success: false,
                already: true,
                message: "User already exists Please Signin"
            })
        }

        const newUser = await UserModel.create({
            name: name,
            email: email,

        });
        if (newUser) {

            return res.status(200).json({
                success: true,
                message: "User created successfully",
            })
        }

    } catch (error) {
        console.log(error);

    }
}