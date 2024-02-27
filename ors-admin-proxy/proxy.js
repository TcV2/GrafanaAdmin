const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cookieParser = require("cookie-parser");
const { default: axios } = require("axios");
const bodyParser = require("body-parser");
const AES = require("crypto-js/aes");
const CryptoJS = require("crypto-js");
var cors = require("cors");
const { register } = require("prom-client");
require('dotenv').config({path:'D:/projects/TcV/GrafanaAdmin/ors-admin-proxy/.env'})

const log4js = require("log4js");
log4js.configure({
	"appenders": {
		"application": {
			"type": "console"
		},
		"file": {
			"type": "file",
			"filename": "/logs/oms-admin.log",
			"compression": true,
			"maxLogSize": 10485760,
			"backups": 100
		}
	},
	"categories": {
		"default": {
			"appenders": [
				"application",
				"file"
			],
			"level": "info"
		}
	}
});
const logger = log4js.getLogger();

const {snapshotStatus, snapshotStatusProm, onProxyReq} = require('./util')
const { statusSplit } = require("./router/status.js");
const { statusProxy } = require("./router/status-proxy.js");
const { fetchData } = require("./status.js");
global.snapshotStatus = snapshotStatus
global.snapshotStatusProm = snapshotStatusProm

const app = express();
app.use(cors());
app.use(cookieParser());

require('events').EventEmitter.prototype._maxListeners = 200;

app.use(
	"/omsproxy/e1api",
	createProxyMiddleware({
		target: process.env.E1API,
		onProxyReq,
		pathRewrite: {
			"^/omsproxy/e1api/": "/",
		},
		headers: {
			Connection: 'keep-alive'
		}
	})
);

app.use(
	"/omsproxy/e2api",
	createProxyMiddleware({
		target: process.env.E2API,
		onProxyReq,
		pathRewrite: {
			"^/omsproxy/e2api/": "/",
		},
		headers: {
			Connection: 'keep-alive'
		}
	})
);


app.use(
	"/omsproxy/boapi",
	createProxyMiddleware({
		target: process.env.BOAPI,
		onProxyReq,
		pathRewrite: {
			"^/omsproxy/boapi/": "/",
		},
		headers: {
			Connection: 'keep-alive'
		}
	})
);

app.use(
	"/omsproxy/i1api",
	createProxyMiddleware({
		target: process.env.I1API,
		onProxyReq,
		pathRewrite: {
			"^/omsproxy/i1api/": "/",
		},
		headers: {
			Connection: 'keep-alive'
		}
	})
);

app.use(
	"/omsproxy/i2api",
	createProxyMiddleware({
		target: process.env.I2API,
		onProxyReq,
		pathRewrite: {
			"^/omsproxy/i2api/": "/",
		},
		headers: {
			Connection: 'keep-alive'
		}
	})
);

app.use(
	"/omsproxy/alert",
	createProxyMiddleware({
		target: process.env.ALERT_SERVER,
		pathRewrite: {
			"^/omsproxy/alert": "/",
		},
	})
);

// Status split
app.use("/", statusSplit)
app.use("/", statusProxy)
app.get("/omsproxy/metrics", async (req, res) => {
	try {
		res.set("Content-Type", register.contentType);
		res.end(await register.metrics());
	} catch (ex) {
		res.status(500).end(ex);
	}
});

app.get("/omsproxy/getkey", async (req, res) => {
	grafana_cookie = req.cookies.grafana_session;
	if (!grafana_cookie) {
		res.status = 401;
		res.send("Missing cookie");
	} else {
		let resGrafana = await axios.get("http://localhost:3000/api/user", {
			headers: {
				Cookie: "grafana_session=" + grafana_cookie,
				Connection: 'keep-alive'
			},
		});

		let userData = resGrafana.data;
		var encrypted = AES.encrypt(`${userData.login}`, secretKey);
		res.cookie("omsproxy", encrypted.toString(), { httpOnly: true, sameSite: "lax" });
		res.send("OK");
	}
});

