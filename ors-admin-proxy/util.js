const { fixRequestBody } = require("http-proxy-middleware");
const winston = require("winston");
require("winston-daily-rotate-file");
const AES = require("crypto-js/aes");
const CryptoJS = require("crypto-js");

const checkCookie =(proxyReq, req, res) => {
  if (!req.cookies.omsproxy) {
  	res.status = 401;
  	res.send("Missing cookie");
  	proxyReq.end();
  } else {
  	let dec = AES.decrypt(req.cookies.omsproxy, process.env.SECRET_KEY);
  	dec = dec.toString(CryptoJS.enc.Utf8);
  	let ip = req.header('x-forwarded-for') || req.socket.remoteAddress;
  	logger.info(`User: ${dec} -- ip: ${ip} -- Url: ${req.url} -- Method: ${req.method} -- Data: ${req.method === 'GET' ? '' : JSON.stringify(req.body)}`);
  }
  fixRequestBody(proxyReq, req);
};

var transport = new winston.transports.DailyRotateFile({
	filename: "record-%DATE%.log",
	datePattern: "YYYY-MM-DD",
	zippedArchive: false,
	maxFiles: "14d",
	maxSize: "400m",
	dirname: "log",
});

const timezoned = () => {
	return new Date().toLocaleString("en-US", {
		timeZone: "Asia/Jakarta",
	});
};

const logger = winston.createLogger({
	level: "info",
	transports: [transport],
	format: winston.format.combine(
		winston.format.timestamp({ format: timezoned }),
		winston.format.json()
	),
});

let snapshotStatus = {
	E1: {
		State: "none",
		Fix: [],
		Kafka: [],
		DbPool: [],
	},
	E2: {
		State: "none",
		Fix: [],
		Kafka: [],
		DbPool: [],
	},
	E3: {
		State: "none",
		Fix: [],
		Kafka: [],
		DbPool: [],
	},
	E4: {
		State: "none",
		Fix: [],
		Kafka: [],
		DbPool: [],
	},
	I1: {
		State: "none",
		Fix: [],
		DbPool: [],
	},
	I2: {
		State: "none",
		Fix: [],
		DbPool: [],
	},
	DB: {},
	BO: {
		State: "none",
		KafkaState: "none",
	},
	ORS: {
		State: "none",
		KafkaState: "none",
	},
	// MOMS: {
	// 	State: "none",
	// 	KafkaState: "none",
	// },
	ORDERCACHE: {
		State: "none",
		KafkaState: "none",
	},
	ENGINE: {},
	// ENGINEBANKAPI: {},
	OMSService1: {
		State: "none",
		DbPool: [],
	},
	OMSService2: {
		State: "none",
		DbPool: [],
	},
	OMSService3: {
		State: "none",
		DbPool: [],
	},
	OMSService4: {
		State: "none",
		DbPool: [],
	},
	TradeApi: {
		accountNumber: [],
	}
};

const getCurrentDateTime = () => {
	let currentdate = new Date();
	let datetime =
		currentdate.getFullYear() +
		":" +
		(currentdate.getMonth() + 1) +
		":" +
		currentdate.getDate() +
		" " +
		currentdate.getHours() +
		":" +
		currentdate.getMinutes() +
		":" +
		currentdate.getSeconds();

	return datetime;
};

const { Gauge } = require("prom-client");

let state = new Gauge({
	name: "state",
	help: "State for service",
	labelNames: ["service"],
});
let fix = new Gauge({
	name: "fix_state",
	help: "Fix desc for service",
	labelNames: ["service", "sessionid"],
});
let kafka = new Gauge({
	name: "kafka_state",
	help: "State for service",
	labelNames: ["service"],
});
let throughput = new Gauge({
	name: "order_tp",
	help: "Throughput",
	labelNames: ["type"],
});

let processApps = new Gauge({
	name: "app_pps",
	help: "Process",
	labelNames: ["type"],
});

let db = new Gauge({
	name: "db_pool",
	help: "DB connection pool",
	labelNames: ["service", "poolid"],
});

let account = new Gauge({
	name: "account",
	help: "Account on OMS",
	labelNames: ["OMS", "status","total"],
});

let snapshotStatusProm = {
	state,
	fix,
	kafka,
	throughput,
	processApps,
	db,
	account,
};

exports.onProxyReq = checkCookie;
exports.snapshotStatus = snapshotStatus;
exports.snapshotStatusProm = snapshotStatusProm;
exports.logger = logger
exports.getCurrentDateTime = getCurrentDateTime