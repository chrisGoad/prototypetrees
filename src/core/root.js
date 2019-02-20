// Copyright 2019 Chris Goad
// License: MIT
/* The central structure is a tree, made of 2 kinds of internal nodes (pj.Object,pj.Array), 
 * and leaves which are of primitive type (numbers,boolean,null,strings), or are functions.
 * Internal nodes have __name and __parent  attributes.
 */
 
// Non-null non-array object. 
const ObjectNode = {}; 

// Sequential, zero-based array
const ArrayNode = [];


// Later modules install hooks under vars
const vars = Object.create(ObjectNode);

// root is the root of the current item (the item that becomes visible in the UI)

let root;
const setRoot = function (rt) {
  root = rt;
}

// externals are explained here: https://protopedia.org/doc/tech.html#externals

const externals = Object.create(ObjectNode);

externals.Object = ObjectNode;
externals.Array = ArrayNode;


// do the work normally performed by 'set'  by hand for these initial objects


ObjectNode.__parent = externals;
ObjectNode.__name = 'Object';
ArrayNode.__parent = externals;
ArrayNode.__name = 'Array';


// motivation: we need to define geometric methods for arrays too, and this provides access.

const defineArrayNodeMethod = function (name,method) {
  ArrayNode[name] = method;
}
  

export {setRoot,root,ObjectNode,ArrayNode,externals,vars,defineArrayNodeMethod};