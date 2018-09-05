class CustomProtocol {
  constructor() {
    this.name = 'wse-x-protocol';
    this.hi = 'hi';
  }

  pack(c, d) {
    return JSON.stringify({c: c, dat: d});
  }

  unpack(string) {
    return JSON.parse(string);
  }
}

module.exports = CustomProtocol;
