'use strict';
var Youtube = require("youtube-api");
var $q = require('q');
var _ = require('lodash');

var oauth = Youtube.authenticate({type: 'key', key: 'AIzaSyCV-WHHsQcxAj0hbrG3PI8HONahDXTmw3Q'});

exports.video = function(id){
  console.log('choonYT video ' + id);
  var deferred = $q.defer();
  if (!id) {
    deferred.reject('no id presented to video-details');
  } else {
    var config = {
      part: 'id,contentDetails,topicDetails'
    };
    Youtube.videos.list(config, function (err, succ){
      if(err){
        deferred.reject(err);
      } else {
        console.log('\n\nsucc', succ);
        deferred.resolve(succ);
      }
    });
  }
  return deferred.promise;
};

exports.list = function(list){
  console.log('choonYT list: ', list);
  var deferred = $q.defer();
  if (!list) {
    deferred.reject('no list presented to video-details');
  } else {

  }
  return deferred.promise;
};
