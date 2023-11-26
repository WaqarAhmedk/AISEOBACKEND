const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
require("dotenv").config();

const usermodel = require('../models/usermodel')

const products = require('../products')
const router = express.Router();



const UpdateUserData = async (email, subid) => {
    console.log('1', email, subid);

    try {
        console.log('2', email, subid);

        const subscription = await stripe.subscriptions.retrieve(
            subid);
        console.log('3', email, subid);

        const user = await usermodel.findOne({ email: email });
        console.log('4', email, subid);

        console.log('user found', user);
        if (user) {
            let allowedwords = user.allowedwords;
            console.log('user', user.allowedwords);
            if (products[subscription.plan.product]) {
                console.log('sdsadsada', products[subscription.plan.product].name);
                allowedwords = user.allowedwords + products[subscription.plan.product].allowedwords;
                console.log('sdsadsada', allowedwords);



            }


            const userUp = await usermodel.findOneAndUpdate({ email: email }, {
                allowedwords: allowedwords,
                remainingwords: allowedwords,
                allowed: true,

            })
        }
    }
    catch (err) {
        console.log('error', err.message);

        console.log(err);
    }

}


router.post('/check-recuring-payment', async (req, res) => {
    const event = req.rawBody;
    console.log('wdewdsadsadhsadghsadsah');

    // Verify the Stripe signature
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let stripeEvent;

    try {
        stripeEvent = stripe.webhooks.constructEvent(event, sig, webhookSecret);
    } catch (err) {
        console.error(err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the Stripe webhook event here
    switch (stripeEvent.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = stripeEvent.data.object;





            // Update your database or trigger other actions
            break;


        case 'customer.subscription.updated':
            const subscribe = stripeEvent.data.object;
            break;

        case 'invoice.paid':
            const invoice = stripeEvent.data.object;

            if (invoice.paid) {


                const email = invoice.customer_email;
                const subid = invoice.subscription;

                if (invoice.billing_reason == 'subscription_cycle') {
                    await UpdateUserData(email, subid);
                    break;

                }






                break;

            }
        default:
            break;
        // console.log(`Unhandled event type ${stripeEvent.type}`);
    }

    res.json({ received: true });
})







module.exports = router;