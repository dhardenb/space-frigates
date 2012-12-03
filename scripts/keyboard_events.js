// keyboard_events.js

function KeyPress(evt) {

    // ENTER - Start
    if(evt.keyCode==13 && game.gameOver == true) {
    
        evt.preventDefault();
    }
  
    // SPACE_BAR - Fire
    else if(evt.keyCode == 32) {
    
        evt.preventDefault();
        var newCommand = new Command({command: 0, targetId: 0});
        commands.push(newCommand);
    }
  
    // LEFT_ARROW - Rotate CounterClockwise
    else if(evt.keyCode == 37) {
    
        evt.preventDefault();
        var newCommand = new Command({command: 1, targetId: 0});
        commands.push(newCommand);
    }
  
    // UP_ARROW - Forward Thruster
    else if(evt.keyCode==38) {
    
        evt.preventDefault();
        var newCommand = new Command({command: 2, targetId: 0});
        commands.push(newCommand);
    }
  
    // RIGHT_ARROW - Rotate Clockwise
    else if(evt.keyCode==39) {
    
        evt.preventDefault();
        var newCommand = new Command({command: 3, targetId: 0});
        commands.push(newCommand);
    }
  
    // DOWN_ARROW - Stop
    else if(evt.keyCode==40) {
    
        evt.preventDefault();
        var newCommand = new Command({command: 4, targetId: 0});
        commands.push(newCommand);
    }
}