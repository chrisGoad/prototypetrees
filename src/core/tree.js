// Copyright 2019 Chris Goad
// License: MIT

// utilities for trees

/* utilities for constructing Nodes from ordinary objects and arrays
 * recurses down to objects that are already nodes
 * o is an array or an object
 */

const toNode1 = function (parent,name,o) {
  let tp = typeof o;
  let  rs;
  if ((o === null) || (tp !== 'object')) {
    parent[name] =  o;
    return;
  }
  if (isNode(o)) {
    rs = o;
  } else {
    if (Array.isArray(o)) {
      rs = toArray(o,null);
    } else {
      rs = toObject(o,null);
    }
  }
  rs.__parent = parent;
  rs.__name = name;
  parent[name] = rs;
}

// transfer the contents of ordinary object o into idst (or make a new destination if idst is undefined)
const toObject= function (o,idest) {
  let dest,oVal;
  if (ObjectNode.isPrototypeOf(o)) {
    return o; // already a Object
  }
  if (idest) {
    dest = idest;
  } else {
    dest = ObjectNode.mk();
  }
  for (let prop in o) {
    if (o.hasOwnProperty(prop)) {
      oVal = o[prop];
      toNode1(dest,prop,oVal); 
    }
  }
  return dest;
}

const toArray = function (array,idest) {
  let dest;
  if (idest) {
    dest = idest;
  } else {
    dest = ArrayNode.mk();
  }
  array.forEach(function (element) {   
    dest.push(toNode(element));
  });
  return dest;
}

const toNode = function (o) {
  if (isNode(o)) {
    // idempotent
    return o;
  }
  if (Array.isArray(o)) {
    return toArray(o);
  } else if (o && (typeof o === 'object')) {
    return toObject(o);
  } else {
    return o;
  }
}

const lift = toNode;




// Some utilities for iterating functions over trees.

// internal __properties are excluded from the iterators and recursors 

let internalProps = {'__parent':1,'__protoChild':1,'__value__':1,'__hitColor':1,'__chain':1,'__copy':1,__name:1,widgetDiv:1,
  __protoLine:1,__inCopyTree:1,__headOfChain:1,__element:1,__domAttributes:1};

const internal = function (__name) {
   return internalProps[__name];
}


// a proper element of the tree: an own property with the right parent link. If includeLeaves, then atomic own properties are included too

const treeProperty = function (node,prop,includeLeaves,knownOwn) {
  let child;
  if ((!knownOwn && !node.hasOwnProperty(prop)) ||  internal(prop)) {
    return false;
  }
  child = node[prop];
  if (isNode(child)) {
    return child.__parent === node;
  } else {
    return includeLeaves?(typeof child !== 'object'):false;
  }
}


const treeProperties = function (node,includeLeaves) {
  let rs = [];
  let child,names,ln,i;
  if (ArrayNode.isPrototypeOf(node)) {
    ln = node.length;
    for (i = 0;i < ln;i++) {
      child = node[i];
      if (includeLeaves) {
        rs.push(i);
      } else if (isNode(child) && (child.__parent === node)) {
        rs.push(i);
      }
    }
    return rs;
  }
  names = Object.getOwnPropertyNames(node);
  names.forEach(function (name) {
    if (treeProperty(node,name,includeLeaves,true)) {
      rs.push(name);
    }
  });
  return rs;
}
  
// apply fn(node[prop],prop,node) to each non-internal own property p. 
const mapOwnProperties = function (node,fn) {
  let ownprops = Object.getOwnPropertyNames(node);
  ownprops.forEach(function (prop) {
     if (!internal(prop))  { 
      fn(node[prop],prop,node);
    }
  });
  return node;
}

const ownProperties = function (node) {
  let rs = [];
  mapOwnPropeties(node,function (child,prop) {
    rs.push(prop);
  });
  return rs; 
}

// apply fn(node[p],p,node) to each treeProperty p  of node. Used extensively for applying functions through a tree
const forEachTreeProperty = function (node,fn,includeLeaves) {
  let perChild = function (value,prop) {
     if (treeProperty(node,prop,includeLeaves,true))  { //true: already known to be an owned property
       fn(node[prop],prop,node);
    }
  }
  if (ArrayNode.isPrototypeOf(node)) {
    node.forEach(perChild);
  } else {
    let ownprops = Object.getOwnPropertyNames(node);
    ownprops.forEach(perChild.bind(undefined,undefined));
  }
  return this;
}

