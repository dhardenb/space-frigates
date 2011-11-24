function renderScore(parentNode)
{
  // Group
  var ScoreGroupElement = document.createElementNS(svgNS,"g");
  x = componentOffset;
  y = componentOffset;
  ScoreGroupElement.setAttribute('transform', 'translate(' + x + ',' + y +')');
  parentNode.appendChild(ScoreGroupElement);
  
    // Background
    var ScoreElement = document.createElementNS(svgNS,"circle");
    ScoreElement.setAttributeNS(null, "cx", (AvailablePixels * .9));	
    ScoreElement.setAttributeNS(null, "cy", (AvailablePixels * .075));		
    ScoreElement.setAttributeNS(null, "r", (AvailablePixels * .075));
    ScoreElement.setAttributeNS(null, "stroke", "gray");
    ScoreElement.setAttributeNS(null, "stroke-width", "2px");
    ScoreElement.setAttributeNS(null, "fill", "dimgray");
    ScoreGroupElement.appendChild(ScoreElement);
    
    // 
    var ScoreScreenElement = document.createElementNS(svgNS,"circle");
    ScoreScreenElement.setAttributeNS(null, "cx", (AvailablePixels * .9));	
    ScoreScreenElement.setAttributeNS(null, "cy", (AvailablePixels * .075));		
    ScoreScreenElement.setAttributeNS(null, "r", (AvailablePixels * .067));
    ScoreScreenElement.setAttributeNS(null, "stroke", "black");
    ScoreScreenElement.setAttributeNS(null, "stroke-width", "2px");
    ScoreScreenElement.setAttributeNS(null, "fill", "black");
    ScoreGroupElement.appendChild(ScoreScreenElement);
    
    ScoreText = document.createElementNS(svgNS, "text");
    ScoreText.setAttributeNS(null, "x", (AvailablePixels * .9));
    ScoreText.setAttributeNS(null, "y", (AvailablePixels * .075));
    ScoreText.setAttributeNS(null, "font-size", 15);
    ScoreText.setAttributeNS(null, "fill", 'green');
    ScoreText.appendChild(document.createTextNode(""));
    ScoreGroupElement.appendChild(ScoreText);
}