/**
 * Module dependencies.
 */

var express = require('express');
var router = express.Router();
var axios = require('axios');
var dotenv = require("dotenv");


dotenv.config({
  path: "config.env"
});



router.get('/:url', function(req, res, next){
  axios({
        method: 'get',
        url: `https://cdn.contentstack.io/v3/content_types/${process.env.BLOG_CONTENT_TYPE}/entries?environment=${process.env.ENV}`,
        headers:{api_key:process.env.APIKEY,access_token:process.env.ACCESSTOKEN,"Content-Type":"application/json"}
        
      })
        .then(function (data) {
            function getdata(blog){
              return blog.url === `/${req.params.url}` 
          }
          let data_content=  data.data.entries.find(getdata);
          res.render('pages/blogpage.html',{content:data_content})  
        }).catch((err)=>{
          console.log(err);
        })
});


module.exports = router;