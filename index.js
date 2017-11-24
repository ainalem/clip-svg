#!/usr/bin/env node

var fs = require('fs');
var file = process.argv[2];

function round(x) {
  return parseFloat(x.toFixed(2));
}

function bail(errorMsg) {
  console.log(errorMsg);
  process.exit(1);
}

function descriptor2clipPath(descriptor) {
  // Divide string into coordinate strings
  var points = descriptor.split(' ');
  // Divide these strings into arrays of float pairs ([x1, y1], [x2, y2], ...)
  points = points.map(value => value.split(',').map((string) => {
    return round(parseFloat(string));
  }));

  for (var key in points) {
    if ([0, 1].some((index) => isNaN(points[key][index]))) {
      bail('Error: Malformed descriptor');
    }
  }

  var start = points[0];
  var relativePoints = points.slice(1);
  // Convert relative points to absolute points
  var sum = start.map((value) => round(value));
  var absolutePoints = relativePoints.map(pair => {
    sum = pair.map(function (num, i) {
      return round(num + sum[i]);
    });
    return sum;
  });
  var newPoints = [start].concat(absolutePoints);
  var polygonString = 'clip-path: polygon('
  newPoints.forEach((point) => {
    polygonString += `${point[0]}% ${point[1]}%,`
  });
  polygonString = polygonString.slice(0, -1) + ');'
  console.log(polygonString);
}

if (!file || !fs.existsSync(file)) {
  bail('Usage: clip-path [SVG file]');
}

fs.readFile( file, 'utf8', function (err, buffer) {
  if ( err ) { bail('Error: File I/O'); }

  // Parse for SVG path descriptor
  var descriptors = buffer.match(/ d="m ([^z]*) z"/g);

  if (!descriptors || descriptors.length === 0) {
    bail('Error: no matches');
  }

  descriptors = descriptors.map((descriptor) => descriptor.slice(6, -3));
  console.dir(descriptors);

  descriptors.forEach((descriptor) => {
    descriptor2clipPath(descriptor);
  });
});