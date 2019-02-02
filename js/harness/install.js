
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

