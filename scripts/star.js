// star.js

function Star(star)
{
	this.xLocation = star.xLocation;
	this.yLocation = star.yLocation;
	this.alpha = Math.random();
	
	this.createView();
}

Star.prototype.createView = function()
{
	this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
	this.svgElement.setAttributeNS(null, "cx", this.xLocation);	
	this.svgElement.setAttributeNS(null, "cy", this.yLocation);	
	this.svgElement.setAttributeNS(null, "r", "0.5");	
	this.svgElement.setAttributeNS(null, "fill", "white");
	this.svgElement.setAttributeNS(null, "fill-opacity", this.alpha);
	mapGroup.appendChild(this.svgElement);
}