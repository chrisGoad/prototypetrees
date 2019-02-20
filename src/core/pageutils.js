// Copyright 2019 Chris Goad
// License: MIT

// minimal utilities needed for a ProtoPedia web page (used in the minimal and firebase_only modules)


// p might be a string or array of strings; if the latter, returns  true if it ends in any
const endsIn = function (string,p) {
  if (typeof p === 'string') {
    let ln = string.length;
    let  pln = p.length;
    let es;
    if (pln > ln) {
      return false;
    }
    es = string.substr(ln-pln);
    return es === p;
  } else {
    return p.some(function (x) {
      return endsIn(string,x);
    });
  }
  
}

const beginsWith = function (string,p) {
  let ln = string.length;
  let pln = p.length;
  let es;
  if (pln > ln) {
    return false;
  }
  es = string.substr(0,pln);
  return es === p;
}


const beforeLastChar = function (string,chr,strict) {
  let idx = string.lastIndexOf(chr);
  if (idx < 0) {
    return strict?undefined:string;
  }
  return string.substr(0,idx);
}

const pathExceptLast = function (string,chr) {
  return beforeLastChar(string,chr?chr:'/');
}


const afterLastChar = function (string,chr,strict) {
  let idx = string.lastIndexOf(chr);
  if (idx < 0) {
    return strict?undefined:string;
  }
  return string.substr(idx+1);
}


const pathLast = function (string) {
  return afterLastChar(string,'/');
}


const ready = function (fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded',fn);
  }
}


const httpGet = function (iurl,cb) { // there is a fancier version in core/install.js
/* from youmightnotneedjquery.com */
  let performGet = function (url) {
    let request = new XMLHttpRequest();
    request.open('GET',url,true);// meaning async
    request.onload = function() {
      if (cb) {
        if (request.status >= 200 && request.status < 400) {
        // Success!
          cb(undefined,request.responseText);
        } else {
          cb('http GET error for url='+url);
        }
        // We reached our target server, but it returned an error
      }
    }  
    request.onerror = function() {
        cb('http GET error for url='+url);
    };
    request.send();
  }
  vars.mapUrl(iurl,performGet)
}


const parseQuerystring = function() { 
    let nvpair = {};
    let qs = window.location.search.replace('?','');
    let pairs = qs.split('&');
    pairs.forEach(function(v) {
      let pair = v.split('=');
      if (pair.length>1) {
        nvpair[pair[0]] = pair[1];
      }
    });
    return nvpair;
}


// in strict mode, the next 4 functions return undefined if c does not appear in s, ow the whole string
const afterChar = function (string,chr,strict) {
  let idx = string.indexOf(chr);
  if (idx < 0) {
    return strict?undefined:string;
  }
  return string.substr(idx+1);
}




const beforeChar = function (string,chr,strict) {
  let idx = string.indexOf(chr);
  if (idx < 0) {
    return strict?undefined:string;
  }
  return string.substr(0,idx);
}

  
const stripInitialSlash = function (string) {
  if (string==='') {
    return string;
  }
  if (string[0]==='/') {
    return string.substr(1);
  }
  return string;
}


const addInitialSlash = function (string) {
  if (string==='') {
    return string;
  }
  if (string[0]==='/') {
    return string;
  }
  return '/'+string;
}

const pathReplaceLast = function (string,rep,sep) {
  let sp = sep?sep:'/';
  let idx = string.lastIndexOf(sp);
  let  dr = string.substring(0,idx+1);
  return dr + rep;
}
  
 
const setIfNumeric = function (node,prp,v) {
  let n = parseFloat(v);
  if (!isNaN(n)) {
    this[prp] = v;
  }
}


export {httpGet,beginsWith,endsIn,afterLastChar,beforeLastChar,parseQuerystring,pathExceptLast,pathLast};
