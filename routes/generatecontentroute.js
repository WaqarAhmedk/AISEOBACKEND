const express = require("express");
const { Generate_Content, generate_Details, Generate_Keywords, Generate_ParaPhrase } = require("../controllers/generatecontentcontroller");
const { Generate_Blog } = require('../controllers/blogController');
const { Generate_Product, } = require('../controllers/productcontroller');
const { Generate_Web, } = require('../controllers/webcontroller');
const { Generate_Rephrase, Generate_Summarize, } = require('../controllers/rephrase-summarizecontroller');


const getUser = require("../middlewares/getuser");

const router = express.Router();


router.post("/create", getUser, Generate_Content);
router.post("/create-blog", getUser, Generate_Blog);
router.post("/create-product", getUser, Generate_Product);
router.post("/create-web", getUser, Generate_Web);
router.post("/create-rephrase", getUser, Generate_Rephrase);
router.post("/create-summarize", getUser, Generate_Summarize);
router.post("/create-paraphrase", getUser, Generate_ParaPhrase);






router.get("/check-details", getUser, generate_Details);
router.post("/keywords", getUser, Generate_Keywords);


module.exports = router;