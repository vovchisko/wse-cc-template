"use strict";
/*
    API v.0.2
    Process email verification
*/

const server = require('../server');

module.exports = async function (req, res, dat) {
    let result = {
        result: 0,
        type: 'error',
        text: ''
    };
    let log = 'E-VERIFY: ';

    if (!dat) return res.end();

    console.log('dat:', dat);

    if (dat.secret) {
        let player = await server.db.players.findOne({secret: dat.secret});

        if (player) {
            log += `[${player.email}] `;
            player.valid = true;
            player.secret = server.db.some_hash();

            await server.db.players.save(player);

            result.player = {api_key: player.api_key};
            result.result = 1;
            result.type = 'info';
            result.text = 'account email verified';
        } else {
            result.text = 'invalid secret key';
        }
    } else {
        let head = req.headers;
        if (dat.email && head.api_key) {

            dat.email = dat.email.toLowerCase();

            log += `[${dat.email}] `;

            let player = await server.db.players.findOne({api_key: head.api_key});
            if (player && player.email === dat.email) {
                server.mail.send_everify(dat.email, player.secret);
                result.result = 1;
                result.type = 'info';
                result.text = 'verification email sent. check your inbox';
            } else {
                res.statusCode = 498;
                result.text = 'invalid secret key or email';
            }
        } else {
            result.text = 'no such email in database';
        }
    }

    res.end(JSON.stringify(result));
    server.log(log + result.text);
};



