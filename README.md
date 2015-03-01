# Node Airodump Parser
Take data gathered through airodump and POST it to an endpoint. This is a WIP.

## Requirements

* NodeJS 0.10+
* Airodump 1.1+
* Wifi interface in monitor mode
* (Optional) 2nd wifi interface connected to the internet

## Usage

Set your wifi interface in monitor mode. Replace `wlan0` with your interface name:
```
sudo ifconfig wlan0 down;sudo iwconfig wlan0 set mode monitor
```

Install npm modules
```
npm install
```

Start app
```
sh start.sh
```