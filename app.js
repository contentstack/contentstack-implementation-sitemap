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

// setInterval(sitemap_function.untrackedUrls,2592000); // for untracked interval is set for 30 days

sitemapFunction.initialSynCall(); // called only once

setInterval(sitemapFunction.updateCall, 100000); // 1 min interval

app.get('/sitemap', (req, res) => {
  res.contentType('application/xml');
  res.sendFile(path.join(__dirname, 'sitemap.xml'));
});

// load port on 4000

app.listen(configVars.port, () => {
  console.log(`Start your browser on port ${configVars.port}`);
});
