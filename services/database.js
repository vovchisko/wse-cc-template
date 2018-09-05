'use strict';

const MongoClient = require('mongodb').MongoClient;
const shortid = require('shortid');
const crypto = require('crypto');
const extend = require('deep-extend');

class Database {
    constructor() {
        //databases links
        this._db = null;

        //database settings
        this.cfg = {
            host: '127.0.0.1',
            port: 27017,
            dbname: 'database',
        };
    }


    connect(cfg, callback) {
        extend(this.cfg, cfg);
        MongoClient
            .connect('mongodb://' + this.cfg.host + ':' + this.cfg.port, {useNewUrlParser: true})
            .then(async (client) => {
                this._db = client.db(this.cfg.dbname);
                await this.bind_collections();
                callback();
            })
            .catch((err) => {
                console.error('DB::connect() Failed!', err);
                process.exit(-1);
            });
        return this;
    }

    /**
     * Generate ID with prefix ('U' - unit, 'I' - item, and so on)
     * @param prefix
     * @returns {string}
     */
    id(prefix = 'Х') {
        return prefix + '-' + shortid.generate();
    }

    async bind_collections() {

        this.players = this._db.collection('players');
        this.locations = this._db.collection('locations');
        this.units = this._db.collection('units');
        this.doors = this._db.collection('doors');
        this.items = this._db.collection('items');
        this.blocks = this._db.collection('blocks');
        this.harvs = this._db.collection('harvs');
        this.stuffs = this._db.collection('stuffs');

        //shortcuts, and also firts letter or ID
        this.P = this.players;
        this.L = this.locations;
        this.U = this.units;
        this.D = this.doors;
        this.I = this.items;
        this.B = this.blocks;
        this.H = this.harvs;
        this.S = this.stuffs;

    };

    some_hash() {
        return this.hash(Math.random().toString(36).substring(3) + Date.now());
    }

    hash(string) {
        return crypto.createHash('md5').update(string).digest('hex');
    }
}

const DB = new Database();
module.exports = DB;

