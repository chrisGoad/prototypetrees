let history = [];
// each element of history is either a complete state, or a diff
// at any given moment (except when the mouse is moving), the last element of history represents the current state 
// (perhaps via a diff)
// popping the state means going to history[history.length - 2]



let beforeSaveStateHooks = [];
let afterSaveStateHooks = [];

let historyFailed = false;
const isDiff = (h) => Boolean(h.diffs);
let afterHistoryFailureHooks = [];

const addStateToHistory = function (kind) { //complete state, that is
  clearLabels(root);
  let srcp = root.__sourceUrl;
  root.__sourceUrl = undefined;// for reference generaation in externalize
  beforeSerialize.forEach(function (fn) {fn(root);});
  let s = encode(root);
  let state = deserialize(s);
  let map = collectNodes(state,root);
  root.__sourceUrl = srcp;
  afterSerialize.forEach(function (fn) {fn(root);});
  //let labelMap = buildLabelMap(state); // just for testing
  if (!map) {
	  console.log('CollectNodes failed');
    historyFailed = true;
    debugger;  //keep
	  console.log('history failure');// shouldn't happen
    afterHistoryFailureHooks.forEach((fn) => fn());
  }
  history.push({map,state,kind});

}


const previousState = function (n) {
  for (let i=n;i>=0;i--) {
    let h = history[i];
    if (!isDiff(h)) {
      return i;
    }
  }
}

const mostRecentState = function () {
  return previousState(history.length - 1);
}

const nullDiff = function (diff) {
  return Object.getOwnPropertyNames(diff).length ===0;
}

const nullDiffs = function (diffs) {
  let ln = diffs.length;
  for (let i=0;i<ln;i++) {
    if (!nullDiff(diffs[i])) {
      return false;
    }
  }
  return true;
}
let currentHistoryIndex = -1;

const saveState = function (kind) {
  //console.log('saveState');
  if (!vars.historyEnabled) {
	return;
  }
  beforeSaveStateHooks.forEach((fn) => {fn();});
  let ln = history.length;
  if (ln === 0) {
	  addStateToHistory(kind);
  } else {
    let lastState = history[mostRecentState()];
    let diffs = findAllDiffs(lastState.map);
    if (diffs) { 
      if (!nullDiffs(diffs)) {
        history.push({diffs,kind});  // add a diff 
      }
    } else { // need a new complete state
      addStateToHistory(kind);
    }
  }
  afterSaveStateHooks.forEach((fn) => {fn();});
  currentHistoryIndex = history.length - 1;

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


const gotoState= function (n) { // goes to a state, or diff
  if (!vars.historyEnabled) {
    return;
  }
  let ln = history.length;
  if ((n >= ln) || (currentHistoryIndex === n)) {
    return;
  }
  let current = history[currentHistoryIndex];
  let destination = history[n];
  let currentStateIndex = previousState(currentHistoryIndex);
  let destStateIndex = previousState(n);
  let destState = history[destStateIndex];
  if (currentStateIndex === destStateIndex) { // only need to install a diff
    installMap(destState.map);
    if (n > destStateIndex) {
      installDiffs(destState.map,destination.diffs);
    }
  } else { // we have moved to a new state 
    //debugger;
    root = copyState(destState.state);
    remap(root,destState.map); 
    if (n > destStateIndex) {
      installDiffs(destState.map,destination.diffs);
    }
    if (vars.installRoot) {
	    vars.installRoot();
    }
  }
  if (vars.refresh) {
	   vars.refresh();
  }
  afterRestoreStateHooks.forEach((fn) => {fn();});
  currentHistoryIndex = n;
}


const undo = function () {
  let ln = history.length;
  if (ln > 1) {
    gotoState(currentHistoryIndex-1);
    // history.pop();
  } 
}

const next = function () {
  let ln = history.length; 
  if (currentHistoryIndex < ln-1) {
    gotoState(currentHistoryIndex  + 1);
  }
}


export {history,historyFailed,afterHistoryFailureHooks,beforeSaveStateHooks,afterSaveStateHooks,saveState,
        gotoState,undo,next,currentHistoryIndex,afterRestoreStateHooks};
