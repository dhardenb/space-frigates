var StarModel = Backbone.Model.extend(
{
	defaults:
	{
		xLocation: 0,
		yLocation: 0,
		radias: 1,
		fill: "white",
		alpha: 1.0,
		brightning: 0,
		twinkleRate: 0.05
	},
					
	twinkle: function()
	{
		if (this.get("brightning") == 0)
		{
			if (this.get("alpha") < 1.0)
			{
				this.set("alpha",  this.get("alpha") + this.get("twinkleRate"));
			}
			else 
			{
				this.set("alpha", 0.99);
				this.set("brightning", 1);
			}
		}
		
		else // (this.brightning == 1)
		{
			if (this.get("alpha") > 0.5)
			{
				this.set("alpha", this.get("alpha") - this.get("twinkleRate"));
			}
			else 
			{
				this.set("alpha", 0.55);
				this.set("brightning", 0);
			}
		}	
	}
});
	
var StarCollection = Backbone.Collection.extend(
{
	model: StarModel
});
	
var StarView = Backbone.View.extend(
{
	initialize: function()
	{
		this.model.bind("change:alpha", this.update, this);
		this.render();
	},
		
	render: function()
	{
		this.el = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			
		this.el.setAttributeNS(null, "cx", this.model.get("xLocation"));	
		this.el.setAttributeNS(null, "cy", this.model.get("yLocation"));	
		this.el.setAttributeNS(null, "r", this.model.get("radias"));	
		this.el.setAttributeNS(null, "fill", this.model.get("fill"));
		this.el.setAttributeNS(null, "fill-opacity", this.model.get("alpha"));
			
		backgroundGroup.appendChild(this.el);
	},
		
	update: function()
	{
		this.el.setAttributeNS(null, "fill-opacity", this.model.get("alpha"));
	}
});