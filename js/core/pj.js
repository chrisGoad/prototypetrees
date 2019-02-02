// Copyright 2017 Chris Goad
// License: MIT
//import {pj} from 'pj.js';
//import {build as build1} from 'tree.js';
//build1(pj);

// Copyright 2017 Chris Goad
// License: MIT
/* The central structure is a tree, made of 2 kinds of internal nodes (pj.Object,pj.Array), 
 * and leaves which are of primitive type (numbers,boolean,null,strings), or are functions.
 * Internal nodes have __name and __parent  attributes.
 */
 
// Non-null non-array object. 
const ObjectNode = {}; 

// Sequential, zero-based array
const ArrayNode = [];

//export {ObjectNode,ArrayNode};
// pjr is the root of the ProtoPedia realm, relative to which paths are computed
// pj.root is the root of the current item (the item that becomes visible in the UI)


const pjr = Object.create(ObjectNode);
const vars = Object.create(ObjectNode);

let root;
const setRoot = function (rt) {
  root = rt;
  //pjr.root = rt;
}


pjr.Object = ObjectNode;
pjr.Array = ArrayNode;


// do the work normally performed by 'set'  by hand for these initial objects


ObjectNode.__parent = pjr;
ObjectNode.__name = 'Object';
ArrayNode.__parent = pjr;
ArrayNode.__name = 'Array';


// motivation: we need to define geometric methods for arrays too, and this provides access.

const defineArrayNodeMethod = function (name,method) {
  ArrayNode[name] = method;
}
  

export {setRoot,root,ObjectNode,ArrayNode,pjr,vars,defineArrayNodeMethod};