const forSomeTreeProperty = function (node,fn,includeLeaves) {
  let found = undefined;
  let perChild = function (value,prop) {
     if (treeProperty(node,prop,includeLeaves,true))  { //true: already known to be an owned property
       let rs = fn(node[prop],prop,node);
       if (rs) {
         found = node[prop];
       }
    }
  }
  if (ArrayNode.isPrototypeOf(node)) {
    node.some(perChild);
  } else {
    let ownprops = Object.getOwnPropertyNames(node);
    ownprops.some(perChild.bind(undefined,undefined));
  }
  return found;
}

const forEachAtomicProperty = function (node,fn) {
  let perChild = function (notUsed,prop) {
    let value = node[prop];
    let tp = typeof value;
    if ((value === null) || ((tp !== 'object')  && (tp !== 'function'))) {
       fn(node[prop],prop,node);
    }
  }
  if (ArrayNode.isPrototypeOf(node)) {
    node.forEach(perChild);
  } else {
    let ownprops = Object.getOwnPropertyNames(node);
    ownprops.forEach(perChild.bind(undefined,undefined));
  }
  return this;
}

const forEachDescendant = function (fn,node=root) {
  fn(node);
  forEachTreeProperty(node,function (child) {
    forEachDescendant(fn,child);
  })
}

           
      
    




const forSomeDescendant = function (node,fn) {
  if (fn(node)) {
    return node;
  }
  forSomeTreeProperty(node,function (child) {
    return forSomeDescendant(child,fn);
  })
}




const everyTreeProperty = function (node,fn,includeLeaves) { 
  let ownprops = Object.getOwnPropertyNames(node);
  return ownprops.every(function (prop) {
     if (treeProperty(node,prop,includeLeaves,true))  { //true: already known to be an owned property
       return fn(node[prop],prop,node);
    } else {
      return 1;
    }
  });
}


const someTreeProperty = function (node,fn,includeLeaves) { 
  let ownprops = Object.getOwnPropertyNames(node);
  return ownprops.some(function (prop) {
     if (treeProperty(node,prop,includeLeaves,true))  { //true: already known to be an owned property
       return fn(node[prop],prop,node);
    } else {
      return false;
    }
  });
}

 // if node itself has gthe propety, return true
const ancestorHasOwnProperty  = function (node,p) {
  let cv = node;
  while (cv) {
    if (cv.__get(p)) {
      return true;
    }
    cv = cv.__get('__parent');
  }
  return false;
}

ObjectNode.__inCore = function () {
  return ancestorHasOwnProperty(this,'__builtIn');
}

/* used eg for iterating through styles.
 * apply fn(node[p],p,node) to each atomic property of node, including properties defined in prototypes, but excluding
 * those defined in core modules.
 * sofar has the properties where fn has been called so far (absent except in the recursive call)
 */

const mapNonCoreLeaves = function (node,fn,allowFunctions,isoFar) {
  let soFar = isoFar?isoFar:{};
  if (!node) {
    error('Bad argument');
  }
  if (!node.__inCore || node.__inCore()) {
    return;
  }
  let op = Object.getOwnPropertyNames(node);
  op.forEach(function (prop) {
    let child,childType;
    if (soFar[prop]) {
      return;
    }
    if (!treeProperty(node,prop,true,true)) {
      return true;
    }
    soFar[prop] = 1;
    child = node[prop];
    childType = typeof child;
    if ((child && (childType === 'object' ))||((childType==='function')&&(!allowFunctions))) {
      return;
    }
    fn(child,prop,node);
  });
  let proto = Object.getPrototypeOf(node);
  if (proto) {
    mapNonCoreLeaves(proto,fn,allowFunctions,soFar);
  }
}

const deepApplyFun = function (node,fn) {
  fn(node);
  forEachTreeProperty(node,function (c) {
    deepApplyFun(c,fn);
  });
}
  


const deepDeleteProps = function (node,props) {
  deepApplyFun(node,function (ch) {
    props.forEach(function (p) {
      delete ch[p];
    });
  });
}



const deepDeleteProp = function (inode,prop) {
  deepApplyFun(inode,function (node) {
    delete node[prop]
  });
}

let findResult = [];
const findDescendant = function (node,fn) {
  const recurser = function (inode) {
    if (fn(inode)) {
      findResult[0] = inode;
      throw findResult;
    } else {
      forEachTreeProperty(inode,function (child) {
        recurser(child);
      });
    }
  }
  try {
    recurser(node);
  } catch(e) {
    if (e === findResult) {
      return e[0];
    } 
  }
}

