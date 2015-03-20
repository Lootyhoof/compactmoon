const { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://gre/modules/Services.jsm");

onload = function onload() {
    window.sizeToContent();

    let features = {
        menubar: Services.appinfo.OS !== "Darwin",
        titlebar: Services.appinfo.OS === "WINNT"
    };

    document.documentElement.setAttribute("platform", Services.appinfo.OS);
    document.documentElement.setAttribute("features", Object.keys(features)
                                                            .filter(function (feature) features[feature])
                                                            .join(" "));

    for (let [feature, enabled] in Iterator(features)) {
        Array.forEach(document.getElementsByClassName("feature-" + feature), function (elem) {
            elem.disabled = !enabled;
        });
    }
}