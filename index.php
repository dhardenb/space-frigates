<?php
header("Content-type: image/svg+xml");
?>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title>Space Battle</title>
    <meta charset="UTF-8" />
    <script src="./scripts/globals.js"></script>
    <script src="./scripts/ScoreView.js"></script>
    <script src="./scripts/gui.js"></script>
    <script src="./scripts/objects.js"></script>
    <script src="./scripts/ship.js"></script>
    <script src="./scripts/missile.js"></script>
    <script src="./scripts/partical.js"></script>
    <script src="./scripts/physics.js"></script>
    <script src="./scripts/keyboard_events.js"></script>
    <script type="text/ecmascript"><![CDATA[
  
      var svgNS = "http://www.w3.org/2000/svg";
      var GameOver = true;
      var CountdownTimer = 0;
      var GameObjects = new Array();
      var DeadObjects = new Array();
      var PlayerObjects = new Array();
      var CommandObjects = new Array();
      var CommandRequestObjects = new Array();
      var FrameCounter = 0;
      var FramesPerSecond = 0;
      var ZoomLevel = 400;
      var GameSpeed = .66;
      var CapacitorMax = 25;
      var CapacitorInput = .16;
      var MissileVelocity = 5;
      var ExplosionSize = 20;
      var MissileFuel = 100;
      var tick = 0;
      var score = 0;

      var singlePlayer = false;
      var commandDelay = 1;

      var playerObjectId = 0;
      var gameObjectId = 0;
      var availableHeight = window.innerHeight - 22;
      var availableWidth = window.innerWidth - 22;
    
      if (availableHeight < availableWidth)
      {
        AvailablePixels = availableHeight;
      }
      else
      {
        AvailablePixels = availableWidth;
      }

      var componentOffset = AvailablePixels * .01
      var CurrentScale = AvailablePixels / ZoomLevel;
      var StartingDistanceFromCenter = 100;
      var roundingConstant = AvailablePixels * .02;

      document.documentElement.addEventListener("keydown", KeyPress, false);
      
    ]]></script>
  </head>
  <body>
    <svg id="Canvas" onload="Init()" width="100%" height="100%" version="1.1" baseProfile="full" xmlns="http://www.w3.org/2000/svg"></svg>
  </body>
</html>