const { Configuration, OpenAIApi } = require("openai");


const configuration = new Configuration({
    apiKey: "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",
});
const openai = new OpenAIApi(configuration);
module.exports = openai;