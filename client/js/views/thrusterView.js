// thrusterView.js

ThrusterView = function (thruster)
{
	this.svgElement = document.createElementNS("http://www.w3.org/2000/svg","path");
	this.svgElement.setAttributeNS(null, 'stroke', 'red');
	this.svgElement.setAttributeNS(null, 'd', 'M-2 0 L2 0 L0 6 Z');
	this.svgElement.setAttributeNS(null, 'stroke-linejoin', 'round');
    this.svgElement.setAttributeNS(null, 'stroke-width', 2 / currentScale);
    this.svgElement.setAttributeNS(null, 'fill', 'yellow');
    this.svgElement.setAttribute('transform', 'translate('+thruster.LocationX+','+thruster.LocationY+') rotate('+thruster.Facing+')');
	mapGroup.appendChild(this.svgElement);
}

ThrusterView.prototype.update = function(args)
{
	this.svgElement.setAttribute('transform', 'translate('+args[0]+','+args[1]+') rotate('+args[2]+')');
}

ThrusterView.prototype.destroy = function()
{
	mapGroup.removeChild(this.svgElement);
}