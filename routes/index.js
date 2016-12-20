var express = require('express');
var router = express.Router();
const request = require('request');
const _ = require('lodash');

router.get('/:track/:artist', function(req, res, next) {
    request.get(`https://api.spotify.com/v1/search?q=${req.params.track}&type=track`, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body);
            var artist = _.find(data.tracks.items, function(track) { return track.artists[0].name == req.params.artist; });
            if (artist)
                res.send(artist.album.images[0].url);
            else {
                res.send();
            }
        } else {
            res.send('error' + response);
        }
    });
});

module.exports = router;
