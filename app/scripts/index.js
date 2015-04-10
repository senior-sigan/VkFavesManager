'use strict';

global.jQuery = jQuery;
global.Audio = Audio;
if (Audio == undefined) {
  throw 'Audio not supported';
}
global.localStorage = localStorage;
global.gui = require('nw.gui');
global.mainWindow = global.gui.Window.get();

require('../scripts/view.js');
