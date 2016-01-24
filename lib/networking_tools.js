
var fs = require('fs');
var child_process = require('child_process');
var path = require('path');

var systemDrive = process.env.systemDrive;
var winArpLocations = [
	path.normalize(path.join(systemDrive, 'Windows', 'System32', 'ARP.exe')),
	path.normalize(path.join(systemDrive, 'WINDOWS', 'System32', 'ARP.exe')),
	path.normalize(path.join(systemDrive, 'Windows', 'System32', 'arp.exe')),
	path.normalize(path.join(systemDrive, 'WINDOWS', 'System32', 'arp.exe')),
];

var winPingLocations = [
	path.normalize(path.join(systemDrive, 'Windows', 'System32', 'PING.exe')),
	path.normalize(path.join(systemDrive, 'WINDOWS', 'System32', 'PING.exe')),
	path.normalize(path.join(systemDrive, 'Windows', 'System32', 'ping.exe')),
	path.normalize(path.join(systemDrive, 'WINDOWS', 'System32', 'ping.exe')),
];

var unixArpLocations = [
	'/usr/sbin/arp',
	'/sbin/arp',
];

var unixPingLocations = [
	'/usr/sbin/ping',
	'/sbin/ping',
];

var arpLocation = '';
var pingLocation = '';

function saveArpAndPingLocations(arpLocations, pingLocations) {
	arpLocations.some(function(location) {
		var exists = fs.existsSync(location);
		if(exists) {
			arpLocation = location;
			return true;
		} else {
			return false;
		}
	});
	pingLocations.some(function(location) {
		var exists = fs.existsSync(location);
		if(exists) {
			pingLocation = location;
			return true;
		} else {
			return false;
		}
	});
}

function parseWindowsArpCmdForIPs(arpStr) {
	var data = [];

	// console.log('ArpStr', arpStr);

	// var splitStr = arpStr.split('\r\n');
    var ips = arpStr.match(/((?!\s)([0-9-]{1,}\.){3}[0-9-]{1,}){1}/g);
	return ips;
}

function parseUnixArpCmdForIPs(arpStr) {
	var ips = arpStr.match(/((?!\s)([0-9-]{1,}\.){3}[0-9-]{1,}){1}/g);
	return ips;
}
var parseArpCmd;


// Save platform specific commands.
if(process.platform === 'win32') {
	saveArpAndPingLocations(winArpLocations, winPingLocations);
	parseArpCmd = parseWindowsArpCmdForIPs;
} else {
	saveArpAndPingLocations(unixArpLocations, unixPingLocations);
	parseArpCmd = parseUnixArpCmdForIPs;
}


function getExtraIPAddressesToSearch(cb) {
	// Execute the platforms arp command with the -a flag.
	var execFile = child_process.execFile;
	var child = execFile(arpLocation, ['-a'], {}, function(err, stdout, stderr) {
		if(err) {
			console.log('ERROR!');
		}

		var ips = parseArpCmd(stdout);
		cb(ips);
	});
}
getExtraIPAddressesToSearch(function(ips) {
	console.log('IPs', ips);
});
exports.getExtraIPAddressesToSearch = getExtraIPAddressesToSearch;