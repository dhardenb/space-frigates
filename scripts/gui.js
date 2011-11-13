function renderScope(parentNode)
{
  // Group
  var ScopeGroupElement = document.createElementNS(svgNS,"g");
  x = componentOffset;
  y = AvailablePixels * .1 + componentOffset;
  ScopeGroupElement.setAttribute('transform', 'translate(' + x + ',' + y +')');
  parentNode.appendChild(ScopeGroupElement);
  
    // Background
    var ScopeElement = document.createElementNS(svgNS,"rect");
    ScopeElement.setAttributeNS(null, "x", 0);	
    ScopeElement.setAttributeNS(null, "y", 0);		
    ScopeElement.setAttributeNS(null, "rx", roundingConstant);
    ScopeElement.setAttributeNS(null, "ry", roundingConstant);
    ScopeElement.setAttributeNS(null, "height", AvailablePixels * .5 - componentOffset);
    ScopeElement.setAttributeNS(null, "width", AvailablePixels - componentOffset * 2);
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
    Map_Viewport.setAttributeNS(null, "height", AvailablePixels * .5 - componentOffset * 3);
    Map_Viewport.setAttributeNS(null, "width", AvailablePixels - componentOffset * 4);
    ScopeGroupElement.appendChild(Map_Viewport);
  
      // scopeScreen
      var scopeScreen = document.createElementNS(svgNS,"rect");
      scopeScreen.setAttributeNS(null, "x", 0);	
      scopeScreen.setAttributeNS(null, "y", 0);		
      scopeScreen.setAttributeNS(null, "rx", roundingConstant);
      scopeScreen.setAttributeNS(null, "ry", roundingConstant);
      scopeScreen.setAttributeNS(null, "height", AvailablePixels * .5 - componentOffset * 3);
      scopeScreen.setAttributeNS(null, "width", AvailablePixels - componentOffset * 4);
      scopeScreen.setAttributeNS(null, "fill", "black");
      Map_Viewport.appendChild(scopeScreen);
      
      // Map
      var centerMap = document.createElementNS(svgNS,"g");
      x = ((AvailablePixels - componentOffset) * 0.5);
      y = ((AvailablePixels - componentOffset) * 0.25);
      centerMap.setAttribute('transform', 'translate('+ x +','+ y +') scale(' + CurrentScale + ')');
      Map_Viewport.appendChild(centerMap);

      // Map
      MapGroupElement = document.createElementNS(svgNS,"g");
      MapGroupElement.setAttributeNS(null, 'cursor', 'crosshair');
      centerMap.appendChild(MapGroupElement);
}

function renderRibbon(parentNode)
{
  // Group
  var ribbonGroup = document.createElementNS(svgNS,"g");
  x = componentOffset;
  y = componentOffset;
  ribbonGroup.setAttribute('transform', 'translate(' + x + ',' + y + ')');
  parentNode.appendChild(ribbonGroup);

    // Background
    var ribbonBackground = document.createElementNS(svgNS,"rect");
    ribbonBackground.setAttributeNS(null, "x", 0);	
    ribbonBackground.setAttributeNS(null, "y", 0);		
    ribbonBackground.setAttributeNS(null, "rx", roundingConstant);
    ribbonBackground.setAttributeNS(null, "ry", roundingConstant);
    ribbonBackground.setAttributeNS(null, "height", AvailablePixels * .1 - componentOffset);
    ribbonBackground.setAttributeNS(null, "width", AvailablePixels - componentOffset * 2);
    ribbonBackground.setAttributeNS(null, "stroke", "gray");
    ribbonBackground.setAttributeNS(null, "stroke-width", "2px");
    ribbonBackground.setAttributeNS(null, "fill", "dimgray");
    ribbonGroup.appendChild(ribbonBackground);
}

