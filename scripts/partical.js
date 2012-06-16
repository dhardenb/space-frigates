function CreateParticalObject(ParticalSource)
{
  var NewPartical = new GameObject(gameObjectId, 'Partical', ParticalSource.LocationX, ParticalSource.LocationY, 0, Math.random()*360, Math.random()*10, 'hidden', 1, 'None', 0, 0, Math.random()*10);
  gameObjectId++;
  GameObjects.push(NewPartical);
  CreateParticalElement(NewPartical);
  FindNewVelocity(NewPartical, ParticalSource.Heading, ParticalSource.Velocity); 
}

function UpdateParticalObject(ParticalObject)
{
  ParticalObject.Capacitor = ParticalObject.Capacitor - 1;

  if (ParticalObject.Capacitor < 1)
  {
    RemoveGameObject(ParticalObject);
  }
  else
  {
    MoveObjectAlongVector(ParticalObject);
  }
}

function CreateParticalElement(ParticalObject)
{
  ParticalObject.svgElement = document.createElementNS("http://www.w3.org/2000/svg","circle");
  ParticalObject.svgElement.setAttributeNS(null, 'cx', ParticalObject.LocationX);	
  ParticalObject.svgElement.setAttributeNS(null, 'cy', ParticalObject.LocationY);	
  ParticalObject.svgElement.setAttributeNS(null, 'r', ParticalObject.Size / CurrentScale);		
  ParticalObject.svgElement.setAttributeNS(null, 'fill', 'red');
  mapGroup.appendChild(ParticalObject.svgElement);
}

function UpdateParticalElement(ParticalObject)
{
  ParticalObject.svgElement.setAttributeNS(null, 'cx', ParticalObject.LocationX);	
  ParticalObject.svgElement.setAttributeNS(null, 'cy', ParticalObject.LocationY);
}

// Sameple of using inheritance for the object. Hope this works with models too.

/* var Pannel = Backbone.View.extend({
   initialize: function(options){
      console.log('Pannel initialized');
      this.foo = 'bar';
   }
});

var PannelAdvanced = Pannel.extend({
   initialize: function(options){
      this.constructor.__super__.initialize.apply(this, [options])
      console.log('PannelAdvanced initialized');
      console.log(this.foo); // Log: bar
   }
}); */