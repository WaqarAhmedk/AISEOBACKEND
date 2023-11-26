const mongoose = require('mongoose')

const KeywordSchema = mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    cpc: {
        type: String,
    },
    vol: {
        type: String
    },
    v: {
        type: String,
    },
    competition: {
        type: String
    },
    score: {
        type: String
    }

})

const keywords = mongoose.model('keyword', KeywordSchema);
module.exports = keywords;