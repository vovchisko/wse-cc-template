function checksum(s) {
    return (s.split("").reduce(function (a, b) {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a
    }, 0) + 2147483647) + 1;
}

function pick(A, a, B, b, func = null, even_undef = false) {
    if (typeof A[a] === 'undefined' && !even_undef) return;
    if (typeof func === 'function') {
        B[b] = func(A[a]);
    } else {
        B[b] = A[a];
    }
    return B;
}

function pickx(A, B) {
    let fields = [...arguments].slice(2);
    for (let i in fields) {
        pick(A, fields[i][0], B, fields[i][1], fields[i][2], fields[i][3]);
    }
    return B;
}

function is_valid_email(email) {
    let re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return re.test(email);
}

function safe_regexp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function not_nulled(obj) {
    let ret = {};
    for (let i in obj) {
        if (obj[i] !== null) ret[i] = obj[i];
    }
    return ret;
}

function now(ms = false) {
    return ms ? Date.now() / 1000 : Date.now();
}

function item_in(arr, prop, val, cb) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][prop] === val) {
            if (typeof cb === 'function') cb(arr[i], i)
            return arr[i];
        }
    }
}

function parse_json(string) {
    if (!string) return undefined;
    try {
        return JSON.parse(string);
    } catch (e) {
        return undefined;
    }
}

/**
 * Parse data fro mpost and run callback after.
 * @param {Object} req
 * @param {Object} res
 * @param {function} cb
 */
function handle_request(req, res, cb) {
    const chunks = [];
    //todo: limit payload size
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
        const buff = Buffer.concat(chunks);
        let data = buff.toString();
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Methods', 'POST');
        if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, client, api_key');
            return res.end();
        }
        res.setHeader('Content-Type', 'application/json');
        if (data) data = parse_json(data);
        cb(req, res, data);
    });
}

function pause(t) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, t)
    });
}

module.exports.handle_request = handle_request;
module.exports.parse_json = parse_json;
module.exports.now = now;
module.exports.item_in = item_in;
module.exports.not_nulled = not_nulled;
module.exports.safe_regexp = safe_regexp;
module.exports.is_valid_email = is_valid_email;
module.exports.pick = pick;
module.exports.pickx = pickx;
module.exports.checksum = checksum;
module.exports.pause = pause;
