// Copyright 2019 Chris Goad
// License: MIT

// basic operations on ObjectNodes, and ArrayNodes; set for example
//Starting the cleanup; testing git

externals.__builtIn = 1;

// constructors for nodes 

ObjectNode.mk = function (src) {
  let rs = Object.create(ObjectNode);
  if (src) {
    extend(rs,src);
  }
  return rs;
}

ArrayNode.mk = function (array) {
  let rs = Object.create(externals.Array);
  if (array===undefined) {
    return rs;
  }
  let ln;
  let numerical = typeof array === 'number';
  if (numerical) {
    ln = array;
  } else {
    ln = array.length;
   }
  for (let i=0;i<ln;i++) {
    if (numerical) {
      rs.push(undefined);
    } else {
      let child = array[i];
      if (child && (typeof child === 'object')) {
        child.__parent = rs;
        child.__name = String(i);
      }
      rs.push(child);
    }
  }
  return rs;
}


//  make the same method fn work for Objects, Arrays
const nodeMethod = function (name,func) {
  ArrayNode[name] = ObjectNode[name] = func;
}



// only strings that pass this test may  be used as names of nodes
// numbers can be used as labels
export const checkName = function (string) {
  if ((string === undefined) || (!string.match)) { 
    error('Bad argument');
  }
  if (string==='') {
    return false;
  }
  if (string==='$') {
    return true;
  }
  return Boolean(string.match(/^(?:|_|[a-z]|[A-Z])(?:\w|-)*$/));
}
/* A path is a sequence of names indicating a traversal down a tree. It may be
 * represented as a '/' separated string, or as an array.
 * When string path starts with '/' (or an array with  empty string as 0th element)
 * this means start at pj, regardless of origin (ie the path is absolute rather than relative).
 */

const checkPath = function (string,allowFinalSlash) {
  let strSplit = string.split('/');
  let ln = strSplit.length;
  let  i = 0;
  if (ln===0) {
    return false;
  }
  if (allowFinalSlash && (strSplit[ln-1] === '')) {
    ln = ln - 1;
  }
  for (;i<ln;i++) {
    let pathElement = strSplit[i];
    if (((i>0) || (pathElement !== '')) && // '' is allowed as the first  element here, corresponding to a path starting with '/'
       !checkName(pathElement)) {
      return false;
    }
  }
  return true;
}


const evalPath = function (ipth,iorigin) {
  let pth,current,startIdx;
  let origin = iorigin?iorigin:root;
  if (!ipth) {
    return undefined;//origin; // it is convenient to allow this option
  }
  if (typeof ipth === 'string') {
    pth = ipth.split('/');
  } else {
    pth = ipth;
  }
  let ln = pth.length;
  if (ln===0) {
    return origin;
  }
  if (pth[0]==='') {
    current = externals;
    startIdx = 1;
  } else {
    current = origin;
    startIdx = 0;
  }
  for (let idx=startIdx;idx<ln;idx++) {
    let prop = pth[idx];
    if (current && (typeof current === 'object')) {
      current = current[prop];
    } else {
      return undefined;
    }
  }
  return current;
}

// omits initial "/"s. Movethis?
const pathToString = function (p,isep) {
  let rs,ln,e;
  let sep = isep?isep:"/";
  ln = p.length;
  if (sep===".") {
    rs = p[0];
    for (let i=1;i<ln;i++) {
      e = p[i];
      if (typeof e==="number") {
        rs = rs+"["+e+"]";
      } else {
        rs = rs +"."+e;
      }
    }
  } else {
    rs = p.join(sep);
  }
  if (ln>0) {
    if (p[0]===sep) {
      return rs.substr(1);
    }
  }
  return rs;
}

/*
 * Return the path from root, or if root is undefined the path up to where parent is undefined. In the special case where
 * root === externals, the path begins with '' (so that its string form will start with '/')
 */

const pathOf = function (node,root) {
  let rs = [];
  let current = node;
  while (true) {
    if (current === undefined) {
      //return undefined; // change cg 8/2/18 
      return root?undefined:rs;
    }
    if (current=== root)  {
      if (root === externals) {
        rs.unshift('');
      }
      return rs;
    }
    let name = getval(current,'__name');
    // if we have reached an unnamed node, it should not have a parent either
    if (name!==undefined) {
      rs.unshift(name);
    }
    current = getval(current,'__parent');
  }
}

