"use strict";

const server = require('../server');

module.exports = async function (req, res, dat) {
    let result = {
        result: 0,
        type: 'error',
        text: ''
    };

    let log = 'PASS-RST: ';

    if (!dat) return res.end();

    if (dat.secret) {
        // verification procedure require only secret key
        let player = await server.db.players.findOne({secret: dat.secret});

        if (!dat.pass || dat.pass.length < 3)
            return res.end(JSON.stringify({
                result: 0,
                type: 'warn',
                text: 'new password is required (atleast 3 symbols)'
            }));

        if (player) {

            //server.JCL.wss.drop_client(player._id);
            //server.CLS.wss.drop_client(player._id);

            player.valid = true;
            player.pass = server.db.hash(dat.pass);
            player.secret = server.db.some_hash();
            player.api_key = server.db.some_hash();

            await server.db.players.save(player);

            result.player = {api_key: player.api_key};
            result.result = 1;
            result.type = 'info';
            result.text = 'new password confirmed';
        } else {
            result.text = 'unable to change password. please, request new link';
        }
    } else {
        // to request new validation email need header with api_key and correct email in body
        if (dat.email) {
            dat.email = dat.email.toLowerCase();
            let player = await server.db.players.findOne({email: dat.email});
            if (player && dat.email === player.email) {
                server.mail.send_passrst(dat.email, player.secret);
                result.result = 1;
                result.type = 'info';
                result.text = 'We sent a email with validation link to you.\nCheck your inbox.';
            } else result.text = 'invalid account email';
        } else result.text = 'invalid account email';
    }


    res.end(JSON.stringify(result));
    server.log(log + result.text);

};



