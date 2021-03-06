
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
};

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
  svgMessageDiv.$html('<div style="text-align:center">'+msg+'</div>');
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
  window.addEventListener('resize', function () {
      layout();
      dom.svgMain.fitContents();
    });
}




 // the page structure
let mpg,svgDiv,svgMessageDiv;


const buildPage = function () {
mpg =  html.wrap("main",'div',{style:{position:"absolute","margin":"0px",padding:"0px",display:"none"}}).
__addChildren([ 
  svgDiv = html.Element.mk('<div id="svgDiv" draggable="true" style="position:absolute;background-color:white;border:solid thin black;display:inline-block"/>').
 __addChildren([
      svgMessageDiv =
       html.Element.mk('<div style="position:absolute;display:none;padding:20px;border:solid thin black"></div>')
  ]) 
])
return mpg;
};




   // there is some mis-measurement the first time around, so this runs itself twice at fist
let firstLayout = true;

const layout = function(noDraw) { // in the initialization phase, it is not yet time to draw, and adjust the transform
  let pageHeight,pageWidth,svgwd,svght;
  pageWidth = window.innerWidth - 10;//$(window).width();
  pageHeight= window.innerHeight - 20;//$(window).height();
  mpg.$css({left:"5px",width:pageWidth+"px",height:(pageHeight-0)+"px",display:"block"});
  svgwd = pageWidth-20;
  svght = pageHeight - 20;
  svgDiv.$css({id:"svgdiv",left:"10px",width:svgwd +"px",height:svght + "px"});
  svgMessageDiv.$css({left:(svgwd/2-100)+"px",top:"20px",width:"300px",height:(svght/2) + "px"});
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
}
  
export {initPage,userName,directory};
    
