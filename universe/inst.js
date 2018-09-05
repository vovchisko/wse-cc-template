const {WseCCCore} = require('wse-cc');
const CustomProtocol = require('../services/protocol');

const inst = {};
const cfg = inst.cfg = require('../cfg');
const db = inst.db = require('../services/database').connect(cfg.db, main);


async function on_player_auth(api_key, resolve) {
    if (!api_key || typeof api_key !== 'string') return resolve(null);
    let player = await db.players.findOne({api_key: api_key});
    if (!player) return resolve(null);
    return resolve(player._id, {core_id: core.id});
}

const core = new WseCCCore(on_player_auth, new CustomProtocol());

let tick = 0;

core.on('message', (client, c, dat) => console.log('>> message: ', client.id, c, dat));
core.on('leave', (client, code, reason) => console.log('>> leave:', client.id, code, reason));
core.on('join', (client) => {
    console.log('>> join:', client.id);
    client.send('world', {id: core.id})
});
core.on('m:poke', (client, dat) => {
    client.send('poke', {'msg': 'poke your self x2!', dat: dat * 2});
});


function main() {
    core.init();
    setInterval(() => {
        core.prop('tick', ++tick);
    }, 10000);
    core.get_ready();
}
