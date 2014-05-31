var Q = require('q'),
    googleapis = require('googleapis'),
    OAuth2 = googleapis.auth.OAuth2;

function getOAuthClient(user) {
  var oauth2Client =
      new OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.HOST + '/auth/google/return');

  oauth2Client.credentials = {
    access_token: user.googleToken,
    refresh_token: user.googleRefreshToken
  };

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
