import EventEmitter3 from 'eventemitter3';
import WEB_CFG from '../web_config';
import {WSE_REASON, WseCCClient} from 'wse-cc';
import CustomProtocol from '../../services/protocol';

class Network extends EventEmitter3 {

    constructor() {
        super();

        this.WEB_HOST = WEB_CFG.host;
        this.WEB_PORT = ((!WEB_CFG.ssl && WEB_CFG.port === 80) || (WEB_CFG.ssl && WEB_CFG.port === 443)) ? '' : ':' + WEB_CFG.port;
        this.WEB_URL = (WEB_CFG.ssl ? 'https://' : 'http://') + WEB_CFG.host + this.WEB_PORT + '/';
        this.WS_URL = ((WEB_CFG.ssl ? 'wss://' : 'ws://') + this.WEB_HOST + this.WEB_PORT);

        this.email = null;
        this.api_key = (localStorage.getItem('api_key')) || '';
        this.valid = null;
        this.is_in = !!this.api_key ? null : false; //means unknown or not for sure
        this.is_online = null;
        this.core_id = null;

        window.addEventListener('storage', (e) => NET.reset());

        this.init_wse();

        if (this.api_key)
            this.signin({api_key: this.api_key})
                .catch((e) => this.signout());
    }

    init_wse() {
        this.master = new WseCCClient(this.WS_URL + '/ws-master', {}, new CustomProtocol());
        this.master.logging = true;
        this.master.on('open', () => this.is_online = true);
        this.master.on('close', (code, reason) => {
            this.is_online = false;
            this.master.core.close(1000, reason);
            if (reason === WSE_REASON.NOT_AUTHORIZED) return this.signout();
            if (code !== 1000) // unexpected anyway. wse always disconnect with 1000
                setTimeout(() => {
                    this.master.connect(this.api_key);
                }, 2000);
        });

        this.core = this.master.core; //shortcut;

        this.core.on('open', (dat) => this.core_id = dat.core_id);
        this.core.on('close', (core, reason) => this.core_id = null);

        this.on('signout', () => this.master.close(1000, WSE_REASON.NOT_AUTHORIZED));
        this.on('ready', () => this.master.connect(this.api_key));
    }


    api(method, data) {
        return fetch(this.WEB_URL + 'api/' + method, {
            method: 'POST',
            body: data ? JSON.stringify(data) : null,
            headers: {api_key: this.api_key || ''}
        })
            .then((res) => {
                return res.json().then((response) => {
                    response.status = res.status;
                    return response;
                });
            })
            .catch((e) => {
                if (!e.response) e.response = {
                    result: 0,
                    status: 0,
                    text: 'undable to complete request',
                    type: 'error',
                };
                console.log('API ERROR: ', e);
                throw e;
            });
    }

    signup(email, pass) {
        return this.api('signup', {email, pass})
            .then((response) => {
                if (!response.result) throw {response};
                console.log(response);
                return this.signin({api_key: response.player.api_key});
            });
    }

    everify(secret = null) {
        let payload = {};
        if (secret) payload.secret = secret;
        if (!secret) payload.email = this.email;
        return this.api('everify', payload)
            .then((response) => {
                if (!response.result) throw {response};

                if (response.player && response.player.api_key)
                    this.signin({api_key: response.player.api_key});

                return response;
            });
    }

    passrst_request(email) {
        return this.api('passrst', {email})
            .then((response) => {
                if (!response.result) throw {response};
                return response;
            });
    }

    passrst(secret, pass) {
        return this.api('passrst', {secret, pass})
            .then((response) => {
                if (!response.result) throw {response};
                return this.signin({api_key: response.player.api_key})
                    .then((signin_response) => response)
                    .catch((e) => e.response);
            });
    }

    apirst() {
        return this.api('apirst')
            .catch(e => e.response)
            .then((response) => {
                if (!response.result) throw {response};
                this.signout();
                return response;
            })
    }

    passch(curr_pass, new_pass) {
        return this.api('passch', {curr_pass, new_pass})
            .catch(e => e.response)
            .then(response => {
                if (!response.result) throw {response};
                this.signout();
                return response;
            });
    }

    signin(creds = null) {
        return this.api('signin', creds)
            .then((response) => {
                if (!response.result) throw {response};

                this.api_key = response.player.api_key;
                this.email = response.player.email;
                this.valid = response.player.valid;
                localStorage.setItem('api_key', this.api_key);
                this.is_in = true;

                this.emit('ready');

                return response;
            }).catch((e) => {
                console.log('signin error', e);
                if (!e.response.result) this.signout();
                throw e;
            });
    }

    signout() {
        localStorage.removeItem('api_key');
        this.api_key = '';
        this.email = '';
        this.is_in = false;
        this.valid = null;

        if (this.master) this.master.close(1000, 'signout');

        this.emit('signout');
    }

    reset() {
        window.location = window.location.href.split('#')[0];
    }

}

const NET = new Network();
export default NET;