function renderMissionSummary(parentNode)
{
  // Mission_Summary_Group
  var Mission_Summary_Group = document.createElementNS(svgNS,"g");
  x = componentOffset;
  y = (AvailablePixels * .5 - componentOffset * 2 ) + (AvailablePixels * .1) + (componentOffset * 3);
  Mission_Summary_Group.setAttribute('transform', 'translate(' + x + ',' + y + ')');
  parentNode.appendChild(Mission_Summary_Group);

    // Mission_Summary_Control
    var Mission_Summary_Control = document.createElementNS(svgNS,"rect");
    Mission_Summary_Control.setAttributeNS(null, "x", 0);	
    Mission_Summary_Control.setAttributeNS(null, "y", 0);		
    Mission_Summary_Control.setAttributeNS(null, "rx", roundingConstant);
    Mission_Summary_Control.setAttributeNS(null, "ry", roundingConstant);
    Mission_Summary_Control.setAttributeNS(null, "height", AvailablePixels * .1 - componentOffset * 2);
    Mission_Summary_Control.setAttributeNS(null, "width", AvailablePixels * .5 - componentOffset * 2);
    Mission_Summary_Control.setAttributeNS(null, "stroke", "gray");
    Mission_Summary_Control.setAttributeNS(null, "stroke-width", "2px");
    Mission_Summary_Control.setAttributeNS(null, "fill", "dimgray");
    Mission_Summary_Group.appendChild(Mission_Summary_Control);

    var Mission_Summary_Name_Plate = document.createElementNS(svgNS, "text");
    Mission_Summary_Name_Plate.setAttributeNS(null, "x", 20);
    Mission_Summary_Name_Plate.setAttributeNS(null, "y", 20);
    Mission_Summary_Name_Plate.setAttributeNS(null, "font-size", 20);
    Mission_Summary_Name_Plate.setAttributeNS(null, "fill", 'black');
    Mission_Summary_Name_Plate.appendChild(document.createTextNode("MISSION SUMMARY"));
    Mission_Summary_Group.appendChild(Mission_Summary_Name_Plate);

    Mission_Summary_Level = document.createElementNS(svgNS, "text");
    Mission_Summary_Level.setAttributeNS(null, "x", 20);
    Mission_Summary_Level.setAttributeNS(null, "y", 50);
    Mission_Summary_Level.setAttributeNS(null, "font-size", 15);
    Mission_Summary_Level.setAttributeNS(null, "fill", 'black');
    Mission_Summary_Level.appendChild(document.createTextNode("Level: 1"));
    Mission_Summary_Group.appendChild(Mission_Summary_Level);
}

function renderCapacitor(parentNode)
{
  // Render the CapacitorGroup
  var CapacitorGroupElement = document.createElementNS(svgNS,"g");
  x = componentOffset;
  y = (AvailablePixels * .5 - componentOffset * 2 ) + (AvailablePixels * .1) + (AvailablePixels * .1) + (componentOffset * 2);
  CapacitorGroupElement.setAttribute('transform', 'translate(' + x + ',' + y + ')');
  parentNode.appendChild(CapacitorGroupElement);

  // Render the Capacitor
  var CapacitorElement = document.createElementNS(svgNS,"rect");
  CapacitorElement.setAttributeNS(null, "x", 0);	
  CapacitorElement.setAttributeNS(null, "y", 0);		
  CapacitorElement.setAttributeNS(null, "rx", roundingConstant);
  CapacitorElement.setAttributeNS(null, "ry", roundingConstant);
  CapacitorElement.setAttributeNS(null, "height", AvailablePixels * .10 - componentOffset * 2);
  CapacitorElement.setAttributeNS(null, "width", AvailablePixels * .5 - componentOffset * 2);
  CapacitorElement.setAttributeNS(null, "stroke", "gray");
  CapacitorElement.setAttributeNS(null, "stroke-width", "2px");
  CapacitorElement.setAttributeNS(null, "fill", "dimgray");
  CapacitorGroupElement.appendChild(CapacitorElement);

  var Capacitor_Name_Plate = document.createElementNS(svgNS, "text");
  Capacitor_Name_Plate.setAttributeNS(null, "x", 20);
  Capacitor_Name_Plate.setAttributeNS(null, "y", 20);
  Capacitor_Name_Plate.setAttributeNS(null, "font-size", 20);
  Capacitor_Name_Plate.setAttributeNS(null, "fill", 'black');
  Capacitor_Name_Plate.appendChild(document.createTextNode("PRIMARY CAPACITOR"));
  CapacitorGroupElement.appendChild(Capacitor_Name_Plate);

  Capacitor_Current_Energy_Element = document.createElementNS(svgNS, "text");
  Capacitor_Current_Energy_Element.setAttributeNS(null, "x", 20);
  Capacitor_Current_Energy_Element.setAttributeNS(null, "y", 50);
  Capacitor_Current_Energy_Element.setAttributeNS(null, "font-size", 15);
  Capacitor_Current_Energy_Element.setAttributeNS(null, "fill", 'black');
  Capacitor_Current_Energy_Element.appendChild(document.createTextNode("Energy: 10"));
  CapacitorGroupElement.appendChild(Capacitor_Current_Energy_Element);
}

