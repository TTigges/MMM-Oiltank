/* Magic Mirror
 * Module: MMM-Oiltank 
 *
 * By Torben Tigges
 *
 * TO DO:
 * - Label (Datum aus der JSON)?
 * - Vorhersage, wann Öl bestellt werden muss. config: prediction: true/false
 * - Öltank-Icon f. Volumenanzeige
 * - Max. anzeigen?
 * - maxVolume: ,
 * - Warnlinie sollte nur angezeigt werden, wenn sie im Scope ist!
 * - Anzeigebreite für weniger als full-width
 *
 */

Module.register("MMM-Oiltank",{
	// Default module config.
	defaults: {
		file: "", // "modules/MMM-Oiltank/history.json" doesn't work unless "request" is changed to the "fs"-line in the node-helper
		warnVolume: 0,
		showDays: 30,
		scope: 25 // above max and below min
	},

	getScripts: function() {
		return [
			this.file("highcharts/highcharts.js"),
			this.file("highcharts/series-label.js"),
			this.file("highcharts/exporting.js")
		]
	},

	getStyles: function() {
		return [
			this.file('css/chart.css')
		]
	},

	start: function() {
		Log.info("Starting module: " + this.name);
		if (this.config.file === "") {
			this.config.file = "modules/MMM-Oiltank/history.json";
		}
		var payload = this.config.file;
	    this.sendSocketNotification("GetChart", payload);
//	    this.fuelName = fuelIds[this.config.fuelId];
//      this.getChartLabel();
		this.config.warnOn = 0;
		if (this.config.warnVolume > 0) {
			this.config.warnOn = 2;
		}
	},

	socketNotificationReceived: function(notification, payload) {
        if (notification === "ChartUpdate") {
        	this.getChart(payload);
        	Log.info("good to go");
        }
    },

	getDom: function() {
		newMainElement = document.createElement('div');
	  	newMainElement.setAttribute('id', 'tankvolumen');

		newVolumeDiv = document.createElement('div');
		newVolumeDiv.setAttribute('id', 'volume');
		if (this.volume) {
			newVolumeDiv.innerHTML = this.volume.replace(".",",") + " L";
		}

		newChartDiv = document.createElement('div');
		newChartDiv.setAttribute('id', 'volume-chart');
		// siehe unten: Das Label geht zur Zeit nach 7 Tagen. Das macht hier wenig Sinn.
		/*
		newLabelDiv = document.createElement('div');
		newLabelDiv.setAttribute('id', 'chart-label');
		newLabelDiv.innerHTML = this.chartLabel;
		*/

		newMainElement.appendChild(newVolumeDiv);
		newMainElement.appendChild(newChartDiv);
		//newMainElement.appendChild(newLabelDiv);

		return newMainElement;
	},

	getChart: function(history) {
//		Log.info("running chart");
//		Log.info(history.length);
		if (history.length >= this.config.showDays) {
			history = history.slice(-this.config.showDays);
		}
//		Log.info(history.length);
		for(i = 0; i < history.length; i++) {
	    	if (i === 0) {
	    		list = history[i].Volumen;
	    	}
	    	else if (i === (history.length-1)) {
	    		list = list + ", " + history[i].Volumen;
	    		document.getElementById("volume").innerHTML = history[i].Volumen + " L"; //history[i].Volumen.replace(".",",") + " L"; // <= bei Kommawerten
	    		this.volume = history[i].Volumen;
	    	}
	    	else {
	    		list = list + ", " + history[i].Volumen;
	    	}
	    }
	    var maxi = Math.max.apply(Math, JSON.parse("[" + list + "]"));
	    var highest = maxi.toString() + " L"; //maxi.toString().replace(".",",") + " L"; // <= bei Kommawerten
	    var mini = Math.min.apply(Math, JSON.parse("[" + list + "]"));
	    var lowest  = mini.toString() + " L"; //mini.toString().replace(".",",") + " L"; // <= bei Kommawerten

	    Highcharts.chart('volume-chart', {
	    	chart: {
		    	height: 175, // Höhe des Chart in Pixel
		    	margin: 0,
		    	left: 0
	    	},
	        plotOptions: {
	            series: {
	                marker: {
	                    enabled: false
	                }
	            }
	        },
	        tooltip: {
		        pointFormat: "Value: {point.y:.2f}"
		    },
	        yAxis: {
	            min: mini - this.config.scope, // mini - 25, Tiefstwert, oben ermittelt. 
	            max: maxi + this.config.scope, // maxi + 25, Höchstwert, oben ermittelt.
	            tickInterval: 25, // Schrittgröße
	            plotLines: [/*{ // HILFSLINIEN
	            	value: this.Volumen, // Linie die den aktuellen Füllstand anzeigen sollte, macht keinen Sinn, weil es keine Schwankungen geben sollte. Bzw. macht nur kurz nach Befüllung Sinn.
	            	dashStyle: 'solid',
	            	width: 1,
	            	color: {
		                linearGradient: [0, 0, 900, 0],
		                stops: [
		                    [0, 'rgba(255, 255, 255, 0.1)'],
		                    [1, 'rgba(255, 255, 255, 0.2)']
		                ]
		            }
	            },*/{
	            	value: Math.max.apply(Math, JSON.parse("[" + list + "]")), // gepunktete Linie zur Kennzeichnung des Höchstwert
	            	dashStyle: 'dot',
	            	width: 1,
	            	color: {
		                linearGradient: [0, 0, 900, 0],
		                stops: [ // fade in, Linie fängt dunkler an und wird dann heller
		                    [0, 'rgba(255, 255, 255, 0.2)'],
		                    [1, 'rgba(255, 255, 255, 0.3)']
		                ]
		            },
		            label: {
		            	text: highest, // Höchstwert als Referenzwert auf der Linken Seite, oben ermittelt.
		            	x: 11,
		            	y: -7
		            }
	            }, {
	            	value: Math.min.apply(Math, JSON.parse("[" + list + "]")),  // gepunktete Linie zur Kennzeichnung des Tiefstwert
	            	dashStyle: 'dot',
	            	width: 1,
	            	color: {
		                linearGradient: [0, 0, 900, 0],
		                stops: [ // fade in, Linie fängt dunkler an und wird dann heller
		                    [0, 'rgba(255, 255, 255, 0.2)'],
		                    [1, 'rgba(255, 255, 255, 0.3)']
		                ]
		            },
		            label: {
		            	text: lowest, // Tiefstwert als Referenzwert auf der Linken Seite, oben ermittelt.
		            	x: 11,
		            	y: 13
		            	
		            }
	            }, {
	            	value: 2480, // Warnlinie "TANK FAST ALLE" solle aus Config kommen. "this.config.alarm"? Wird nur angezeigt, wenn der Chart das räumlich zulässt, also zwischen yAxis min/max
	            	dashStyle: 'solid',
	            	width: this.config.warnOn,
	            	color: {
		                linearGradient: [0, 0, 900, 0],
		                stops: [
		                    [0, 'rgba(200, 0, 0, 0.2)'],
		                    [1, 'rgba(200, 0, 0, 0.6)']
		                ]
		            }
	            }]
	        }, // eigentliches CHART
	        series: [{
	            data: JSON.parse("[" + list + "]"),
	            step: 'center',
	            lineWidth: 2,
	            color: {
	                linearGradient: [0, 0, 900, 0], // 0,0,900,900 wäre 45° nach oben rechts
	                stops: [ // fade in, Linie fängt dunkler an und wird dann heller
	                    [0, 'rgba(255, 255, 255, 0.4)'],
	                    [1, 'rgba(255, 255, 255, 1)']
	                ]
	            }
	        }]
		});
	}
/* // Das Label geht zur Zeit nach 7 Tagen. Das macht hier wenig Sinn.
	getChartLabel: function() {
		var date = new Date();
		var today = date.getDay();
		var hour = date.getHours();
		var yesterday;
		var lastday;
		if (today == 0) {
			yesterday = 6;
		}
		else {
			yesterday = today - 1;
		}
		var days = new Array("Sonntag", "Montag", "Dienstag", "Mittwoch",
	    "Donnerstag", "Freitag", "Samstag");
		if (hour >= 0 && hour < 12) {
			lastday = yesterday;
	    }
	    if (hour >= 12 && hour <= 23) {
	    	lastday = today;
	    }
		if (lastday == 0) {
			this.chartLabel= "<span class=\"day7\">"+days[1]+"</span><span class=\"day6\">"+days[2]+"</span><span class=\"day5\">"+days[3]+"</span><span class=\"day4\">"+days[4]+"</span><span class=\"day3\">"+days[5]+"</span><span class=\"day2\">"+days[6]+"</span><span class=\"day1\">"+days[0]+"</span>";
		}
		if (lastday == 1) {
			this.chartLabel= "<span class=\"day7\">"+days[2]+"</span><span class=\"day6\">"+days[3]+"</span><span class=\"day5\">"+days[4]+"</span><span class=\"day4\">"+days[5]+"</span><span class=\"day3\">"+days[6]+"</span><span class=\"day2\">"+days[0]+"</span><span class=\"day1\">"+days[1]+"</span>";
		}
		if (lastday == 2) {
			this.chartLabel= "<span class=\"day7\">"+days[3]+"</span><span class=\"day6\">"+days[4]+"</span><span class=\"day5\">"+days[5]+"</span><span class=\"day4\">"+days[6]+"</span><span class=\"day3\">"+days[0]+"</span><span class=\"day2\">"+days[1]+"</span><span class=\"day1\">"+days[2]+"</span>";
		}
		if (lastday == 3) {
			this.chartLabel= "<span class=\"day7\">"+days[4]+"</span><span class=\"day6\">"+days[5]+"</span><span class=\"day5\">"+days[6]+"</span><span class=\"day4\">"+days[0]+"</span><span class=\"day3\">"+days[1]+"</span><span class=\"day2\">"+days[2]+"</span><span class=\"day1\">"+days[3]+"</span>";
		}
		if (lastday == 4) {
			this.chartLabel= "<span class=\"day7\">"+days[5]+"</span><span class=\"day6\">"+days[6]+"</span><span class=\"day5\">"+days[0]+"</span><span class=\"day4\">"+days[1]+"</span><span class=\"day3\">"+days[2]+"</span><span class=\"day2\">"+days[3]+"</span><span class=\"day1\">"+days[4]+"</span>";
		}
		if (lastday == 5) {
			this.chartLabel= "<span class=\"day7\">"+days[6]+"</span><span class=\"day6\">"+days[0]+"</span><span class=\"day5\">"+days[1]+"</span><span class=\"day4\">"+days[2]+"</span><span class=\"day3\">"+days[3]+"</span><span class=\"day2\">"+days[4]+"</span><span class=\"day1\">"+days[5]+"</span>";
		}
		if (lastday == 6) {
			this.chartLabel= "<span class=\"day7\">"+days[0]+"</span><span class=\"day6\">"+days[1]+"</span><span class=\"day5\">"+days[2]+"</span><span class=\"day4\">"+days[3]+"</span><span class=\"day3\">"+days[4]+"</span><span class=\"day2\">"+days[5]+"</span><span class=\"day1\">"+days[6]+"</span>";
		}
	}
*/

});