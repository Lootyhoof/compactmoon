"use strict";
var EXPORTED_SYMBOLS = ["compactmoonoptions"];

const { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://gre/modules/NetUtil.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

Services = Object.create(Services);
XPCOMUtils.defineLazyServiceGetter(Services,
                                   "ss",
                                   "@mozilla.org/content/style-sheet-service;1",
                                   "nsIStyleSheetService");

function hasOwnProperty(object, property) Object.hasOwnProperty.call(object, property);

let attributes = {
  toRSSFeedInURLBarHidden: {
    "urlbar-single-feed-button": "ccoHide",
    "urlbar-multiple-feed-button": "ccoHide"
  },

  toHowCompactAddonBar: { "addon-bar": "ccHowCompact" },
  toHowCompactPersonalBar: { "PersonalToolbar": "ccHowCompact" },
  toHowCompactMenuBar: { "toolbar-menubar": "ccHowCompact" },
  toHowCompactNavBar: { "nav-bar": "ccHowCompact" },
  toHowCompactCustomBar: { "navigator-toolbox": "ccHowCompactCustomToolbars" },
  toHowCompactTabBar: { 
    "TabsToolbar": "ccHowCompact",
    "main-window": "ccHowCompactTabs"
  }
};

let stylesheets = {
  // Toolbar Buttons
  "buttonsclassic2":                  {prefs:{toToolbarButtons:"cc2"}},
  "buttonsclassic3":                  {prefs:{toToolbarButtons:"cc3"}},
  "buttonsfirefox0.9osx":             {prefs:{toToolbarButtons:"ff1osx"}},
  "buttonsfirefox0.9win":             {prefs:{toToolbarButtons:"ff1win"}},
  "buttonsfirefox3vista":             {prefs:{toToolbarButtons:"ff3v"}},
  "buttonsfirefox3xp":                {prefs:{toToolbarButtons:"ff3xp"}},
  "buttonsclassic2dark":              {prefs:{toOSSystemColors:"dark",toToolbarButtons:"ff4"}},
  "buttonsfirefox4aero":              {prefs:{toToolbarButtons:"ff4aero"}},
  "buttonsfirefox4linux-GnomeHuman":  {prefs:{toToolbarButtons:"ff4lgnomehuman"}},
  "buttonsfirefox4linux-GnomeOxygen": {prefs:{toToolbarButtons:"ff4lgnomeoxygen"}},
  "buttonsfirefox4osx":               {prefs:{toToolbarButtons:"ff4osx"}},
  "buttonsfirefox4osxdark":           {prefs:{toOSSystemColors:"dark",toToolbarButtons:"ff4osx"}},
  "buttonsfirefox8osx-Lion":          {prefs:{toToolbarButtons:"ff8osxlion"}},

  // White Back/Forward Arrows
  "arrowff1win":                      {prefs:{toArrows:["!=","classic"], toToolbarButtons:["|", "ff1osx", "ff1win"]}},
  "arrowff4win":                      {prefs:{toArrows:["!=","classic"], toToolbarButtons:["|", "ff3v", "ff3xp", "ff4"]}},
  "arrowff4linux-GnomeHuman":         {prefs:{toArrows:["!=","classic"], toToolbarButtons:["|", "cc2", "cc3", "ff4lgnomehuman", "ff4lgnomeoxygen"]}},
  "arrowff4osx":                      {prefs:{toArrows:["!=","classic"], toToolbarButtons:["|", "ff4osx", "ff8osxlion"]}},

  // Back/Forward Background Colors
  "arrowbcgreen":                     {prefs:{toArrows:"keyhole"}},
  "arrowbcblue":                      {prefs:{toArrows:"keyholeblue"}},
  "arrowbcorange":                    {prefs:{toArrows:"keyholeorange"}},

  // Button Borders
  "buttonbordersno":                  {prefs:{toButtonBorders:"no"}},
  "buttonbordersonlyunified":         {prefs:{toButtonBorders:"unified"}},

  // Backgrounds
  "flatbackgrounds":                  {prefs:{toBackgrounds:"flat"}},
  "flatbackgrounds-notbtntabs":       {prefs:{toBackgrounds:"gradientbtntabs"}},
  "flatbackgrounds-all":              {prefs:{toBackgrounds:"flatall"}},

  // dividers
  "chiseledborders":                  {prefs:{toToolbarDividers:"chiseled"}},

  // corners
  "squarecorners":                    {prefs:{toCornerStyles:"square"}},
  "roundtabs":                        {prefs:{toCornerStyles:"roundtabs"}},

  // sysColors
  "darkarrows":                       {prefs:{toOSSystemColors:"dark"}},

  // ccoScrollbars
  "xulscrollbars":                    {type: "agent",os: ["!=", "Darwin"],prefs:{toScrollbars:"os"}},
  "nativescrollbars":                 {type: "agent",os: "Darwin",prefs:{toScrollbars:"os"}},
  "squarescrollbars":                 {prefs:{toOSSystemColors:["!=", "dark"], toCornerStyles: "squarescrollbars"}},
  "darkscrollbarsflat":               {prefs:{toOSSystemColors:"dark", toBackgrounds:["!=","gradients"]}},
  "scrollbarsflat":                   {prefs:{toOSSystemColors:["!=", "dark"], toBackgrounds:["!=","gradients"]}},
  "darkscrollbarsbeveled":            {prefs:{toOSSystemColors:"dark", toBackgrounds: "gradients",}},

  // HowCompact
  "HowCompact/Toolbars":              {anyPrefs:{toHowCompactAddonBar: ["!=", 0],toHowCompactPersonalBar: ["!=", 0],toHowCompactMenuBar: ["!=", 0]}},
  "HowCompact/NavBar":                {anyPrefs:{toHowCompactNavBar: ["!=", 0]}},
  "HowCompact/CustomBar":             {anyPrefs:{toHowCompactCustomBar: ["!=", 0]}},
  "HowCompact/TabBar":                {anyPrefs:{toHowCompactTabBar: ["!=", 0]}}
}

function Prefs(branch, defaults) {
    this.constructor = Prefs; // Ends up Object otherwise... Why?

    this.branch = Services.prefs[defaults ? "getDefaultBranch" : "getBranch"](branch || "");
    if (this.branch instanceof Ci.nsIPrefBranch2)
        this.branch.QueryInterface(Ci.nsIPrefBranch2);

    this.defaults = defaults ? this : new this.constructor(branch, true);
}
Prefs.prototype = {
    /**
* Returns a new Prefs object for the sub-branch *branch* of this
* object.
*
* @param {string} branch The sub-branch to return.
*/
    Branch: function Branch(branch) new this.constructor(this.root + branch),

    /**
* Returns the full name of this object's preference branch.
*/
    get root() this.branch.root,

    /**
* Returns the value of the preference *name*, or *defaultValue* if
* the preference does not exist.
*
* @param {string} name The name of the preference to return.
* @param {*} defaultValue The value to return if the preference has no value.
* @optional
*/
    get: function get(name, defaultValue) {
        let type = this.branch.getPrefType(name);

        if (type === Ci.nsIPrefBranch.PREF_STRING)
            return this.branch.getComplexValue(name, Ci.nsISupportsString).data;

        if (type === Ci.nsIPrefBranch.PREF_INT)
            return this.branch.getIntPref(name);

        if (type === Ci.nsIPrefBranch.PREF_BOOL)
            return this.branch.getBoolPref(name);

        return defaultValue;
    },

    /**
* Returns true if the given preference exists in this branch.
*
* @param {string} name The name of the preference to check.
*/
    has: function has(name) this.branch.getPrefType(name) !== 0,

    /**
* Returns an array of all preference names in this branch or the
* given sub-branch.
*
* @param {string} branch The sub-branch for which to return preferences.
* @optional
*/
    getNames: function getNames(branch) this.branch.getChildList(branch || "", { value: 0 }),

    /**
* Returns true if the given preference is set to its default value.
*
* @param {string} name The name of the preference to check.
*/
    isDefault: function isDefault(name) !this.branch.prefHasUserValue(name),

    /**
* Sets the preference *name* to *value*. If the preference already
* exists, it must have the same type as the given value.
*
* @param {name} name The name of the preference to change.
* @param {string|number|boolean} value The value to set.
*/
    set: function set(name, value) {
        let type = typeof value;
        if (type === "string") {
            let string = SupportsString();
            string.data = value;
            this.branch.setComplexValue(name, Ci.nsISupportsString, string);
        }
        else if (type === "number")
            this.branch.setIntPref(name, value);
        else if (type === "boolean")
            this.branch.setBoolPref(name, value);
        else
            throw TypeError("Unknown preference type: " + type);
    },

    /**
* Sets the preference *name* to *value* only if it doesn't
* already have that value.
*/
    maybeSet: function maybeSet(name, value) {
        if (this.get(name) != value)
            this.set(name, value);
    },

    /**
* Resets the preference *name* to its default value.
*
* @param {string} name The name of the preference to reset.
*/
    reset: function reset(name) {
        if (this.branch.prefHasUserValue(name))
            this.branch.clearUserPref(name);
    }
};
let prefs = new Prefs();

var compactmoonoptions = {
  osString: Services.appinfo.OS,

  prefs: prefs.Branch("extensions.compactmoonoptions."),

  PREF_GENERAL_SKINS_SELECTEDSKIN: "general.skins.selectedSkin",
  STYLESHEETS_BASE: "chrome://global/skin/themeoptions/",

  get themeName() prefs.get(this.PREF_GENERAL_SKINS_SELECTEDSKIN),

  initBrowserWindow: function(window) {
    let { document } = window;

    this.setTabInTitlebar(document);
    this.setTabCloseButton(document);
    this.setTabWidths(document);

    // updatePref needs to be refactored to accept a document
    for (let [k, v] in Iterator(attributes))
      this.updatePref(k, v);

    for each (let id in ["compactmoonoptions", "classiccompactoptions_appmenu_options"]) {
      // Why not just unhide them to begin with?
      let el = document.getElementById(id);
      if (el)
        el.hidden = false;
    }

    //find the main menu
    var menubar = document.getElementById('main-menubar'); //firefox
    if (!menubar)
      return;

    //find our menu popup
    var menusub = document.getElementById('classiccompactoptions_mergedmenu-popup');

    //move each of the menus into the sub menu
    if (this.osString != "Darwin") {
      let mergedMenu = document.getElementById("classiccompactoptions_mergedmenu");
      if(this.prefs.get("toMergeMenus") === "yes") {
        if (mergedMenu)
          mergedMenu.hidden = false;

        Array.filter(menubar.childNodes, function (el) el != mergedMenu)
             .forEach(function (el) { menusub.appendChild(el) });
      }
      else if (mergedMenu) {
        mergedMenu.parentNode.removeChild(mergedMenu);
      }
    }

  },

  get allDocuments() {
    let enumerator = Services.wm.getEnumerator("navigator:browser");
    while (enumerator.hasMoreElements())
      yield enumerator.getNext().document;
  },

  init: function () {
    if (compactmoonoptions.themeName !== "compactmoon")
      return;

    for (let [name, sheet] in Iterator(stylesheets))
      this.updateSheet(name, sheet);

    this.prefs.branch.addObserver("", this.onPrefChange.bind(this), false);

    Services.prefs.addObserver("browser.tabs.tabMinWidth", this.styleOptionsObserver.bind(this), false);
    Services.prefs.addObserver("browser.tabs.tabMaxWidth", this.styleOptionsObserver.bind(this), false);
    Services.prefs.addObserver("browser.tabs.closeButtons", this.styleOptionsObserver.bind(this), false);
    Services.prefs.addObserver("general.skins.selectedSkin", this.styleOptionsObserver.bind(this), false);
  },

  styleOptionsObserver: function (branch, topic, pref) {
    switch (pref) {
    case "browser.tabs.tabMaxWidth":
      for (let document in this.allDocuments)
        ccpreferences.setTabWidths(document);
      break;
    case "browser.tabs.tabMinWidth":
      for (let document in this.allDocuments)
        this.setTabWidths(document);
      break;
    case "browser.tabs.closeButtons":
      for (let document in this.allDocuments)
        this.setTabCloseButton(document);
      break;
    }
  },

  onPrefChange: function onPrefChange(branch, topic, pref) {
    for (let [name, sheet] in Iterator(stylesheets)) {
      if (sheet.prefs && hasOwnProperty(sheet.prefs, pref) ||
          sheet.anyPrefs && hasOwnProperty(sheet.anyPrefs, pref))
        this.updateSheet(name, sheet);
    }
    if(pref==='toTabsInTitlebar' || pref==='toTabsInTitlebarAdjustmentMaxWindow' || pref==='toTabsInTitlebarAdjustmentNormalWindow'){
      for (let document in this.allDocuments)
        this.setTabInTitlebar(document);
    }
    if (hasOwnProperty(attributes, pref))
      this.updatePref(pref, attributes[pref]);
  },

  predicates: {
    "=": function (a, b) a == b,
    "!=": function (a, b) a != b,
    "<=": function (a, b) a <= b,
    ">=": function (a, b) a >= b,
    "<": function (a, b) a < b,
    ">": function (a, b) a > b,
    "&": function (a, b) a & b,
    "|": function (a) ~Array.slice(arguments, 1).indexOf(a)
  },

  test: function test(key, value) {
    if (Array.isArray(value))
      return this.predicates[value[0]].apply(this, [key].concat(value.slice(1)));
    return key == value;
  },

  updateSheet: function (sheetName, sheet) {

    function testPref([pref, predicate]) this.test(this.prefs.get(pref), predicate);

    function pairs(object) [pair for (pair in Iterator(object))];

    let enabled = (!sheet.os || this.test(this.osString,sheet.os))
               && (!sheet.anyPrefs || pairs(sheet.anyPrefs).some(testPref, this))
               && (!sheet.prefs || pairs(sheet.prefs).every(testPref, this));

    try {
      let uri = NetUtil.newURI(this.STYLESHEETS_BASE + sheetName + ".css");
      let type = Services.ss[(sheet.type || "user").toUpperCase() + "_SHEET"];
      let registered = Services.ss.sheetRegistered(uri, type);
      if (enabled != registered) {
        Services.ss[enabled ? "loadAndRegisterSheet" : "unregisterSheet"](uri, type);
      }
    }
    catch (e) {
      Cu.reportError(e);
    }
  },

  updatePref: function (pref, attrs) {
    try {
      let value = this.prefs.get(pref);

      for (let document in this.allDocuments) {
        for (let [id, attr] in Iterator(attrs)) {
          let elem = document.getElementById(id);
          if (elem) {
            if (value == false || value == null)
              elem.removeAttribute(attr);
            else
              elem.setAttribute(attr, value);
          }
        }
      }
    }
    catch (e) {
      Cu.reportError(e);
    }
  },

  getStyles: function getStyles(document) {
    var ss = document.styleSheets;
    for (let i = 0; i < ss.length; i++) {
      if (ss[i].href === "chrome://compactmoonoptions/skin/tabwidths.css")
        return Array.map(ss[i].cssRules, function (rule) rule.style);
    }

    return null;
  },

  setTabWidths: function (document) {
    var tabMinWidth = prefs.get("browser.tabs.tabMinWidth");
    var tabMaxWidth = prefs.get("browser.tabs.tabMaxWidth");

    let style = this.getStyles(document)[1];
    if (tabMaxWidth > 9) {style.setProperty("max-width", tabMaxWidth + "px","important");}
    if (tabMinWidth > 9 && tabMaxWidth>=tabMinWidth) {style.setProperty("min-width", tabMinWidth + "px","important");}
  },

  setTabInTitlebar: function (document) {
    if (this.osString !== "WINNT")
      return;

    var toTabsInTitlebar = this.prefs.get("toTabsInTitlebar");
    var toTabsInTitlebarAdjustmentMaxWindow = this.prefs.get("toTabsInTitlebarAdjustmentMaxWindow");
    var toTabsInTitlebarAdjustmentNormalWindow = this.prefs.get("toTabsInTitlebarAdjustmentNormalWindow");
    var MainWindow = document.getElementById("main-window");
    var ButtonBox = document.getElementById("titlebar-buttonbox-container");
    var AppMenu = document.getElementById("appmenu-button-container");
    var TabsToolbar = document.getElementById("TabsToolbar");
    var titlebar = document.getElementById("titlebar");

    let styles = this.getStyles(document);

    var TabbarEnd = 75;
    if (ButtonBox.getBoundingClientRect().width>10){TabbarEnd = ButtonBox.getBoundingClientRect().width + 2;}
    styles[2].setProperty("width", TabbarEnd + "px", "important");
    if (AppMenu) {
      var AppMenuWidth = AppMenu.getBoundingClientRect().width; //default 89.5px
      if (AppMenu.getElementsByTagName("button").length > 0 && AppMenuWidth > 0) {
        AppMenuWidth = AppMenuWidth + 2;
      } else if (AppMenu.getElementsByTagName("button").length > 0) {
        AppMenuWidth = 91.5;
      } else {
        AppMenuWidth = 0;
      }
      styles[3].setProperty("width", AppMenuWidth + "px", "important");
    }
    if (titlebar) {
      var osString=Components.classes["@mozilla.org/network/protocol;1?name=http"]  
          .getService(Components.interfaces.nsIHttpProtocolHandler).oscpu;
      var titlebarHeight = titlebar.getBoundingClientRect().bottom - titlebar.getBoundingClientRect().top;
      if(titlebarHeight<10){titlebarHeight=30;}
      var titlebarcontentHeight = "";
      if(osString.indexOf("Windows NT 6.1")!=-1){titlebarcontentHeight=15;}
      else{titlebarcontentHeight=13;}

      var toHowCompact = 0;
      if (this.prefs.get("toHowCompactTabBar")) {
        toHowCompact = this.prefs.get("toHowCompactTabBar");
      }
      var tabsHeight = 19 + toHowCompact;

      // //USED FOR TESTING ONLY.
      // var aText="\n sizemode: " +MainWindow.getAttribute("sizemode")+
      //   "\n osString: "+osString+
      //   "\n ccoTabMarginAdj: " +MainWindow.getAttribute("ccoTabMarginAdj")+
      //   "\n titlebarcontent.getBoundingClientRect().top: "+ titlebarcontent.getBoundingClientRect().top +
      //   "\n titlebarcontent.getBoundingClientRect().bottom: "+ titlebarcontent.getBoundingClientRect().bottom +
      //   "\n TabsToolbar.getBoundingClientRect().top: "+ TabsToolbar.getBoundingClientRect().top +
      //   "\n AppMenu.getBoundingClientRect().top: "+ AppMenu.getBoundingClientRect().top +
      //   "\n ButtonBox.getBoundingClientRect().top: "+ ButtonBox.getBoundingClientRect().top+
      //   "\n titlebarHeight: "+titlebarHeight+
      //   "\n tabsHeight: "+tabsHeight;
      // var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
      // promptService.alert(null,"Titlebar Test",aText);


      var heightadj = titlebarcontentHeight-tabsHeight;
      var MarginAdjust=0;
      if(MainWindow.getAttribute("sizemode")=="normal"){
        MarginAdjust=0;
      }
      if (heightadj<0){heightadj=0;}
      var pSign='';
      var menuNormalmargin = titlebarHeight-heightadj-4;

      // 4  Normal Window
      var s4margin=menuNormalmargin+MarginAdjust+toTabsInTitlebarAdjustmentNormalWindow;
      if(s4margin>0){pSign='-';}
      else{pSign='';}
      styles[4].setProperty("margin-top", pSign + s4margin + "px","important");

      // 5 Max Window
      var s5margin=menuNormalmargin+MarginAdjust+toTabsInTitlebarAdjustmentMaxWindow;
      if(s5margin>0){pSign='-';}
      else{pSign='';}
      styles[5].setProperty("margin-bottom", pSign + s5margin + "px","important");

      // 6  Normal Window
      var s6margin=menuNormalmargin+MarginAdjust+toTabsInTitlebarAdjustmentNormalWindow;
      if(s6margin>0){pSign='-';}
      else{pSign='';}
      styles[6].setProperty("margin-top", pSign + s6margin + "px","important");

      // 7  Max Window
      var s7margin=menuNormalmargin+MarginAdjust+toTabsInTitlebarAdjustmentMaxWindow;
      if(s7margin>0){pSign='-';}
      else{pSign='';}
      styles[7].setProperty("margin-bottom", pSign + s7margin + "px","important");

      MarginAdjust=0;
      if(MainWindow.getAttribute("sizemode")=="normal"){
        MarginAdjust=0;
      }
      // 8 Normal Window
      var s8margin=menuNormalmargin+MarginAdjust+toTabsInTitlebarAdjustmentNormalWindow;
      if(s8margin>0){pSign='-';}
      else{pSign='';}
      styles[8].setProperty("margin-top", pSign + s8margin + "px","important");

      // 9 Max Window
      var s9margin=menuNormalmargin+MarginAdjust-4+toTabsInTitlebarAdjustmentMaxWindow;
      if(s9margin>0){pSign='-';}
      else{pSign='';}
      styles[9].setProperty("margin-bottom", pSign + s9margin + "px","important");

      MainWindow.setAttribute("ccoTabMarginAdj",true);
      if(toTabsInTitlebar==="Always"){
        MainWindow.setAttribute("cctabsintitlebar", true);
        TabsToolbar.setAttribute("cctabsintitlebar", true);
      }
      else {
        MainWindow.setAttribute("cctabsintitlebar", false);
        TabsToolbar.setAttribute("cctabsintitlebar", false);
      }
    }
  },

  setTabCloseButton: function (document) {
    var closeButtons = prefs.get("browser.tabs.closeButtons");
    var TabsToolbar = document.getElementById("tabbrowser-tabs");
    if(closeButtons===1){
      TabsToolbar.setAttribute("ccoclosebuttons", "alltabs");
    }
    else{
      TabsToolbar.setAttribute("ccoclosebuttons", "");
    }
  }
};

compactmoonoptions.init();
