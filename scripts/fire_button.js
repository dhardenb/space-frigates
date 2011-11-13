function fireButtonOnMouseOver()
{
  fireButtonBackground.setAttributeNS(null, "stroke", "yellow");
}

function fireButtonOnMouseOut()
{
  fireButtonBackground.setAttributeNS(null, "stroke", "gray");
  fireButtonBackground.setAttributeNS(null, "fill", "dimgray");
}

function fireButtonOnMouseDown()
{
  fireButtonBackground.setAttributeNS(null, "fill", "gray");
  var newCommand = new CommandObject(0, 0, PlayerObjects[0].ship, tick+commandDelay);
  IssueCommand(newCommand);
}

function fireButtonOnMouseUp()
{
  fireButtonBackground.setAttributeNS(null, "fill", "dimgray");
}

function fireButtonOnClick()
{
  fireButtonBackground.setAttributeNS(null, "fill", "gray");
  var newCommand = new CommandObject(0, 0, PlayerObjects[0].ship, tick+commandDelay);
  IssueCommand(newCommand);
}