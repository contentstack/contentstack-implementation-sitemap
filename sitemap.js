/**
 * Module dependencies.
 */

const configVars = require('./config');
const utils = require('./utils');

const mapping = [];

let syncTokenVar = '';

// For untracked urls

async function untrackedUrls() {
  return utils
    .getData(
      `${configVars.baseUrlContentStack}/content_types/${configVars.unTrackedUrls.unTrackedUrlsContentTypeId}/entries/${configVars.unTrackedUrls.unTrackedUrlsEntryId}?environment=${configVars.env}`,
    )
    .then((resp) => {
      resp.data.entry.urls.map((index) => {
        mapping.push({
          uid: 'un-tracked',
          urls: index.href,
          lastmod: resp.data.entry.updated_at,
          changfreq: 'weekly',
          priority: '0.8',
        });
      });
      utils.createSitemap(mapping);
    })
    .catch((err) => {
      console.log(err);
    });
}

async function initialSyncCall() {
  return utils
    .getData(
      `${configVars.baseUrlContentStack}/stacks/sync?init=true&environment=${configVars.env}&content_type_uid=${configVars.expressBlogSection.blogContentTypeId}`,
    )
    .then((data) => {
      if (data.data.sync_token) {
        syncTokenVar = data.data.sync_token;
        data.data.items.map((index) => {
          mapping.push({
            uid: index.data.uid,
            urls: index.data.url,
            lastmod: index.data.updated_at,
            changfreq: 'daily',
            priority: '0.4',
          });
        });
        utils.createSitemap(mapping);
        utils.syncTokenGenerator(syncTokenVar);
      } else if (data.data.pagination_token) {
        data.data.items.map((index) => {
          mapping.push({
            uid: index.data.uid,
            urls: index.data.url,
            lastmod: index.data.updated_at,
            changfreq: 'daily',
            priority: '0.4',
          });
        });
        pagination(data.data.pagination_token);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function pagination(token) {
  return utils
    .getData(
      `${configVars.baseUrlContentStack}/stacks/sync?pagination_token=${token}`,
    )
    .then((data) => {
      data.data.items.map((index) => {
        mapping.push({
          uid: index.data.uid,
          urls: index.data.url,
          lastmod: index.data.updated_at,
          changfreq: 'daily',
          priority: '0.4',
        });
      });
      if (data.data.pagination_token) {
        pagination(data.data.pagination_token);
      }
      syncTokenVar = data.data.sync_token;
      utils.createSitemap(mapping);
      utils.syncTokenGenerator(syncTokenVar);
    })
    .catch((err) => {
      console.log(err);
    });
}

async function consecutiveSyncCall() {
  return utils
    .getData(
      `${configVars.baseUrlContentStack}/stacks/sync?sync_token=${syncTokenVar}`,
    )
    .then((data) => {
      if (syncTokenVar === data.data.sync_token) {
        return null;
      } if (syncTokenVar !== data.data.sync_token) {
        syncTokenVar = data.data.sync_token;
        utils.syncTokenGenerator(syncTokenVar);
        const syncUpdatedData = data.data;
        syncUpdatedData.items.map((index) => {
          if (index.type === 'entry_published') {
            const filteredData = mapping.filter(
              (filterIndex) => filterIndex.uid === index.data.uid,
            );
            if (filteredData.length === 0) {
              mapping.push({
                uid: index.data.uid,
                urls: index.data.url,
                lastmod: index.data.updated_at,
                changfreq: 'daily',
                priority: '0.4',
              });
            }
          } else if (index.type === 'entry_deleted') {
            mapping.map((elementIndex) => {
              if (elementIndex.uid === index.data.uid) {
                mapping.splice(mapping.indexOf(elementIndex), 1);
              }
            });
          }
        });
        mapping.map((obj, index) => {
          syncUpdatedData.items.map((respIndex) => {
            if (obj.uid === respIndex.data.uid) {
              if (obj.lastmod !== respIndex.data.updated_at) {
                mapping[index].urls = respIndex.data.url;
              }
            }
          });
        });
        utils.createSitemap(mapping);
      }
    });
}

module.exports = {
  untrackedUrls,
  initialSyncCall,
  consecutiveSyncCall,
};
