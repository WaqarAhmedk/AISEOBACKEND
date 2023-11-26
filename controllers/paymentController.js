const UserModel = require("../models/usermodel");

require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const products = {
    'prod_NUF97mjWo4lP5c': {
        name: "creator-boss",
        allowedwords: 120000,

    },
    'prod_NJQEdIKO93fGDX': {
        name: "go-getter",
        allowedwords: 40000,
    }
};

let allowedwords = 0;
exports.CreateSUBSCRIPTION = async (req, res) => {
    const { paymentMethod, price } = req.body;
    const userid = req.id;
    try {

        const user = await UserModel.findById(userid);
        if (!user) {
            return res.json({
                success: false,
                message: "No user is found provide  correct Token"
            })
        }


        if (paymentMethod && price) {
            customer = await stripe.customers.create({
                name: user.name,
                email: user.email,
                payment_method: paymentMethod,
                invoice_settings: {
                    default_payment_method: paymentMethod
                }
            });




            const subscription = await stripe.subscriptions.create({
                customer: customer.id,
                items: [{ price: price }],
                payment_settings: {

                    payment_method_types: ['card'],
                    save_default_payment_method: 'on_subscription'
                },
                expand: ['latest_invoice.payment_intent'],
                metadata: { customerEmail: user.email }, // NOTICE HERE!

            });

            if (products[subscription.plan.product]) {
                console.log(products[subscription.plan.product].name);
                allowedwords = user.allowedwords + products[subscription.plan.product].allowedwords;
            }

            await UserModel.findByIdAndUpdate(userid, {
                subid: subscription.id,
                plan: products[subscription.plan.product].name,
                allowedwords: allowedwords,
                remainingwords: allowedwords,
                allowed: true,
                customerid: subscription.customer
            })




            if (subscription.latest_invoice.payment_intent != null) {
                return res.json({
                    success: true,
                    data: subscription,
                    clientSecret: subscription.latest_invoice.payment_intent.client_secret,
                    subscriptionId: subscription.id,
                    message: "Payment was successfully created"
                })
            } else {
                return res.json({
                    success: true,
                    data: subscription,
                    subscriptionId: subscription.id,
                    message: "Payment was successfully created"

                })

            }
        }
        else {
            return res.json({
                success: false,
                message: "missing Paymenet method or the Price id of the Subscription plan"

            })
        }






    } catch (error) {
        console.log("Error  in payment catch" + error);
        return res.json({
            success: false,

            message: error.message

        })
    }

}




exports.CreateFreeSubscription = async (req, res) => {

    const { paymentMethod, price } = req.body;
    const userid = req.id;
    try {

        const user = await UserModel.findById(userid);
        if (!user) {
            return res.json({
                success: false,
                message: "No user is found provide  correct Token"
            })
        }
        console.log(user);

        if (user.plan != 'free' && user.plan != null) {
            return res.send({
                success: false,
                message: `you Already have a ${user.plan} plan and cannot Subscribe for a Free Plan`
            })

        }
        if (user.plan === 'free') {
            return res.send({
                success: false,
                message: `you Already have a ${user.plan} plan  please Choose other Plan that is suitable for you`
            })

        }





        await UserModel.findByIdAndUpdate(userid, {
            plan: 'free',
            allowedwords: 10000,
            remainingwords: 10000,
            allowed: true,
        });


        return res.send({
            success: true,
            message: "Free Trial Plan is active now"
        })


    } catch (error) {
        console.log("Error  in payment catch" + error);
        return res.json({
            success: false,

            message: error.message

        })
    }
}




exports.OneTimePayment = async (req, res) => {
    const userid = req.id;

    try {
        const user = await UserModel.findById(userid)
        console.log(user);
        // Create a checkout session for the one-time use feature
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],

            customer_email: user.email,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'One-Time Use Feature',
                        },
                        unit_amount: 100, // Price in cents, so $1
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'https://erin-amused-gharial.cyclic.app/stripe/confirm/' + user._id, // Redirect URL for successful purchase
            cancel_url: 'https://your-app.com/cancel', // Redirect URL for cancelled purchase
        });



        // Return the checkout session ID to the client
        res.json({ id: session.id });
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send('An error occurred while processing your request.');
    }
}


exports.CheckOneTimePayment = async (req, res) => {
    try {
        // Check if the user has purchased the one-time use feature
        const customerId = req.user.customerId; // Replace with your own logic to get the user's Stripe customer ID
        const subscriptions = await stripe.subscriptions.list({ customer: customerId });

        // If the user has a subscription, they have access to the one-time use feature
        if (subscriptions.data.length > 0) {
            res.send('You have access to the one-time use feature!');
        } else {
            res.send('You do not have access to the one-time use feature. Please purchase it first.');
        }
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send('An error occurred while processing your request.');
    }
}


exports.ConfirmOneTimePayment = async (req, res) => {
    try {
        const userid = req.params.id;
        const user = await UserModel.findById(userid);
        const allowedlimit = user.paraphrasinglimit + 1;
        const useragain = await UserModel.findByIdAndUpdate(userid, {
            paraphrasinglimit: allowedlimit
        });
        console.log('here');
        return res.redirect('https://aiseo-360-frontend.vercel.app/dashboard')
    } catch (error) {
        console.log(error);
    }
}

// exports.Create_Checkout_Payment = async (req, res) => {
//     // console.log("payment ROute");
//     const prices = await stripe.prices.list({

//     })
//     const session = await stripe.checkout.sessions.create({
//         payment_method_types: ["card"],

//         mode: "subscription",
//         success_url: "http://localhost:3000/success",
//         cancel_url: "http://localhost:3000/cancel",
//     })
//     console.log(session);
// }