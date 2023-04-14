let net = require("net"),
  singleton = require("./Singleton"),
  handler = require("./PeersHandler");

singleton.init();

let os = require("os");
let ifaces = os.networkInterfaces();
let HOST = "";
let PORT = singleton.getPort(); //get random port number

// get the loaclhost ip address
Object.keys(ifaces).forEach(function (ifname) {
  ifaces[ifname].forEach(function (iface) {
    if ("IPv4" == iface.family && iface.internal !== false) {
      HOST = iface.address;
    }
  });
});

// get current folder name
let path = __dirname.split("\\");
let peerLocation = path[path.length - 1].split("-")[0];
let maxpeers = path[path.length - 1].split("-")[1];

if (process.argv.length > 2) {
  // call as node peer [-p <serverIP>:<port>]

  // run as a client
  // this needs more work to properly filter command line arguments
  let firstFlag = process.argv[2]; // should be -p
  let hostserverIPandPort = process.argv[3].split(":");

  let knownHOST = hostserverIPandPort[0];
  let knownPORT = hostserverIPandPort[1];

  // connect to the known peer address
  let clientPeer = new net.Socket();
  clientPeer.connect(knownPORT, knownHOST, function () {
    // initialize peer table
    let peerTable = []; // array of objects
    // peerTable format
    // [{
    //   peerIP: peer ip address,
    //   peerPort: peer port number
    // }]

    handler.handleCommunications(clientPeer, maxpeers, peerLocation, peerTable);
  });
} else {
  // call as node peer (no arguments)
  // run as a server
  let serverPeer = net.createServer();
  serverPeer.listen(PORT, HOST);
  console.log(
    "This peer address is " + HOST + ":" + PORT + " located at " + peerLocation
  );

  // initialize peer table
  let peerTable = [];
  serverPeer.on("connection", function (sock) {
    // received connection request
    handler.handleClientJoining(sock, maxpeers, peerLocation, peerTable);
  });
}
