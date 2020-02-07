/**
 * Module dependencies.
 */

var express = require('express');
var router = express.Router();
var axios = require('axios');
var dotenv = require("dotenv");



dotenv.config({
  path: "config.env"
}); // configuring the environment



router.get('/', function(req, res, next){
  axios({
        method: 'get',
        url: `https://cdn.contentstack.io/v3/content_types/${process.env.BLOG_CONTENT_TYPE}/entries?environment=${process.env.ENV}`,
        headers:{api_key:process.env.APIKEY,access_token:process.env.ACCESSTOKEN,"Content-Type":"application/json"}
        
      })
        .then(function (data) {
          // console.log(data.data);
          res.render('pages/blog.html',{blog:data.data})
        }).catch((err)=>{
          console.log(err);
        })
});


module.exports = router;