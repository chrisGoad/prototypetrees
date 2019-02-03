
import * as core from "/js/core-1.1.0.min.js";
import * as geom from "/js/geom-1.1.0.min.js";
import * as dom from "/js/dom-1.1.0.min.js";
const {html,svg} = dom;

const {Point,Rectangle,Transform,LineSegment} = geom;

export const vars = core.ObjectNode.mk();


const SvgElement = dom.SvgElement;
let loadingItem,installError,mainUrl,main;

const installMainItem = function (source,settings)  {
 debugger;
  mainUrl = source;
  if (settings) {
    settings = settings;
  }
  let next = function () {
    if (source) {
      core.setRoot(dom.SvgElement.mk('<g/>'));
      core.install(source,afterMainInstall); 
    } else  {
      finishMainInstall();
    }
  }
  next();
}

const afterMainInstall = function (e,rs) {
  if (e) {
    installError = e;
    finishMainInstall();
  } else if (rs) {
    delete rs.__sourceUrl;
    main = rs;
  } 
  finishMainInstall();
}

const setBackgroundColor = function (item) {
      if (!item.backgroundColor) {
        item.backgroundColor="white";
      }
   if (!item.__nonRevertable) {
     core.root.set('__nonRevertable',core.lift({backgroundColor:1}));
   }
}

const installAsSvgContents= function (itm) {
  let mn = dom.svgMain;
  if (mn.contents) {
    dom.removeElement(mn.contents);
  }
  mn.contents=itm;
  dom.svgDraw();
}

let enableTheGrid = true;
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
    let svProtos = core.root.prototypes; // loading main may have involved installing prototypes
    core.setRoot(main);
    if (svProtos && main.prototypes) {
      mergeIn(main.prototypes,svProtos);
    }
  } else if (!core.root) {
    core.setRoot(dom.SvgElement.mk('<g/>'));
  }
  
  setBackgroundColor(core.root);
  let itm = main?main:core.root;
  dom.svgMain.addBackground(core.root.backgroundColor);
  dom.svgMain.fitFactor = fitFactor;
  installAsSvgContents(core.root);
  if (main && !fromItemFile) {
      core.root.set('main',main);
  }
  let rmain = core.root.main;
  
  if (rmain) {
    let proto = Object.getPrototypeOf(rmain);
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
  return;
  if (!core.throwOnError) {
    ui.refresh(ui.vars.fitMode);
  } else {
    try {
      ui.refresh(ui.vars.fitMode);
  } catch (e) {
    handleError(e);
  }
}
}

let enableButtons; //defined differently for different pages
let fitFactor = 0.8;
const findInstance = function (url) {
  let proto = core.installedItems[url]; 
  if (!proto) {
    return undefined;
  }
  let rs =  core.findDescendant(core.root,function (node) {
    return proto.isPrototypeOf(node);
  });
  if (rs) {
    return rs;
  }
}

const displayError = function (msg) {
  svgMessageDiv.$show();
  svgMessageDiv.$html('<div style="padding:150px;background-color:white;text-align:center">'+msg+'</div>');
  //svgDivReady = false;
}

core.setDisplayError(displayError);

const finishMainInstall = function () {
  let e = installError;
  let emsg;
  
  if (e) {
    emsg = '<p style="font-weight:bold">'+e+'</p>';
    core.displayError(emsg);
    
  }
  if (svgDiv && !e) {
    svgMessageDiv.$hide();
    svgInstall();
  }
  layout();
  dom.svgMain.fitContents();
 
  let next = function () {
    enableButtons();
    $(window).resize(function() {
      layout();
      dom.svgMain.fitContents();
    });
  }
  
  next();
}

const displayMessageInSvg = function (msg) {
  core.root.hide();
  svgMessageDiv.$show();
  svgMessageDiv.$html(msg);
}

 const clearError = function () {
   core.root.show();
   svgMessageDiv.$hide();
 }

const handleError = function (e) {
  if (core.throwOnError) {
    displayMessageInSvg(e);
  } else {
    core.error(e.message);
  }
}

//okok

/*global setClickFunction enableButtons enableButton enableButton1 disableButton activateTreeClimbButtons enableTreeClimbButtons
afterYes setYesNoText ownedFilePath initFsel insertOwn :true*/
/* begin section: build and layout the page */
let includeTest = false;
let treePadding = 0;
let bkColor = "white";
let saveCatalog,theConfig,theCatalogs;