const descendantWithProperty = function (node,prop) {
  return findDescendant(node,function (x) {
    return x[prop] !== undefined;
  });
}

const findAncestor = function (node,fn,excludeArrays) {
  let excluded;
  if (node===undefined) {
    return undefined;
  }
  excluded = excludeArrays && ArrayNode.isPrototypeOf(node);
  if ((!excluded) && fn(node)) {
    return node;
  }
  let parent = node.__get('__parent');
  return findAncestor(parent,fn,excludeArrays);
}



const findTopAncestor = function (inode,fn,excludeArrays) {
  let rs = undefined;
  const candidate = function (node) {
    let excluded = excludeArrays && ArrayNode.isPrototypeOf(node);
    return (!excluded) && fn(node);
  }
  let node = inode;
  while (node !== undefined) {
    if (candidate(node)) {
      rs = node;
      //return rs;
    }
    node = node.__get('__parent');
  }
  return rs;
}

const isDescendantOf = function (inode,ancestor,notTopCall) {
  let node = inode;
  if (node === undefined) {
    return undefined;
  }
  if ((node === ancestor) && notTopCall)  {
    return true;
  }
  return isDescendantOf(node.__get('__parent'),ancestor,true);
}

const ancestorThatInheritsFrom = function (node,proto) {
  return findAncestor(node,function (x) {
    return proto.isPrototypeOf(x)
  });
}

const ancestorWithProperty = function (node,prop) {
  return findAncestor(node,function (x) {
      return x[prop] !== undefined;
  },1);
}


const ancestorWithPrototype = function (node,proto) {
  return findAncestor(node,function (x) {
      return proto.isPrototypeOf(x);
  },1);
}


const ancestorWithSourceUrl = function (node,source) {
  return findAncestor(node,function (x) {
      return x.__sourceUrl === source;
  },1);
}

const ancestorWithMethod = function (node,prop) {
  return findAncestor(node,function (x) {
    return typeof x[prop] === 'function';
  },1);
}


const ancestorWithName = function (node,name) {
  return findAncestor(node,function (x) {
    return x.__name === name;
  });
}




const ancestorWithoutProperty = function (node,prop) {
  return findAncestor(node,function (x) {
      return x[prop] === undefined;
  },1);
}



const ancestorWithPropertyTrue = function (node,prop) {
  return findAncestor(node,function (x) {
      return x[prop];
  },1);
}


const ancestorWithPropertyValue = function (node,prop,value) {
  return findAncestor(node,function (x) {
      return x[prop] === value;
  },1);
}

const ancestorWithPropertyFalse = function (node,prop) {
  return findAncestor(node,function (x) {
      return !x[prop];
  },1);
}

export let removeHooks = [];

// dontRemoveFromArray is used when all of the elements of an array are removed (eg  in removeChildren)
nodeMethod('remove',function (dontRemoveFromArray) {
  let parent = this.__parent;
  let isArray = ArrayNode.isPrototypeOf(parent);
  let __name = this.__name;
  removeHooks.forEach((fn) => {
      fn(this);
  });
  if (isArray) {
    if (!dontRemoveFromArray) {
      let idx = parent.indexOf(this);
      let ln = parent.length;
      for (let i=idx+1;i<ln;i++) {
        let child = parent[i];
        child.__name = i-1;
      }
      parent.splice(idx,1);
    }
  } else {
    let anm = __name;
    if (parent[anm] !== this)  { // check from ghost bug
      error('ghost bug back');
    }
    delete parent[anm];
  }
  return this;  
});


export let reparentHooks = [];

nodeMethod('__reparent',function (newParent,newName) {
  reparentHooks.forEach((fn) => {
      fn(this,newParent,newName);
  });
  adopt(newParent,newName,this);
  newParent[newName] = this;
  return this;  
});


const removeChildren =  function (node) {
  forEachTreeProperty(node,function (child) {
    child.remove(true);
  });
  if (ArrayNode.isPrototypeOf(node)) {
    node.length = 0;
  }
}





 



// without inheritance from prototype;  x.__get(prop) will return a value only if prop is a direct property of this
nodeMethod('__get',function (prop) { 
  if (this.hasOwnProperty(prop)) {
    return this[prop];
  }
  return undefined;
});

