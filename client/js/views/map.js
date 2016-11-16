// map.js

Map = function Map() {

	this.create();
	this.createStars();
}

Map.prototype.create = function() {

    background = document.getElementById("background");
	background.setAttributeNS(null, "height", availableHeight);
	background.setAttributeNS(null, "width", availableWidth);

	portGroup = document.createElementNS("http://www.w3.org/2000/svg","g");
	portGroup.setAttribute('id', 'portGroup');
	portGroup.setAttribute('transform', 'translate('+availableWidth / 2+','+availableHeight / 2+') scale(' + currentScale + ')');
	background.appendChild(portGroup);

	rotateGroup = document.createElementNS("http://www.w3.org/2000/svg","g");
	rotateGroup.setAttribute('id', 'rotateGroup');
	portGroup.appendChild(rotateGroup);

	translateGroup = document.createElementNS("http://www.w3.org/2000/svg","g");
	translateGroup.setAttribute('id', 'translateGroup');
	rotateGroup.appendChild(translateGroup);

	mapGroup = document.createElementNS("http://www.w3.org/2000/svg","g");
	mapGroup.setAttribute('id', 'mapGroup');
	translateGroup.appendChild(mapGroup);

}

Map.prototype.createStars = function() {

    for (var x = mapRadius*-1; x < mapRadius; x++) {

    	for (var y = mapRadius*-1; y < mapRadius; y++) {

            if (Math.floor((Math.random()*1000)+1) == 1) {

			    // Make sure the star is within the radius of the map size
                if (x * x + y * y < mapRadius * mapRadius) {

				    var newStar = new Star(x, y);
				    new StarView(newStar);
				}
			}
		}
	}
}
