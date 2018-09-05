const nodemailer = require('nodemailer');
const clog = require('./clog');

class MailService {
    constructor(cfg) {
        this.cfg = cfg;
        this.transporter = nodemailer.createTransport({
            service: this.cfg.service,
            auth: this.cfg.auth,
        });
    }

    send_everify(email, secret) {
        let link = `http://${this.cfg.self_host}/#/sign/verify/${secret}`;

        this.transporter.sendMail({
            from: 'WORLD-NULL Account Service <' + this.cfg.email + '>',
            to: email,
            subject: 'Welcome to WORLD-NULL',
            html: `
<h3>WELCOME TO WORLD-NULL</h3>
<p>
    We're glad to see you in our game.<br>
    To verify your account use link below:<br><br>
    <a href="${link}" style="">${link}</a>
</p>
`
        }).then((info) => {
            clog(`[mail:everify] ${email} / sent`);
            return true;
        }).catch((err) => {
            clog('[mail:everify] ERROR!', err);
        });
    }

    send_passrst(email, secret) {
        let link = `http://${this.cfg.self_host}/#sign/reset/${secret}`;

        this.transporter.sendMail({
            from: 'WORLD-NULL Account Service <' + this.cfg.email + '>',
            to: email,
            subject: 'Restore access to account',
            html: `
<h3>RESTORING ACCESS TO ACCOUNT</h3>
<p>
    Seems you have a trouble with login.<br>
    To reset your password use link below:<br><br>
    <a href="${link}">${link}</a>
</p>
`
        }).then((info) => {
            clog(`[mail:passrst] ${email} / sent`);
            return true;
        }).catch((err) => {
            clog('[mail:passrst] ERROR!', err);
        });
    }
}

module.exports = MailService;
