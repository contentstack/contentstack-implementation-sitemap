/**
 * Module dependencies.
 */

let app = require("express")();
let nunjucks = require("nunjucks"); // templating framework
var dotenv = require("dotenv"); // for config varible
var dotenv = require("dotenv");


var home = require("./routes/home");
var blog = require("./routes/blog");
var blog_page = require("./routes/blogcontent");
var path = require("path");
var sitemap_function = require("./routes/sitemap")


dotenv.config({
  path: "./config.env"
});

app.set("view engine", "html");

nunjucks.configure(["views/"], {
  // setting a default views folder for templates
  autoescape: false,
  express: app
});

//generator.start();

app.use("/", require("./middleware"));
app.use("/", home);
app.use("/blog", blog);
app.use("/blog", blog_page);

sitemap_function.untracked_urls(); // first untracked url call with no interval

// setInterval(sitemap_function.untracked_urls,2592000); // for untracked interval is set for 30 days

sitemap_function.syncall(); //called only once

setInterval(sitemap_function.update_call,100000); // 10second days interval

app.get("/sitemap", async function(req, res) {
  res.contentType("application/xml");
  res.sendFile(path.join(__dirname, "sitemap.xml"));
});

// load port on 3000
app.listen(process.env.PORT, function() {
  console.log(`Start your browser on ${process.env.PORT}`);
});
