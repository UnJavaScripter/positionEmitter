'use strict';

/**
 * @ngdoc function
 * @name positionEmitterApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the positionEmitterApp
 */
(function(){
	function MainCtrl(webSocket_Factory, $rootScope, $window, $scope) {
		Array.prototype.doEveryX = function(fn, delay){
		    var that = this,
				i=0,
				delay = delay || 1000,
				go = setInterval(function(){
					i === that.length ? window.clearInterval(go) : ( fn(that[i], i) ,  i +=1  );
					
				}, delay)
		}

	 	var vm = this;

	 	vm.active = 'options';

		vm.wsServerAddress = 'ws://echo.websocket.org';

		var messageObj = {
	        "body": ""
		};



	 	vm.gpsPositions = [];

		var mapOptions = {
			center: new google.maps.LatLng(4, -74),
			zoom: 4
		};


		var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);


		function initialize() {

			var drawingManager = new google.maps.drawing.DrawingManager({
				drawingMode: google.maps.drawing.OverlayType.POLYLINE,
			    drawingControl: false,
			    drawingControlOptions: {
			      position: google.maps.ControlPosition.TOP_CENTER,
			    }
		  	});
			drawingManager.setMap(map);

			google.maps.event.addListener(drawingManager, 'polylinecomplete', function(line) {
			  
			  line.getPath().getArray().forEach(function(element){
				vm.gpsPositions.push({
					"lat": element.k,
					"lng": element.D
				});
			  })
			  $scope.$apply();
			});

		};

/*		var options = {
			delay: 0,//in ms
			messageType: "allThePositions", // "allThePositions", "oneByOne"
			split: false, // false, *number*
		};
*/
		vm.processMessage = function(messageType, split){
			console.log("process");
			var options = {
				"messageType": messageType,
			};

			vm.messageDelay ? options.delay = vm.messageDelay : false
			vm.splitIn ? options.split = vm.splitIn : false

			if(options.split){
				getIntermediatePositions(options.split);
			}

			if(options.messageType === "allThePositions"){
				messageObj.body = JSON.stringify(vm.gpsPositions)
				sendMessage(messageObj)
			}
			else if(options.messageType === "oneByOne" && vm.gpsPositions.length > 1){
				vm.gpsPositions.doEveryX(function(element, index){
					console.log(index);
					messageObj.body = JSON.stringify(element);
					sendMessage(messageObj)
				}, options.delay);
			}else{
				throw "err"
			}	

		};







		function getIntermediatePositions(splitIn){
			var splitIn = splitIn - 2; // Minus the original 2 positions

			var newPositionArr = [];

			console.log(vm.gpsPositions);

			if(vm.gpsPositions.length === 2){
				newPositionArr.push(vm.gpsPositions[0])
				for(var i=0 ; i < splitIn ; i++){
					var intermediate_lat = vm.gpsPositions[0].lat + ((vm.gpsPositions[1].lat - vm.gpsPositions[0].lat)/(splitIn-i));
					var intermediate_lng = vm.gpsPositions[0].lng + ((vm.gpsPositions[1].lng - vm.gpsPositions[0].lng)/(splitIn-i));
					console.log(intermediate_lat);
					console.log(intermediate_lng);
					newPositionArr.push({"lat": intermediate_lat,"lng": intermediate_lng});
				}
				newPositionArr.push(vm.gpsPositions[1])
				vm.gpsPositions = newPositionArr;
			}
			console.log(vm.gpsPositions);
			if(!$scope.$$phase) {
				$scope.$apply();
			}

		}




		function sendMessage(messageObj){
			webSocket_Factory.sendMessage(vm.wsServerAddress, messageObj);
		};




	    $rootScope.$on('newMessage', function(e, args){
	    	console.log(args);
	    })
	    google.maps.event.addDomListener(window, 'load', initialize);
	   
	   
	};

	angular.module('positionEmitterApp')
	  .controller('MainCtrl', MainCtrl)
})();