"use strict";
/*
    API v.0.2
    Reset api-key and re-login all cleints
*/

const server = require('../server');
const DB = server.db;

module.exports = async function (req, res, dat) {
    let result = {
        result: 0,
        type: 'error',
        text: 'unknown error'
    };
    let log = 'APIKEY_RST: ';

    let head = req.headers;

    let player = await  server.db.players.findOne({api_key: head.api_key});

    if (player) {

        // server.JCL.wss.drop_client(user._id);
        // server.CLS.wss.drop_client(user._id);

        player.api_key = server.db.some_hash();

        await server.db.players.save(player);

        result.result = 1;
        result.type = 'info';
        result.text = 'new api-key set';
        result.desc = 'now you need to re-login';

    } else {
        res.statusCode = 498;
        result.text = 'invalid current api-key';
    }


    res.end(JSON.stringify(result));

    server.log(log + result.text);
};

