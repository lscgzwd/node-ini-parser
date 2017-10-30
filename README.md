# ini-parser-encoder
A helper to parse ini file for nodejs

# USAGE


```
npm install ini-parser-encoder
```
## parse
```
var parser = require('ini-parser-encoder');
// sync
var config = parser.parseFileSync(INI_FILE, sub_separator, process_section, file_encoding, return_number_as_string);
// async
var parser.parseFile(INI_FILE, function(err, data) {
    if (err) {
        //
    } else {
        //
    }
}, sub_separator, process_section, file_encoding, return_number_as_string)
```
### subSeparator
`a.b.c = val` will be parse as {a:{b:{c: val}}}, the default sub separator is `.` , you can change it by pass param subSeparator
### processSection
By default, will process section `[section]` as object property, you can pass `false` to disable it.  
## note
if set returnNumberAsString to false,  will return Number(value) if a line only contain number and point

## encode

```
var obj = {
    hello: 'world',
    arr: ['a', 'b', 'c'],
    sectionA: {
        itema: 'stringa',
        itemb: true
    }
}
var strIni = parser.encode(obj);
// save to file
```

# Example for ini file
```
hello = world ; inline comment
booltest = true
numbertest = 1
floattest = 2.22
floattesta = 0.333
notfloattest = .4444
; this is comment
[sectionA]
# # comment not recommend
itemarray[] = a
itemarray[] = b
itemarray[] = c
[sectionB]
# sub seperator test
itemobject.subobj.a = 1
itemobject.subobj.b.d = 2
itemobject.subobj.b.e = 2
[mysql]
database="mis"
username="rd"
password="ABCDD=="
host=100.0.0.2
port="3306"
charset= "utf8"
```
