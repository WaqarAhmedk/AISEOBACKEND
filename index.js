const express = require("express");
const app = express();
const connectDb = require("./dbconfig/connection");
const cors = require("cors");
const bodyParser = require("body-parser");

app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf
  }
}))
// app.use(express.json());
app.use(cors());
app.set('trust proxy', true)
require("dotenv").config();


const user = require("./routes/userroute");
const stripe = require("./routes/paymentsroute");
const content = require("./routes/generatecontentroute");
const webhooks = require("./routes/Checkrecuringpayment");
const trialuser = require("./routes/trialuserroute")




app.use('/trial', trialuser)
app.use("/user", user);
app.use("/stripe", stripe)
app.use("/content", content);
app.use('/webhook', webhooks)








const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("Server i slistening on port " + PORT);
})
connectDb();

