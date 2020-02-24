var axios = require("axios");
const fs = require("fs");

var mapping = [];

var sync_token = "";

let root_path = "http://localhost:4000";

// write mapper json

function mapping_file() {
  // mapper json
  fs.writeFileSync("./mapping.json", JSON.stringify(mapping, null, 4), function(
    err
  ) {
    if (err) {
      console.log(err);
    } else {
      console.log("Mapped file created");
    }
  });
}

function sync_token_file() {
  //sync_token file
  fs.writeFileSync("./sync.txt", sync_token, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Mapped file created");
    }
  });
}

function create_sitemap() {
  // create a sitemap file
  let stream = fs.createWriteStream("sitemap.xml");
  stream.write('<?xml version="1.0" encoding="utf-8" standalone="yes" ?>');
  stream.write(
    '\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  );
  mapping.map(i => {
    stream.write("\n  <url>\n");
    stream.write(`    <loc>${root_path + i.urls}</loc>\n`);
    stream.write(`    <lastmod>${i.lastmod}</lastmod>\n`);
    stream.write(`    <changefreq>${i.changfreq}</changefreq>\n`);
    stream.write(`    <priority>${i.priority}</priority>\n`);
    stream.write(`  </url>`);
  });
  stream.write("\n</urlset>");
  stream.end();
}

async function untracked_urls() {
  // for untracked urls
  axios({
    method: "get",
    url: `https://cdn.contentstack.io/v3/content_types/${process.env.UNTRACKED_CONTENT_TYPE_ID}/entries/${process.env.UNTRACKED_ENRTY_ID}?environment=${process.env.ENV}`,
    headers: {
      api_key: process.env.APIKEY,
      access_token: process.env.ACCESSTOKEN,
      "Content-Type": "application/json"
    }
  })
    .then(resp => {
      // console.log("untracked urls",resp.data.entry.urls);
      resp.data.entry.urls.map(i => {
        // console.log("untracked urls",i.href)
        console.log("splitted", i.href);
        mapping.push({
          uid: "un-tracked",
          urls: i.href,
          lastmod: resp.data.entry.updated_at,
          changfreq: "weekly",
          priority: "0.8"
        });
      });
      create_sitemap();
      mapping_file();
      console.log("after untracked push", mapping.length);
    })
    .catch(err => {
      console.log(err);
    });
}

async function syncall() {
  axios({
    method: "get",
    url: `https://cdn.contentstack.io/v3/stacks/sync?init=true&environment=${process.env.ENV}&content_type_uid=${process.env.BLOG_CONTENT_TYPE}`,
    headers: {
      api_key: process.env.APIKEY,
      access_token: process.env.ACCESSTOKEN,
      "Content-Type": "application/json"
    }
  })
    .then(data => {
      if (data.data.sync_token) {
        console.log("Inside sync token");
        sync_token = data.data.sync_token;
        console.log("sync token within sync condition", sync_token);
        data.data.items.map(i => {
          mapping.push({
            uid: i.data.uid,
            urls: i.data.url,
            lastmod: i.data.updated_at,
            changfreq: "daily",
            priority: "0.4"
          });
        });
        create_sitemap();
        mapping_file();
        sync_token_file();
        console.log(
          "inside sync if the is sync token at first",
          mapping.length,
          "this is sync token",
          sync_token
        );
      } else if (data.data.pagination_token) {
        console.log("inside page token");
        console.log("got page token", data.data.pagination_token);
        const page_one = data.data.pagination_token;
        console.log("demo", page_one);
        data.data.items.map(i => {
          mapping.push({
            uid: i.data.uid,
            urls: i.data.url,
            lastmod: i.data.updated_at,
            changfreq: "daily",
            priority: "0.4"
          });
        });
        if (page_one) {
          function page_call(token) {
            return new Promise((resolve, reject) => {
              axios({
                method: "get",
                url: `https://cdn.contentstack.io/v3/stacks/sync?pagination_token=${token}`,
                headers: {
                  api_key: process.env.APIKEY,
                  access_token: process.env.ACCESSTOKEN,
                  "Content-Type": "application/json"
                }
              })
                .then(data => {
                  data.data.items.map(i => {
                    mapping.push({
                      uid: i.data.uid,
                      urls: i.data.url,
                      lastmod: i.data.updated_at,
                      changfreq: "daily",
                      priority: "0.4"
                    });
                  });
                  if (data.data.pagination_token) {
                    page_call(data.data.pagination_token);
                  }
                  console.log("page sync section", mapping.length);
                  sync_token = data.data.sync_token;
                  console.log("final length", mapping.length);
                  create_sitemap();
                  mapping_file();
                  sync_token_file();
                  console.log("sync token file and mapper file created");
                  console.log("sync token global varibable", sync_token);
                })
                .catch(err => {
                  console.log(err);
                });
            });
          }
          page_call(page_one);
        }
      }
    })
    .catch(err => {
      console.log(err);
    });
}

// syncall(); // once initial sync_call

// update call using sync_token

function update_call() {
  console.log(sync_token, "called");
  axios({
    method: "get",
    url: `https://cdn.contentstack.io/v3/stacks/sync?sync_token=${sync_token}`,
    headers: {
      api_key: process.env.APIKEY,
      access_token: process.env.ACCESSTOKEN,
      "Content-Type": "application/json"
    }
  }).then(data => {
    console.log("anyyyyy response", data.data, sync_token);
    // console.log("SSssss",data.data);
    if (sync_token === data.data.sync_token) {
      console.log("No changes yet");
    } else if (sync_token != data.data.sync_token) {
      sync_token = data.data.sync_token;
      sync_token_file();
      console.log("yes changes there", sync_token, "new");
      let sync_updated_data = data.data;
      sync_updated_data.items.map(x => {
        if (x.type === "entry_published") {
          let filtered_data = mapping.filter(i => i.uid === x.data.uid);
          if (filtered_data.length === 0) {
            mapping.push({
              uid: x.data.uid,
              urls: x.data.url,
              lastmod: x.data.updated_at,
              changfreq: "daily",
              priority: "0.4"
            });

            mapping_file();
          }
        } else if (x.type === "entry_deleted") {
          // let myArr = mapping.find(i=>i.uid === x.data.uid)
          mapping.map(element => {
            if (element.uid === x.data.uid) {
              console.log("This is the item to be popped", element);
              mapping.splice(mapping.indexOf(element), 1);
              console.log("poporss", mapping);
              mapping_file();
            }
          });

          console.log("got now new aaryyyy", mapping.length);
        }
      });
      mapping.map((obj, i) => {
        sync_updated_data.items.map(x => {
          if (obj.uid === x.data.uid) {
            if (obj.lastmod !== x.data.updated_at) {
              console.log("This is local data", obj);
              console.log("This is response data", x.data);
              console.log(
                "============================================================="
              );
              console.log(obj.urls);
              console.log(x);
              mapping[i]["urls"] = x.data.url;
              console.log("mappper updated", mapping[i]);
              mapping_file();
            }
          }
        });
      });
      create_sitemap();
    }
  });
}

module.exports = {
  untracked_urls,
  syncall,
  update_call
};
