"use strict";
/*
    API v.0.2
    Process change player passwrd using api_key and old password.
*/

const server = require('../server');

module.exports = async function (req, res, dat) {

    let result = {
        result: 0,
        type: 'error',
        text: 'unknown error'
    };

    let log = 'PASS_CH: ';

    if (!dat) return res.end();
    let head = req.headers;
    let player = await server.db.players.findOne({api_key: head.api_key});
    if (player) {
        if (player.pass === server.db.hash(dat.curr_pass)) {
            if (dat.new_pass && dat.new_pass.length >= 5) {

                //server.JCL.wss.drop_client(player._id);
                //server.CLS.wss.drop_client(player._id);

                player.pass = server.db.hash(dat.new_pass);
                player.api_key = server.db.some_hash();

                await server.db.players.save(player);

                result.result = 1;
                result.type = 'info';
                result.text = 'password successfully changed';
                result.desc = 'please login with new password';
            } else {
                result.type = 'warn';
                result.text = 'new passwrd should contain atleast 5 chars';
            }
        } else {
            result.type = 'warn';
            result.text = 'invalid current password';
        }
    } else {
        res.statusCode = 498;
        result.text = 'invalid api-key';
    }


    res.end(JSON.stringify(result));
    server.log(log + result.text);

};



