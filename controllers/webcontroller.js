const UserModel = require("../models/usermodel");
const openai = require("../openaiconfig/openaiconfig");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);



exports.Generate_Web = async (req, res) => {




    const userid = req.id;
    const { keywords, query, outputlength, language } = req.body;
    let finalreply = [];
    console.log('language: ' + language);
    try {



        const user = await UserModel.findById(userid);

        if (user) {

            if (user.plan === 'free') {
                if (user.allowed && user.remainingwords > 10) {


                    const titles = await WebpageTitle(keywords, query, outputlength, language);


                    for (let i = 0; i < titles.length; i++) {
                        const titledesc = await WebpageTitleDesc(keywords, titles[i], language);
                        const pagedesc = await WebpageDesc(keywords, titles[i], language);
                        const aboutus = await WebpageAboutus(keywords, titles[i], language);
                        const metadata = await WebpageMetaData(keywords, titles[i], language)



                        finalreply.push({
                            title: titles[i],
                            titledesc: titledesc[0],
                            desc: pagedesc[0],
                            aboutus: aboutus[0],
                            metadata: metadata[0]
                        })





                    }
                    console.log('final is here', finalreply);
                    let totalwords = 0;

                    for (let i = 0; i < finalreply.length; i++) {


                        finalreply[i].title = finalreply[i].title.replace(/(^\s*)|(\s*$)/gi, "");//exclude  start and end white-space
                        finalreply[i].title = finalreply[i].title.replace(/\n /, "\n"); // exclude newline with a start spacing
                        let ans1 = finalreply[i].title.split(' ').filter(function (str) { return str != ""; }).length;
                        // //return s.split(' ').filter(String).length; - this can also be used

                        finalreply[i].titledesc = finalreply[i].titledesc.replace(/(^\s*)|(\s*$)/gi, "");//exclude  start and end white-space
                        finalreply[i].titledesc = finalreply[i].titledesc.replace(/\n /, "\n"); // exclude newline with a start spacing
                        let ans2 = finalreply[i].titledesc.split(' ').filter(function (str) { return str != ""; }).length;





                        finalreply[i].desc = finalreply[i].desc.replace(/(^\s*)|(\s*$)/gi, "");//exclude  start and end white-space
                        finalreply[i].desc = finalreply[i].desc.replace(/\n /, "\n"); // exclude newline with a start spacing
                        let ans3 = finalreply[i].desc.split(' ').filter(function (str) { return str != ""; }).length;


                        finalreply[i].aboutus = finalreply[i].aboutus.replace(/(^\s*)|(\s*$)/gi, "");//exclude  start and end white-space
                        finalreply[i].aboutus = finalreply[i].aboutus.replace(/\n /, "\n"); // exclude newline with a start spacing
                        let ans4 = finalreply[i].aboutus.split(' ').filter(function (str) { return str != ""; }).length;


                        finalreply[i].metadata = finalreply[i].metadata.replace(/(^\s*)|(\s*$)/gi, "");//exclude  start and end white-space
                        finalreply[i].metadata = finalreply[i].metadata.replace(/\n /, "\n"); // exclude newline with a start spacing
                        let ans5 = finalreply[i].metadata.split(' ').filter(function (str) { return str != ""; }).length;
                        totalwords = ans1 + ans2 + ans3 + ans4 + ans5;
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









                        const titles = await WebpageTitle(keywords, query, outputlength, language);


                        for (let i = 0; i < titles.length; i++) {
                            const titledesc = await WebpageTitleDesc(keywords, titles[i], language);
                            const pagedesc = await WebpageDesc(keywords, titles[i], language);
                            const aboutus = await WebpageAboutus(keywords, titles[i], language);
                            const metadata = await WebpageMetaData(keywords, titles[i], language)



                            finalreply.push({
                                title: titles[i],
                                titledesc: titledesc[0],
                                desc: pagedesc[0],
                                aboutus: aboutus[0],
                                metadata: metadata[0]
                            })





                        }
                        console.log('final is here', finalreply);
                        let totalwords = 0;

                        for (let i = 0; i < finalreply.length; i++) {


                            finalreply[i].title = finalreply[i].title.replace(/(^\s*)|(\s*$)/gi, "");//exclude  start and end white-space
                            finalreply[i].title = finalreply[i].title.replace(/\n /, "\n"); // exclude newline with a start spacing
                            let ans1 = finalreply[i].title.split(' ').filter(function (str) { return str != ""; }).length;
                            // //return s.split(' ').filter(String).length; - this can also be used

                            finalreply[i].titledesc = finalreply[i].titledesc.replace(/(^\s*)|(\s*$)/gi, "");//exclude  start and end white-space
                            finalreply[i].titledesc = finalreply[i].titledesc.replace(/\n /, "\n"); // exclude newline with a start spacing
                            let ans2 = finalreply[i].titledesc.split(' ').filter(function (str) { return str != ""; }).length;





                            finalreply[i].desc = finalreply[i].desc.replace(/(^\s*)|(\s*$)/gi, "");//exclude  start and end white-space
                            finalreply[i].desc = finalreply[i].desc.replace(/\n /, "\n"); // exclude newline with a start spacing
                            let ans3 = finalreply[i].desc.split(' ').filter(function (str) { return str != ""; }).length;


                            finalreply[i].aboutus = finalreply[i].aboutus.replace(/(^\s*)|(\s*$)/gi, "");//exclude  start and end white-space
                            finalreply[i].aboutus = finalreply[i].aboutus.replace(/\n /, "\n"); // exclude newline with a start spacing
                            let ans4 = finalreply[i].aboutus.split(' ').filter(function (str) { return str != ""; }).length;


                            finalreply[i].metadata = finalreply[i].metadata.replace(/(^\s*)|(\s*$)/gi, "");//exclude  start and end white-space
                            finalreply[i].metadata = finalreply[i].metadata.replace(/\n /, "\n"); // exclude newline with a start spacing
                            let ans5 = finalreply[i].metadata.split(' ').filter(function (str) { return str != ""; }).length;
                            totalwords = ans1 + ans2 + ans3 + ans4 + ans5;
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


const WebpageTitle = async (keywords, query, outputlength, language) => {

    try {
        let finalquery;
        const translateq = "Generate professional, eye catching, witty webpage title on: \n " + query;


        if (language !== 'English') {
            finalquery = await translateQuery(translateq, language);
            finalquery = finalquery;
        } else {
            finalquery = translateq;
        }
        let replies = [];

        console.log('finl', finalquery);
        for (let i = 0; i < outputlength; i++) {
            const resdata = await openai.createCompletion({

                model: "davinci-instruct-beta-v3",
                prompt: finalquery,
                temperature: 0.7,
                max_tokens: 30,
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

const WebpageTitleDesc = async (keywords, title, language) => {
    try {


        // Prompt: Generate a professional, eye-catching, and witty web page description for a webpage about [topic]. Incorporate the following keywords: [keyword1], [keyword2], [keyword3]. The description should be engaging, creative, and highlight the unique features of the web page, while seamlessly integrating the keywords.

        const query = "Generate a professional, eye-catching, and witty web title description for a webpage about " + title

        let finalquery = ''

        if (keywords.length > 0) {
            finalquery = query + ".Incorporate the following keywords:"

            for (let i = 0; i < keywords.length; i++) {
                finalquery = finalquery + " " + '`' + keywords[i] + '`, ';

            }

        } else {
            finalquery = query
        }


        if (language !== 'English') {
            let finalqueryres = await translateQuery(finalquery, language);
            finalquery = finalqueryres;
        } else {
            finalquery = finalquery;
        }




        let replies = [];
        console.log('cejdsadsad   :', finalquery);
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


        refinedResult = replies.map((str) => {
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
const WebpageDesc = async (keywords, title, language) => {
    try {


        // Prompt: Generate a creative and captivating web page description for a webpage about [topic], incorporating the following keywords: [keyword1], [keyword2], [keyword3]. The description should be professional, eye-catching, and infused with witty language that showcases the unique features of the web page.
        const query = "Generate a professional, eye-catching, seo optimized, and witty web page description for a webpage about " + title;

        let finalquery = ''

        if (keywords.length > 0) {
            finalquery = query + ".Incorporate the following keywords:"

            for (let i = 0; i < keywords.length; i++) {
                finalquery = finalquery + " " + '`' + keywords[i] + '`, ';

            }

        } else {
            finalquery = query
        }


        if (language !== 'English') {
            let finalqueryres = await translateQuery(finalquery, language);
            finalquery = finalqueryres;
        } else {
            finalquery = finalquery;
        }









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


        refinedResult = replies.map((str) => {
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

const WebpageAboutus = async (keywords, title, language) => {
    try {



        const query = "Generate a description for a my website that is about  " + title + ' in 5 to 7 lines';

        let finalquery = '';

        if (keywords.length > 0) {
            finalquery = 'using following keywords '
            for (let i = 0; i < keywords.length; i++) {
                finalquery = finalquery + " " + keywords[i];

            }
            finalquery = finalquery + ' ' + query + ".\n\n 1. "

        } else {
            finalquery = query;
        }



        if (language !== 'English') {
            let finalqueryres = await translateQuery(finalquery, language);
            finalquery = finalqueryres
        }




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
const WebpageMetaData = async (keywords, title, language) => {
    try {



        const query = "Generate web page METADATA  for  my website that is about  ";

        let finalquery = '';

        if (keywords > 0) {
            finalquery = 'using following keywords '
            for (let i = 0; i < keywords.length; i++) {
                finalquery = finalquery + " " + keywords[i];

            }
            finalquery = finalquery + ' ' + query + ".\n\n"

        } else {
            finalquery = query;
        }


        if (language !== 'English') {
            let finalqueryres = await translateQuery(finalquery, language);
            finalquery = finalqueryres + '\n ' + title
        } else {
            finalquery = finalquery + ' \n' + title
        }





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
        console.log('replies', replies);
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


