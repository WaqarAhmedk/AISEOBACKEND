const UserModel = require("../models/usermodel");
const openai = require("../openaiconfig/openaiconfig");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const TrialUser = require('../models/trialmodel')

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
    console.log('sdsa', country, keyword);
    queries = [];


    await axios.get('https://seo-keyword-research.p.rapidapi.com/keynew.php', {
        params: { keyword: keyword, country: 'us' }, headers: {
            'X-RapidAPI-Key': 'a350f94596mshf14d44e43776643p1a8e4ajsn332ca7b338a0',
            'X-RapidAPI-Host': 'seo-keyword-research.p.rapidapi.com'
        }
    }).then(function (response) {
        console.log('saasa', response);

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

// const findKeywords = async (keyword, country) => {
//     let data = [];
//     relatedQueries = [];


//     await axios.get('https://seo-keyword-research.p.rapidapi.com/keynew.php', {
//         params: { keyword: keyword, country: 'us' }, headers: {
//             'X-RapidAPI-Key': 'a350f94596mshf14d44e43776643p1a8e4ajsn332ca7b338a0',
//             'X-RapidAPI-Host': 'seo-keyword-research.p.rapidapi.com'
//         }
//     }).then(function (response) {

//         const ans = response.data;
//         console.log(ans);
//         for (let i = 0; i < 50; i++) {
//             relatedQueries.push(ans[i]);
//         }
//         let d = ans.sort((a, b) => {
//             if (b.volume !== a.volume) {
//                 return b.score - a.score; // sort by greater volume
//             }
//             return a.score - b.score
//         });





//         for (let i = 0; i < 200; i++) {
//             if (data.length > 0) {
//                 data.map((fff) => {
//                     if (fff.score != d[i].score && data.length < 5) {
//                         data.push(d[i]);

//                     }
//                 })

//             } else if (data.length >= 5) {
//                 break;

//             }
//             else {
//                 data.push(d[i]);
//             }



//         }

//     }).catch(function (error) {
//         console.log("error in keyword planer", error.message);
//         // data=[ 'cat', 'cats', 'catos', "cato's", 'catoes' ]

//     });

//     // data = ['cat', 'cats', 'catos', "cato's", 'catoes']
//     return data;
// }

exports.Generate_Content = async (req, res) => {











    const userid = req.id;
    const { query, max_tokens, prompt, outputlength, keywords, usertype } = req.body;
    //converting max token into  Bigint as it is coming as a String
    const tokens = parseInt(max_tokens);
    console.log('tokens', tokens, typeof (tokens));

    try {


        if (tokens > 1500) {
            return res.json({
                success: false,
                message: "MAX 1500 Words are Allowed",

            })
        }

        const r1 = query.includes("topics");
        const r2 = query.includes("title");
        const r3 = query.includes("titles");
        let finalquery = "Using following keywords ";




        if (r1 || r2 || r3) {

            if (keywords != null) {
                for (let i = 0; i < keywords.length; i++) {
                    finalquery = finalquery + " " + keywords[i];

                }
                finalquery = finalquery + ' ' + query + ".\n\n 1. "

            }


        } else {
            if (keywords != null) {

                for (let i = 0; i < keywords.length; i++) {
                    finalquery = finalquery + " " + keywords[i];

                }
                finalquery = finalquery + " " + query;

            }



        }

        console.log('final query: ', finalquery);

        if (usertype === 'trial') {
            const user = await TrialUser.findById(userid);
            if (user && user.allowed) {
                let replies = [];
                let totalwords = 0;
                for (let i = 0; i < outputlength; i++) {
                    const resdata = await openai.createCompletion({

                        model: "davinci-instruct-beta-v3",
                        prompt: finalquery,
                        temperature: 0.7,
                        max_tokens: tokens,
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




                return res.json({
                    success: true,
                    message: "result generated successfully",
                    result: refinedResult,

                })
            }

        }

        const user = await UserModel.findById(userid);





        if (user) {

            if (user.plan === 'free') {
                if (user.allowed && user.remainingwords > 10) {


                    let replies = [];
                    let totalwords = 0;
                    for (let i = 0; i < outputlength; i++) {
                        const resdata = await openai.createCompletion({

                            model: "davinci-instruct-beta-v3",
                            prompt: finalquery,
                            temperature: 0.7,
                            max_tokens: tokens,
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

                        remainingwords: updateduser.remainingwords
                    })

                } else {
                    return res.json({
                        success: false,
                        message: `your monthly word limit has Ended Remainign words are ${user.remainingwords} words`
                    })
                }
            }

            else if (user.subid) {
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
                                max_tokens: tokens,
                                top_p: 1,
                                frequency_penalty: 0,
                                presence_penalty: 0
                            });

                            replies.push(
                                resdata.data.choices[0].text
                            )
                            totalwords = totalwords + resdata.data.choices[0].text.length;

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
                                        a.push({ v: foundString })

                                    }
                                }

                            }
                            refinedResult.push(a)



                        }










                        const updateduser = await UserModel.findByIdAndUpdate(userid, {
                            remainingwords: user.remainingwords - totalwords
                        }, { new: true })


                        return res.json({
                            success: true,
                            message: "result generated successfully",
                            result: refinedResult,

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
    const { searchterm, usertype } = req.body;
    console.log(req.body);

    try {

        if (usertype === 'trial') {
            const user = await TrialUser.findById(userid);
            if (user && user.allowed) {
                const keywords = await findKeywords(searchterm, country);


                console.log("key", keywords);


                return res.json({
                    success: true,
                    message: "result generated successfully",
                    keywords: keywords,
                })
            }

        }


        const user = await UserModel.findById(userid);


        if (!user) {
            return res.json({
                success: false,
                messsage: 'No User is found against this token',
            })
        }




        if (user.subid || user.plan === 'free') {

            if (user.subid) {
                const subscription = await stripe.subscriptions.retrieve(
                    user.subid
                );
                if (subscription.status == 'active') {

                    const keywords = await findKeywords(searchterm, country);
                    console.log("key", keywords);


                    return res.json({
                        success: true,
                        message: "result generated successfully",
                        keywords: keywords,
                    })

                } else {
                    return res.json({
                        success: false,
                        message: "Subscription is not Active please subscribe to a package"
                    })
                }
            } else {
                const keywords = await findKeywords(searchterm, country);
                console.log("key", keywords);


                return res.json({
                    success: true,
                    message: "result generated successfully",
                    keywords: keywords,
                })

            }


        } else {
            return res.json({
                success: false,
                message: 'You have no Subscription to any Plan please subscribe to a package or Use Free Trial version',
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












// const translateQuery = async (query, language) => {
//     // "Translate this into 1. French, 2. Spanish and 3. Japanese:\n\nWhat rooms do you have available?\n\n1.",
//     const fquery = 'translate following line into ' + language + ' language \n\n' + query + '\n\n';
//     console.log(fquery, 'ddd');
//     const resdata = await openai.createCompletion({

//         model: "text-davinci-003",
//         prompt: fquery,
//         temperature: 0.9,
//         max_tokens: 100,
//         top_p: 1,
//         frequency_penalty: 0,
//         presence_penalty: 0
//     });
//     const data = resdata.data.choices[0].text;
//     console.log('transalted', data);
//     return data;
// }



exports.Generate_ParaPhrase = async (req, res) => {

    const userid = req.id;
    const { query, language } = req.body;
    let finalreply = [];

    try {





        const user = await UserModel.findById(userid);

        if (user) {
            if (user.paraphrasinglimit > 0) {
                const data = await Paraphrase(query, language);

                console.log('data', data);
                if (data === 'stringproblem') {
                    return res.send({
                        success: false,
                        message: ("impossible str! you have some words having more lenght then normal words in paragraph that cannot be converted")
                    })
                }
                const user = await UserModel.findById(userid);

                const updateuser = await UserModel.findByIdAndUpdate(userid, {
                    paraphrasinglimit: user.paraphrasinglimit - 1
                });

                const useragain = await UserModel.findById(userid).select('-passowrd')





                return res.json({
                    success: true,
                    message: "result generated successfully",
                    result: data,
                    user: useragain,

                })



            }
            else {
                return res.json({
                    success: false,
                    message: `you have not made payment yet please click on buy now or refresh the page`
                })
            }




        } else {
            return res.status(404).json({ message: 'No User found with this id' })
        }







    } catch (error) {

        console.log("Error inn the catch block of Generate Paraphrase Controller", error.message)
        return res.json({
            success: false,
            message: error.message,
        })
    }
}




const Paraphrase = async (query, language) => {



    try {





        let finalans = [];

        var result = [];
        var start = 0;
        for (var i = 1300; i < query.length; i += 1300) {//jump to max
            while (query[i] !== "." && i) i--;//go back to .
            if (start === i) {
                return 'stringproblem'
            }
            result.push(query.substr(start, i - start));//substr to result
            start = i + 1;//set next start
        }

        //add last one
        result.push(query.substr(start));


        for (let i = 0; i < result.length; i++) {
            var finalq = result[i].replace(/\n|\r/g, "");

            let finalquery = "paraphrase the following paragraphs \n" + result[i];

            // if (language !== 'English') {
            //     let finalqueryres = await translateQuery(finalquery, language);
            //     finalquery = finalqueryres + '\n' + result[i];

            // } else {
            //     finalquery = finalquery + '\n' + result[i]
            // }
            let replies = [];
            const resdata = await openai.createCompletion({

                model: "davinci-instruct-beta-v3",
                prompt: finalquery,
                temperature: 0.7,
                max_tokens: 1700,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 1
            });

            replies.push(
                resdata.data.choices[0].text
            )



            const refinedResult = [];

            for (let j = 0; j < replies.length; j++) {
                // const element = array[i];
                if (replies[j].length > 4) {
                    refinedResult.push(replies[j])

                }










            }

            let singleline = '';
            for (let l = 0; l < refinedResult.length; l++) {
                singleline = singleline + refinedResult[l]

            }
            console.log('single', singleline);
            finalans.push(singleline)
        }



        return finalans;



    } catch (error) {
        console.log('Error in generate paraphrase function', error.message);
        return 'something bad'
    }




}
































