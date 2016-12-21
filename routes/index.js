var express = require('express');
var router = express.Router();
const request = require('request');
const _ = require('lodash');
var spotifyAuth = process.env.spotifyAuth;

router.get('/:track/:artist', function(req, res, next) {
    let track = req.params.track.replace(/([f][t]\.|[F][t]\.)/g, '');
    track = _.split(track, /\(/);
    //console.log(track);
    request.get(`https://api.spotify.com/v1/search?q=${track[0]}&type=track`, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let data = JSON.parse(body);
            let artists = _.split(req.params.artist, /(\&|[f][t]|[F][t]|\,)/g);
            artists =_.map(artists, function(artist) {
                return _.lowerCase(artist);
            });

            //console.log(artists);
            var artist = _.find(data.tracks.items, function(track) {
                var checked = false;
                if (track.artists[0].name == req.params.artist) {
                    checked = true;
                }
                _.forEach(track.artists, function(artist) {
                    if (_.indexOf(artists, _.lowerCase(artist.name)) >= 0) {
                        checked = true;
                    }
                });
                return checked;
            });

            if (artist) {
                res.send(artist.album.images[0].url);
            } else {
                res.send();
            }
        } else {
            res.send(response);
        }
    });
});

module.exports = router;
