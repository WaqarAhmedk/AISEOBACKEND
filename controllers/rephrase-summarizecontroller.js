const UserModel = require("../models/usermodel");
const openai = require("../openaiconfig/openaiconfig");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// let finalquery = await translate(translateq, { to: language });


exports.Generate_Rephrase = async (req, res) => {

    const userid = req.id;
    const { query, outputlength, language } = req.body;
    let finalreply = [];

    try {




        const user = await UserModel.findById(userid);

        if (user) {

            if (user.plan === 'free') {
                if (user.allowed && user.remainingwords > 10) {


                    for (let i = 0; i < outputlength; i++) {
                        const ans = await Rephrase(query, language);
                        finalreply.push({
                            reply: ans[0]
                        })

                    }

                    let totalwords = 0;
                    for (let i = 0; i < finalreply.length; i++) {
                        finalreply[i].reply = finalreply[i].reply.replace(/(^\s*)|(\s*$)/gi, "");//exclude  start and end white-space
                        finalreply[i].reply = finalreply[i].reply.replace(/\n /, "\n"); // exclude newline with a start spacing
                        let ans1 = finalreply[i].reply.split(' ').filter(function (str) { return str != ""; }).length;
                        // //return s.split(' ').filter(String).length; - this can also be used







                        totalwords = ans1;


                    }

                    console.log('totalwords', totalwords);

                    const updateduser = await UserModel.findByIdAndUpdate(userid, {
                        remainingwords: user.remainingwords - totalwords
                    }, { new: true })


                    return res.json({
                        success: true,
                        message: "result generated successfully",
                        result: finalreply,

                        remainingwords: updateduser.remainingwords
                    })
                } else {
                    return res.json({
                        success: false,
                        message: `your monthly word limit has Ended Remaining words are ${user.remainingwords} words`
                    })
                }
            }

            else if (user.subid) {
                const subscription = await stripe.subscriptions.retrieve(
                    user.subid
                );
                if (subscription.status == 'active') {

                    if (user.allowed && user.remainingwords > 10) {






                        for (let i = 0; i < outputlength; i++) {
                            const ans = await Rephrase(query, language);
                            finalreply.push({
                                reply: ans[0]
                            })

                        }
                        let totalwords = 0;
                        for (let i = 0; i < finalreply.length; i++) {
                            finalreply[i].reply = finalreply[i].reply.replace(/(^\s*)|(\s*$)/gi, "");//exclude  start and end white-space
                            finalreply[i].reply = finalreply[i].reply.replace(/\n /, "\n"); // exclude newline with a start spacing
                            let ans1 = finalreply[i].reply.split(' ').filter(function (str) { return str != ""; }).length;
                            // //return s.split(' ').filter(String).length; - this can also be used







                            totalwords = ans1;


                        }

                        console.log('totalwords', totalwords);


                        const updateduser = await UserModel.findByIdAndUpdate(userid, {
                            remainingwords: user.remainingwords - totalwords
                        }, { new: true })


                        return res.json({
                            success: true,
                            message: "result generated successfully",
                            result: finalreply,

                            remainingwords: updateduser.remainingwords
                        })


                    } else {
                        return res.json({
                            success: false,
                            message: `youu have only ${user.remainingwords} words
                            `
                        })
                    }

                } else {
                    return res.json({
                        success: false,
                        message: "Subscription is not Active please subscribe to a package"
                    })
                }

                // console.log(subscription);

                // const customer = await stripe.subscriptions.search({
                //     query: `email:'${user.email}'`,
                // })
                // // console.log(customer);

                // for (let i = 0; i < customer.data.length; i++) {
                //     if (customer.data[i].id == user.customerid) {
                //         console.log(customer.data[i]);
                //     }
                // }

            } else {
                return res.json({
                    success: false,
                    message: "You haven,t Subscribed to any Product please subscribe to a package "
                })
            }
        }



    } catch (error) {

        console.log("Error inn the catch block of Generate Content Controller", error.message)
        return res.json({
            success: false,
            message: error.message,
        })
    }
}

