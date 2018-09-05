//
// SIGNUP PROCEDURE
//
const server = require('../server');

module.exports = async function (req, res, dat) {

    if (!dat)
        return res.end(JSON.stringify({result: 0, type: 'error', text: 'request was failed'}));

    if (!dat.email)
        return res.end(JSON.stringify({result: 0, type: 'error', text: 'email is required'}));

    dat.email = dat.email.toLowerCase();

    if (!server.tools.is_valid_email(dat.email))
        return res.end(JSON.stringify({result: 0, type: 'error', text: 'email is invalid'}));

    if (!dat.pass || dat.pass.length < 3)
        return res.end(JSON.stringify({result: 0, type: 'error', text: 'password is required (atleast 3 symbols)'}));

    const exists_email = await server.db.players.findOne({email: dat.email});
    if (exists_email !== null)
        return res.end(JSON.stringify({result: 0, type: 'error', text: 'this email already used'}));

    let player = {
        _id: server.db.id('P'),
        email: dat.email,
        pass: server.db.hash(dat.pass),
        api_key: server.db.some_hash(),
        secret: server.db.some_hash(),
        valid: false,
    };

    await server.db.players.save(player);

    await server.mail.send_everify(dat.email, player.secret);

    res.end(JSON.stringify({
        result: 1,
        type: 'info',
        text: 'Your account ready!',
        player: {api_key: player.api_key}
    }));

    server.log('SIGNUP:', player.email);
};



