
const UserModel = require("../models/usermodel");
const openai = require("../openaiconfig/openaiconfig");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);



exports.Generate_Product = async (req, res) => {











    const userid = req.id;
    const { keywords, query, outputlength, language } = req.body;
    let finalreply = [];

    try {



        const user = await UserModel.findById(userid);

        if (user) {

            if (user.plan === 'free') {
                if (user.allowed && user.remainingwords > 10) {



                    const topics = await ProductTitle(keywords, query, outputlength, language);


                    for (let i = 0; i < topics.length; i++) {
                        const productdesc = await ProductDescription(keywords, topics[i], language);

                        finalreply.push({
                            title: topics[i],
                            description: productdesc[0],
                        })





                    }
                    console.log('final is here', finalreply);
                    let totalwords = 0;

                    for (let i = 0; i < finalreply.length; i++) {
                        finalreply[i].title = finalreply[i].title.replace(/(^\s*)|(\s*$)/gi, "");//exclude  start and end white-space
                        finalreply[i].title = finalreply[i].title.replace(/\n /, "\n"); // exclude newline with a start spacing
                        let ans1 = finalreply[i].title.split(' ').filter(function (str) { return str != ""; }).length;
                        // //return s.split(' ').filter(String).length; - this can also be used

                        finalreply[i].description = finalreply[i].description.replace(/(^\s*)|(\s*$)/gi, "");//exclude  start and end white-space
                        finalreply[i].description = finalreply[i].description.replace(/\n /, "\n"); // exclude newline with a start spacing
                        let ans2 = finalreply[i].description.split(' ').filter(function (str) { return str != ""; }).length;






                        totalwords = ans1 + ans2;


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








                        const topics = await ProductTitle(keywords, query, outputlength, language);


                        for (let i = 0; i < topics.length; i++) {
                            const productdesc = await ProductDescription(keywords, topics[i], language);

                            finalreply.push({
                                title: topics[i],
                                description: productdesc[0],
                            })




                        }
                        console.log('final is here', finalreply);
                        let totalwords = 0;

                        for (let i = 0; i < finalreply.length; i++) {
                            finalreply[i].title = finalreply[i].title.replace(/(^\s*)|(\s*$)/gi, "");//exclude  start and end white-space
                            finalreply[i].title = finalreply[i].title.replace(/\n /, "\n"); // exclude newline with a start spacing
                            let ans1 = finalreply[i].title.split(' ').filter(function (str) { return str != ""; }).length;
                            // //return s.split(' ').filter(String).length; - this can also be used

                            finalreply[i].description = finalreply[i].description.replace(/(^\s*)|(\s*$)/gi, "");//exclude  start and end white-space
                            finalreply[i].description = finalreply[i].description.replace(/\n /, "\n"); // exclude newline with a start spacing
                            let ans2 = finalreply[i].description.split(' ').filter(function (str) { return str != ""; }).length;






                            totalwords = ans1 + ans2;


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

                // for (let i = 0; i < customer.finalreply.length; i++) {
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


const ProductTitle = async (keywords, query, outputlength, language) => {

    try {
        let finalquery;
        const translateq = "Generate clever product title on:  " + query;

        if (language !== 'English') {
            finalquery = await translateQuery(translateq, language)

        } else {
            finalquery = translateq
        }
        let replies = [];
        for (let i = 0; i < outputlength; i++) {
            const resdata = await openai.createCompletion({

                model: "davinci-instruct-beta-v3",
                prompt: finalquery,
                temperature: 0.7,
                max_tokens: 20,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0
            });

            replies.push(
                resdata.data.choices[0].text
            )


        }


        const refinedResult = [];

        for (let j = 0; j < replies.length; j++) {
            let a = [];
            // const element = array[i];


            const str = replies[j];
            const ans = str.split(/\r?\n/);
            for (var i = 0; i < ans.length; i++) {
                if (ans[i]) {
                    const foundString = ans[i].replace(/[^a-zA-Z ]/g, "");
                    if (foundString.length > 2) {
                        if (refinedResult.length < outputlength) {
                            refinedResult.push(foundString)
                            break;
                        }
                        else {
                            break;
                        }

                    }
                } else {
                    continue;
                }

            }


            //    console.log("refined in topics", refinedResult);

        }



        return refinedResult;




    } catch (error) {
        console.log('Error in generate blog topics function', error.message);
        return 'something bad'
    }




}


const ProductDescription = async (keywords, topic, language) => {
    try {



        const overviewprompt = 'Generate detailed professional, witty and clever product details on: ' + topic;

        let finalquery = ' '

        if (keywords.length > 0) {
            finalquery = overviewprompt + '. Make sure to use following keywords \n ';
            for (let i = 0; i < keywords.length; i++) {
                finalquery = finalquery + " " + '`' + keywords[i] + '`';

            }
            finalquery = finalquery;

        } else {
            finalquery = overviewprompt
        }


        if (language !== 'English') {
            let finalqueryres = await translateQuery(finalquery, language);
            finalquery = finalqueryres;

        } else {
            finalquery = finalquery;
        }

        console.log('query on oin', finalquery);
        let replies = [];

        const resdata = await openai.createCompletion({

            model: "davinci-instruct-beta-v3",
            prompt: finalquery,
            temperature: 0.7,
            max_tokens: 500,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        });

        replies.push(
            resdata.data.choices[0].text
        )
        let refinedResult = [];
        const str = replies[0];
        const ans = str.split(/\r?\n/);
        for (var i = 0; i < ans.length; i++) {
            if (ans[i]) {
                const foundString = ans[i].replace(/[^a-zA-Z ]/g, "");
                if (foundString.length > 20) {

                    refinedResult.push(foundString)
                    break;



                }
            } else {
                continue;
            }

        }


        // console.log("refined overview", refinedResult);





        return refinedResult;


    }


    catch (error) {
        console.log('Error in generate blog topics function', error.message);
        return 'something bad'

    }

}