exports.Generate_Summarize = async (req, res) => {

    const userid = req.id;
    const { query, outputlength, language } = req.body;
    let finalreply = [];

    try {




        const user = await UserModel.findById(userid);

        if (user) {

            if (user.plan === 'free') {
                if (user.allowed && user.remainingwords > 10) {


                    for (let i = 0; i < outputlength; i++) {
                        const ans = await Summrize(query, language);
                        finalreply.push({
                            reply: ans[0]
                        })

                    }

                    let totalwords = 0;
                    for (let i = 0; i < finalreply.length; i++) {
                        finalreply[i].reply = finalreply[i].reply.replace(/(^\s*)|(\s*$)/gi, "");//exclude  start and end white-space
                        finalreply[i].reply = finalreply[i].reply.replace(/\n /, "\n"); // exclude newline with a start spacing
                        let ans1 = finalreply[i].reply.split(' ').filter(function (str) { return str != ""; }).length;
                        // //return s.split(' ').filter(String).length; - this can also be used







                        totalwords = ans1;


                    }

                    console.log('totalwords', totalwords);

                    const updateduser = await UserModel.findByIdAndUpdate(userid, {
                        remainingwords: user.remainingwords - totalwords
                    }, { new: true })


                    return res.json({
                        success: true,
                        message: "result generated successfully",
                        result: finalreply,

                        remainingwords: updateduser.remainingwords
                    })
                } else {
                    return res.json({
                        success: false,
                        message: `your monthly word limit has Ended Remaining words are ${user.remainingwords} words`
                    })
                }
            }

            else if (user.subid) {
                const subscription = await stripe.subscriptions.retrieve(
                    user.subid
                );
                if (subscription.status == 'active') {

                    if (user.allowed && user.remainingwords > 10) {






                        for (let i = 0; i < outputlength; i++) {
                            const ans = await Summrize(query, language);
                            finalreply.push({
                                reply: ans[0]
                            })

                        }
                        let totalwords = 0;
                        for (let i = 0; i < finalreply.length; i++) {
                            finalreply[i].reply = finalreply[i].reply.replace(/(^\s*)|(\s*$)/gi, "");//exclude  start and end white-space
                            finalreply[i].reply = finalreply[i].reply.replace(/\n /, "\n"); // exclude newline with a start spacing
                            let ans1 = finalreply[i].reply.split(' ').filter(function (str) { return str != ""; }).length;
                            // //return s.split(' ').filter(String).length; - this can also be used







                            totalwords = ans1;


                        }

                        console.log('totalwords', totalwords);


                        const updateduser = await UserModel.findByIdAndUpdate(userid, {
                            remainingwords: user.remainingwords - totalwords
                        }, { new: true })


                        return res.json({
                            success: true,
                            message: "result generated successfully",
                            result: finalreply,

                            remainingwords: updateduser.remainingwords
                        })


                    } else {
                        return res.json({
                            success: false,
                            message: `youu have only ${user.remainingwords} words
                            `
                        })
                    }

                } else {
                    return res.json({
                        success: false,
                        message: "Subscription is not Active please subscribe to a package"
                    })
                }

                // console.log(subscription);

                // const customer = await stripe.subscriptions.search({
                //     query: `email:'${user.email}'`,
                // })
                // // console.log(customer);

                // for (let i = 0; i < customer.data.length; i++) {
                //     if (customer.data[i].id == user.customerid) {
                //         console.log(customer.data[i]);
                //     }
                // }

            } else {
                return res.json({
                    success: false,
                    message: "You haven,t Subscribed to any Product please subscribe to a package "
                })
            }
        }



    } catch (error) {

        console.log("Error inn the catch block of Generate Content Controller", error.message)
        return res.json({
            success: false,
            message: error.message,
        })
    }
}
const translateQuery = async (query, language) => {
    // "Translate this into 1. French, 2. Spanish and 3. Japanese:\n\nWhat rooms do you have available?\n\n1.",
    const fquery = 'Translate this into ' + language + ' \n\n' + query + '\n\n';
    console.log(fquery, 'ddd');
    const resdata = await openai.createCompletion({

        model: "text-davinci-003",
        prompt: fquery,
        temperature: 0.9,
        max_tokens: 100,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
    });
    const data = resdata.data.choices[0].text;
    console.log('transalted', data);
    return data;
}
const Rephrase = async (query, language) => {
    try {
        let finalquery;
        let querytext = 'Rephrase the following paragraph '
        if (language !== 'English') {
            let finalqueryres = await translateQuery(querytext, language);
            finalquery = finalqueryres + '\n' + query;

        } else {
            finalquery = querytext + '\n' + '`' + query + '`'
        }


        console.log(finalquery);


        let replies = [];

        const resdata = await openai.createCompletion({

            model: "davinci-instruct-beta-v3",
            prompt: finalquery,
            temperature: 0.9,
            max_tokens: 500,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        });

        replies.push(
            resdata.data.choices[0].text
        )

        let refinedResult = replies.map((str) => {
            return str.replaceAll("\n", '');
        })
        console.log(replies);

        console.log("refined overview", refinedResult);





        return refinedResult;


    }


    catch (error) {
        console.log('Error in generate blog topics function', error.message);
        return 'something bad'

    }

}

const Summrize = async (query, language) => {
    try {

        if (query.length > 1300) {
            return resdata.send({
                success: false,
                message: 'max length of Query Allowed by model is 1300 please write less then 1300 characters'
            })
        }

        let finalquery;
        let querytext = 'summarize the following '
        if (language !== 'English') {
            let finalqueryres = await translateQuery(querytext, language);
            finalquery = finalqueryres + '\n' + query;

        } else {
            finalquery = querytext + '\n' + query
        }





        let replies = [];

        const resdata = await openai.createCompletion({

            model: "davinci-instruct-beta-v3",
            prompt: finalquery,
            temperature: 0.7,
            max_tokens: 800,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        });

        replies.push(
            resdata.data.choices[0].text
        )
        console.log('replies', replies);
        let refinedResult = replies.map((str) => {
            return str.replaceAll("\n", '');
        })


        // console.log("refined overview", refinedResult);





        return refinedResult;


    }


    catch (error) {
        console.log('Error in generate blog topics function', error.message);
        return 'something bad'

    }

}