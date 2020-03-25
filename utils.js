
/**
 * Module dependencies.
 */

const axios = require('axios');
const fs = require('fs');
const configVars = require('./config');

function createSitemap(mapping) {
  const stream = fs.createWriteStream('sitemap.xml');
  stream.write('<?xml version="1.0" encoding="utf-8" standalone="yes" ?>');
  stream.write(
    '\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  );
  mapping.map((index) => {
    stream.write('\n  <url>\n');
    stream.write(`    <loc>${configVars.rootPath.path + index.urls}</loc>\n`);
    stream.write(`    <lastmod>${index.lastmod}</lastmod>\n`);
    stream.write(`    <changefreq>${index.changfreq}</changefreq>\n`);
    stream.write(`    <priority>${index.priority}</priority>\n`);
    stream.write('  </url>');
  });
  stream.write('\n</urlset>');
  stream.end();
}


// Write SyncFile with SyncToken

function syncTokenGenerator(syncTokenVar) {
  fs.writeFileSync('./syncToken.txt', syncTokenVar, (err) => {
    if (err) {
      console.log(err);
    } else {
      // console.log('Mapped file created');
    }
  });
}

// Axios wrapper

function getData(url) {
  const headerData = {
    headers: {
      api_key: configVars.apiKey,
      access_token: configVars.accessToken,
    },
  };
  return axios.get(url, headerData);
}

// export library

module.exports = {
  getData,
  syncTokenGenerator,
  createSitemap,
};