let actionPanel,actionPanelMessage,actionPanelButton,actionPanelCommon,actionPanelCustom;
let uiDiv,topbarDiv,deleteBut,editTextBut,addImageBut,cloneBut,openDataInTextEditorBut;
let separateBut,showCohortBut,doneCloningBut,insertContainer,insertDiv,dragMessage,catalogState;
let tabContainer,insertDivCol1,insertDivCol2,includeDoc,replaceProtoMode,fromItem;
let resizable;
let uiWidth;
let panelMode = 'chain'; // mode of the right panel view; one of 'chain' (view the prototype chains); 'proto','insert','code'
 // the page structure
let actionDiv,cols,fileBut,unwrapBut,insertBut,replaceBut,insertTab;
let replaceProtoBut,dataBut,gridBut,fileDisplay,noteDiv,svgDiv;//,protoContainer;
let messageElement,ctopDiv,noteSpan,upBut,downBut,topBut,svgMessageDiv;
let dataMessage,JSONMessage,rebuildFromDataBut,changeDataSourceBut,saveDataBut,testBut,saveDataAsBut,checkJSONBut,runningSpan,dataButtons,dataDiv,dataContainer;
let includeActionPanel = false;

const closerStyle = 'position:absolute;padding:3px;cursor:pointer;background-color:red;'+
         'font-weight:bold,border:thin solid black;font-size:12pt;color:black';
         
const closer = html.Element.mk('<div style="right:0px;'+closerStyle+'">X</div>');
   
const docClose = html.Element.mk('<div style="right:0px;'+closerStyle+'">X</div>');// right:20 for scroll bar

const docIframe = html.Element.mk('<iframe width="98%" height="98%" id="doc" />');
const docDiv = html.Element.mk('<div id="docDiv" style="position:absolute;width:100%;height:100%;background-color:white;border:solid thin green;display:inline-block"/>').__addChildren([
  docClose,
  docIframe
]);

