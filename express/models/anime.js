module.exports = class AnimeModel {
  constructor(opts) {
    if (!opts) opts = {};

    this.searchTerm = opts.searchTerm;
    this.searchText = opts.searchText;
    this.animeToken = opts.animeToken;
    this.jsonResponse = opts.jsonResponse || {
      text: 'This is default text',
      response_type: 'in_channel',
    };
  }
};
