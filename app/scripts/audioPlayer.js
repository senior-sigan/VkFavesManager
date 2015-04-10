'use strict';
var Audio = global.Audio;

var AudioPlayer = function() {
  this.audio = null;
};

AudioPlayer.prototype.stop = function() {
  if (this.audio) {
    this.audio.pause();
    this.audio = null;
  }
};

AudioPlayer.prototype.play = function(url, next) {
  if (!url) {
    return;
  }

  if (this.audio) {
    this.audio.pause();
    this.audio = null;
  }

  this.audio = new Audio(url);
  this.audio.play();
  this.audio.addEventListener('ended', function() {
    this.playAudio(next.call(), next);
  }.bind(this));
};

module.exports = AudioPlayer;
