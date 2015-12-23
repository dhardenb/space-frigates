Template.map.rendered = function() {
  // init();
};

Template.map.helpers({
  createStars: function () {

    var stars = [];

    for (var x = 0; x < window.innerWidth - 22; x++) {
    
      for (var y = 0; y < window.innerHeight - 22; y++) {
      
          if (Math.floor((Math.random()*1000)+1) == 1) {
                
            stars.push({cx:x-(window.innerWidth - 22)/2, cy:y-(window.innerHeight - 22)/2,r:'.5',fill:'white',fillOpacity:Math.random()});
        }
      }
    }
    
    return stars;
  },
  mapWidth: function () {
    return window.innerWidth - 22;
  },
  mapHeight: function () {
    return window.innerHeight - 22;
  },
  mapTransform: function () {
    return 'translate('+(window.innerWidth-22)/2+','+(window.innerHeight-22)/2+') scale(1.5)';
  }
});