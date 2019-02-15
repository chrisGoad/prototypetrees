let history = [];

let beforeSaveStateHooks = [];

const saveState = function () {
  beforeSaveStateHooks.forEach((fn) => {fn();});
  history.push(serialize(root));
}

let afterRestoreStateHooks = [];



const restoreState = function (n) {
  let ln = history.length;
  if ((n>=ln) || (n<0)) {
    error('out of bounds'); // will throw if throwOnError is set
    return;
  }
  root = deserialize(history[n]);
  afterRestoreStateHooks.forEach((fn) => {fn();});
}

const undo = function () {
  restoreState(history.length-1);
}

export {history,beforeSaveStateHooks,saveState,afterRestoreStateHooks,restoreState,undo};