function renderDebugger(parentNode)
{
  // Render the DebugerGroup
  var DebugerGroupElement = document.createElementNS(svgNS,"g");
  x = componentOffset;
  y = (AvailablePixels * .5 - componentOffset * 2 ) + (AvailablePixels * .3) + (componentOffset * 1);
  DebugerGroupElement.setAttribute('transform', 'translate(' + x + ',' + y + ')');
  parentNode.appendChild(DebugerGroupElement);
  
  // Render the Debuger
  var DebugerElement = document.createElementNS(svgNS,"rect");
  DebugerElement.setAttributeNS(null, "x", 0);	
  DebugerElement.setAttributeNS(null, "y", 0);		
  DebugerElement.setAttributeNS(null, "rx", roundingConstant);
  DebugerElement.setAttributeNS(null, "ry", roundingConstant);
  DebugerElement.setAttributeNS(null, "height", AvailablePixels * .22 - componentOffset * 2);
  DebugerElement.setAttributeNS(null, "width", AvailablePixels * .5 - componentOffset * 2);
  DebugerElement.setAttributeNS(null, "stroke", "gray");
  DebugerElement.setAttributeNS(null, "stroke-width", "2px");
  DebugerElement.setAttributeNS(null, "fill", "dimgray");
  DebugerGroupElement.appendChild(DebugerElement);

  var Debugger_Name_Plate = document.createElementNS(svgNS, "text");
  Debugger_Name_Plate.setAttributeNS(null, "x", 20);
  Debugger_Name_Plate.setAttributeNS(null, "y", 20);
  Debugger_Name_Plate.setAttributeNS(null, "font-size", 20);
  Debugger_Name_Plate.setAttributeNS(null, "fill", 'black');
  Debugger_Name_Plate.appendChild(document.createTextNode("SHIP DEBUGGER"));
  DebugerGroupElement.appendChild(Debugger_Name_Plate);

  Debugger_Velocity = document.createElementNS(svgNS, "text");
  Debugger_Velocity.setAttributeNS(null, "x", 20);
  Debugger_Velocity.setAttributeNS(null, "y", 50);
  Debugger_Velocity.setAttributeNS(null, "font-size", 15);
  Debugger_Velocity.setAttributeNS(null, "fill", 'black');
  Debugger_Velocity.appendChild(document.createTextNode("Velocity: 0"));
  DebugerGroupElement.appendChild(Debugger_Velocity);

  FramesPerSecondElement = document.createElementNS(svgNS, "text");
  FramesPerSecondElement.setAttributeNS(null, "x", 20);
  FramesPerSecondElement.setAttributeNS(null, "y", 90);
  FramesPerSecondElement.setAttributeNS(null, "font-size", 15);
  FramesPerSecondElement.setAttributeNS(null, "fill", 'black');
  FramesPerSecondElement.appendChild(document.createTextNode("FPS: 0"));
  DebugerGroupElement.appendChild(FramesPerSecondElement);

  Debugger_Heading = document.createElementNS(svgNS, "text");
  Debugger_Heading.setAttributeNS(null, "x", 20);
  Debugger_Heading.setAttributeNS(null, "y", 70);
  Debugger_Heading.setAttributeNS(null, "font-size", 15);
  Debugger_Heading.setAttributeNS(null, "fill", 'black');
  Debugger_Heading.appendChild(document.createTextNode("Heading: 0"));
  DebugerGroupElement.appendChild(Debugger_Heading);
}

