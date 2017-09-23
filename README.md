# ini-parser-encoder
A helper to parse ini file for nodejs

# USAGE
``
npm install ini-parser-encoder
``

```
var parser = require('ini-parser-encoder');
// sync
var config = parser.parseFileSync(INI_FILE);
// async
parser.parseFile(INI_FILE, function(err, data) {
    if (err) {
        //
    } else {
        //
    }
});
```

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
; this is comment
[sectionA]
# # comment not recommend
itemarray[] = a
itemarray[] = b
itemarray[] = c
[sectionB]
itemobject.subobj.a = 1
itemobject.subobj.b.d = 2
itemobject.subobj.b.e = 2
```