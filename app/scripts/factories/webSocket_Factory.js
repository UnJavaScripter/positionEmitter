'use strict';

(function(){
	function webSocket_Factory($rootScope, $q, $window){
		var webSocket_Factory = {};


		var theSocket;

		function _sendMessage(messageObj){
			theSocket.send(JSON.stringify(messageObj))
		};


		function _incomingMessage(theMessage){
			//Your code here
			// .
			// ..
			// ...
			//

			//My sample code here
			if(theMessage){
				console.log(theMessage);
			}
		};

		function _socketClosed(e){
			var closingMsg;
			switch(e.code){
				case 1000:
					closingMsg: "The connection was closed successfully.";
				case 1001:
					closingMsg: "Connection terminated by the client or the server.";
				case 1002:
					closingMsg: "Connection terminated due to a protocol error.";
				case 1003:
					closingMsg: "Connection terminated because of an illegal data type was sent to the server.";
				case 1004:
					closingMsg: "Unknown.";
				case 1005:
					closingMsg: "No status code could be found.";
				case 1006:
					closingMsg: "The connection was closed unexpectedly.";
				case 1007:
					closingMsg: "Connection bein closed by the server. Inconsistent data was sent";
				case 1008:
					closingMsg: "Connection bein closed by the server. Inconsistent data that violates the policies was sent";
				case 1009:
					closingMsg: "Connection bein closed by the server. The data is too large";
				case 1010:
					closingMsg: "Connection closed by the client. Expected the server to negotiate one or mor extensions ["+e.reason+"]";
				case 1011:
					closingMsg: "Connection bein closed by the server. A condition that a condition that prevented the fulfillment of the request was found";
				default:
					closingMsg: "The connection was closed"
			}
			console.log(closingMsg);
		};

		function _socketError(evt){
			console.log(evt.data)
		};

		function _openTheSocket(socketUrl){
			var deferred = $q.defer();


			//Opening the socket
			theSocket = new WebSocket(socketUrl);

			//Calling the listeners
			theSocket.onmessage = _incomingMessage;
			theSocket.close = _socketClosed;
			theSocket.onerror = _socketError;
			theSocket.onopen = function(){
				deferred.resolve();
			};

			return deferred.promise;
		}


		//---------------------------
		// Factory methods
		//-------------------------------
		webSocket_Factory.sendMessage = function(socketUrl, messageObj){

			_openTheSocket(socketUrl).then(function(socketId){
				
				var delay = theSocket.readyState !== 1 ? 1000 : 0;

				$window.setTimeout(function(){
					_sendMessage(messageObj)
				}, delay)
				
			});

		};	

		webSocket_Factory.close = function(){
			theSocket.close();
		};


		return webSocket_Factory
	};
	angular.module('unJS', [])
		.factory('webSocket_Factory', webSocket_Factory)
})();