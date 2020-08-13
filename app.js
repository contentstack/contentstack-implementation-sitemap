/**
 * Module dependencies.
 */

const app = require('express')();
const nunjucks = require('nunjucks');
const path = require('path');


const sitemapFunction = require('./sitemap');
const configVars = require('./config');


app.set('view engine', 'html');

nunjucks.configure(['views/'], {
  autoescape: false,
  express: app,
});

// Routes

require('./routes')(app);


sitemapFunction.untrackedUrls(); // first untracked url call with no interval

// For setInterval function the second parameter is the time in millisecond's make sure to add equivalent millisecond's based on your days

setInterval(sitemapFunction.untrackedUrls, 864000000); // for untracked urls interval is set for 10 days in millisecond's

sitemapFunction.initialSyncCall(); // called only once

setInterval(sitemapFunction.consecutiveSyncCall, configVars.timeInterval); // 1 min interval change per your need

app.get('/sitemap', (req, res) => {
  res.contentType('application/xml');
  res.sendFile(path.join(__dirname, 'sitemap.xml'));
});

// load port on 4000

app.listen(configVars.port, () => {
  console.log(`Start your browser on port ${configVars.port}`);
});
