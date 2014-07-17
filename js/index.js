$(function() {
	printBTLog("Chrome BT App 0.1");
	printBTLog(" - Use https://developer.chrome.com/apps/app_bluetooth for all operations");
	printBTLog(" - This App uses the chrome.bluetoothSocket APIs");
	printBTLog(" - To connect devices, they MUST be paired in \"Devices and Printers\" on a PC");
	printBTLog("   and in \"Bluetooth\" under \"System Preferences\" on a Mac");
	printBTLog(" - At LEAST Chrome 37 is required for this application");


	var btDeviceSelect = $('#btDeviceSelect');


	var socketID         = 0;
	
	var deviceArray      = {};
	var device_names     = {};
	var device_Addresses = {};
	var deviceCount      = 0;
	var deviceOffset     = 0;

	var screenWidth = screen.availWidth;
	var screenHeight = screen.availHeight;

//  Start up Code	

	var addDeviceName = function(device) {
		deviceArray[deviceCount++] = device;
//                var btDeviceName = device.name;
//                $('<option></option>').text(btDeviceName).appendTo(btDeviceSelect);
        $('<option></option>').text(device.name).appendTo(btDeviceSelect);
	}
	var updateDeviceName = function(device) {
		printBTLog('  Have a device update - ' + device.name);
	}
	var removeDeviceName = function(device) {
		delete device_names[device.address];
	}
	// Add listeners to receive newly found devices and updates
	// to the previously known devices.
	chrome.bluetooth.onDeviceAdded.addListener(addDeviceName);
	chrome.bluetooth.onDeviceChanged.addListener(updateDeviceName);
	chrome.bluetooth.onDeviceRemoved.addListener(removeDeviceName);
	
    // Get the list of paired devices.
//	printBTLog("");
//	chrome.bluetooth.getDevices(function(devices) {
//		for (var i = 0; i < devices.length; i++) {
//		    printBTLog('Found: ' + device[i].name);
//		    deviceArray[deviceCount++] = device[i];
//			$('<option></option>').text(device[i].name).appendTo(btDeviceSelect);
//		    updateDeviceName(devices[i]);
//		}
//    });
	chrome.bluetooth.startDiscovery(function() {
	// Stop discovery after 3 seconds.
//        printBTLog('Starting Bluetooth Device Scan.');
        setTimeout(function() {
            chrome.bluetooth.stopDiscovery(function() {});
//            printBTLog('Finished Scanning for Bluetooth Devices.');
            $('#selectedBTDevice').empty().text(btDeviceSelect.val());
        }, 30000);
    });
	

	
//  Functions	
	function convertArrayBufferToString (buf) {
		return String.fromCharCode.apply(null, new Uint8Array(buf));
	}

	function convertArrayBufferToDumpString (buf) {
		var dumpString = '['
		var charArray = new Uint8Array(buf);
		for (var i = 0; i < charArray.length; i++) {
			dumpString += charArray[i].toString();
			if (i < charArray.length - 1) dumpString += ', ';
		}
		dumpString += ']';
		return dumpString;
	}

	function convertStringToArrayBuffer (str) {
		var buf = new ArrayBuffer(str.length);
		var bufView = new Uint8Array(buf);
		for (var i = 0; i < str.length; i++) {
			bufView[i] = str.charCodeAt(i);
		}
		return buf;
	}

	function printBTLog(logmsg) {
		var btLog = $('#btLog');
		var btLogContent = $('#btLogContent');

		btLogContent.append(document.createTextNode(logmsg + '\n'));
		btLog.scrollTop(btLog[0].scrollHeight);
	}

	function printConnectionBTLog(id, msg) {
		printBTLog('(' + id + ') ' + msg);
	}
			

	$('#btDeviceSelect')
		.change(function () {
			$('#selectedBTDevice').empty().text($('#btDeviceSelect').val());
		});

	$('#btConnect')
		.click(function () {
			var btDeviceName    = $('#btDeviceSelect').val();
			    deviceOffset    = $("#btDeviceSelect")[0].selectedIndex;
			var btDeviceAddress = deviceArray[deviceOffset].address;
			printBTLog('');
			printBTLog('Starting Connection to ' + btDeviceName);
			if (!btDeviceName) {
				printBTLog('No Bluetooth Device Selected.');
				return;
			}
			else if (!socketID) {
				chrome.bluetoothSocket.create(function(createInfo) {
				    if (chrome.runtime.lastError) {
						AddConnectedSocketId(socketID = 0);
						printBTLog("Socket Create Failed: " + chrome.runtime.lastError.message);
					}
					else {
						socketID = createInfo.socketId;
						chrome.bluetoothSocket.connect(createInfo.socketId,
						    btDeviceAddress, "1101", onConnectedCallback);
					}
				});
				if (chrome.runtime.lastError) {
				    AddConnectedSocketId(socketID = 0);
					printBTLog("Connection Operation failed: " + chrome.runtime.lastError.message);
				} 
			}
			else {
				printBTLog('Already connected.');
			}
		});
		var onConnectedCallback = function() {
				if (chrome.runtime.lastError) {
						AddConnectedSocketId(socketID = 0);
						printBTLog("Connection failed: " + chrome.runtime.lastError.message);
				}
				else {
						// Profile implementation here.
						printBTLog("Connected with socketID = " + socketID);
						AddConnectedSocketId(socketID);
						$('#socketId').text(socketID);
						$('#btStatus').text("Connected");
				}
		}

	$('#btDisconnect')
		.click(function () {
			printBTLog('');
			if (socketID) {
				printBTLog('Disconnecting connection id ' + socketID + '...');
				chrome.bluetoothSocket.disconnect(socketID);
				if (chrome.runtime.lastError) {
				    printBTLog("Disconnect failed: " + chrome.runtime.lastError.message);
				}
				else {
					printBTLog('Disconnect successful');
				    AddConnectedSocketId(0);
					$('#socketId').text("-");
					$('#btStatus').text("Disconnected");
				}
				socketID = 0;
			}
			else {
				printBTLog('Not connected.');
			}
		});


	$('#btGetDevice')
		.click(function () {
		    deviceOffset   = $("#btDeviceSelect")[0].selectedIndex;
			var deviceInfo = deviceArray[deviceOffset];
			printBTLog("");
			printBTLog(deviceArray[deviceOffset].name + " Has Address " + deviceInfo.address);
			if (deviceInfo.deviceClass) {
				printBTLog(" Device Class:" + deviceInfo.deviceClass);
			}
			if (deviceInfo.vendorId) {
				printBTLog(" Vendor ID:" + deviceInfo.vendorId);
			}
			if (deviceInfo.productId) {
				printBTLog(" Product ID:" + deviceInfo.productId);
			}
			if (deviceInfo.deviceId) {
				printBTLog(" Device ID:" + deviceInfo.deviceId);
			}
			if (deviceInfo.paired) {
				printBTLog(" Paired:" + deviceInfo.paired);
			}
			if (deviceInfo.connected) {
				printBTLog(" Connected:" + deviceInfo.connected);
			}
			for (var i = 0; deviceInfo.uuids.length > i; ++i) {
				printBTLog(" uuid:" + deviceInfo.uuids[i]);
			}
			if (chrome.runtime.lastError) {
				printBTLog("getDevice Operation failed: " + chrome.runtime.lastError.message);
			} 
		});

	$('#btSendMessage')
		.click(function () {
			if (socketID) {
				var txdata = $('#sendMessageContent').val();
				printBTLog('>> Sending message: "' + txdata + '"');
				var txstring = txdata + '\r';
				var txbuffer = convertStringToArrayBuffer(txstring);

				chrome.bluetoothSocket.send(socketID, txbuffer, function (bytes_sent) {
				    if (chrome.runtime.lastError) {
					    printBTLog("send Operation failed: " + chrome.runtime.lastError.message);
				    } 
					else {
						printBTLog('Sent ' + bytes_sent + ' bytes');
					}
				});
			}
			else {
				printBTLog('Not connected.');
			}			
		});

	var rxbuilder = '';
	function onBTReceive(info) {
		printBTLog('Received ' + info.data.byteLength + ' bytes of data: ' + convertArrayBufferToDumpString(info.data));
		var rxstring = convertArrayBufferToString(info.data);
		rxbuilder += rxstring;
		if (rxbuilder.charCodeAt(rxbuilder.length - 1) == 13) {
			var rxdata = rxbuilder.slice(0, -1);
			printBTLog('<< Received message: "' + rxdata + '"');
			rxbuilder = '';
		}
		else {
			printBTLog('Message is not terminated. Message so far is: "' + rxbuilder + '"');
		}
	}

	function onBTReceiveError(errorInfo) {
		printBTLog(errorInfo.errorMessage);
	}

	chrome.bluetoothSocket.onReceive.addListener(onBTReceive);
	chrome.bluetoothSocket.onReceiveError.addListener(onBTReceiveError);

});