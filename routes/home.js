/**
 * Module dependencies.
 */

var express = require('express');
var router = express.Router();
var axios = require('axios');




router.get('/', function(req, res, next){
  
    axios({
        method: 'get',
        url: `https://cdn.contentstack.io/v3/content_types/${process.env.HOMEPAGE_CONTENT_TYPE}/entries/${process.env.HOMEPAGE_ENTRY_UID}?environment=${process.env.ENV}`,
        headers:{api_key:process.env.APIKEY,access_token:process.env.ACCESSTOKEN,"Content-Type":"application/json"}
        
      })
        .then(function (data) {
          res.render('pages/home.html',{home:data.data})
        }).catch((err)=>{
          console.log(err);
        })
});

module.exports = router;