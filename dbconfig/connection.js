const mongoose = require("mongoose");
const dbName = "seo360";
// const conUrl=`mongodb+srv://waqar:waqar@cluster0.2utvwps.mongodb.net/${dbName}?retryWrites=true&w=majority`;

const conUrl = `mongodb+srv://waqar:waqar@cluster0.2utvwps.mongodb.net/${dbName}?retryWrites=true&w=majority`;


const connectDb = () => {
    try {
        mongoose.set("strictQuery", true);

        mongoose.connect(conUrl).then(() => {
            console.log("Connected with Db Successfully");
        }).catch((error) => {
            console.log('Error in DB connection catch', error.message);
        });

    } catch (error) {
        console.log("Something bad hapend in db connnection" + error);
    }
}

module.exports = connectDb;