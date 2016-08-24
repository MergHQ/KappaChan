module.exports = {
  GET_emoteList: 'https://api.twitch.tv/kraken/chat/emoticons',
  GET_channel: (chan) => { return 'https://api.twitch.tv/kraken/streams?channel=' + chan; },
  GET_streamSearch: (q) => { return 'https://api.twitch.tv/kraken/search/streams?limit=10&q=' + q; }
};