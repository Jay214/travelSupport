const cheerio = require('cheerio')
const mysql = require('mysql')
const userModel = require('../lib/mysql')
//const express = require('express')
//const app = express()
const superagent = require('superagent')
require('superagent-charset')(superagent)
const async = require('async');
//将Unicode转汉字
function reconvert(str) {
    str = str.replace(/(&#x)(\w{1,4});/gi, function ($0) {
      return String.fromCharCode(parseInt(escape($0).replace(/(%26%23x)(\w{1,4})(%3B)/g, "$2"), 16));
    });
    return str
  }

  function fetUrl(url,fn) {
    return new Promise(function(resolve,reject){

       superagent.get(url)
         .charset('utf-8')  
         .end(function (err, res) {
           if(err){
            console.log('err:',err)
            reject(0);
     
           }else{
           resolve(fn(res))
           }
         
         })
       //  return result
    })
    
     }
     function fetUrl2(url,data) {
      return new Promise(function(resolve,reject){
  
         superagent.post(url)
           .charset('utf-8')
           .send(data)
           .set('Content-Type','application/x-www-form-urlencoded')  
           .end(function (err, res) {
             if(err){
              //console.log('err:',err)
              reject('[]');
       
             }else{
              
             resolve(res.text)
             }
           
           })
         //  return result
      })
      
       }
  


     function main(urls) {

        async.mapLimit(urls, 5, function (url, callback) {
         
          fetUrl(url, callback, arr) 
        }, function (err, results) {
          if(err){
            console.log('errrsult')
          }
          saveToMysql(arr)
          console.log('result',arr)
          arr = []
        })
      }
      module.exports = {
          fetUrl: fetUrl,
          fetUrl2: fetUrl2
      }