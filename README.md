# Compact Moon
![Preview](http://i68.tinypic.com/iee1c8.png)

Fork of the theme [Classic Compact](https://addons.mozilla.org/firefox/addon/classic-compact/) by Ken Barbalace for Pale Moon.

## Building
Simply download the contents of the "src" folder  and pack the contents of both the "options" and "theme" folders into a .zip file each. Then, rename the files to .xpi. Pack both of these XPI files with the install.rdf file in the "src" folder into another .xpi. Then, drag into the browser. You can install these separately if you wish, however it is strongly advised to install together.

On Unix systems (or Windows 10, with [WSL](https://docs.microsoft.com/en-us/windows/wsl/about)) you can optionally run `build.sh` instead. Running this as-is will produce a .xpi file ending in `-dev`, and if run from the command line and appending a number (e.g. `./build.sh 2`) will append that number to the filename instead. To build only the theme or options components, append either `theme` or `options` after the number (e.g. `./build.sh 2 theme`). By default all components are built.

## Download
You can grab the latest release either from the Releases section of this repository, or the [Pale Moon Add-Ons Site](https://addons.palemoon.org/themes/complete/compact-moon-theme/).
