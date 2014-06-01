module.exports.hoursAgo = function hoursAgo(date) {
  return ((new Date().getTime()) - date.getTime()) / (1000 * 60 * 60);
};

module.exports.daysAgo = function daysAgo(date) {
  return ((new Date().getTime()) - date.getTime()) / (1000 * 60 * 60 * 24);
};

module.exports.addTo = function addTo(date, seconds) {
  var time = date.getTime();
  time += (1000 * seconds);
  return new Date(time);
};
