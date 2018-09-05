const EventEmitter3 = require('eventemitter3');

let server = null;

module.exports.attach = function (_server) {
    server = _server;
    return world;
};

// SINGLE SERVER EXAMPLE
// all API-calls also have access to `world` object
// anything can be done inside this class,
// and world can subscribe on server.master events.

class World extends EventEmitter3 {
    constructor() {
        super();
        this.tick = 0;
        console.log('WORLD: CC CONSTRUCTED!');
    }

    init() {

        server.master.spawn_core('world-1');
        server.master.spawn_core('world-2');
        server.master.spawn_core('world-3');
        server.master.spawn_core('world-4');
        server.master.spawn_core('world-5');

        server.master.on('join', (client) => {
            client.send('stats', server.master.sys_info());
        });

        setInterval(() => {
            for (let i in server.master.clients)
                server.master.clients[i].send('tick', {tick: ++this.tick});
        }, 1000);


        // simple statistical feature
        server.master.on('stat', (stat_data) => {
            for (let i in server.master.clients)
                server.master.clients[i].send('stats', stat_data);
        });

        console.log('WORLD: INIT!');
    }
}

const world = new World();