nodeMethod('parent',function () {
  return this.__get('__parent');
});

nodeMethod('__nthParent',function (n) {
  let cv = this;
  let i;
  for (i=0;i<n;i++) {
    cv = cv.__parent;
    if (!cv) {
      return undefined;
    }
  }
  return cv;
});




ObjectNode.name = function () {
  return this.__get('__name');
}


/* inheritors(root,proto,filter) computes all of the descendants of root
 * which inherit from proto (including proto itself) and for which the filter (if any) is true.
 */

 
nodeMethod('__root',function () {
  let pr  = this.__get('__parent');
  return pr?pr.__root():this;
});



const inheritors = function (proto,filter) {
  let rs = [];
  let root = proto.__root();
  let recurser = function (node,iproto) {
    if ((iproto === node) || proto.isPrototypeOf(node)) {
      if (filter) {
        if (filter(node)) {
          rs.push(node);
        }
      } else {
        rs.push(node);
      }
    }
    forEachTreeProperty(node,function (child) {
      recurser(child,iproto);
    });
  }
  recurser(root,proto);
  return rs;
}


const forInheritors = function (proto,fn,filter) {
  let root = proto.__root();
  const recurser = function (node,iproto) {
    if ((iproto === node) || proto.isPrototypeOf(node)) {
      if ((filter && filter(node)) || !filter) {
        fn(node)
      }
    }
    forEachTreeProperty(node,function (child) {
      recurser(child,iproto);
    });
  }
  recurser(root,proto);
}


const forSomeInheritors = function (proto,fn) { 
  let rs = 0;
  let root = proto.__root();
  const recurser = function (node,iproto) {
    
    if ((iproto === node) || iproto.isPrototypeOf(node)) {
      if (fn(node)) {
        rs = 1;
      } else {
        forEachTreeProperty(node,function (child) {
          recurser(child,iproto);
        });
      }
    }
    return rs;
  }
  recurser(root,proto);
  return rs;
}
 
// array should contain strings or numbers
const removeDuplicates = function(array) {
  let rs;
  if (ArrayNode.isPrototypeOf(array)) {
    rs = ArrayNode.mk();
  } else {
    rs = [];
  }
  let d = {};
  array.forEach(function (v) {
    if (d[v] === undefined) {
      rs.push(v);
      d[v] = 1; 
    }
  });
  return rs;
}

const removeFromArray = function (array,value) {
  let index = array.indexOf(value);
  if (index > -1) {
    array.splice(index,1);
  }
  return array;
}

const addToArrayIfAbsent = function (array,value) {
  let index = array.indexOf(value);
  if (index === -1) {
    array.push(value);
  }
  return array;
}
          
      
  

/* a utility for autonaming. Given seed nm, this finds a __name that does not conflict
 * with children of avoid, and has the form nmN, N integer. nm is assumed not to already have an integer at the end
 * Special case. nm might be a number (as it will be when derived from the name of an array element). In this case, nm is replaced
 * by "N" and the usual procedure is followed
 */

 
 const removeTrailingDigits = function (nm) {
    let ln = nm.length;
    for (let i = ln-1;i>=0;i--) {
       let c = nm.charCodeAt(i);
       if ((c <48) || (c > 57)) {
          return nm.substring(0,i+1);
       }
    }
    return 'n';
 }
 
 const autoname = function (avoid,inm) {
    let maxnum = -1;
    let anm;
    let nm = (typeof inm === 'number')?'n':inm;
    nm = removeTrailingDigits(nm);
    if (!avoid[nm]) {
      return nm;
    }
    let nmlength = nm.length;
    for (anm in avoid) {
      if (anm === nm) {
        continue;
      }
      let idx = anm.indexOf(nm);
      if (idx === 0) {
        let rst = anm.substr(nmlength);
        if (!isNaN(rst)) {
          maxnum = Math.max(maxnum,parseInt(rst));
        }
      }
    }
  let num = (maxnum === -1)?1:maxnum+1;
  return nm + num;
}

  
const fromSource = function (x,src) {
    if (x && (typeof x==='object')) {
      if ((x.__sourceUrl) && (x.__sourceUrl === src)) {
        return true;
      } else {
        let pr = Object.getPrototypeOf(x);
        return fromSource(pr,src);
      } 
    } else {
      return false;
    }
  }


ObjectNode.__namedType = function () { // shows up in the inspector
  this.__isType = 1;
  return this;
}

