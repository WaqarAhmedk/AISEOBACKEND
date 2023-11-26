const UserModel = require("../models/usermodel");
const openai = require("../openaiconfig/openaiconfig");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const TrialUser = require("../models/trialmodel");

exports.Generate_Blog = async (req, res) => {
  const userid = req.id;
  const { keywords, query, outputlength, language } = req.body;
  console.log("Requested Language is ", language);
  let finalreply = [];

  try {
    const user = await UserModel.findById(userid);

    if (user) {
      if (user.plan === "free") {
        if (user.allowed && user.remainingwords > 10) {
          const topics = await BlogTopics(
            keywords,
            query,
            outputlength,
            language
          );

          for (let i = 0; i < topics.length; i++) {
            const blogoverview = await BlogOverview(
              keywords,
              topics[i],
              language
            );
            const expandblogsection = await ExpandBlog(
              keywords,
              topics[i],
              language
            );

            finalreply.push({
              topic: topics[i],
              overview: blogoverview[0],
              expand: expandblogsection[0],
            });
          }
          console.log("final is here", finalreply);
          let totalwords = 0;

          for (let i = 0; i < finalreply.length; i++) {
            finalreply[i].topic = finalreply[i].topic.replace(
              /(^\s*)|(\s*$)/gi,
              ""
            ); //exclude  start and end white-space
            finalreply[i].topic = finalreply[i].topic.replace(/\n /, "\n"); // exclude newline with a start spacing
            let ans1 = finalreply[i].topic.split(" ").filter(function (str) {
              return str != "";
            }).length;
            // //return s.split(' ').filter(String).length; - this can also be used

            finalreply[i].overview = finalreply[i].overview.replace(
              /(^\s*)|(\s*$)/gi,
              ""
            ); //exclude  start and end white-space
            finalreply[i].overview = finalreply[i].overview.replace(
              /\n /,
              "\n"
            ); // exclude newline with a start spacing
            let ans2 = finalreply[i].overview.split(" ").filter(function (str) {
              return str != "";
            }).length;

           
            let dp = finalreply[i].expand;

            let ans3 = dp.trim().split(/\s+/).length;
            totalwords = ans1 + ans2 + ans3;
          }

          console.log("totalwords", totalwords);

          const updateduser = await UserModel.findByIdAndUpdate(
            userid,
            {
              remainingwords: user.remainingwords - totalwords,
            },
            { new: true }
          );

          return res.json({
            success: true,
            message: "result generated successfully",
            result: finalreply,

            remainingwords: updateduser.remainingwords,
          });
        } else {
          return res.json({
            success: false,
            message: `your monthly word limit has Ended Remaining words are ${user.remainingwords} words`,
          });
        }
      } else if (user.subid) {
        const subscription = await stripe.subscriptions.retrieve(user.subid);
        if (subscription.status == "active") {
          if (user.allowed && user.remainingwords > 10) {
            const topics = await BlogTopics(
              keywords,
              query,
              outputlength,
              language
            );

            for (let i = 0; i < topics.length; i++) {
              const blogoverview = await BlogOverview(
                keywords,
                topics[i],
                language
              );
              const expandblogsection = await ExpandBlog(
                keywords,
                topics[i],
                language
              );

              finalreply.push({
                topic: topics[i],
                overview: blogoverview[0],
                expand: expandblogsection[0],
              });
            }
            console.log("final is here", finalreply);
            let totalwords = 0;

            for (let i = 0; i < finalreply.length; i++) {
              finalreply[i].topic = finalreply[i].topic.replace(
                /(^\s*)|(\s*$)/gi,
                ""
              ); //exclude  start and end white-space
              finalreply[i].topic = finalreply[i].topic.replace(/\n /, "\n"); // exclude newline with a start spacing
              let ans1 = finalreply[i].topic.split(" ").filter(function (str) {
                return str != "";
              }).length;
              // //return s.split(' ').filter(String).length; - this can also be used

              finalreply[i].overview = finalreply[i].overview.replace(
                /(^\s*)|(\s*$)/gi,
                ""
              ); //exclude  start and end white-space
              finalreply[i].overview = finalreply[i].overview.replace(
                /\n /,
                "\n"
              ); // exclude newline with a start spacing
              let ans2 = finalreply[i].overview
                .split(" ")
                .filter(function (str) {
                  return str != "";
                }).length;

              let dp = finalreply[i].expand;

              let ans3 = dp.trim().split(/\s+/).length;

              
              totalwords = ans1 + ans2 + ans3;
            }

            console.log("totalwords", totalwords);

            const updateduser = await UserModel.findByIdAndUpdate(
              userid,
              {
                remainingwords: user.remainingwords - totalwords,
              },
              { new: true }
            );

            return res.json({
              success: true,
              message: "result generated successfully",
              result: finalreply,

              remainingwords: updateduser.remainingwords,
            });
          } else {
            return res.json({
              success: false,
              message: `youu have only ${user.remainingwords} words
                            `,
            });
          }
        } else {
          return res.json({
            success: false,
            message: "Subscription is not Active please subscribe to a package",
          });
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
          message:
            "You haven,t Subscribed to any Product please subscribe to a package ",
        });
      }
    }
  } catch (error) {
    console.log(
      "Error inn the catch block of Generate Content Controller",
      error.message
    );
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

const translateQuery = async (query, language) => {
  // "Translate this into 1. French, 2. Spanish and 3. Japanese:\n\nWhat rooms do you have available?\n\n1.",
  const fquery = "Translate this into " + language + " \n\n" + query + "\n\n";
  console.log(fquery, "ddd");
  const resdata = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: fquery,
    temperature: 0.9,
    max_tokens: 100,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  const data = resdata.data.choices[0].text;
  console.log("transalted", data);
  return data;
};

const BlogTopics = async (keywords, query, outputlength, language) => {
  try {
    let finalquery;
    finalquery = "Generate seo optimized blog topic title for: " + query;

    if (keywords.length > 0) {
      finalquery = finalquery + ". make sure it is relevent with these kewords";
      for (let i = 0; i < keywords.length; i++) {
        finalquery = finalquery + " " + "`" + keywords[i] + "`";
      }
    }

    if (language !== "English") {
      finalquery = await translateQuery(finalquery, language);
    } else {
      finalquery = finalquery;
    }
    console.log("final query in topics", finalquery);

    let replies = [];
    for (let i = 0; i < outputlength; i++) {
      const resdata = await openai.createCompletion({
        model: "davinci-instruct-beta-v3",
        prompt: finalquery,
        temperature: 0.3,
        max_tokens: 30,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      replies.push(resdata.data.choices[0].text);
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
          if (foundString.length > 5) {
            if (refinedResult.length < outputlength) {
              refinedResult.push(foundString);
              break;
            } else {
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
    console.log("Error in generate blog topics function", error.message);
    return "something bad";
  }
};
const BlogOverview = async (keywords, topic, language) => {
  try {
    const overviewprompt = "Generate a short overview for blog on  ";
    let finalquery = "";
    if (keywords.length > 0) {
      finalquery = "by using these keywords ";
      for (let i = 0; i < keywords.length; i++) {
        finalquery = finalquery + " " + "`" + keywords[i] + "`";
      }

      finalquery = finalquery + " " + overviewprompt;
    } else {
      finalquery = overviewprompt;
    }
    if (language !== "English") {
      const finalqueryres = await translateQuery(finalquery, language);
      finalquery = finalqueryres + ":" + topic;
    } else {
      finalquery = finalquery + ": " + topic;
    }

    let replies = [];
    console.log("overview", finalquery);
    const resdata = await openai.createCompletion({
      model: "davinci-instruct-beta-v3",
      prompt: finalquery,
      temperature: 0.3,
      max_tokens: 200,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    replies.push(resdata.data.choices[0].text);

    const refinedResult = [];

    for (let j = 0; j < replies.length; j++) {
      let a = [];
      // const element = array[i];

      const str = replies[j];
      const ans = str.split(/\r?\n/);
      for (var i = 0; i < ans.length; i++) {
        if (ans[i]) {
          const foundString = ans[i].replace(/[^a-zA-Z ]/g, "");
          if (foundString.length > 20) {
            refinedResult.push(foundString);
            break;
          }
        } else {
          continue;
        }
      }

      // console.log("refined overview", refinedResult);
    }

    return refinedResult;
  } catch (error) {
    console.log("Error in generate blog topics function", error.message);
    return "something bad";
  }
};

const ExpandBlog = async (keywords, topic, language) => {
  try {
    let overviewprompt =
      " Write a blog content of approximately 1500 words on the topic of :" +
      topic;

    let finalquery = "";
    if (keywords.length > 0) {
      overviewprompt =
        overviewprompt +
        ". Make sure to include the following words in your writing:";

      for (let i = 0; i < keywords.length; i++) {
        overviewprompt = overviewprompt + " " + "`" + keywords[i] + "`, ";
      }
      finalquery =
        overviewprompt +
        ".The content should be engaging, informative, and well-structured and seo optimized. Use proper grammar and language. Feel free to add your own insights and creativity to make it unique and interesting.Conclude the blog content with a summary of the main points discussed and your personal conclusion or opinion on the topic. The conclusion should be no more than 3-4 sentences.";
    } else {
      finalquery =
        overviewprompt +
        ".The content should be engaging, informative, and well-structured and seo optimized. Use proper grammar and language. Feel free to add your own insights and creativity to make it unique and interesting.Conclude the blog content with a summary of the main points discussed and your personal conclusion or opinion on the topic. The conclusion should be no more than 3-4 sentences.";
    }

    if (language !== "English") {
      const finalqueryres = await translateQuery(finalquery, language);
      finalquery = finalqueryres;
    } else {
      finalquery = finalquery;
    }
    let replies = [];
    console.log(finalquery);
    const resdata = await openai.createCompletion({
      model: "davinci-instruct-beta-v3",
      prompt: finalquery,
      temperature: 0.5,
      max_tokens: 1500,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    replies.push(resdata.data.choices[0].text);

    let expandedsection = replies.map((str) => {
      return str.replaceAll("\n", "");
    });

    return replies;
  } catch (error) {
    console.log("Error in generate blog topics function", error.message);
    return "something bad";
  }
};
