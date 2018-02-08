/* Magic Mirror
 * Node Helper: MMM-Oiltank
 *
 * By Torben Tigges
 * 
 */

var NodeHelper = require("node_helper");
var request = require("request")
var fs = require("fs");
var timer = 0;

module.exports = NodeHelper.create({
    start: function() {
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "GetChart") {
        	this.updateTimer(payload);
        }
    },

	getChart: function(payload) {
		var self = this;
		var file = payload;
//      console.log("gettingchart and sending it to the module");
		request({
		    url: file,
		    json: true
		}, function (error, response, body) {

		    if (!error && response.statusCode === 200) {
//		        console.log(body) // Print the json response
		        self.sendSocketNotification("ChartUpdate", body);
		    }
		})
//		var rawdata = fs.readFileSync("http://www.torben-tigges.de/div/history.json");
//		var history =  JSON.parse(rawdata);
//		self.sendSocketNotification("ChartUpdate", history);
		
	},

	updateTimer: function(payload) {
// sofort abfragen, dann nur zur vollen Stunde
		var self = this;
		var d = new Date();
		var h = d.getHours();
	    var min = d.getMinutes();
	    var sec = d.getSeconds();
	    if (timer === 0) {
	    	timer ++; // prevent unnecessary timer
//	    	console.log("timer = " + timer);
			this.getChart(payload);

			if((min == '00') && (sec == '00')){
//			  	console.log(h + ":" + min + ":" + sec + " - update calls price and waits 5 min");
//		     	console.log("restart timer");
		    	setTimeout(() => {
	                this.clearTimer(payload);
	             }, 60*1000*60); // 60 sec * 1000 ms = 1 min * 60 = hour
			} else {
//				console.log(h + ":" + min + ":" + sec + " - update waits for " + (59-min) + " min and " + (60-sec) + "sec");
//		     	console.log("restart timer");
	    		setTimeout(() => {
	                this.clearTimer(payload);
	             }, ((60-sec)*1000)+(60*1000*(59-min)));
			}
		}
		else {
//			console.log("timer already running, data displayed outside of timer run");
			this.getChart(payload);
		}
	},

	clearTimer: function(payload) {
//		console.log("timer finished one circle");
		timer --;
		this.updateTimer(payload);
	}

});