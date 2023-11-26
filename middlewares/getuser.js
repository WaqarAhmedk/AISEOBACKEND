const jwt = require("jsonwebtoken");
const SECRET_KEY = "thisis@secret";

const getUser = (req, res, next) => {
    try {
        const usertoken = req.get('authtoken');



        if (!usertoken) {
            return res.send("Please provide a token");

        }

        const data = jwt.verify(usertoken, SECRET_KEY, SECRET_KEY);



        if (data) {
            req.id = data.id
        }

    } catch (error) {
        console.log(error);
        return res.status(403).send("Please provide s valid token");
    }

    next();

}

module.exports = getUser;