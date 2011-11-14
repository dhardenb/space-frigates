function renderScope(parentNode)
{
  // Group
  var ScopeGroupElement = document.createElementNS(svgNS,"g");
  x = componentOffset;
  y = componentOffset;
  ScopeGroupElement.setAttribute('transform', 'translate(' + x + ',' + y +')');
  parentNode.appendChild(ScopeGroupElement);
  
    // Background
    var ScopeElement = document.createElementNS(svgNS,"circle");
    ScopeElement.setAttributeNS(null, "cx", (AvailablePixels - componentOffset * 2) / 2);	
    ScopeElement.setAttributeNS(null, "cy", (AvailablePixels - componentOffset * 2) / 2);		
    ScopeElement.setAttributeNS(null, "r", (AvailablePixels - componentOffset * 2) / 2);
    ScopeElement.setAttributeNS(null, "stroke", "gray");
    ScopeElement.setAttributeNS(null, "stroke-width", "2px");
    ScopeElement.setAttributeNS(null, "fill", "dimgray");
    ScopeGroupElement.appendChild(ScopeElement);

    // Viewport
    var Map_Viewport = document.createElementNS(svgNS,"svg");
    Map_Viewport.setAttributeNS(null, "x", componentOffset);	
    Map_Viewport.setAttributeNS(null, "y", componentOffset);		
    Map_Viewport.setAttributeNS(null, "rx", roundingConstant);
    Map_Viewport.setAttributeNS(null, "ry", roundingConstant);
    Map_Viewport.setAttributeNS(null, "height", AvailablePixels - componentOffset * 4);
    Map_Viewport.setAttributeNS(null, "width", AvailablePixels - componentOffset * 4);
    ScopeGroupElement.appendChild(Map_Viewport);
  
      // scopeScreen
      var scopeScreen = document.createElementNS(svgNS,"circle");
      scopeScreen.setAttributeNS(null, "cx", (AvailablePixels - componentOffset * 4) / 2);	
      scopeScreen.setAttributeNS(null, "cy", (AvailablePixels - componentOffset * 4) / 2);		
      scopeScreen.setAttributeNS(null, "r", (AvailablePixels - componentOffset * 4) / 2);
      scopeScreen.setAttributeNS(null, "fill", "black");
      Map_Viewport.appendChild(scopeScreen);
      
      // Map
      var centerMap = document.createElementNS(svgNS,"g");
      x = ((AvailablePixels - componentOffset) * 0.5);
      y = ((AvailablePixels - componentOffset) * 0.5);
      centerMap.setAttribute('transform', 'translate('+ x +','+ y +') scale(' + CurrentScale + ')');
      Map_Viewport.appendChild(centerMap);

      // Map
      MapGroupElement = document.createElementNS(svgNS,"g");
      MapGroupElement.setAttributeNS(null, 'cursor', 'crosshair');
      centerMap.appendChild(MapGroupElement);
}