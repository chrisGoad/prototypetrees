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
 
//let collectedNodes1 = [];
let nodeMap = []; // this maps nodes1 to nodes2; each member has the form {node1:node1,node2:node2}

const externalToTree = function (node) {
  return !((node === root) || getval(node,'__parent'));
}
let labelCount = 1;

const collectNodes = function (n1,n2,callDepth=0) { // traverse the trees in order given by the ownprops of n1
 // n1.__label = n2.label = labelCount++;
  let  label1 = getval(n1,'__label');
  let  label2 = getval(n2,'__label');
 
  if (label1 !== label2) {
	console.log('label mismatch false');
    return false;
  }
  if (label1) {
	console.log('found label');

    return true;
  }
  let ext1 = callDepth && externalToTree(n1);
  let ext2 = callDepth && externalToTree(n2);
  if (ext1 || ext2) {
	 console.log('external mismatch false');
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
      rs = collectNodes(child1,child2,callDepth+1);
	  if (!rs) {
        return false;
      }
	  
    }
  }
  console.log(callDepth,' true');
  return true;
}
const findDiff = function (n1,n2) {
  let ownprops1 = Object.getOwnPropertyNames(n1);
  let ownprops2 = Object.getOwnPropertyNames(n1);
  let ln = ownprops1.length;
  let diffs = {};
  for (let i=0;i<ln;i++) {
	let p = ownprops1[i];
	let child1 = n1[p];
    let child2 = n2[p];
    let obChild1 = Boolean(child1 && (typeof child1 === 'object'));
    let obChild2 = Boolean(child2 && (typeof child2 === 'object'));
    if (obChild1 !== obChild2) {
      console.log('false 1');
	  debugger;
      return false;
    }
	if (obChild1) {
	  if (child1.__label !== child2.__label) {
		console.log('label mismatch false');
		debugger;
	    return false;
	  };
	  continue;
	}
	let typ1 = typeof child1;
	let typ2 = typeof child2;
	if (typ1 !== typ2) {
	  if (p !== '__sourceUrl') { // special case
	    console.log('type mismatch false');
	    debugger;
	    return false;
	  }
	}
	if (child1 !== child2) {
	  diffs[p] = child2;
	}
  }
  return diffs;
}

const findAllDiffs = function () {
  let ln = nodeMap.length;
  let diffs = [];
  for (let i=0;i<ln;i++) {
	let mapEl = nodeMap[i];
	let diff = findDiff(mapEl.node1,mapEl.node2);
	if (diff) {
	  diffs.push(diff);
	} else {
	  return false;
	}
  }
  return diffs;
}

const installOriginalState = function () {
  nodeMap.forEach(function ({node1,node2}) {
	let ownprops1 = Object.getOwnPropertyNames(node1);
    ownprops1.forEach(function (p) {
	  let child1 = node1[p];
	  let child2 = node2[p]
	  let obChild1 = Boolean(child1 && (typeof child1 === 'object'));
	  if (!obChild1) {
		if (child1!== child2) {
		   node2[p] = child1;
		}
	  }
	});
  });
}
  
  const  clearLabels = function (nd) {
	forEachDescendant((node) => {node.__label = undefined;})
  }
	  
	  
		  

	  
  

const installDiffs = function (diffs) {
  let ln = nodeMap.length;
  for (let i=0;i<ln;i++) {
	let node2 = nodeMap[ln].node2;
	let diff = diffs[i];
	let props = Object.getOwnPropertyNames(diff);
	props.forEach(function (p) {
	  node2[p] = diff[p];
	});
  }
}

export {nodeMap,collectNodes,findAllDiffs}


