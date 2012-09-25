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
	
	mapBoundry = document.createElementNS("http://www.w3.org/2000/svg","circle");
	mapBoundry.setAttributeNS(null, "cx", 0);	
	mapBoundry.setAttributeNS(null, "cy", 0);		
	mapBoundry.setAttributeNS(null, "r", mapRadius);
	mapBoundry.setAttributeNS(null, "stroke", "yellow");
	mapBoundry.setAttributeNS(null, "stroke-width", "5px");
	mapBoundry.setAttributeNS(null, "stroke-opacity", 0.5);
	mapBoundry.setAttributeNS(null, "fill", "yellow");
	mapBoundry.setAttributeNS(null, "fill-opacity", 0.0);
	mapGroup.appendChild(mapBoundry);
	
	scopeGroup = document.createElementNS("http://www.w3.org/2000/svg","g");
	scopeGroup.setAttribute('id', 'scopeGroup');
	scopeGroup.setAttribute('transform', 'translate('+availableWidth / 2+','+availableHeight / 2+')');
	background.appendChild(scopeGroup);
  
	mask = document.createElementNS("http://www.w3.org/2000/svg","path");
    mask.setAttributeNS(null, 'stroke', 'black');  
    mask.setAttributeNS(null, 'd', 'M '+availableWidth/2*-1+','+availableHeight/2*-1+' L '+availableWidth+','+availableHeight/2*-1+' L '+availableWidth+','+availableHeight+' L '+ availableWidth/2*-1 +','+availableHeight+' L '+availableWidth/2*-1+','+availableHeight/2*-1+' M 0, 0 m '+(((availablePixels - 22) / 2)*-1)+', 0 a '+((availablePixels - 22) / 2)+','+((availablePixels - 22) / 2)+' 0 1,0 '+(availablePixels - 22)+',0 a '+(availablePixels - 22)/2+','+(availablePixels - 22)/2+' 0 1,0 '+(availablePixels - 22)*-1+',0');
    mask.setAttributeNS(null, 'stroke-linejoin', 'round');
    mask.setAttributeNS(null, 'stroke-width', 2 / currentScale);
    mask.setAttributeNS(null, 'fill', 'black');
    scopeGroup.appendChild(mask);
    
    scopeOuterRim = document.createElementNS("http://www.w3.org/2000/svg","circle");
	scopeOuterRim.setAttributeNS(null, "cx", 0);	
	scopeOuterRim.setAttributeNS(null, "cy", 0);		
	scopeOuterRim.setAttributeNS(null, "r", ((availablePixels - 22) / 2));
	scopeOuterRim.setAttributeNS(null, "stroke", "gray");
	scopeOuterRim.setAttributeNS(null, "stroke-width", "2px");
	scopeOuterRim.setAttributeNS(null, "stroke-opacity", 0.5);
	scopeOuterRim.setAttributeNS(null, "fill", "black");
	scopeOuterRim.setAttributeNS(null, "fill-opacity", 0.0);
	scopeGroup.appendChild(scopeOuterRim);
	
	/*scopeInnerRim = document.createElementNS("http://www.w3.org/2000/svg","circle");
	scopeInnerRim.setAttributeNS(null, "cx", 0);	
	scopeInnerRim.setAttributeNS(null, "cy", 0);		
	scopeInnerRim.setAttributeNS(null, "r", ((availablePixels - 22) / 4));
	scopeInnerRim.setAttributeNS(null, "stroke", "gray");
	scopeInnerRim.setAttributeNS(null, "stroke-width", "2px");
	scopeInnerRim.setAttributeNS(null, "stroke-opacity", 0.5);
	scopeInnerRim.setAttributeNS(null, "fill", "black");
	scopeInnerRim.setAttributeNS(null, "fill-opacity", 0.0);
	scopeGroup.appendChild(scopeInnerRim);
	
	grid = document.createElementNS("http://www.w3.org/2000/svg","path");
    grid.setAttributeNS(null, 'stroke', 'gray');  
    grid.setAttributeNS(null, 'd', 'M '+(availablePixels - 22)/2*-1+',0 L '+(availablePixels - 22)/2+',0 M 0,'+(availablePixels - 22)/2*-1+' L 0,'+(availablePixels - 22)/2+'');
    grid.setAttributeNS(null, 'stroke-width', '1px');
    grid.setAttributeNS(null, 'fill', 'black');
    scopeGroup.appendChild(grid);*/
}

Map.prototype.createStars = function()
{
    for (var x = mapRadius*-1; x < mapRadius; x++)
	{
    	for (var y = mapRadius*-1; y < mapRadius; y++)
		{
            if (Math.floor((Math.random()*1000)+1) == 1)
			{
			    // Make sure the star is within the radius of the map size 
                if (x * x + y * y < mapRadius * mapRadius)
				{
				    new Star({xLocation: x, yLocation: y});
				}
			}
		}
	}
}