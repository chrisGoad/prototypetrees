let history = [];
let historyEnabled = true;
// each element of history is either a complete state, or a diff
// at any given moment (except when the mouse is moving), the last element of history represents the current state 
// (perhaps via a diff)
// popping the state means going to history[history.length - 2]



let beforeSaveStateHooks = [];
let lastState;

const addStateToHistory = function () { //complete state, that is
  clearLabels(root);
  lastState = deserialize(serialize(root));
  let check = collectNodes(lastState,root);// sets the global nodeMap
  if (!check) {
	 console.log('collectNodes failed');
	debugger;// shouldn't happen
  }
  history.push({map:nodeMap,state:lastState});

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
  let diffs = findAllDiffs();
  if (diffs) { 
	 history.push(diffs);
  } else { // need a new complete state
	addStateToHistory();
  }
}

let afterRestoreStateHooks = [];

const installLastState = function () {
  let ln = history.length;
  for (i=ln-1;i>=0;i--) {
	let h = history[i];
	if (!Array.isArray(h)) {
	  lastState = h.state;
	  nodeMap = h.map;
	  root = lastState;
	  return;
	}
  }
}

const undo = function () {
  debugger;
  if (!historyEnabled) {
	return;
  }
  let needReinstall = false;
  let ln = history.length;
  if (ln <= 1) {
    return;
  }
  let current = history.pop();
  if (!Array.isArray(current)) { //move to the last state
    installLastState();
	needReinstall = true;
  }
  let previous = history[ln-2];
  if (previous) { //diff
    installOriginalState();
	if (Array.isArray(previous)) {
      installDiffs(root,previous);
	}
  } 
  if (needReinstall && vars.installRoot) {
	vars.installRoot();
  } else if (vars.refresh) {
	vars.refresh();
  }
  //afterRestoreStateHooks.forEach((fn) => {fn();});
}


export {history,beforeSaveStateHooks,saveState,afterRestoreStateHooks,undo,lastState};
