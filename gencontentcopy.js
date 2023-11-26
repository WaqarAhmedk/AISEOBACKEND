


















const UserModel = require("../models/usermodel");
const openai = require("../openaiconfig/openaiconfig");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const googleTrends = require('google-trends-api');

const axios = require("axios");
let relatedQueries = [];


const getLocation = async (ip) => {
    let country = "us";


    await axios.request('https://ip-geolocation-ipwhois-io.p.rapidapi.com/json/', {
        params: { ip: ip },
        headers: {
            'X-RapidAPI-Key': 'b37b9f153fmshed510dd02e1bc20p1ca4ffjsn8ff00092b917',
            'X-RapidAPI-Host': 'ip-geolocation-ipwhois-io.p.rapidapi.com'
        }
    }).then(function (response) {
        country = response.data.country_code;
        console.log(response.data.country_code);
    }).catch(function (error) {
        console.error(error);
    });


    return country;

}

const findKeywords = async (keyword, country) => {
    let data = [];
    relatedQueries = [];


    await axios.get('https://seo-keyword-research.p.rapidapi.com/keynew.php', {
        params: { keyword: keyword, country:'us' }, headers: {
            'X-RapidAPI-Key': 'a350f94596mshf14d44e43776643p1a8e4ajsn332ca7b338a0',
            'X-RapidAPI-Host': 'seo-keyword-research.p.rapidapi.com'
        }
    }).then(function (response) {

        const ans = response.data;
        console.log(ans);
        for (let i = 0; i < 50; i++) {
            relatedQueries.push(ans[i]);
        }
        let d = ans.sort((a, b) => {
            if (b.volume !== a.volume) {
                return b.score - a.score; // sort by greater volume
            }
            return a.score - b.score
        });





        for (let i = 0; i < 200; i++) {
            if (data.length > 0) {
                data.map((fff) => {
                    if (fff.score != d[i].score && data.length < 5) {
                        data.push(d[i]);

                    }
                })

            } else if (data.length >= 5) {
                break;

            }
            else {
                data.push(d[i]);
            }



        }

    }).catch(function (error) {
        console.log("error in keyword planer", error.message);
        // data=[ 'cat', 'cats', 'catos', "cato's", 'catoes' ]

    });

    // data = ['cat', 'cats', 'catos', "cato's", 'catoes']
    return data;
}

exports.Generate_Content = async (req, res) => {


    // let ip = req.get('x-forwarded-for') || req.connection.remoteAddress;

    let ip = "101.50.127.83";
    const country = await getLocation(ip);









    const userid = req.id;
    const { query, max_tokens, prompt, outputlength,keywords } = req.body;
    const tokens = parseInt(max_tokens);
    try {





        const r1 = query.includes("topics");
        const r2 = query.includes("title");
        const r3 = query.includes("titles");
        let finalquery = "Using following keywords ";


        const genkeywords = await findKeywords(prompt, country);
      


        if (r1 || r2 || r3) {

            if (keywords!=null) {
                for (let i = 0; i < keywords.length; i++) {
                    finalquery = finalquery + " " + keywords[i];

                }
                finalquery = finalquery + ' ' + query + ".\n\n 1. "

            } else {
                for (let i = 0; i < genkeywords.length; i++) {
                    finalquery = finalquery + " " + genkeywords[i].text;

                }
                finalquery = finalquery + ' ' + query + ".\n\n 1. "

            }


        } else {
            if (keywords !=null) {

                for (let i = 0; i < keywords.length; i++) {
                    finalquery = finalquery + " " + keywords[i];

                }
                finalquery = finalquery + " " + query;

            } else {

                for (let i = 0; i < genkeywords.length; i++) {
                    finalquery = finalquery + " " + genkeywords[i].text;

                }
                finalquery = finalquery + " " + query;
            }




        }





        const user = await UserModel.findById(userid);

        console.log("finalquery", finalquery);
        console.log("len", outputlength);




        if (user) {

            if (user.subid) {
                const subscription = await stripe.subscriptions.retrieve(
                    user.subid
                );
                if (subscription.status == 'active') {

                    if (user.allowed && user.remainingwords > 10) {









                        let replies = [];
                        let totalwords = 0;
                        for (let i = 0; i < outputlength; i++) {
                            const resdata = await openai.createCompletion({

                                model: "davinci-instruct-beta-v3",
                                prompt: finalquery,
                                temperature: 0.7,
                                max_tokens: max_tokens,
                                top_p: 1,
                                frequency_penalty: 0,
                                presence_penalty: 0
                            });

                            replies.push(
                                resdata.data.choices[0].text
                            )
                            totalwords = totalwords + resdata.data.choices[0].text.length;

                        }

                        console.log('resdata', replies);

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
                                        a.push({ v: foundString })

                                    }
                                }

                            }
                            refinedResult.push(a)


                            console.log("refined", refinedResult);

                        }








                        console.log('tot', totalwords);


                        const updateduser = await UserModel.findByIdAndUpdate(userid, {
                            remainingwords: user.remainingwords - totalwords
                        }, { new: true })


                        return res.json({
                            success: true,
                            message: "result generated successfully",
                            result: refinedResult,

                            keywords: genkeywords,
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
            messsage: error.message,
        })
    }
}

