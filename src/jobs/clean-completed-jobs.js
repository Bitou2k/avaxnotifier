const debug = require('debug')('app:jobs:clean-completed-jobs')

const handler = agenda => async job => {
  debug()

  await agenda.cancel({ nextRunAt: null }, (err, numRemoved) => {
    debug(err);
    debug('Number of finished jobs removed', numRemoved);
  });
}

module.exports = {
  handler: agenda => handler(agenda),
  job: agenda => agenda.define('clean completed jobs', handler(agenda))
}
