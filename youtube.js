'use strict';
var chalk = require('chalk');
var $q = require('q');
var _ = require('lodash');

youTube.setKey('AIzaSyCV-WHHsQcxAj0hbrG3PI8HONahDXTmw3Q');

exports.video = function(id){
  // console.log('choonYT video: ', id);
  var deferred = $q.defer();
  if (!id) {
    deferred.reject('no id presented to video-details');
  } else {
    youTube.getById(id, function(error, result){
      if(error){
        console.error('YouTube video details retrieval error');
        deferred.reject(error);
      } else {
        if (result && result.items && result.items[0].snippet) {
          deferred.resolve(result.items[0].snippet);
        } else {
          deferred.resolve(result);
        }
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
    console.log(youTube);
    youTube.getPlayListsItemsById('PLpOqH6AE0tNhInmRTSNf9f6OQsdaSJS8F', function(error, result) {
      if (error) {
        deferred.reject(error);
      }
      else {
        console.log(JSON.stringify(result, null, 2));
        deferred.resolve(result);
      }
    });
  }
  return deferred.promise;
};
