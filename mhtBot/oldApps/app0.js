// Loads the environment variables from the .env file
//require('dotenv-extended').load();

var builder = require('botbuilder');
var restify = require('restify');

// Create connector and listen for messages
var connector = new builder.ChatConnector({
	appId: process.env.MICROSOFT_APP_ID,
	appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var bot = new builder.UniversalBot(connector, [
	function(session){
		session.beginDialog('intro');
	}
]);

// Sends greeting message
bot.on('conversationUpdate', function(message){
	if(message.membersAdded){
		message.membersAdded.forEach(function(identity){
			if(identity.id === message.address.bot.id){
				var reply = new builder.Message().address(message.address).text('Hi, I\'m MaxBot. I hope we\'ll be able to work together to help you.');
				bot.send(reply);
			}
		});
	}
});

// Setup restify Server
var server = restify.createServer();

server.post('/api/messages', connector.listen());

// Serve a static web page
server.get(/.*/, restify.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));

// LUIS recogniser
var luisModelURL = process.env.LUIS_MODEL_URL;
var luisRecognizer = new builder.LuisRecognizer(luisModelURL);

// Creates an intent recogniser
var intents = new builder.IntentDialog({recognizers: [luisRecognizer]});
console.log(intents);

var DialogLabels = {
	Intro: 'Intro',
	PHQ9: 'phq9',
	GAD7: 'gad7'
};


bot.dialog('intro', require('./intro.js'));
bot.dialog('phq9', require('./phq9.js'));
bot.dialog('gad7', require('./gad7.js'));

// log any bot errors to the console
bot.on('error', function(e){
	console.log('An error occured', e);
});

server.listen(process.env.port || process.env.PORT || 3978, function() {
	console.log('%s listening to %s', server.name, server.url);
});


