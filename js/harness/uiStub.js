// so that some ui functions can be included in items that are used in a non-ui context


let ui = core.ObjectNode.mk(); 
  ui.setNote = function () {}
  ui.watch = function () {}
  ui.freeze = function (){}
  ui.hide = function () {}
  ui.show= function () {}
  ui.melt = function () {}
  ui.freezeExcept = function () {}
  ui.hideExcept = function () {}
  ui.hideInInstance = function () {}
  core.ObjectNode.setUIStatus = function () {}
  core.ObjectNode.setFieldType = function () {}

let graph = core.ObjectNode.mk(); 
graph.installCirclePeripheryOps = () => {};
export {graph,ui};
