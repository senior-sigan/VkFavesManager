'use strict';

global.jQuery = jQuery;
global.Audio = Audio;
global.localStorage = localStorage;
global.Howl = Howl;
global.gui = require('nw.gui');
global.mainWindow = global.gui.Window.get();

require('../scripts/view.js');
