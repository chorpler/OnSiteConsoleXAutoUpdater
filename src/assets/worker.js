var registerPromiseWorker = require('promise-worker/register');
var Log = require('../config/config.functions/Log')

registerPromiseWorker((message) => {
  Log.l("Message from worker");
})
