#!/usr/bin/env node
var fs = require('fs');

var file = process.argv[2];

function round(x) {
  return parseFloat(x.toFixed(2));
}

if (!file || !fs.existsSync(file)) {
  console.log('PRINT HELP');
  process.exit(1);
}

fs.readFile( file, 'utf8', function ( err, buffer ) {
  if ( err ) { throw err; }

  // Parse for SVG path descriptor
  var descriptor = buffer.match(/ d="m ([^"]*) z"/);
  // Divide string into coordinate strings
  var points = descriptor[1].split(' ');
  // Divide these strings into arrays of float pairs ([x1, y1], [x2, y2], ...)
  points = points.map(value => value.split(',').map((string) => {
    return round(parseFloat(string));
  }));
  var start = points[0];
  var relativePoints = points.slice(1);
  // Convert relative points to absolute points
  var sum = start.map((value) => round(value));
  var absolutePoints = relativePoints.map(pair => {
    sum = pair.map(function (num, i) {
      return round(num + sum[i]);
    });
    return sum;
  })
  var newPoints = [start].concat(absolutePoints);
  var polygonString = 'clip-path: polygon('
  newPoints.forEach((point) => {
    polygonString += `${point[0]}% ${point[1]}%,`
  });
  polygonString = polygonString.slice(0, -1) + ');'
  console.log(polygonString);
});