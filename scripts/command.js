var CommandModel = Backbone.Model.extend(
{
	defaults:
	{
		playerId: 0,
		command: 0,
		targetId: 0,
		tick: 0
	}		
});

var CommandCollection = Backbone.Collection.extend(
{
	model: CommandModel
});