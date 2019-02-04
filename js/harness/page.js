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
      /*noteDiv = html.Element.mk('<div style="font:10pt arial;background-color:white;position:absolute;top:0px;left:90px;padding-left:4px;border:solid thin black"/>').__addChildren([
        noteSpan = html.Element.mk('<span>Click on things to adjust them. Hierarchy navigation:</span>'),
        upBut =html.Element.mk('<div class="roundButton">Up</div>'), 
        downBut =html.Element.mk('<div class="roundButton">Down</div>'),
        topBut =html.Element.mk('<div class="roundButton">Top</div>')
        ]),*/
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

