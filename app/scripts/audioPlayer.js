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

AudioPlayer.prototype.play = function(data, next) {
  if (!data || !data.url) {
    return;
  }

  if (this.audio) {
    this.audio.pause();
    this.audio = null;
  }

  console.log('Playing: ', data.name, data.id);
  this.audio = new Audio(data.url);
  this.audio.play();
  this.audio.addEventListener('ended', function() {
    this.play(next.call(), next);
  }.bind(this));

  this.audio.addEventListener('progress', function(ev){
    console.log(ev.path[0].currentTime, ev.path[0].duration, ev.path[0].currentTime / ev.path[0].duration);
  });
};

module.exports = AudioPlayer;
