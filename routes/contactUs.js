const express = require("express");

const router = express.Router();

// Validators
const { runValidation } = require("../validators");
const { contactFormValidator } = require("../validators/contactUs");

// Controllers
const { contactUs } = require("../controllers/contactUs");

// Routes
router.post("/contact-us", contactFormValidator, runValidation, contactUs);

// Export
module.exports = router;
