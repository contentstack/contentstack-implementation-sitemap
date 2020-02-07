/**
 * Module dependencies.
 */

let app = require('express')();
// let app = 
let nunjucks = require('nunjucks'); // templating framework
var dotenv = require('dotenv'); // for config varible 

const fs = require('fs')

// const path = './sitemap.xml'








  var home = require('./routes/home');
  var blog = require('./routes/blog');
  var blog_page = require('./routes/blogcontent');
  // const { SitemapStream, streamToPromise } = require('sitemap')
  // const { createGzip } = require('zlib')
  const SitemapGenerator = require('sitemap-generator');
  var pathsite = require('path');



  



  dotenv.config({
    path: './config.env'
  });

  app.set("view engine", "html")

  nunjucks.configure(['views/'], {   // setting a default views folder for templates 
    autoescape: false,
    express: app
  })


  //generator.start();


  app.use('/', require('./middleware'))
  app.use('/', home);
  app.use('/blog', blog)
  app.use('/blog', blog_page)



  // generator.start();

  app.post('/', async(req, res) => {
    var generator = SitemapGenerator('http://localhost:4000', {
    maxDepth: 2000,
    filepath: './sitemap.xml',
    maxEntriesPerFile: 50000,
    stripQuerystring: true,
    changeFreq: 'always'
  });

  generator.on('done', () => {
    console.log("created")
  });
   generator.start();

   res.send({message:'Successful',statusCode:200})

  })

  app.get('*/sitemap', function(req, res){
    let path = './sitemap.xml'
    fs.stat(path, function(err, stat) {
      if(err == null) {
          // console.log('File exists');
          res.contentType('application/xml')
          res.sendFile(pathsite.join(__dirname , 'sitemap.xml'));
  } else if(err.code === 'ENOENT') {
          res.send('<h1>Sitemap not found</h1>')
      } else {
          console.log('Some other error: ', err.code);
      }
    })
    });

  // load port on 3000
  app.listen(process.env.PORT, function () {
    console.log(`Start your browser on ${process.env.PORT}`);
  });