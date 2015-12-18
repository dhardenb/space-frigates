// starView.js

StarView = function (star)
{
    this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
	this.svgElement.setAttributeNS(null, "cx", star.xLocation);	
	this.svgElement.setAttributeNS(null, "cy", star.yLocation);	
	this.svgElement.setAttributeNS(null, "r", "0.5");	
	this.svgElement.setAttributeNS(null, "fill", "white");
	this.svgElement.setAttributeNS(null, "fill-opacity", star.alpha);
	mapGroup.appendChild(this.svgElement);
}