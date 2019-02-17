// computes the diff between core.root, and a state (deserialized from a saved state)

const propsToIgnore = ['__code','__element'];
                       
const propsEquivalent = function (props1,props2) {
  let ln1 = props1.length;
  let ln2 = props2.length;
  for (let i=0;i<ln1;i++) {
    let p=props1[i];
    if ((propsToIgnore.indexOf(p) === -1) && (props2.indexOf(p) === -1)) {
        return false;
    }
  }
  for (let i=0;i<ln2;i++) {
    let p=props2[i];
    if ((propsToIgnore.indexOf(p) === -1) && (props1.indexOf(p) === -1)) {
        return false;
    }
  }
  return true;
}
  

const compareNodes = function (n1,n2) {
  let ownprops1 = Object.getOwnPropertyNames(n1);
  let ownprops2 = Object.getOwnPropertyNames(n1);
}

//let collectedNodes1 = [];
let nodeMap = []; // this maps nodes1 to nodes2; each member has the form {node1:node1,node2:node2}

const externalToTree = function (node) {
  return !((node === root) || node.__get('__parent'));
}
let labelCount = 1;

const collectNodes = function (n1,n2,callDepth=0) { // traverse the trees in order given by the ownprops of n1
 // n1.__label = n2.label = labelCount++;
 debugger;
 
  if (n1.__label !== n2.__label) {
    return false;
  }
  if (n1.__label) {
    return true;
  }
  let ext1 = callDepth && externalToTree(n1);
  let ext2 = callDepth && externalToTree(n2);
  if (ext1 || ext2) {
    return n1 === n2;
  }
  n1.__label = n2.__label = labelCount++;
  nodeMap.push({node1:n1,node2:n2});
  let ownprops1 = Object.getOwnPropertyNames(n1);
  let ownprops2 = Object.getOwnPropertyNames(n1);
  if (!propsEquivalent(ownprops1,ownprops2)) {
    console.log('false 0');
     return false
  }
  let ln = ownprops1.length;
  for (let i=0;i<ln;i++) {
    let p = ownprops1[i];
    if (p === '__parent') {
      continue;
    }
    console.log(callDepth,n1.__name,'/',p);
    let child1 = n1[p];
    let child2 = n2[p];
    let obChild1 = Boolean(child1 && (typeof child1 === 'object'));
    let obChild2 = Boolean(child2 && (typeof child2 === 'object'));
    if (obChild1 !== obChild2) {
      console.log('false 1');
      return false;
    }
    let treeChild1;
    if (obChild1) {
      treeChild1 = child1.__parent === n1;
      let treeChild2= child2.__parent === n2;
      if (treeChild1 !== treeChild2) {
        console.log('false 2');
        return false;
      }
    }
    if (treeChild1) { //both tree children
      let proto1 = Object.getPrototypeOf(child1);
      let proto2 = Object.getPrototypeOf(child2);
      console.log('to proto');
      let rs = collectNodes(proto1,proto2,callDepth+1);
      if (!rs) {
        return false;
      }
      return collectNodes(child1,child2,callDepth+1);
    }
  }
  console.log(callDepth,' true');
  return true;
}

export {nodeMap,collectNodes}