const countDescendants = function (node,fn) {
  let rs = 0;
  forEachDescendant(function (d) {
    rs +=  fn?(fn(d)?1:0):1;
  },node);
  return rs;
}

const numericalSuf = function (string) {
  let i,c,ln;
  let n = Number(string);
  if (!isNaN(n)) {
    return n;
  }
  ln = string.length;
  for (i=ln-1;i>=0;i--) {
    c = string[i];
    if (isNaN(Number(c))) { //that is, if c is a digit
      return Number(string.substring(i+1));
    }
  }
  return Number(string);
}

// c = max after decimal place; @todo adjust for .0000 case
const nDigits = function (n,d) {
  let ns,dp,ln,bd,ad;
  if (typeof n !=="number") {
    return n;
  }
  let pow = Math.pow(10,d);
  let unit = 1/pow;
  let rounded = Math.round(n/unit)/pow;
  ns = String(rounded);
  dp = ns.indexOf(".");
  if (dp < 0) {
    return ns;
  }
  ln = ns.length;
  if ((ln - dp -1)<=d) {
    return ns;
  }
  bd = ns.substring(0,dp);
  ad = ns.substring(dp+1,dp+d+1)
  return bd + "." + ad;
}

ArrayNode.__copy = function (copyElement) {
  let rs = ArrayNode.mk();
  let ln = this.length;
  let i,ce;
  for (i=0;i<ln;i++) {
    ce = this[i];
    if (copyElement) {
      rs.push(copyElement(ce));
    } else {
      rs.push(ce);
    }
  }
  return rs;  
}

ObjectNode.add = function (child,ikey) {
  let key = ikey?ikey:'X';
  let nm = autoname(this,key);
  this.set(nm,child);
  return child;
}
  
// an item is a  node suitable for use in  the main tree (if used with the svg dom, an svg group element)
let newItem = function () {
  return objectNode.mk();
}


const setItemConstructor = function (f) {
  newItem = f;
}

vars.installPrototypeDisabled = false;


// in the standard setup, the protypes are kept together under root.prototypes

const installPrototype = function (iid,iprotoProto) {
 let id,protoProto;
 // allow just one argument, the protoProto
 if (iprotoProto) {
   protoProto = iprotoProto;
   id = iid
 } else {
  protoProto = iid;
  id = 'x';
 }
  let protos = root.prototypes;
  if (!protos) {
    protos = root.set('prototypes',newItem());
    protos.visibility = "hidden";
  }
  let external = protoProto.__get('__sourceUrl');
  let rs = external?protoProto.instantiate():protoProto;
  rs.visibility = 'hidden'; // a forward reference of sorts
  let anm = autoname(protos,id);
  protos.set(anm,rs);
  return rs;
}

const replacePrototype = function (where,id,replacementProto) {
  let replaced = where[id];
  let nm = replaced.__name;
  let protos = root.prototypes;
  let anm = autoname(protos,nm);
  let external = replacementProto.__get('__sourceUrl');
 let rs = external?replacementProto.instantiate():replacementProto;
  rs.visibility = "hidden"; // a forward reference of sorts
  protos.set(anm,rs);
  where[id] = rs;
  return rs;
}



const isPrototype = function (node) {
  let rs = findAncestor(node, (anc) => (anc.__name === 'prototypes'));
  return rs;
}



// just a short synonym to save typing when debugging
const pOf = function(x) {
  return Object.getPrototypeOf(x);
}


const propagateDimension  = function (item) {
  if (item === ObjectNode) {
    return;
  }
  let dim = item.__get('dimension');
  if (dim !== undefined) {
    item.width = item.height = dim;
  }
  propagateDimension(Object.getPrototypeOf(item));
}

 


export {nodeMethod,extend,setProperties,getval,internal,propagateDimension,
        mapNonCoreLeaves,treeProperty,mapOwnProperties,lift,forEachTreeProperty,stripInitialSlash,descendantWithProperty,
        isNode,ancestorHasOwnProperty,isAtomic,treeProperties,autoname,removeChildren,beforeChar,afterChar,
        isDescendantOf,findAncestor,ancestorWithProperty,ancestorWithPropertyFalse,ancestorWithPropertyTrue,ancestorWithPropertyValue,
        nDigits,evalPath,inheritors,forInheritors,pathToString,pOf,
        isObject,findDescendant,stringPathOf,isPrototype,
        newItem,setItemConstructor,installPrototype,replacePrototype,addToArrayHooks
        };
