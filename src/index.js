const mongoose = require('mongoose')
const Agenda = require('agenda')

require('dotenv').config()

let bot = require('./bot')
// const setupBot

// const addCheckCycleJob = require('./jobs/check-cycle')
// const addSendMessageJob = require('./jobs/send-message')
// const addcheckPayoutsJob = require('./jobs/check-payouts')
const addSendTransactionMessageJob = require('./jobs/send-transaction-message')
const addSendDelegationEndMessageJob = require('./jobs/send-delegation-end-message')
const addCheckAssetsJob = require('./jobs/check-assets')
// const addSendTweetToRedditJob = require('./jobs/send-tweet-to-reddit')
// const addSendTweetToTelegramJob = require('./jobs/send-tweet-to-telegram')
// const addSendRedditAdJob = require('./jobs/send-reddit-ad')
// const addSearchTweetsJob = require('./jobs/search-tweets')
// const addSendRetweetJob = require('./jobs/send-retweet')
const addCheckTransactionsJob = require('./jobs/check-transactions')
const addCheckDelegationEndJob = require('./jobs/check-delegation-end')
const addCleanCompletedJobsJob = require('./jobs/clean-completed-jobs')

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!

  // bot = setupBot(db)

  bot.launch()
});

const agenda = new Agenda({
  db: {
    address: process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
});

// addCheckCycleJob.job(agenda)
// addSendMessageJob.job(agenda)
// addcheckPayoutsJob.job(agenda)
addSendTransactionMessageJob.job(agenda)
addSendDelegationEndMessageJob.job(agenda)
addCheckAssetsJob.job(agenda)
// addSendTweetToRedditJob.job(agenda)
// addSendTweetToTelegramJob.job(agenda)
// addSendRedditAdJob.job(agenda)
// addSearchTweetsJob.job(agenda)
// addSendRetweetJob.job(agenda)
addCheckTransactionsJob.job(agenda)
addCheckDelegationEndJob.job(agenda)
addCleanCompletedJobsJob.job(agenda)

const graceful = (event) => async () => {
  await agenda.stop();
  bot.stop(event)
  process.exit(0);
}

process.on('SIGTERM', graceful('SIGTERM'));
process.on('SIGINT' , graceful('SIGINT'));

(async function() { // IIFE to give access to async/await
  await agenda.start();

  await agenda.every('1 minute', ['check transactions', 'check delegation end'])

  // await agenda.every('10 minutes', ['check cycle', 'check payouts']);

  // await agenda.every('20 minutes', ['send reddit ad']);

  // await agenda.every('1 hour', ['search tweets']);

  await agenda.every('1 day', ['clean completed jobs', 'check assets']);

  await agenda.cancel({ nextRunAt: null }, (err, numRemoved) => {
    debug(err);
    debug('Number of finished jobs removed', numRemoved);
  });
})();
