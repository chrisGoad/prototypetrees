
import * as core from "/js/core-1.1.0.min.js";
import * as geom from "/js/geom-1.1.0.min.js";
import * as dom from "/js/dom-1.1.0.min.js";
const {html,svg} = dom;

const {Point,Rectangle,Transform,LineSegment} = geom;

export const vars = core.ObjectNode.mk();


const SvgElement = dom.SvgElement;
let installError,mainUrl,main;

const installMainItem = function (source)  {
  mainUrl = source;
  if (source) {
    core.setRoot(dom.SvgElement.mk('<g/>'));
    core.install(source,afterMainInstall); 
  } else  {
    finishMainInstall();
  }
}

const afterMainInstall = function (e,rs) {
  if (e) {
    installError = e;
    finishMainInstall();
  } else if (rs) {
    main = rs;
  } 
  finishMainInstall();
}

const installAsSvgContents= function (itm) {
  let mn = dom.svgMain;
  if (mn.contents) {
    dom.removeElement(mn.contents);
  }
  mn.contents=itm;
  dom.svgDraw();
}

const mergeIn = function (dst,src) {
  core.forEachTreeProperty(src,(child) => {
    let nm = child.__name;
    let anm = core.autoname(dst,nm);
    dst.set(anm,child);
  }); 
}
const svgInstall = function () {
  let fromItemFile = mainUrl && core.endsIn(mainUrl,'.item');
  if (main && fromItemFile) {
   debugger;
    let svProtos = core.root.prototypes; // loading main may have involved installing prototypes
    core.setRoot(main);
    if (svProtos && main.prototypes) {
      mergeIn(main.prototypes,svProtos);
    }
  } else if (!core.root) {
    core.setRoot(dom.SvgElement.mk('<g/>'));
  }  
  let itm = main?main:core.root;
  dom.svgMain.fitFactor = fitFactor;
  installAsSvgContents(core.root);
  if (main && !fromItemFile) {
      core.root.set('main',main);
  }
  let rmain = core.root.main;
  
  if (rmain) {
    if (rmain.updatePrototype) {
      rmain.updatePrototype();
    }
    if (rmain.initialize) {
      rmain.initialize();
    }
    core.propagateDimension(rmain);
  }
  dom.fullUpdate();
  if (core.root.draw) {
    core.root.draw(dom.svgMain.__element); // update might need things to be in svg
  }
  if (itm.soloInit) { 
    itm.soloInit(); 
  }
}

let fitFactor = 0.8;


const displayError = function (msg) {
  svgMessageDiv.$show();
  svgMessageDiv.$html('<div style="padding:150px;background-color:white;text-align:center">'+msg+'</div>');
}

core.setDisplayError(displayError);

const finishMainInstall = function () {
 debugger;
  let e = installError;
  let emsg;
  
  if (e) {
    emsg = '<p style="font-weight:bold">'+e+'</p>';
    core.displayError(emsg);
    
  }
  if (!e) {
   svgMessageDiv.$hide();
    svgInstall();
  }
  layout();
  dom.svgMain.fitContents();
 /*    $(window).resize(function() {
      layout();
      dom.svgMain.fitContents();
    });*/
}

const displayMessageInSvg = function (msg) {
  core.root.hide();
  svgMessageDiv.$show();
  svgMessageDiv.$html(msg);
}



 // the page structure
let mpg,svgDiv,svgMessageDiv;


const buildPage = function () {
mpg =  html.wrap("main",'div',{style:{position:"absolute","margin":"0px",padding:"0px",display:"none"}}).
__addChildren([ 
  svgDiv = html.Element.mk('<div id="svgDiv" draggable="true" style="position:absolute;height:400px;width:600px;background-color:white;border:solid thin black;display:inline-block"/>').
  __addChildren([
      svgMessageDiv = html.Element.mk('<div style="display:none;margin-left:auto;padding:40px;margin-right:auto;width:50%;margin-top:20px;border:solid thin black"></div>')
   ]) 
])
return mpg;
}




   // there is some mis-measurement the first time around, so this runs itself twice at fist
