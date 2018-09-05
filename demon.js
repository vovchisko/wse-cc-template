const {WSE_REASON, WseCCDemon} = require('wse-cc');
const cfg = require('./cfg');
const master_url = cfg.demons.protocol + '://' + cfg.demons.host + ':' + cfg.demons.port + '/demons';

//setInterval(() => demon1.send('ports', demon1.ports), 1000);

let DEMON_NAME = 'no-name-demon';

for (let i in process.argv) {
    if (process.argv[i].split('=')[0] === 'name') {
        DEMON_NAME = process.argv[i].split('=')[1];
    }
}

const demon1 = (new WseCCDemon(master_url)).connect(DEMON_NAME, 'ULTRA-SECRET-KEY');
