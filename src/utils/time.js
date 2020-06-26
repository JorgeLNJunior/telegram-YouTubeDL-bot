const moment = require('moment')

function secondsToMinutes(seconds) {
  return moment
    .utc(moment.duration(seconds, 'seconds').as('milliseconds'))
    .format('mm:ss')
}

module.exports = {
  secondsToMinutes,
}
