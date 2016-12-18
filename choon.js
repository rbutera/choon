#! /usr/bin/env node
'use strict';
// invariables
var YOUTUBE_URL = process.argv[2];
var HOME_DIRECTORY = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

// libraries
var offliberty = require('offliberty');
var fs = require('fs');
var path = require('path');
var request = require('request');
var progress = require('request-progress');
var chalk = require('chalk');
var $q = require('q');
var _ = require('lodash');

var choonYT = require('./youtube.js');


var requestedContent;

var userDownloads = path.join(HOME_DIRECTORY, 'Downloads');
var downloadDirectory = process.argv[3] || userDownloads;

var processYoutubeUrl = function (url) {
  var output = {
    v: undefined,
    list: undefined
  };

  var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  var extractVideoId = url.match(regExp);
  if (extractVideoId && extractVideoId[2].length == 11) {
    console.log('extracted video id');
    output.v = extractVideoId[2];
  } else {
    console.error('ERROR: Could not extract youtube id from download url');
  }

  var regExp = /^.*(youtu.be\/|list=)([^#\&\?]*).*/;
  var extractPlaylistId = url.match(regExp);
   if (extractPlaylistId && extractPlaylistId[2]){
       console.log('extracted playlist id');
       output.list = extractPlaylistId[2];
   } else {
     console.error('ERROR: Could not extract playlist id from download url');
   }
   return output;
};

var buildMetaData = function(input){
  var id = input.v;
  var list = input.list;
  var deferred = $q.defer();
  if (_.isString(input)) {
    deferred.reject('Deprecated: buildMetaData now expects an object {v: \'video-id\', list: \'list-id\'}. Received ' + JSON.stringify(input));
  }
  if (_.isEmpty(id) && _.isEmpty(list)) {
    deferred.reject('no id or list sent to buildMetaData');
  } else {
    // get youtube details
    if (!_.isEmpty(id)) {
      console.log('building meta data for video ' + id);
      choonYT.video(id).then(function succ(res) {
        deferred.resolve(res);
      },function failure(error) {
        deferred.reject(error);
      });
    } else if (!_.isEmpty(list)) {
      console.log('building meta data for playlist ' + id);
      choonYT.list(list).then(function succ(res) {
        deferred.resolve(res);
      },function failure(error) {
        deferred.reject(error);
      });
    } else {
      deferred.reject('id and list are empty, wtf is:', wtf);
    }
  }

  return deferred.promise;
};

if (!YOUTUBE_URL) {
  throw new Error('usage: choon <url> <destination directory>');
} else {
  // validate url as youtube
  console.log(chalk.white.bgBlack.bold('choon: ') + 'using offliberty to extract audio from ' + chalk.underline(YOUTUBE_URL));

  // extract uuid from youtube url
  requestedContent = processYoutubeUrl(YOUTUBE_URL);
}

var download = function (url, dest) {
  var deferred = $q.defer();
  if (!url || !dest) {
    deferred.reject('Download: missing argument(s)');
  } else {
    console.log('Downloading ' + chalk.underline(url) + ' as ' + chalk.bold(dest));
    // Note that the options argument is optional
    progress(request(url), {
        throttle: 2000,  // Throttle the progress event to 2000ms, defaults to 1000ms
        delay: 1000      // Only start to emit after 1000ms delay, defaults to 0ms
    })
    .on('progress', function (state) {
        console.log(chalk.bold(state.percent) + '% ' + chalk.dim('complete'));
    })
    .on('error', function (err) {
        deferred.reject(err);
    })
    .pipe(fs.createWriteStream(dest))
    .on('error', function (err) {
        deferred.reject(err);
    })
    .on('close', function (err) {
       if(err){
         deferred.reject(err);
       }
       console.log(chalk.green.bgBlack('Enjoy your choon!'));
       deferred.resolve();
    });
  }
  return deferred.promise;
};


var olRequest = function(filename){
  var deferred = $q.defer();
  console.log(chalk.dim('Requesting download url from offliberty'));

  offliberty.off(YOUTUBE_URL, function (err, downloadUrl) {
    if (err) {
      deferred.reject(err);
    }

    if (!downloadUrl) {
      deferred.reject('ERROR: Could not generate download url');
    } else {
      if(!process.argv[3]){
        console.log(chalk.dim('No destination directory specified.... defaulting to ~/Downloads/'));
      }

      var finalDestination = downloadDirectory + '/' + (filename || requestedContent) + '.mp3'; // no items, fox only, final destination
      console.log(chalk.dim('File will be downloaded to ' + chalk.underline(finalDestination)));
      deferred.resolve([downloadUrl, finalDestination]);
    }
  });
  return deferred.promise;
};

var getSong = function (videoData) {
  console.log(chalk.yellow.bgBlack('> ' + videoData.title));
  return olRequest(videoData.title)
    .then(function(urlAndFilename){
      return download(urlAndFilename[0], urlAndFilename[1]);
    }).then(function(result){
      return 'success';
    }).catch(function(error){
      throw error;
    });
}

if (!_.isEmpty(requestedContent) && (!_.isEmpty(requestedContent.v) || !_.isEmpty(requestedContent.list))) {
  console.log('####',requestedContent);
  buildMetaData(requestedContent).then(function (metadata){
    if (_.isEmpty(requestedContent.list)){ /* get video mode */
      chalk.inverse('single video mode');
      console.log(metadata);
      return getSong(metadata[0]);
    } else { /* get playlist mode */
      chalk.inverse('playlist mode');
      if (metadata.length > 1) {
        var playlist = metadata[1];
        chalk.magenta(playlist);
      } else if (metadata.length === 1) {
        var playlist = metadata[0];
        chalk.magenta(playlist);
      } else {
        throw new error('playlist mode failure - metadata metadata array of unexpected size');
      }
    }
  }, function(error){
      throw error;
  })
} else {
  console.log(requestedContent);
  throw new error('requested content empty');
}
