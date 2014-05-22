var Q = require('q');
var googleapis = require('googleapis'),
    OAuth2 = googleapis.auth.OAuth2;

module.exports.getPeople = function getPeople(user) {
  var deferred = Q.defer();

  var oauth2Client =
      new OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.HOST + '/auth/google/return');

  oauth2Client.credentials = {
    access_token: user.googleToken,
    refresh_token: user.googleRefreshToken
  };

  googleapis
    .discover('plus', 'v1')
    .execute(function (err, client) {
      var peopleReq = client.plus.people.list({
        userId: user.googleId,
        collection: 'visible'
      }).withAuthClient(oauth2Client);

      peopleReq.execute(function (err, people) {
        if (err) {
          deferred.reject(err);
        }
        if (people && people.items) {
          deferred.resolve(people.items.map(function (person) {
            return person.id;
          }));
        } else {
          console.log(people);
          deferred.resolve([]);
        }
      });
    });

    return deferred.promise;
};
