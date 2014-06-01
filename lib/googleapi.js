var Q = require('q'),
    googleapis = require('googleapis'),
    OAuth2 = googleapis.auth.OAuth2,
    Time = require('./time');

function getOAuthClient(user) {
  var oauth2Client =
      new OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.HOST + '/auth/google/return');

  if (user) {
    oauth2Client.credentials = {
      access_token: user.googleToken,
      refresh_token: user.googleRefreshToken
    };
  }

  return oauth2Client;
}

module.exports.getPeople = function getPeople(user) {
  var deferred = Q.defer();

  googleapis
    .discover('plus', 'v1')
    .execute(function (err, client) {
      var peopleReq = client.plus.people.list({
        userId: user.googleId,
        collection: 'visible'
      }).withAuthClient(getOAuthClient(user));

      peopleReq.execute(function (err, people) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(people.items.map(function (person) {
            return person.id;
          }));
        }
      });
    });

    return deferred.promise;
};

module.exports.getTokenInfo = function getTokenInfo(accessToken) {
  var deferred = Q.defer();

  googleapis
    .discover('oauth2', 'v2')
    .execute(function (err, client) {
      var tokenInfo = client.oauth2.tokeninfo({
        access_token: accessToken
      });

      tokenInfo.execute(function (err, tokenInfo) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(tokenInfo);
        }
      });
    });

    return deferred.promise;
};


module.exports.refreshAccessToken = function refreshAccessToken(user, cb) {
  if (!user.googleRefreshToken) {
    console.log('No refresh token!');
    cb(null, user);
  } else {
    var oauth2client = getOAuthClient(user);

    oauth2client.refreshAccessToken(function (err, result) {
      if (err) {
        console.log('refresh error: ' + err);
        cb(err);
      } else {
        user.googleToken = result['access_token'];
        user.googleTokenExpires = Time.addTo(new Date(), result['expires_in']);
        user.save();

        cb(null, user);
      }
    });
  }
};