setInterval(() => {
	fetchData(snapshotStatus, snapshotStatusProm);
}, 5000);

app.get("/omsproxy/status", (req, res) => {
	res.send(snapshotStatus);
});

app.get("/omsproxy/logging", (req, res) => {
	logger.info(req.headers.log4js);
	res.send("Logged");
});

app.get("/omsproxy/service-status", (req, res) => {
	let i1 = (snapshotStatus.I1.State === "Started" ? 1 : 0);
	let i2 = (snapshotStatus.I2.State === "Started" ? 1 : 0);
	let e1 = (snapshotStatus.E1.State === "Started" ? 1 : 0);
	let e2 = (snapshotStatus.E2.State === "Started" ? 1 : 0);
	let oms1 = (snapshotStatus.OMSService1.State === "Started" ? 1 : 0);
	let oms2 = (snapshotStatus.OMSService2.State === "Started" ? 1 : 0);
	let ors = (snapshotStatus.ORS.State === "Started" ? 1 : 0);
	let orderCache = (snapshotStatus.ORDERCACHE.State === "Started" ? 1 : 0);
	let bo = (snapshotStatus.BO.State === "Started" ? 1 : 0);
	let engine = (snapshotStatus.ENGINE.State === "Started" ? 1 : 0);

	let msg_temp =
		`oms_alert_service{name="IOMS-1"} ${i1}\n` +
		`oms_alert_service{name="IOMS-2"} ${i2}\n` +
		`oms_alert_service{name="EOMS-1"} ${e1}\n` +
		`oms_alert_service{name="EOMS-2"} ${e2}\n` +
		`oms_alert_service{name="OMS-SERVICE-1"} ${oms1}\n` +
		`oms_alert_service{name="OMS-SERVICE-2"} ${oms2}\n` +
		`oms_alert_service{name="OMS-SYNC"} ${ors}\n` +
		`oms_alert_service{name="ORDERCACHE"} ${orderCache}\n` +
		`oms_alert_service{name="BO-SYNC"} ${bo}\n` +
		`oms_alert_service{name="FIX-ENGINE"} ${engine}\n`;

	console.log("Request service-status: " + msg_temp);
	res.send(msg_temp);
});

app.get("/omsproxy/current-time", (req, res) => {
	let configTime = "15:00:05";
	configTime = process.env.TIME_UNHOLD;
	let current =  new Date();
	console.log('OMS-ADMIN config time: ============> ' + configTime);
	let hours = ("0" + current.getHours()).slice(-2);
	let minutes = ("0" + current.getMinutes()).slice(-2);
	let seconds = ("0" + current.getSeconds()).slice(-2);
	let curr_time = hours + ":" + minutes + ":" + seconds;
	console.log('OMS-ADMIN current time: ============> ' + curr_time);
	if (curr_time <= configTime){
		console.log('OMS-ADMIN NOT ALLOW UNHOLD ALL: ============ ');
		res.send(true);
	}
	else {
		console.log('OMS-ADMIN ALLOW UNHOLD ALL: ============ ');
		res.send(false);
	}
});

const filter = function (pathname, req) {
	return pathname.match("^((?!omsproxy).)*$");
};

app.use("/", createProxyMiddleware(filter, { target: "http://localhost:3000/", ws: true }));

app.use(bodyParser.json());

let secretKey = process.env.SECRET_KEY;
app.use(
	"/omsproxy/oms1",
	createProxyMiddleware({
		target: process.env.OMS1,
		onProxyReq,
		pathRewrite: {
			"^/omsproxy/oms1/": "/",
		},
		headers: {
			Connection: 'keep-alive'
		}
	})
);

app.use(
	"/omsproxy/oms2",
	createProxyMiddleware({
		target: process.env.OMS2,
		onProxyReq,
		pathRewrite: {
			"^/omsproxy/oms2/": "/",
		},
		headers: {
			Connection: 'keep-alive'
		}
	})
);

app.listen(13111);
