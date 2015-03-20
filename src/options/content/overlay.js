
Components.utils.import("chrome://compactmoonoptions/content/module.jsm");

var compactmoonoptions_overlay = {
  pref: null,

  onLoad: function() {
    if (compactmoonoptions.themeName !== "compactmoon")
      return;

    compactmoonoptions.initBrowserWindow(this);

    try {
      document.documentElement
              .setAttribute('TabsCollapsed',
                            document.getElementById('TabsToolbar').getAttribute('collapsed'));
    } catch (e) {
        Cu.reportError(e);
    }
  },

  openPreferences: function(e) {
    window.openDialog("chrome://compactmoonoptions/content/options.xul", "",
                      "chrome,toolbar,dialog,resizable=yes,centerscreen")
          .focus();
  }
};

window.addEventListener("load", compactmoonoptions_overlay.onLoad, false);
