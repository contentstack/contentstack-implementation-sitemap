/* eslint-disable max-len */
/* eslint-disable no-shadow */
/* eslint-disable no-inner-declarations */
/* eslint-disable array-callback-return */

const configVars = require('./config');
const utils = require('./utils');

const mapping = [];

let syncTokenVar = '';

utils.syncWriteFunction(syncTokenVar);

utils.createSitemap(mapping);

// for untracked urls
async function untrackedUrls() {
  return utils.getData(`https://cdn.contentstack.io/v3/content_types/${configVars.unTrackedUrls.unTrackedUrlsContentTypeId}/entries/${configVars.unTrackedUrls.unTrackedUrlsEntryId}?environment=${configVars.env}`)
    .then((resp) => {
      // console.log("untracked urls",resp.data.entry.urls);
      resp.data.entry.urls.map((index) => {
        // console.log('splitted', index.href);
        mapping.push({
          uid: 'un-tracked',
          urls: index.href,
          lastmod: resp.data.entry.updated_at,
          changfreq: 'weekly',
          priority: '0.8',
        });
      });
      utils.createSitemap(mapping);
      console.log('after untracked push', mapping.length);
    })
    .catch((err) => {
      console.log(err);
    });
}


async function initialSynCall() {
  return utils.getData(`https://cdn.contentstack.io/v3/stacks/sync?init=true&environment=${configVars.env}&content_type_uid=${configVars.expressBlogSection.blogContentTypeId}`)
    .then((data) => {
      if (data.data.sync_token) {
        console.log('Inside sync token');
        syncTokenVar = data.data.sync_token;
        console.log('sync token within sync condition', syncTokenVar);
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
        utils.syncWriteFunction(syncTokenVar);
        console.log(
          'inside sync if the is sync token at first',
          mapping.length,
          'this is sync token',
          syncTokenVar,
        );
      } else if (data.data.pagination_token) {
        console.log('inside page token');
        console.log('got page token', data.data.pagination_token);
        data.data.items.map((index) => {
          mapping.push({
            uid: index.data.uid,
            urls: index.data.url,
            lastmod: index.data.updated_at,
            changfreq: 'daily',
            priority: '0.4',
          });
        });
        function pageCallMethod(token) {
          return utils.getData(`https://cdn.contentstack.io/v3/stacks/sync?pagination_token=${token}`)
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
                pageCallMethod(data.data.pagination_token);
              }
              syncTokenVar = data.data.sync_token;
              console.log('final length', mapping.length);
              utils.createSitemap(mapping);
              utils.syncWriteFunction(syncTokenVar);
              console.log('sync token file and mapper file created');
              console.log('sync token global varibable', syncTokenVar);
            })
            .catch((err) => {
              console.log(err);
            });
        }
        pageCallMethod(data.data.pagination_token);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function updateCall() {
  console.log(syncTokenVar, 'called');
  return utils.getData(`https://cdn.contentstack.io/v3/stacks/sync?sync_token=${syncTokenVar}`)
    .then((data) => {
      console.log('anyyyyy response', data.data, syncTokenVar);
      // console.log("SSssss",data.data);
      if (syncTokenVar === data.data.sync_token) {
        console.log('No changes yet');
      } else if (syncTokenVar !== data.data.sync_token) {
        syncTokenVar = data.data.sync_token;
        utils.syncWriteFunction(syncTokenVar);
        console.log('yes changes there', syncTokenVar, 'new');
        const syncUpdatedData = data.data;
        syncUpdatedData.items.map((index) => {
          if (index.type === 'entry_published') {
            const filteredData = mapping.filter((filterIndex) => filterIndex.uid === index.data.uid);
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
                console.log('This is the item to be popped', elementIndex);
                mapping.splice(mapping.indexOf(elementIndex), 1);
                console.log('pop', mapping);
              }
            });

            console.log('got now new aaryyyy', mapping.length);
          }
        });
        mapping.map((obj, index) => {
          syncUpdatedData.items.map((respIndex) => {
            if (obj.uid === respIndex.data.uid) {
              if (obj.lastmod !== respIndex.data.updated_at) {
                console.log('This is local data', obj);
                console.log('This is response data', respIndex.data);
                console.log(
                  '=============================================================',
                );
                console.log(obj.urls);
                console.log(respIndex);
                mapping[index].urls = respIndex.data.url;
                console.log('mappper updated', mapping[index]);
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
  initialSynCall,
  updateCall,
};
