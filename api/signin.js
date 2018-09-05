//
// SIGNUP PROCEDURE
//

const server = require('../server');

module.exports = async function (req, res, dat) {

    let response = {
        result: 0,
        type: 'error',
        text: 'invalid email or password'
    };
    let log = 'SIGNIN: ';

    let player = null;

    if (dat.api_key) {
        log += '[api-key] ';
        player = await server.db.players.findOne({api_key: dat.api_key});
        if (!player) response.text = 'invalid api-key';
    } else {
        // by login/pass
        log += '[email/pass] ';
        if (dat.email && dat.pass) {
            dat.email = dat.email.toLowerCase();
            player = await server.db.players.findOne({email: dat.email});
            if (player && player.pass === server.db.hash(dat.pass)) {
                if (!player.api_key) {
                    player.api_key = server.db.some_hash();
                    await server.db.players.save(player);
                }
            } else {
                player = null;
            }
        }
    }

    if (player) {
        response.result = 1;
        response.type = 'info';
        response.text = 'success';
        response.player = {
            api_key: player.api_key,
            email: player.email,
            valid: player.valid,
        }
    }

    server.log(log + response.text);
    res.end(JSON.stringify(response));

};

