// map.js

function Map()
{
	this.create();
	this.createStars();
}

Map.prototype.create = function()
{
	background = document.getElementById("background");
	background.setAttributeNS(null, "height", availableHeight);	
	background.setAttributeNS(null, "width", availableWidth);
  
	backgroundGroup = document.createElementNS("http://www.w3.org/2000/svg","g");
	backgroundGroup.setAttribute('id', 'backgroundGroup');
	background.appendChild(backgroundGroup);
  
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
	
	scopeGroup = document.createElementNS("http://www.w3.org/2000/svg","g");
	scopeGroup.setAttribute('id', 'scopeGroup');
	scopeGroup.setAttribute('transform', 'translate('+availableWidth / 2+','+availableHeight / 2+')');
	background.appendChild(scopeGroup);
  
	test = document.createElementNS("http://www.w3.org/2000/svg","path");
    test.setAttributeNS(null, 'stroke', 'black');  
    test.setAttributeNS(null, 'd', 'M '+availableWidth/2*-1+','+availableHeight/2*-1+' L '+availableWidth+','+availableHeight/2*-1+' L '+availableWidth+','+availableHeight+' L '+ availableWidth/2*-1 +','+availableHeight+' L '+availableWidth/2*-1+','+availableHeight/2*-1+' M 0, 0 m '+(((availablePixels - 22) / 2)*-1)+', 0 a '+((availablePixels - 22) / 2)+','+((availablePixels - 22) / 2)+' 0 1,0 '+(availablePixels - 22)+',0 a '+(availablePixels - 22)/2+','+(availablePixels - 22)/2+' 0 1,0 '+(availablePixels - 22)*-1+',0');
    test.setAttributeNS(null, 'stroke-linejoin', 'round');
    test.setAttributeNS(null, 'stroke-width', 2 / currentScale);
    test.setAttributeNS(null, 'fill', 'black');
    scopeGroup.appendChild(test);
    
    scope = document.createElementNS("http://www.w3.org/2000/svg","circle");
	scope.setAttributeNS(null, "cx", 0);	
	scope.setAttributeNS(null, "cy", 0);		
	scope.setAttributeNS(null, "r", ((availablePixels - 22) / 2));
	scope.setAttributeNS(null, "stroke", "gray");
	scope.setAttributeNS(null, "stroke-width", "2px");
	scope.setAttributeNS(null, "stroke-opacity", 0.5);
	scope.setAttributeNS(null, "fill", "black");
	scope.setAttributeNS(null, "fill-opacity", 0.0);
	scopeGroup.appendChild(scope);
}

Map.prototype.createStars = function()
{
	for (var x = 0; x < window.innerWidth - 22; x++)
	{
		for (var y = 0; y < window.innerHeight - 22; y++)
		{
			if (Math.floor((Math.random()*1000)+1) == 1)
			{
				new Star({xLocation: x - window.innerWidth/2, yLocation: y - window.innerHeight/2});
			}
		}
	}
}