module.exports.master = require('./src/web_config.js');

module.exports.db = {
    host: '127.0.0.1',
    port: 27017,
    dbname: 'world-null',
};

module.exports.email = {
    service: 'gmail',
    self_host: module.exports.master.host + ':8080',
    auth: {
        user: 'wordlnull.dev@gmail.com',
        pass: '2dd9fe3b7ea241558b40d88bc9551b30',
    }
};

module.exports.demons = {
    // how get to the master
    protocol: 'ws',
    host: module.exports.master.host,
    port: module.exports.master.port + 1,

    //how to work with cores and ports
    core_cmd_line: './core/inst.js',
    pub_ports_range: [module.exports.master.port + 2, module.exports.master.port + 10],
};

