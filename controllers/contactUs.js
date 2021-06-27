const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.contactUs = (req, res) => {
  const { name, email, message } = req.body;
  const mailTo = process.env.EMAIL_TO;
  const mailFrom = process.env.CONTACT_FORM_MAIL_FROM;
  const mailSubject = `Contact Form - ${process.env.APP_NAME}`;
  const mailText = `
    Email received from contact form \n 
    Sender name: ${name} \n 
    Sender email: ${email} \n
    Sender message: ${message} \n
    This mail may contain sensitive information. \n
    ${process.env.CLIENT_URL}
    `;
  const mailHTML = `
    <h4>Email received from contact form:</h4>
    <p>Sender name: ${name}</p>
    <p>Sender email: ${email}</p>
    <p>Sender message: ${message}</p>
    <hr />
    <p>This mail may contain sensitive information.</p>
    <p>${process.env.CLIENT_URL}</p>
    `;
  const mailSuccessMessage =
    "Thanks, your message has been successfully sent. We will get back to you as soon as possible.";
  const mailErrorMessage =
    "Sorry, we are unable to send your message at this time.Please try later!";
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
};
