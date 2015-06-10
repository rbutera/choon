'use strict';

var YouTube = require('youtube-node');
var youTube = new YouTube();
var $q = require('q');

youTube.setKey('AIzaSyCV-WHHsQcxAj0hbrG3PI8HONahDXTmw3Q');

exports.get = function(id){
  var deferred = $q.defer();
  if (!id) {
    deferred.reject('no id presented to video-details');
  } else {
    youTube.getById(id, function(result){
      if (result && result.items && result.items[0].snippet) {
        deferred.resolve(result.items[0].snippet);
      } else {
        deferred.resolve(result);
      }
    }, function(error){
      console.error('YouTube video details retrieval error');
      deferred.reject(error);
    });
  }
  return deferred.promise;
};
