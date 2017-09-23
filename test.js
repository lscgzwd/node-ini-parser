'use strict';

var test = require('./index');
var data =(test.parseFileSync(__dirname + '/example.ini'));
console.log(data);
console.log(data.sectionB.itemobject);
