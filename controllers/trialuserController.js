const TrialUser = require('../models/trialmodel')
const jwt = require("jsonwebtoken")
const SECRET_KEY = "thisis@secret";
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);



const TimeCompleted = async (userid) => {
    setTimeout(async () => {
        const user = await TrialUser.findByIdAndUpdate(userid, {
            allowed: false
        })
        console.log('trail expired', user.email);
    }, 360000);
}


exports.Create_Trial_User = async (req, res) => {
    const { name, email } = req.body;

    try {
        const already = await TrialUser.find({ email: email });

        if (already.length < 1) {




            const newUser = await TrialUser.create({
                name: name,
                email: email,
            });
            if (newUser) {
                const data = {
                    id: newUser._id
                }


                const AuthToken = jwt.sign(data, SECRET_KEY);

                TimeCompleted(newUser._id);
                return res.status(200).json({
                    success: true,
                    message: "Your Demo is Started and will expire after 5 minutes",
                    AuthToken: AuthToken,
                    user: newUser,
                })
            }

        }
        else {
            return res.send({
                success: false,
                message: "You have Used your Free  minutes trial period"
            })
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error,

        })
    }







}


