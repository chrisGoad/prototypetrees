// Copyright 2019 Chris Goad
// License: MIT


vars.activeConsoleTags = ['error'];//,'drag','util','tree'];
  
const log = function (tag) {
  if (typeof console === 'undefined') {
    return;
  }
  let activeTags = vars.activeConsoleTags;
  if ((activeTags.indexOf('all')>=0) || (activeTags.indexOf(tag) >= 0)) { 
    // transform arguments list into array
    let aa = [].slice.call(arguments);
    console.log(tag,aa.join(', ')); //keep
  }
};


let startTime = Date.now()/1000;
// time log, no tag


const resetClock = function () {
  startTime = Date.now()/1000;
}

const elapsedTime = function () {
  let now = Date.now()/1000;
  let elapsed = now-startTime;
  return  Math.round(elapsed * 1000)/1000;
}

const tlog = function () {
  let elapsed,aa,rs;
  if (!vars.tlogActive) {
    return;
  }
  if (typeof console === 'undefined') {
    return;
  }
  elapsed = elapsedTime();
  // turn arguments into array
  aa = [].slice.call(arguments);
  rs = 'At '+elapsed+': '+aa.join(', ');
  console.log(rs); //keep
}

const timers = {};
const advanceTimer = function (nm,v) {
  let cv = timers[nm];
  if (cv === undefined) {
    cv = [0,0];
    timers[nm] = cv;
  }
  cv[0] = cv[0]+1;
  cv[1] = cv[1] + v;
}

const resetTimer = function (nm) {
  timers[nm] = 0;
}


export {log,tlog,advanceTimer,resetTimer,timers};




