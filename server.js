const MailService = require('./services/mailer');
const NodeStatic = require('node-static');
const app = new NodeStatic.Server('./dist', {cache: 0});
const server = {};

exports = module.exports = server;

const tools = server.tools = require('./services/tools');
const cfg = server.cfg = require('./cfg');
const mail = server.mail = new MailService(server.cfg.email);
const log = server.log = require('./services/clog');
const world = server.world = require('./universe/world').attach(server);
const db = server.db = require('./services/database').connect(cfg.db, main);

const API = {
    'signup': require('./api/signup'),
    'signin': require('./api/signin'),
    'passch': require('./api/passch'),
    'everify': require('./api/everify'),
    'passrst': require('./api/passrst'),
    'apirst': require('./api/apirst'),
};

//
// PROCESS API-CALLS AND DELIVERY STATIC IN ONCE
//
const webServer = require('http').createServer(function (request, response) {

    let route_url = request.url.endsWith('/') ? request.url.slice(0, -1) : request.url;

    if (route_url.includes('/api/')) {
        let method = route_url.split('/')[2];
        if (method && typeof API[method] === 'function') {
            return tools.handle_request(request, response, (req, res, payload) => {
                API[method](req, res, payload)
                    .catch(e => {
                        let dat = {
                            result: 0,
                            text: 'server: operation failed',
                            type: 'error'
                        };
                        res.statusCode = 500;
                        res.end(JSON.stringify(dat));
                        console.error(`API: '/api/${method}' failed!`, 'payload:', payload, 'err:', e);
                    });
            })
        } else {
            log(`API: "${route_url}" not exists`);
        }
    }

    if (route_url === '/app') // APP
        return app.serveFile('index.html', 200, {}, request, response);

    if (route_url === '/' || route_url === '') // HOME
        return app.serveFile('static/landing.html', 200, {}, request, response);

    // OTHER STATIC
    request.addListener('end', function () {
        app.serve(request, response, function (e, res) {
            if (e && (e.status === 404)) { // If the file wasn't found
                app.serveFile('static/error.html', 404, {}, request, response);
            }
        });
    }).resume();

});

//
// CLIENTS MASTER SERVER SETUP
//
async function on_player_auth(api_key, resolve) {
    if (!api_key || typeof api_key !== 'string') return resolve(null);
    let player = await db.players.findOne({api_key: api_key});
    if (!player) return resolve(null);
    return resolve(player._id);
}

// notice CustomProtocol here. The same used on frontend.
const CustomProtocol = require('./services/protocol');
const {WseCCMaster} = require('wse-cc');
const master = server.master = new WseCCMaster({server: webServer}, on_player_auth, new CustomProtocol());
master.name = 'MASTER';
master.logging = true;
master.default_core_cmd = './universe/inst.js';

// all ws-logic about users
master.on('join', (client) => server.log('JOIN:', client.id));
master.on('leave', (client, code, reason) => server.log('LEAVE:', client.id, code, reason));

//let's say user can select core to connect
master.on('u:select_core', (client, core_id) => {
    master.lead(client.id, core_id);
});

// and demons
function on_demon_auth(dat, resolve) {
    if (dat.secret === 'ULTRA-SECRET-KEY') return resolve(dat.id);
    resolve(null);
}

master.listen_demons({port: cfg.demons.port}, on_demon_auth);

// make sure all cores is attached somewhere
setInterval(() => master.distribute_cores(1), 250);

// initial run
async function main() {

    // init world before anyone connected
    world.init();

    // init static and wse server
    webServer.listen(cfg.master.port);
    master.init();
}

