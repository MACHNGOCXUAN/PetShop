import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 587,
	auth: {
		user: process.env.USERNAME_EMAIL,
		pass: process.env.PASSWORD_EMAIL,
	},
});

const handleSendMail = async (val) => {
	try {
		await transporter.sendMail(val);

		return 'OK';
	} catch (error) {
		return error;
	}

};

const verification = async (email) => {

	const verificationCode = Math.floor(100000 + Math.random() * 900000);


	try {
		const data = {
			from: `zalo-cnm`,
			to: email,
			subject: 'Verification email code',
			text: 'Your code to verification email',
			html: `<h1>${verificationCode}</h1>`,
		};

		await handleSendMail(data);

		return verificationCode;
	} catch (error) {
		throw new Error('Can not send email');
	}
};


export default verification;