function renderAutoPilot(parentNode)
{
  var autoPilot = document.createElementNS(svgNS,"g");
  x = (AvailablePixels * .5 - componentOffset * 2 ) + (componentOffset * 2);
  y = (AvailablePixels * .5 - componentOffset * 2 ) + (AvailablePixels * .1) + (componentOffset * 3);
  autoPilot.setAttribute('transform', 'translate(' + x + ',' + y + ')');
  parentNode.appendChild(autoPilot);

    var autoPilotBackground = document.createElementNS(svgNS,"rect");
    autoPilotBackground.setAttributeNS(null, "x", 0);	
    autoPilotBackground.setAttributeNS(null, "y", 0);		
    autoPilotBackground.setAttributeNS(null, "rx", roundingConstant);
    autoPilotBackground.setAttributeNS(null, "ry", roundingConstant);
    autoPilotBackground.setAttributeNS(null, "height", AvailablePixels * .4 - componentOffset * 2);
    autoPilotBackground.setAttributeNS(null, "width", AvailablePixels * .5 - componentOffset * 2);
    autoPilotBackground.setAttributeNS(null, "stroke", "gray");
    autoPilotBackground.setAttributeNS(null, "stroke-width", "2px");
    autoPilotBackground.setAttributeNS(null, "fill", "dimgray");
    autoPilot.appendChild(autoPilotBackground);
}

function renderFireButton(parentNode)
{
  var fireButton = document.createElementNS(svgNS,"g");
  x = (AvailablePixels * .5 - componentOffset * 2 ) + (componentOffset * 3);
  y = (AvailablePixels * .5 - componentOffset * 2 ) + (AvailablePixels * .1) + (componentOffset * 4);
  fireButton.setAttribute('transform', 'translate(' + x + ',' + y + ')');
  parentNode.appendChild(fireButton);

    fireButtonBackground = document.createElementNS(svgNS,"rect");
    fireButtonBackground.setAttributeNS(null, "onmouseover", "fireButtonOnMouseOver()");
    fireButtonBackground.setAttributeNS(null, "onmouseout",  "fireButtonOnMouseOut()");
    fireButtonBackground.setAttributeNS(null, "onmousedown", "fireButtonOnMouseDown()");
    fireButtonBackground.setAttributeNS(null, "onmouseup",   "fireButtonOnMouseUp()"); 
    // fireButtonBackground.setAttributeNS(null, "onclick",     "fireButtonOnClick()");    
    fireButtonBackground.setAttributeNS(null, "x", 0);	
    fireButtonBackground.setAttributeNS(null, "y", 0);		
    fireButtonBackground.setAttributeNS(null, "rx", roundingConstant);
    fireButtonBackground.setAttributeNS(null, "ry", roundingConstant);
    fireButtonBackground.setAttributeNS(null, "height", AvailablePixels * .1 - componentOffset * 2);
    fireButtonBackground.setAttributeNS(null, "width",  AvailablePixels * .1 - componentOffset * 2);
    fireButtonBackground.setAttributeNS(null, "stroke", "gray");
    fireButtonBackground.setAttributeNS(null, "stroke-width", "2px");
    fireButtonBackground.setAttributeNS(null, "fill", "dimgray");
    fireButton.appendChild(fireButtonBackground);
}