let history = [];
let historyEnabled = false;
// each element of history is either a complete state, or a diff
// at any given moment (except when the mouse is moving), the last element of history represents the current state 
// (perhaps via a diff)
// popping the state means going to history[history.length - 2]



let beforeSaveStateHooks = [];
let lastState;
let lastMap;

const isDiff = (h) => Array.isArray(h);


const addStateToHistory = function () { //complete state, that is
  debugger;
  clearLabels(root);
  lastState = deserialize(serialize(root));
  lastMap = collectNodes(lastState,root);// sets the global nodeMap
  if (!lastMap) {
	  console.log('CollectNodes failed');
	  debugger;// shouldn't happen
  }
  history.push({map:lastMap,state:lastState});

}
  
const saveState = function () {
  debugger;
  console.log('saveState');
  if (!historyEnabled) {
	return;
  }
  beforeSaveStateHooks.forEach((fn) => {fn();});
  let ln = history.length;
  if (ln === 0) {
	  addStateToHistory();
	  return;
  }
  let diffs = findAllDiffs(lastMap);
  if (diffs) { 
	  history.push(diffs);
  } else { // need a new complete state
	  addStateToHistory();
  }
}


let afterRestoreStateHooks = [];


const mostRecentState = function () {
  let ln = history.length;
  for (let i=ln-1;i>=0;i--) {
    let h = history[i];
    if (!isDiff(h)) {
      return i;
    }
  }
}
/*
const installMostRecentState = function () {
  let ln = history.length;
  for (i=ln-1;i>=0;i--) {
    let h = history[i];
    if (!isDiff(h)) {
      lastState = h.state;
      lastMap = h.map;
      installMap(lastMap);
      return i;
    }
  }
}
*/
const undo = function () {
  debugger;
  if (!historyEnabled) {
    return;
  }
  let ln = history.length;
  if (ln <= 1) {
    return;
  }
  let current = history.pop();
  let pidx = ln-2;
  let previous = history[pidx];
  let midx = mostRecentState();
  let m = history[midx];
  if (isDiff(current)) { 
    if (pidx > midx) {
      installMap(m.map);
      installDiffs(m.map,previous);
      if (vars.refresh) {
	      vars.refresh();
      }
    }
  } else { // we have moved back to an old state with a different structure
    root = copyState(m.state);
    m.map = remap(m.map);
    
    if (pidx > midx) {
      installDiffs(m.map,previous);
    }
    if (vars.installRoot) {
	    vars.installRoot();
    }
  }
  //afterRestoreStateHooks.forEach((fn) => {fn();});
}


export {history,beforeSaveStateHooks,saveState,afterRestoreStateHooks,undo,lastState};
