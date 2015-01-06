var youtubeUrl = process.argv[2];
var offliberty = require('offliberty');
var fs = require('fs');
var http = require('http');


var youtubeId;
var userDownloads = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/downloads/';
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
  throw new Error('usage: liberate <url> <filename (optional)>');
} else {
  // validate url as youtube
  console.log('liberate: using offliberty to extract audio from ' + youtubeUrl + '.');

  // extract uuid from youtube url
  youtubeId = extractYoutubeId(youtubeUrl);
}

var download = function (url, dest, cb) {
  if (!url || !dest || !cb) {
    throw new Error('Download: missing argument(s)');
  } else {
    console.log('Downloading ' + url + ' as ' + dest);
    http.get(url, function (response) {
      console.log('Got response: ' + response.statusCode);
      if (response.statusCode === 200) {
        var file = fs.createWriteStream(dest);
        response.pipe(file);

        file.on('finish', function () {
          file.close(cb);
        });

        file.on('error', function (err) {
          fs.unlink(dest); // Delete the file async. (But we don't check the result)
          if (callback)
            callback(err.message);
        });
      } else {
        throw new Error('ERROR: bad offliberty response code (' + response.statusCode + ')');
      }
    });
  }
};

var finished = function () {
  console.log('Finished!');
  process.exit();
};

if (youtubeId) {
  offliberty.off(youtubeUrl, function (err, downloadUrl) {
    if (err) {
      throw err;
    }

    if (!downloadUrl) {
      throw new Error('ERROR: Could not generate download Url');
    } else {
      var finalDestination = downloadDirectory + '/' + youtubeId + '.mp3'; // no items, fox only, final destination
      console.log('File will be downloaded to ' + finalDestination);
      download(downloadUrl, finalDestination, finished);
    }
  });
}
