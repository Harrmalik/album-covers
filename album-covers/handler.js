'use strict';
const request = require('request');
const _ = require('lodash');

module.exports.getAlbum = (event, context, callback) => {
    let track = event.queryStringParameters.track.replace(/([f][t]\.|[F][t]\.)/g, '');
    track = _.split(track, /\(/);
    request.post({
        url: `https://accounts.spotify.com/api/token?grant_type=client_credentials`,
        headers: {
            "Authorization": "Basic M2E3YTlhYmI3MjNiNDliOTgyMzBmNTYwMmFiOGIyMTY6OGY5ZDg4YTE4YTQyNDAyYThlMWYzYTQ0YzE0NDkwYzk=",
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }, (err, res, body) => {
        let data = JSON.parse(body);
        request.get({
            url: `https://api.spotify.com/v1/search?q=${track[0]}&type=track`,
            headers: {
                "Authorization": "Bearer " + data.access_token
            }
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                let data = JSON.parse(body);
                let artists = _.split(event.queryStringParameters.artist, /(\&|[f][t]|[F][t]|\,|\s([x]|[X])\s)/g);
                artists =_.map(artists, function(artist) {
                    return _.lowerCase(artist);
                });

                let artist = _.find(data.tracks.items, function(track) {
                    let checked = false;
                    if (track.artists[0].name == event.queryStringParameters.artist) {
                        checked = true;
                    }
                    _.forEach(track.artists, function(artist) {
                        if (_.indexOf(artists, _.lowerCase(artist.name)) >= 0) {
                            checked = true;
                        }
                    });
                    return checked;
                });

                if (artist && artist.album.images[0].url) {
                    let response = {
                      statusCode: 200,
                      body: JSON.stringify({
                          image: artist.album.images[0].url,
                          album: artist.album.name
                      }),
                    };
                    callback(null, response);
                } else {
                    let response = {
                      statusCode: 200,
                      body: JSON.stringify({
                        message: 'couldn\'t find album'
                      }),
                    };
                    callback(null, response);
                }
            } else {
                let response = {
                  statusCode: 500,
                  body: JSON.stringify({
                    message: error
                  }),
                };
                callback(error, response);
            }
        });
    })
};
