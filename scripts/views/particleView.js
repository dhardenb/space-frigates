// particleView.js

function ParticleView(particle)
{
    this.svgElement = document.createElementNS("http://www.w3.org/2000/svg","circle");
	this.svgElement.setAttributeNS(null, 'cx', particle.LocationX);
	this.svgElement.setAttributeNS(null, 'cy', particle.LocationY);
	this.svgElement.setAttributeNS(null, 'r', particle.Size / currentScale);
	this.svgElement.setAttributeNS(null, 'fill', 'red');
	mapGroup.appendChild(this.svgElement);
}

ParticleView.prototype.update = function(args)
{
    this.svgElement.setAttributeNS(null, 'cx', args[0]);
	this.svgElement.setAttributeNS(null, 'cy', args[1]);
}