const shortId = require("shortid");
const jwt = require("jsonwebtoken"); // To generate token
const expressJwt = require("express-jwt"); // To check if the token has beenexpired or is valid
const _ = require("lodash"); // To update fields in database
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { OAuth2Client } = require("google-auth-library");

const User = require("../models/user");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.preSignup = (req, res) => {
  const { name, email, password } = req.body;
  User.findOne({ email: email.toLowerCase() }, (err, user) => {
    if (user) {
      return res.status(400).json({
        error: "Email is taken",
      });
    }
    const token = jwt.sign(
      { name, email, password },
      process.env.JWT_ACCOUNT_ACTIVATION,
      {
        expiresIn: "10m",
      }
    );
    const mailTo = email;
    const mailFrom = process.env.AUTH_MAIL_FROM;
    const mailSubject = `Account activation link - ${process.env.APP_NAME}`;
    const mailText = `
    Please use the following link to activate your account: \n 
    ${process.env.CLIENT_URL}/auth/account/activate/${token} \n 
    This mail may contain sensitive information. \n
    ${process.env.CLIENT_URL}
    `;
    const mailHTML = `
    <p>Please use the following link to activate your account:</p>
    <p>${process.env.CLIENT_URL}/auth/account/activate/${token}</p>
    <hr />
    <p>This mail may contain sensitive information.</p>
    <p>${process.env.CLIENT_URL}</p>
    `;
    const mailSuccessMessage = `Email has been sent to ${email}. Follow the instructions to activate your account.  Link expires in 10 minutus.`;
    const mailErrorMessage =
      "Sorry, we are unable to register your account at this time. Please try later!";
    const emailData = {
      to: mailTo,
      from: mailFrom,
      subject: mailSubject,
      text: mailText,
      html: mailHTML,
    };
    sgMail
      .send(emailData)
      .then((sent) => {
        return res.json({
          success: true,
          message: mailSuccessMessage,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(400).json({
          success: false,
          error: mailErrorMessage,
        });
      });
  });
};

exports.signup = (req, res) => {
  const { token } = req.body;
  if (token) {
    jwt.verify(
      token,
      process.env.JWT_ACCOUNT_ACTIVATION,
      function (err, decoded) {
        if (err) {
          return res.status(401).json({
            error: "Expired link; please try again.",
          });
        }
        const { name, email, password } = jwt.decode(token);
        User.findOne({ email }).exec((err, user) => {
          if (user) {
            return res.status(400).json({
              error: "Email is taken",
            });
          }
          let username = shortId.generate();
          let profile = `${process.env.CLIENT_URL}/profile/${username}`;
          let newUser = new User({ name, email, password, username, profile });
          newUser.save((err, success) => {
            if (err) {
              return res.status(400).json({
                error: err,
              });
            }
            res.json({
              message: "Signup success! Please signin.",
            });
          });
        });
      }
    );
  }
};

exports.signin = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email }).exec((err, user) => {
    // Check if user exists
    if (err || !user) {
      return res.status(400).json({
        error: "User with that email does not exist. Please signup.",
      });
    }
    // Authenticate
    if (!user.authenticate(password)) {
      return res.status(400).json({
        error: "Email and password does not match",
      });
    }
    // Generate token and send to client
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", token, { expiresIn: "1d" });
    const { _id, username, name, email, role } = user;
    return res.json({
      token,
      user: { _id, username, name, email, role },
    });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "Signup success!",
  });
};

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});

exports.forgotPassword = (req, res) => {
  const { email } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({
        error: "User with that email does not exist.",
      });
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET_PASSWORD, {
      expiresIn: "10m",
    });
    const mailTo = email;
    const mailFrom = process.env.AUTH_MAIL_FROM;
    const mailSubject = `Reset password link - ${process.env.APP_NAME}`;
    const mailText = `
    Please use the following link to reset your password: \n 
    ${process.env.CLIENT_URL}/auth/password/reset/${token} \n 
    This mail may contain sensitive information. \n
    ${process.env.CLIENT_URL}
    `;
    const mailHTML = `
    <p>Please use the following link to reset your password:</p>
    <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
    <hr />
    <p>This mail may contain sensitive information.</p>
    <p>${process.env.CLIENT_URL}</p>
    `;
    const mailSuccessMessage = `Email has been sent to ${email}. Follow the instructions to activate your account. Link expires in 10 minutus.`;
    const mailErrorMessage = "Sorry, Something went wrong.Please try again!";
    const emailData = {
      to: mailTo,
      from: mailFrom,
      subject: mailSubject,
      text: mailText,
      html: mailHTML,
    };
    user.updateOne({ resetPasswordLink: token }, (err, success) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      sgMail
        .send(emailData)
        .then((sent) => {
          return res.json({
            success: true,
            message: mailSuccessMessage,
          });
        })
        .catch((err) => {
          console.log(err);
          return res.status(400).json({
            success: false,
            error: mailErrorMessage,
          });
        });
    });
  });
};

exports.resetPassword = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;
  if (resetPasswordLink) {
    jwt.verify(
      resetPasswordLink,
      process.env.JWT_RESET_PASSWORD,
      function (err, decoded) {
        if (err) {
          return res.status(401).json({
            error: "Expired link. Please try again!",
          });
        }
        User.findOne({ resetPasswordLink }, (err, user) => {
          if ((err, !user)) {
            return res.status(401).json({
              error: "Something went wrong; please try again.",
            });
          }
          const updatedFields = {
            password: newPassword,
            resetPasswordLink: "",
          };
          user = _.extend(user, updatedFields);
          user.save((err, result) => {
            if (err) {
              return res.status(400).json({
                error: errorHandler(err),
              });
            }
            res.json({
              success: true,
              message: "Great! Now you can login with your new password.",
            });
          });
        });
      }
    );
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.googleLogin = (req, res) => {
  const idToken = req.body.tokenId;
  client
    .verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })
    .then((response) => {
      const { email_verified, name, email, jti } = response.payload;
      if (email_verified) {
        User.findOne({ email }).exec((err, user) => {
          if (user) {
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
              expiresIn: "1d",
            });
            res.cookie("token", token, { expiresIn: "1d" });
            const { _id, email, name, role, username } = user;
            return res.json({
              token,
              user: { _id, email, name, role, username },
            });
          } else {
            let username = shortId.generate();
            let profile = `${process.env.CLIENT_URL}/profile/${username}`;
            let password = jti + process.env.JWT_SECRET;
            user = new User({ name, email, profile, username, password });
            user.save((err, data) => {
              if (err) {
                return res.status(400).json({
                  error: errorHandler(err),
                });
              }
              const token = jwt.sign(
                { _id: data._id },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
              );
              res.cookie("token", token, { expiresIn: "1d" });
              const { _id, email, name, role, username } = data;
              return res.json({
                token,
                user: { _id, email, name, role, username },
              });
            });
          }
        });
      } else {
        return res.status(400).json({
          error: "Google login failed; please try again.",
        });
      }
    });
};