let mpg;
const buildPage = function () {
mpg =  html.wrap("main",'div',{style:{position:"absolute","margin":"0px",padding:"0px",display:"none"}}).
__addChildren([
  topbarDiv = html.wrap('topbar','div',{style:{position:"absolute",height:"10px",left:"0px","background-color":bkColor,margin:"0px",padding:"0px"}}).
  __addChildren([
  actionDiv =  html.Element.mk('<div id="action" style="position:absolute;margin:0px;overflow:none;padding:5px;height:20px"/>').
  __addChildren([
      fileBut = html.Element.mk('<div class="ubutton">File</div>')
    
    ]),
    ctopDiv = html.wrap('topbarInner','div',{style:{float:"right"}})
  ]),

  cols = html.Element.mk('<div id="columns" style="left:0px;position:relative"/>').
  __addChildren([
    
    
    
  //  docDiv,
     actionPanel = actionPanel = html.Element.mk('<div id="actionPanel"  draggable="true" style="background-color:white;border:solid thin black;position:absolute;height:400px;width:600px;display:inline-block"></div>').__addChildren([
        html.Element.mk('<div style="border:solid thin black;"></div>').__addChildren([
        actionPanelMessage = html.Element.mk('<div style="margin:10px;width:80%;padding-right:10px">Nothing is selected</div>'),
        actionPanelButton = html.Element.mk('<div class="colUbutton"></div>')
       ]),
       actionPanelCommon = html.Element.mk('<div style="margin:0;width:100%"></div>').__addChildren([
          deleteBut = html.Element.mk('<div class="colUbutton left">Delete</div>'),
          editTextBut = html.Element.mk('<div class="colUbutton left">Edit Text</div>'),
          addImageBut = html.Element.mk('<div class="colUbutton left">Add Image</div>'),
         cloneBut= html.Element.mk('<div class="colUbutton left">Copy</div>'),
          showCohortBut = html.Element.mk('<div  class="colUbutton left">Show Cohort</div>'),
          separateBut= html.Element.mk('<div class="colUbutton left">Separate</div>'),
           ]),
       actionPanelCustom= html.Element.mk('<div style="float:left;margin:0;width:100%"></div>')
     ]),
   
    svgDiv = html.Element.mk('<div id="svgDiv" draggable="true" style="position:absolute;height:400px;width:600px;background-color:white;border:solid thin black;display:inline-block"/>').
    __addChildren([
      noteDiv = html.Element.mk('<div style="font:10pt arial;background-color:white;position:absolute;top:0px;left:90px;padding-left:4px;border:solid thin black"/>').__addChildren([
        noteSpan = html.Element.mk('<span>Click on things to adjust them. Hierarchy navigation:</span>'),
        upBut =html.Element.mk('<div class="roundButton">Up</div>'), 
        downBut =html.Element.mk('<div class="roundButton">Down</div>'),
        topBut =html.Element.mk('<div class="roundButton">Top</div>')
        ]),
        svgMessageDiv = html.Element.mk('<div style="display:none;margin-left:auto;padding:40px;margin-right:auto;width:50%;margin-top:20px;border:solid thin black">AAAAUUUU</div>')
     ])  

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
  let noteWidth,noteLeft,treeHt,pageHeight,pageWidth,lrs;
  let actionLeft,actionHt,actionDivWidth,actionPanelWd,treeInnerWidth,treeOuterWidth;
  let topHt,docwd,docTop,twtp;
  let bkg = "white";
  svgwd = 500;
  svght = 500;
  let ar = 0.48;
  let wpad = 5;
  let vpad = 20;//minimum sum of padding on top and bottom
  let awinwid = $(window).width();
  let awinht = $(window).height();
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
  docTop = 0;
  twtp = 2*treePadding;
  actionDivWidth  = 0.4 * pageWidth;
  actionPanelWd = 0; 
  docwd = 0;
  uiWidth = 0;
  svgwd = pageWidth - actionPanelWd - docwd - uiWidth;
  mpg.$css({left:lrs+"px",width:pageWidth+"px",height:(pageHeight-0)+"px",display:"block"});
  topHt = -15 + topbarDiv.__element.offsetHeight;
  cols.$css({left:"5px",width:pageWidth+"px",top:topHt+"px"});
  ctopDiv.$css({"padding-top":"0px","padding-bottom":"20px","padding-right":"10px",left:svgwd+"px",top:"0px"});
  actionLeft = docwd +10 + "px";
  actionDiv.$css({width:(actionDivWidth + "px"),"padding-top":"10px","padding-bottom":"20px",left:actionLeft,top:"0px"});
  actionHt = actionDiv.__element.offsetHeight;
  topbarDiv.$css({height:actionHt,width:pageWidth+"px",left:"0px","padding-top":"10px"});
  svght = pageHeight - actionHt + 20;
  svgDiv.$css({id:"svgdiv",left:(actionPanelWd + docwd)+"px",width:svgwd +"px",height:svght + "px","background-color":bkg});
  canvas.style.width = svgwd;
  canvas.style.height = svght;
// uiDiv.$css({top:"0px",left:(actionPanelWd + docwd + svgwd)+"px",width:(uiWidth + "px")});
//  docDiv.$css({left:"0px",width:docwd+"px",top:docTop+"px",height:svght+"px",overflow:"auto"});
  actionPanel.$css({left:"0px",width:actionPanelWd+"px",top:docTop+"px",height:svght+"px",overflow:"auto"});
   dom.svgMain.resize(svgwd,svght); 
  // dom.svgMain.positionButtons(svgwd);
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
  if (svgDiv) {
    setupSvgDiv();
    core.setRoot(SvgElement.mk('<g/>')); // to be replaced by incoming item, usually
    core.root.set('transform',dom.vars.defaultTransform);
    dom.svgMain.contents=core.root;
    core.root.__sourceUrl = source;
  }
  $('.mainTitle').click(function () {
    location.href = "/";
  });
    $('body').css({"background-color":"#eeeeee"});
    layout();
    if (cb) {
      cb();
    }; 
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
  let settings = {};
  for (let s in q) {
    if (!mainGetVars[s]) {
      let qs = q[s];
      let nqs = Number(qs);
      settings[s] = isNaN(nqs)?qs:nqs;
    }
  }
  settings = settings;
}  

let userName,directory;
let pageInitialized = false; // to prevent repeats, which firebase will sometimes invoke via onIdTokenChanged 
const initPage = function () {
  debugger;
  pageInitialized = true;
  processQuery();
  dom.vars.fitStdExtent = !(source);
  genMainPage(afterPageGenerated);
}
  

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

export {initPage,userName,directory};
    
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
