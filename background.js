/**
 * Listens for the app launching then creates the window
 *
 * @see http://developer.chrome.com/apps/app.runtime.html
 * @see http://developer.chrome.com/apps/app.window.html
 */
chrome.app.runtime.onLaunched.addListener(function() {
  new btHandler();
});


var btHandler = function() {
  var connectedSocketID = 0;
 // Center window on screen.
  var screenWidth = screen.availWidth;
  var screenHeight = screen.availHeight;
  var width  = 1200;
  var height = 860;

  chrome.app.window.create(
    'index.html', {
      id: "BTApp",
      bounds: {
        width: width,
        height: height,
        left: Math.round((screenWidth-width)/2),
        top: Math.round((screenHeight-height)/2)
      },
      minWidth:  600,
      minHeight: 600,
      state: "normal",
    },
    
    function(win) {
      win.contentWindow.AddConnectedSocketId = function(id) {
        connectedSocketID = id;
      };
      win.onClosed.addListener(function() {
        if (connectedSocketID) {
          chrome.bluetoothSocket.disconnect(connectedSocketID);
        }
      });
    }
  );
}


