const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Use your provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // App Password, not regular password
    },
  });

  const mailOptions = {
    from: `"Continental Hospital" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html, // This allows us to send the template
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