const stringPathOf = function (node,root,sep = '/') {
  let path = pathOf(node,root);
  return path!==undefined?path.join(sep):undefined;
}



nodeMethod('__pathOf',function (root) {return pathOf(this,root);});


const isObject = function (o) {
  return o && (typeof o === 'object');
}


const isAtomic = function (x) {
  return !isObject(x);
}
  

const isNode = function (x) { 
  return ObjectNode.isPrototypeOf(x) || ArrayNode.isPrototypeOf(x);
}

  

// gets own properties only
const getval = function (node,prop) {
  if (!node) {
    error('null v');
  }
  if (node.hasOwnProperty(prop)) {
    return node[prop];
  }
}


const separateFromParent = function (node) {
  let parent = getval(node,'__parent');
  if (parent) {
    let name = node.__name;
    if (Array.isArray(parent)) {
      parent[name] = undefined;
    } else {
      delete parent[name];
    }
  }
}

// assumes node[__name] is  child, or will be child. lifts if needed.
const adopt = function (node,name,ichild) {
  let child;
  if (!isObject(ichild)) {
    return;
  }
  if (isNode(ichild)) {
    child = ichild;
    separateFromParent(child);
  } else {
    child = lift(ichild);
  } 
  child.__name = name;
  child.__parent = node;
}

export let preSetChildHooks = [];
export let setChildHooks = [];

/* A property k of a node is watched if the field annotation "Watched" is set for that property. 
 * For watched fields, a change event is emitted of the form {id:change node:node property:__name}
 */

const setChild = function (node,name,child) {
  preSetChildHooks.forEach(function (fn) {fn(node,name);});
  adopt(node,name,child);
  node[name] = child;
  setChildHooks.forEach(function (fn) {
    fn(node,name,child);
  });
  
  let watched = node.__Watched;
  if (watched && watched[name]) {
  //if (node.__watched && node['__'+name+'_watched']) {
    let event = Event.mk('change',node);
    event.property=name;
    event.emit();
  }
}

/* set has several variants
 * :
 *
 * x.set(name,v)  where name is a simple name (no /'s). This causes v to be the new child of x if v is a node, other wise just does x[name] = v
 *
 * x.set(path,v) where path looks like a/b/../name. This creates the path a/b/... if needed and sets the child name to v. Whatever part of the path
 * is already there is left alone.
 *
 * x.set(source)  extends x by source, in the sense of jQuery.extend in deep mode
 */

 
// returns val
ObjectNode.set = function (key,val) {
  let idx,path,name,parent;
  if (arguments.length === 1) {
    extend(this,key);
    return this;
  }
  if (typeof key ==='string') {
    idx = key.indexOf('/');
  } else { 
    idx = -1;
  }
  if (idx >= 0) {
    path = key.split('/');
    name = path.pop();
    parent = createPath(this,path);
  } else {
    parent = this;
    name = key;
  }
  if (!checkName(name)) {
    error('Ill-formed name "'+name+'". Names may contain only letters, numerals, and underbars, and may not start with a numeral');
  }
  setChild(parent,name,val);
  return val;
}


ArrayNode.set = function (key,val) {
  setChild(this,key,val);
  return val;
}

// adopts val below this if it is not already in a tree,ow just refers
const setIfExternal = function (parent,name,val) { 
  let tp = typeof val;
  if ((tp === 'object') && val && val.__get('__parent')) {
    parent[name] = val;
  } else {
    parent.set(name,val);
  }
  return val;
}

const setIfMissing = function (parent,prop,factory) {
  let rs = parent[prop];
  if (!rs) {
    rs = factory();
    parent.set(prop,rs);
  }
  return rs;
}

// Unless alwaysReplace is set, this similar to jquery.extend in deep mode: it merges source into dest. Note that it does not include properties from the prototypes.
// 

