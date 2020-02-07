/**
 * Module dependencies.
 */

let request = require("request-promise");
let dotenv = require("dotenv");
let async = require("async");
let axios = require('axios');
dotenv.config({
  path: "config.env"
}); // configuring the environment

module.exports=function (req, res, next){

	async.parallel([
		function(callback){
      axios({
        method: 'get',
        url: `https://cdn.contentstack.io/v3/content_types/${process.env.HEADER_CONTENT_TYPE}/entries/${process.env.HEADER_ENTRY_UID}?environment=${process.env.ENV}`,
        headers:{api_key:process.env.APIKEY,access_token:process.env.ACCESSTOKEN,"Content-Type":"application/json"}
        
      })
        .then(function (data) {
          callback(null,data.data);
        }).catch((err)=>{
          console.log(err);
        })
    
    },
    function(callback){
      axios({
        method: 'get',
        url: `https://cdn.contentstack.io/v3/content_types/${process.env.FOOTER_CONTENT_TYPE}/entries/${process.env.FOOTER_ENTRY_UID}?environment=${process.env.ENV}`,
        headers:{api_key:process.env.APIKEY,access_token:process.env.ACCESSTOKEN,
        "Content-Type":"application/json"}
        
      })
        .then(function (data) {
          callback(null,data.data);
        }).catch((err)=>{
          console.log(err);
        })
    
    }], function (error, success) {
			if (error) return next(error);
      res.locals.header = success[0];
			res.locals.footer = success[1];
			next();
		})
};


