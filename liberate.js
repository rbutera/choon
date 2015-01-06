#! /usr/bin/env node

'use strict';

var youtubeUrl = process.argv[2];
var offliberty = require('offliberty');
var fs = require('fs');
var path = require('path');
var request = require('request');
var progress = require('request-progress');
var chalk = require('chalk');


var youtubeId;
var HOME_DIRECTORY = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
var userDownloads = path.join(HOME_DIRECTORY, 'Downloads');
var downloadDirectory = process.argv[3] || userDownloads;

var extractYoutubeId = function (url) {
  var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  var match = url.match(regExp);
  if (match && match[2].length == 11) {
    return match[2];
  } else {
    throw new Error('ERROR: Could not extract youtube id from download url');
  }
};

if (!youtubeUrl) {
  throw new Error('usage: liberate <url> <destination directory>');
} else {
  // validate url as youtube
  console.log('liberate: using offliberty to extract audio from ' + youtubeUrl + '.');

  // extract uuid from youtube url
  youtubeId = extractYoutubeId(youtubeUrl);
}

var download = function (url, dest) {
  if (!url || !dest) {
    throw new Error('Download: missing argument(s)');
  } else {
    console.log('Downloading ' + url + ' as ' + dest);
    // Note that the options argument is optional
    progress(request(url), {
        throttle: 2000,  // Throttle the progress event to 2000ms, defaults to 1000ms
        delay: 1000      // Only start to emit after 1000ms delay, defaults to 0ms
    })
    .on('progress', function (state) {
        console.log(state.percent + '%');
    })
    .on('error', function (err) {
        throw err;
    })
    .pipe(fs.createWriteStream(dest))
    .on('error', function (err) {
        throw err;
    })
    .on('close', function (err) {
       if(err){
         throw err;
       }
       console.log('Finished!');
       process.exit();
    });
  }
};

if (youtubeId) {
  console.log('Requesting download url from offliberty');

  offliberty.off(youtubeUrl, function (err, downloadUrl) {
    if (err) {
      throw err;
    }

    if (!downloadUrl) {
      throw new Error('ERROR: Could not generate download Url');
    } else {
      if(!process.argv[3]){
        console.log('No destination directory specified.... defaulting to ~/Downloads/');
      }

      var finalDestination = downloadDirectory + '/' + youtubeId + '.mp3'; // no items, fox only, final destination
      console.log('File will be downloaded to ' + finalDestination);
      download(downloadUrl, finalDestination);

    }
  });
}