const extend = function (dest,source,merge) {
  let existingVal,newVal;
  if (!source) {
    return dest;
  }
  for (let prop in source) {
    if (source.hasOwnProperty(prop)) {
      newVal = lift(source[prop]);
      if (newVal === undefined) {
        continue;
      }
      if (merge) {
        existingVal = dest[prop];
        // merge if existingVal is a Object; replace otherwise
        if (existingVal && ObjectNode.isPrototypeOf(existingVal) && ObjectNode.isPrototypeOf(newVal)) {
          extend(existingVal,newVal);
        } else {
          dest.set(prop,newVal);
        }
      } else {
        dest.set(prop,newVal);
      }
    }
  }
  return dest;
}


const arrayToObject = function (aarray) {
  let rs = {};
  aarray.forEach(function (prop) {rs[prop] = 1;});
  return rs;
}

/*
let dd = {f:function (n){return n*3}};
let aa = {a:2,b:['a','b'],p:geom.Point.mk(3,4),f:function (n) {return n+n;}}
setProperties(dd,aa,['a','b','p','f']);
*/
// transfer properties from source. 
const setProperties = function (dest,source,props,fromOwn) {
  if (!source) {
    return;
  }
  if (!dest) {
    error('Bad arguments')
  }
  if (props) {
    props.forEach(function (prop) {
      let sourceVal = fromOwn?getval(source,prop):source[prop];
      dest[prop] = sourceVal;  
    });
  } 
  return dest;
}

// only for atomic values
const getProperties = function (source,props) {
  let rs = ObjectNode.mk();
  props.forEach(function (prop) {
    let sourceVal = source[prop];
    let type = typeof sourceVal;
    if ((sourceVal === null) || ((type !== 'undefined') && (type !== 'object'))) {
      rs[prop] = sourceVal;
    }
  });
  return rs;
}

// Some Array methods



ArrayNode.toArray = function () {
  let rs = [];
  this.forEach(function (e) {rs.push(e);});
  return rs;
}
const arrayPush = Array.prototype.push;
const arrayUnshift = Array.prototype.unshift;
const arraySplice = Array.prototype.splice;// only used in plain form

let addToArrayHooks = [];

let setNameInArray = function (array,child,n) { //called after the push
   if (isNode(child)) {
     child.__name = n;
     child.__parent = array;
  } else if (child && (typeof child==='object')) {
    error('Attempt to add non-node object to an Array');
  }
};

ArrayNode.push = function (element) {
  arrayPush.call(this,element);
  setNameInArray(this,element,this.length-1);
  addToArrayHooks.forEach((fn) => {fn(this,element);});
  return this.length;
}


ArrayNode.plainPush = function (element) {
  arrayPush.call(this,element);
}

ArrayNode.unshift = function (element) {
  arrayUnshift.call(this,element);
  setNameInArray(this,element,0);
  let ln = this.length;
  for (let i=1;i<ln;i++) {
    this[i].__name = i;
  }
  addToArrayHooks.forEach((fn) => {fn(this,element);});
  return this.length;
}

ArrayNode.plainUnshift = function (element) {
  arrayUnshift.call(this,element);
}



ArrayNode.plainSplice = function (start,deleteCount,element) {
  if (element !== undefined) {
    arraySplice.call(this,start,deleteCount,element);
  } else {
    arraySplice.call(this,start,deleteCount);
  }
}

ArrayNode.splice = function (start,deleteCount,element) {
  if (element !== undefined) {
    arraySplice.call(this,start,deleteCount,element);
    setNameInArray(this,element,start);
  } else {
    arraySplice.call(this,start,deleteCount);
  }
  let ln = this.length;
  for (let i=start;i<ln;i++) {
    this[i].__name = i;
  }
 if (element) {
    addToArrayHooks.forEach((fn) => {fn(this,element);});
 }
  return this.length;
}

  
ArrayNode.concat = function (elements) {
  let rs = ArrayNode.mk();
  this.forEach((element) => rs.push(element));
  elements.forEach((element) => rs.push(element));
  return rs;
}

ArrayNode.copy = function () {
  return this.concat([]);
}

ArrayNode.concatR = function (elements) {
  elements.forEach((element) => this.push(element))
  return this;
}

