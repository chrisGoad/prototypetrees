/*

A very tiny and simple webpack-ish tool.
Concats files, and babels and minimizes them.
Usage:

cd c:\prototypetrees
node admin/assemble.js <module>

*/
var what = process.argv[2];
var noMinify = Boolean(process.argv[3]);
console.log(noMinify);
var versions = require("./versions.js");

 
var fs = require('fs');
//var minify = require('minify');
var zlib = require('zlib');    
var babel = require("babel-core");


let fileLists = {};

const prepend = function (what,arr) {
  return arr.map(function (el) { return what+"/"+el;});
}


fileLists['core'] = prepend('core',["root","tree","exception","update","instantiate","serialize","deserialize","pageutils",
                  "install","xpath","log","replace","spread"]);
fileLists['geom'] = prepend("geom",["geom","geometric_object"]); 
fileLists['dom'] = prepend('dom',["environment","data","dom1","jxon","svg","html","domstringify","svg_serialize"]);
fileLists['harness']   = ['harness/environment','harness/install','harness/page','harness/init_page','harness/uiStub'];                         
fileLists['lightbox'] = ["lightbox/lightbox"];

function doGzip(file,cb) {
  console.log("gzipping ",file);
  var gzip = zlib.createGzip();
  var inp = fs.createReadStream(file);
  var out = fs.createWriteStream(file+'.gz');
  inp.pipe(gzip).pipe(out);
  out.on('close',cb);
}
let isPrivate = false;
function fullName(f) {
  return 'js/'+f+".js";
}

function getContents(fl) {
  var fln = fullName(fl);
  console.log("Reading from ",fln);
  var cn = ""+fs.readFileSync(fln)
  return cn;
}

function mextract(fls) {
  var rs = "";
  fls.forEach(function (fl) {
    rs += getContents(fl);
  });
  return rs;
}

function mkPath(which,version,mini,es5) {
  return "www/js/"+(es5?'es5_':'')+which+"-"+version+(mini?".min":"")+".js";
}

function mkModule(which,version,contents,cb) {
  console.log('mkModule',which,version,'isPrivate',isPrivate);
  var path = mkPath(which,version,0);
  var minpath = mkPath(which,version,1);
  console.log("Saving to path ",path);  
  fs.writeFileSync(path,contents);
  let minified;
  if (noMinify) {
    minified = contents;
  } else {
    minified = babel.transformFileSync(path).code;// for some reason plain old babel.transformmm couldn't find .babelrc
  }
  fs.writeFileSync(minpath,minified);
  doGzip(minpath,function () { // finally ,gzip it;
    console.log("gzipping done");
  });
}
/*
var stdClose = '\n})(prototypeJungle);\n';
var stdOpen = '"use strict";\n(function (pj) {\n';

stdOpen = '';
stdClose = '';
*/
//var minClose = '\nreturn pj;\n})()\n';
//var addOns = {'minimal':minClose,'firebase_only':minClose,'catalog_editor':stdClose,'editor':stdClose,'code_editor':stdClose};

//var introducePJ;// = getContents('core/pj') ;

function buildModule() {
  let fls = fileLists[what];
  if (!fls) {
    console.log('No such module: ',what);
  }
 // var cn = addOpen + mextract(fls) + addClose;
  let cn = mextract(fls);
  mkModule(what,versions[what],cn);
}

buildModule();     
   
   
/*
 
 node admin/assemble core;
 node admin/assemble geom;
 node admin/assemble dom;
 node admin/assemble harness;

*/

