let history = [];
// each element of history is either a complete state, or a diff
// at any given moment (except when the mouse is moving), the last element of history represents the current state 
// (perhaps via a diff)
// popping the state means going to history[history.length - 2]



let beforeSaveStateHooks = [];
let afterSaveStateHooks = [];

let historyFailed = false;
const isDiff = (h) => Array.isArray(h);
let afterHistoryFailureHooks = [];

const addStateToHistory = function () { //complete state, that is
  //debugger;
  clearLabels(root);
  let srcp = root.__sourceUrl;
  root.__sourceUrl = undefined;// for reference generaation in externalize
  beforeSerialize.forEach(function (fn) {fn(root);});
  let s = encode(root);
  let state = deserialize(s);
  let map = collectNodes(state,root);// sets the global nodeMap
  root.__sourceUrl = srcp;
  afterSerialize.forEach(function (fn) {fn(root);});
  //debugger;
  //let labelMap = buildLabelMap(state); // just for testing
  if (!map) {
	  console.log('CollectNodes failed');
    historyFailed = true;
	  console.log('history failure');// shouldn't happen
    afterHistoryFailureHooks.forEach(fn);
  }
  history.push({map,state});

}


const mostRecentState = function () {
  let ln = history.length;
  for (let i=ln-1;i>=0;i--) {
    let h = history[i];
    if (!isDiff(h)) {
      return i;
    }
  }
}
  
const saveState = function () {
  //debugger;
  //console.log('saveState');
  if (!vars.historyEnabled) {
	return;
  }
  beforeSaveStateHooks.forEach((fn) => {fn();});
  let ln = history.length;
  if (ln === 0) {
	  addStateToHistory();
  } else {
    let lastState = history[mostRecentState()];
    let diffs = findAllDiffs(lastState.map);
    if (diffs) { 
      history.push(diffs);
    } else { // need a new complete state
      addStateToHistory();
    }
  }
  afterSaveStateHooks.forEach((fn) => {fn();});

}


let afterRestoreStateHooks = [];

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
  //debugger;
  if (!vars.historyEnabled) {
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
    if (pidx >= midx) {
      installMap(m.map);
      if (pidx > midx) {
        installDiffs(m.map,previous);
      }
      if (vars.refresh) {
	      vars.refresh();
      }
    }
  } else { // we have moved back to an old state with a different structure
    //debugger;
    root = copyState(m.state);
    remap(root,m.map); 
    if (pidx > midx) {
      installDiffs(m.map,previous);
    }
    if (vars.installRoot) {
	    vars.installRoot();
    }
  }
  afterRestoreStateHooks.forEach((fn) => {fn();});
}


export {history,historyFailed,afterHistoryFailureHooks,beforeSaveStateHooks,afterSaveStateHooks,saveState,afterRestoreStateHooks,undo};
