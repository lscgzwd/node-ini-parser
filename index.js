'use strict';
/**
 * INI file parser for nodejs
 * example:
 [section1]
 ; comment
 # comment
 a[] = b ; comment
 c[d] = e # comment
 f.h.i = j ; f[h][i] = j
 * @author lscgzwd
 * @link https://github.com/lscgzwd/node-ini-parser
 * @licences Apache-2.0
 */
const fs = require("fs");
const REG_LINE_COMMENT = /^\s*[#;]+.*/;
const REG_SECTION = /^\s*\[\s*([^\]]+?)\s*\]\s*$/;
const REG_LINE_PARAMS = /^\s*([^=]+?)\s*=\s*[\'\"]{0,1}([^;#\'\"]+?)[\'\"]{0,1}\s*([#;]+.*){0,}$/;
const REG_SUB_KEY = /^([^\[]+)\[[\'\"]{0,1}([^\]]*?)[\'\"]{0,1}\]$/;
const DEFAULT_SUB_SEPARATOR = '.';
const PROCESS_SECTION = true;
const DEFAULT_FILE_ENCODING = 'utf-8';
const PARSE_NUMBER_AS_STRING = true;
/**
 * ini 解析方法
 * @param string data 
 * @param string subSeparator
 * @param boolean processSection
 * @param boolean returnNumberAsString
 */
function parse(data, subSeparator, processSection, returnNumberAsString) {
    if (typeof returnNumberAsString === 'undefined') {
        returnNumberAsString = PARSE_NUMBER_AS_STRING;
    }
    var value = {};
    var lines = data.split(/\r\n|\r|\n/);
    var section = null;
    if (!subSeparator) {
        subSeparator = DEFAULT_SUB_SEPARATOR;
    }
    if (typeof(processSection) !== 'boolean') {
        processSection = PROCESS_SECTION;
    }
    lines.forEach(function(line) {
        if (REG_LINE_PARAMS.test(line)) {
            var match = line.match(REG_LINE_PARAMS);
            var key = match[1];
            if (key.indexOf('[') !== -1) {
                var subMatch = key.match(REG_SUB_KEY);
                key = subMatch[1];
                var subKey = subMatch[2];
                // A[] = B
                var val = parseValue(match[2], returnNumberAsString);
                if (subKey.length == 0) {
                    if (section && processSection) {
                        if (!value[section][key]) {
                            value[section][key] = [];
                        }
                        value[section][key].push(val);
                    } else {
                        if (!value[key]) {
                            value[key] = [];
                        }
                        value[key].push(val);
                    }
                } else {
                    // A[B] = C
                    if (section && processSection) {
                        if (!value[section][key]) {
                            value[section][key] = {};
                        }
                        value[section][key][subKey] = val;
                    } else {
                        if (!value[key]) {
                            value[key] = {};
                        }
                        value[key][subKey] = val;
                    }
                }
            } else if(key.indexOf(subSeparator) !== -1) {
                var keys = key.split(subSeparator);
                var subData = {};
                if (section && processSection) {
                    subData = value[section];
                } else {
                    subData = value;
                }
                var val = parseValue(match[2], returnNumberAsString);
                var i = 0;
                keys.forEach(function(subKey) {
                    i++;
                    if (typeof(subData[subKey]) == 'undefined') {
                        if (i == keys.length) {
                            subData[subKey] = val;
                        } else {
                            subData[subKey] = {};
                        }
                    }
                    subData = subData[subKey];
                });
            } else {
                var val = parseValue(match[2], returnNumberAsString);
                
                if (section && processSection) {
                    value[section][match[1]] = val;
                } else {
                    value[match[1]] = val;
                }
            }
        } else if (REG_SECTION.test(line)) {
            var match = line.match(REG_SECTION);
            value[match[1]] = {};
            section = match[1];
        } else if (REG_LINE_COMMENT.test(line)) {
            return;
        } else {
            console.log('un_expect_line:' + line);
        }
    });
    return value;
}
function parseValue(val, returnNumberAsString) {
    if (val == 'true') {
        val = true;
    } else if (val == 'false') {
        val = false;
    } else if(/^\d+(\.\d+){0,1}$/.test(val) && returnNumberAsString === false) {
        val = Number(val);
    }
    return val;
}
function parseFileSync(file, subSeparator, processSection, fileEncoding, returnNumberAsString) {
    if (!fileEncoding) {
        fileEncoding = DEFAULT_FILE_ENCODING;
    }
    return parse(fs.readFileSync(file, fileEncoding),subSeparator, processSection, returnNumberAsString);
}
function parseFile(file, callback, subSeparator, processSection, fileEncoding, returnNumberAsString) {
    if (!fileEncoding) {
        fileEncoding = DEFAULT_FILE_ENCODING;
    }
    fs.readFileSync(file, fileEncoding, function(err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null, parse(data, subSeparator, processSection, returnNumberAsString));
        }
    });
}
function encode(obj, subSeparator) {
    var inis = [];
    var notSectionInis = [];
    var seperator = ' = ';
    if (Array.isArray(obj)) {
        obj.forEach(function(item) {
            // only object allowed
            if (typeof(item) == 'object' && !Array.isArray(item)) {
                encodeObj(item, '', inis, seperator, subSeparator);
            }
        });
    } else if (typeof(obj) == 'object' && obj != null) {
        Object.keys(obj).forEach(function(section) {
            var val = obj[section];
            switch(typeof(val)) {
                case 'string':
                case 'number':
                    notSectionInis.push(section + seperator + val);
                    break;
                case 'boolean':
                    if (val == true) {
                        val = 'true';
                    } else if (val == false) {
                        val = 'false';
                    }
                    notSectionInis.push(section + seperator + val);
                    break;
                case 'object':
                    if (val == null) {
                        notSectionInis.push(section + seperator + '');
                    } else if (Array.isArray(val)) {
                        encodeArray(section, val, seperator, notSectionInis);
                    } else {
                        inis.push('[' + section + ']');
                        encodeObj(val, '', inis, seperator, subSeparator);
                    }
                    break;
                default:
                    break;
            }
        });
    }
    return notSectionInis.join("\n") + inis.join("\n");
}
function encodeObj(obj, k, inis, seperator, subSeparator) {
    Object.keys(obj).forEach(function(ok) {
        var val = obj[ok];
        k = k ? k + subSeparator + ok : ok;
        switch(typeof(val)) {
            case 'string':
            case 'number':
                inis.push(k + seperator + val);
                break;
            case 'boolean':
                if (val == true) {
                    val = 'true';
                } else if (val == false) {
                    val = 'false';
                }
                inis.push(k + seperator + val);
                break;
            case 'object':
                if (val == null) {
                    inis.push(k + seperator + '');
                } else if (Array.isArray(val)) {
                    encodeArray(k, val, seperator, inis);
                } else {
                    encodeObj(val, k, inis, seperator, subSeparator);
                }
                break;
            default:
                break;
        }
    });
}
function encodeArray(k, val, seperator, inis) {
    val.forEach(function(subItem) {
        switch(typeof(subItem)) {
            case 'string':
            case 'number':
                inis.push(k + '[]' + seperator + subItem);
                break;
            case 'boolean':
                if (subItem == true) {
                    subItem = 'true';
                } else if (subItem == false) {
                    subItem = 'false';
                }
                inis.push(k + '[]' + seperator + subItem);
                break;
            case 'object':
                if (subItem === null) {
                    inis.push(k + '[]' + seperator + '');
                } else {
                    inis.push(k + '[]' + seperator + JSON.stringify(subItem));
                }
                break;
            default:
                break;
        }
    });
}
module.exports.encode = encode;
module.exports.parse = parse;
module.exports.parseFile = parseFile;
module.exports.parseFileSync = parseFileSync;