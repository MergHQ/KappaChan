module.exports = function () {
  const needle = require('needle');

  this.start = function () {
    update();
    setInterval(update, 3600000);
  };

  function update() {
    var options = {
      json: true,
      headers: {
        'Authorization': App.config.botStatToken,
        'content-type': 'application/json'
      }
    };

    needle.post('https://bots.discord.pw/api/bots/105754113572102144/stats/', JSON.stringify({ server_count: App.client.guilds.size }), options, (err, res) => {
      if (err) console.log(err);
    });
  }
};