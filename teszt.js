const axios = require("axios");
const openai = require("./openaiconfig/openaiconfig")
const findKeywords = async (keyword, country) => {
    const axios = require('axios');

    const response = await axios.get('https://api.stripe.com/v1/subscriptions/sub_1MjHm6LSI0nFoTImRbWkdDZ2', {
        auth: {
            username: 'sk_test_51MYjj7LSI0nFoTImAqe3M1OiobsWywVP1vTrck7OX6Rnr3GgXcMyKxTp612UyjXycaXhOFpaQ1TRJG3kvmv1JHaT005wRIpnDe'
        }
    });
    console.log(response);
}

findKeywords();

