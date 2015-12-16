// thrusterView.js

function ThrusterView(thruster)
{
    this.svgElement = document.createElementNS("http://www.w3.org/2000/svg","circle");
	this.svgElement.setAttributeNS(null, 'cx', thruster.LocationX);
	this.svgElement.setAttributeNS(null, 'cy', thruster.LocationY);
	this.svgElement.setAttributeNS(null, 'r', thruster.Size / currentScale);
	this.svgElement.setAttributeNS(null, 'fill', 'red');
	mapGroup.appendChild(this.svgElement);
}

ThrusterView.prototype.update = function(args)
{
    this.svgElement.setAttributeNS(null, 'cx', args[0]);
	this.svgElement.setAttributeNS(null, 'cy', args[1]);
}

ThrusterView.prototype.destroy = function()
{
	mapGroup.removeChild(this.svgElement);
}