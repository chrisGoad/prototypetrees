/*

A very tiny and simple webpack-ish tool.
It oncats files,  minimizes, and gzips them.

Usage:

cd <prototypetrees-root>

node admin/assemble.js <module>

*/
let what = process.argv[2];
let noMinify = Boolean(process.argv[3]);
let versions = require("./versions.js");

 
let fs = require('fs');
let zlib = require('zlib');    
let babel = require("babel-core");


let fileLists = {};

const prepend = function (what,arr) {
  return arr.map(function (el) { return what+"/"+el;});
}


fileLists.core = prepend('core',["root","tree","exception","update","instantiate","serialize","deserialize","pageutils",
                  "install","xpath","log","replace","spread","history"]);
fileLists.geom = prepend("geom",["geom","geometric_object"]); 
fileLists.dom = prepend('dom',["environment","data","dom1","jxon","svg","html","domstringify","svg_serialize"]);
fileLists.harness  = prepend('harness',['environment','install','page','init_page']);                         

function doGzip(file,cb) {
  console.log("gzipping ",file);
  let gzip = zlib.createGzip();
  let inp = fs.createReadStream(file);
  let out = fs.createWriteStream(file+'.gz');
  inp.pipe(gzip).pipe(out);
  out.on('close',cb);
}

function fullName(f) {
  return `src/${f}.js`;
}

function getContents(fl) {
  let fln = fullName(fl);
  console.log("Reading from ",fln);
  let cn = ""+fs.readFileSync(fln);
  return cn;
}

function mextract(fls) {
  let rs = "";
  fls.forEach(function (fl) {
    rs += getContents(fl);
  });
  return rs;
}

function mkPath(which,version,mini) {
 // return "js/"+(es5?'es5_':'')+which+"-"+version+(mini?".min":"")+".js";
  return `js/${which}-${version}${mini?".min":""}.js`;

}

function mkModule(which,version,contents) {
  console.log('mkModule',which,version);
  let path = mkPath(which,version,0);
  let minpath = mkPath(which,version,1);
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

function buildModule() {
  let fls = fileLists[what];
  if (!fls) {
    console.log('No such module: ',what);
  }
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