let firstLayout = true;
let svgwd,svght;
const layout = function(noDraw) { // in the initialization phase, it is not yet time to draw, and adjust the transform
  // aspect ratio of the UI
  let canvas = document.getElementById('imageCanvas');
  let pageHeight,pageWidth,lrs;
  let topHt;
  let bkg = "white";
  svgwd = 500;
  svght = 500;
  let ar = 0.48;
  let wpad = 5;
  let vpad = 20;//minimum sum of padding on top and bottom
  let awinwid = window.innerWidth;//$(window).width();
  let awinht = window.innerHeight;//$(window).height();
  let pwinwid = awinwid - (2 * wpad);
  let pwinht = awinht - (2 * vpad);
  if (pwinht < ar * pwinwid) { // the page is bounded by height 
    pageHeight = pwinht;
    pageWidth = pageHeight/ar;
    lrs = (awinwid - pageWidth)/2;  
  } else { // the page is bounded by width
    pageWidth = pwinwid;
    pageHeight = ar * pageWidth;
  }
  pageHeight = pwinht;
  pageWidth = pwinwid;
  lrs = wpad;
  svgwd = pageWidth;
  mpg.$css({left:lrs+"px",width:pageWidth+"px",height:(pageHeight-0)+"px",display:"block"});
  topHt = -15;// + topbarDiv.__element.offsetHeight;
  svght = pageHeight + 20;
  svgDiv.$css({id:"svgdiv",left:"0px",width:svgwd +"px",height:svght + "px","background-color":bkg});
  canvas.style.width = svgwd;
  canvas.style.height = svght;
   dom.svgMain.resize(svgwd,svght); 
   if (firstLayout) {
     firstLayout = false; 
     layout(noDraw);
   }
}



/*global setupYesNo setupDialog enableButton disableButton mpg: true */

let tutorialButton;


dom.vars.defaultTransform = Transform.mk(Point.mk(),1);

let mainPage;
let svgDivReady = false;

const setupSvgDiv = function () {
  if (!svgDivReady) {
    dom.setSvgMain(dom.SvgRoot.mk(svgDiv.__element));
    svgDiv.__element.draggable = true;
    svgDivReady = true;
  }
}

const genMainPage = function (cb) {
  debugger;
  if (mainPage) {
    return;
  }
  mainPage = buildPage();//mpg
  mpg.__addToDom();
  setupSvgDiv();
  core.setRoot(SvgElement.mk('<g/>')); // to be replaced by incoming item, usually
  core.root.set('transform',dom.vars.defaultTransform);
  dom.svgMain.contents=core.root;
  core.root.__sourceUrl = source;
  layout();
  installMainItem(source);
  return;
  if (cb) {
    cb();
  }
}

let mainGetVars = {'source':true,'intro':true,'data':true};

let source,sourceFile,helperUrl,content; 


//   from http://paulgueller.com/2011/04/26/parse-the-querystring-with-jquery/
const parseQuerystring = function() {
  let nvpair = {};
  let qs = window.location.search.replace('?','');
  let pairs = qs.split('&');
  pairs.forEach(function(v) {
    let pair = v.split('=');
    if (pair.length>1) {
      nvpair[pair[0]] = pair[1];
    }
  });
  return nvpair;
}
  
const processQuery = function() {  
  let q = parseQuerystring();
  source = q.source;
  if (source==='none') {
    source = undefined;
  } else if (source) {
    sourceFile = core.afterLastChar(source,'/');
  } else {
      source = '';
      sourceFile = '';
  }
  if (q.fit) {
    fitFactor = Number(q.fit);
  }
}  

let userName,directory;
let pageInitialized = false; // to prevent repeats, which firebase will sometimes invoke via onIdTokenChanged

const initPage = function () {
  debugger;
  pageInitialized = true;
  processQuery();
  dom.vars.fitStdExtent = !(source);
  genMainPage();

 // genMainPage(afterPageGenerated);
}
  
/*
const afterPageGenerated = function (doNotInstall) {
  if (doNotInstall) {
     return;
  }
  if (svgDiv) {
    installMainItem(source);
  } else {
    finishMainInstall();
  }
}
*/
export {initPage,userName,directory};
    
