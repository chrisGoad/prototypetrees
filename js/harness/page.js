
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