exports.generate_Details = async (req, res) => {

    try {
        console.log("DSADas");
        let data = [];

        return res.json({
            success: true,
            relatedqueries: relatedQueries
        })


    } catch (error) {

        console.log("Error inn the catch block of Generate Content Controller", error.message)
    }
}


exports.Generate_Keywords = async (req, res) => {


    // let ip = req.get('x-forwarded-for') || req.connection.remoteAddress;

    let ip = "101.50.127.83";
    const country = await getLocation(ip);









    const userid = req.id;
    const { searchterm } = req.body;

    try {






        const findKeywords = async (keyword, country) => {
            queries = [];

            console.log(keyword, country);

            await axios.get('https://seo-keyword-research.p.rapidapi.com/keynew.php', {
                params: { keyword: keyword, country: country }, headers: {
                    'X-RapidAPI-Key': 'a350f94596mshf14d44e43776643p1a8e4ajsn332ca7b338a0',
                    'X-RapidAPI-Host': 'seo-keyword-research.p.rapidapi.com'
                }
            }).then(function (response) {
                console.log('saasa');

                const ans = response.data;


                const len = response.data.length;

                for (let i = 0; i < len; i++) {
                    if (queries.length < 50) {
                        queries.push(ans[i]);

                    } else {
                        break;
                    }
                }

            }).catch(function (error) {
                console.log("error in keyword planer", error.message);


            });


            return queries;
        }
















        const keywords = await findKeywords(searchterm, country);
        console.log("key", keywords);








        const user = await UserModel.findById(userid);






        if (user) {

            if (user.subid) {
                const subscription = await stripe.subscriptions.retrieve(
                    user.subid
                );
                if (subscription.status == 'active') {



                    return res.json({
                        success: true,
                        message: "result generated successfully",
                        keywords: keywords,
                    })

                }

            } else {
                return res.json({
                    success: false,
                    message: "Subscription is not Active please subscribe to a package"
                })
            }


        } else {
            return res.json({
                success: false,
                message: "You haven,t Subscribed to any Product please subscribe to a package "
            })
        }
    } catch (error) {

        console.log("Error inn the catch block of Generate keywords Controller", error.message)
        return res.json({
            success: false,
            messsage: error.message,
        })
    }
}





// const customer = await stripe.subscriptions.search({
//     query: `email:'${user.email}'`,
// })
// // console.log(customer);

// for (let i = 0; i < customer.data.length; i++) {
//     if (customer.data[i].id == user.customerid) {
//         console.log(customer.data[i]);
//     }
// }





















