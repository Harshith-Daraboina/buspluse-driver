# CampusRide Driver Web

Open `index.html` in a modern browser. No installation, build, account, or server is required. The same folder can be published on any static website host.

Select a driver, route, and bus, then start a journey. Active trips lock the selections; ending a trip requires confirmation. SOS is always available and offers a call to India's emergency number, 112.

This is a standalone, device-only website, not a connection to the authenticated CampusRide backend. Journey details and the active timer are saved in this browser when local storage is available. It does not publish GPS, notify campus, sync across devices, or keep trip history. SOS does not send an alert. Calling requires a device with telephone support.

The selectable names, six directional routes, and buses mirror the existing demo fleet in `esp`. Edit the lists at the top of `app.js` to change them. Fonts and the bus photo load from Google Fonts and Unsplash; the controls work without those assets.