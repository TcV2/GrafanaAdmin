const express = require('express');
const router = express.Router();
const axios = require('axios')

const {getCurrentDateTime} = require('../util')

router.get("/omsproxy/status/EOMS1", (req, res) => {
	let result = {
		status: "NotOK",
		version: "V1",
		messageDate: getCurrentDateTime(),
		data: [],
	};

	let general = true;

	if (snapshotStatus.E1.Fix.length === 0) {
		general = false;
	} else {
		snapshotStatus.E1.Fix.forEach((element) => {
			general = general && element.State === "true";
			let statusString = element.State === "true" ? "OK" : "NotOk";
			let state = {
				name: element.SessionID,
				status: statusString,
				message: "Connection " + element.SessionID + " " + statusString,
			};
			result.data.push(state);
		});

		let kafka = {
			name: "E1 -> Kafka",
			status: "",
			message: "Connection between E1 and Kafka ",
		};

		if (snapshotStatus.E1.Kafka.length > 0 && snapshotStatus.E1.Kafka[0].Connection >= 1) {
			kafka.status = "OK";
		} else {
			kafka.status = "NotOK";
			general = false;
		}
		kafka.message = kafka.message + kafka.status;
		result.data.push(kafka);

		if (snapshotStatus.E1.DbPool.length > 0)
		{
			snapshotStatus.E1.DbPool.forEach((element) => {
				let status = element.AvailableConnectionsCount >= element.MinPoolSize;
				general = general && status;
				let statusString = status ? "OK" : "NotOK";
				let state = {
					name: element.PoolId,
					status: statusString,
					message: "Connection pool " + element.PoolId + " is " + statusString,
				};
				result.data.push(state);
			});
		} else {
			general = false;
		}
		general = general && snapshotStatus.E1.State === "Started";

		result.status = general ? "OK" : "NotOk";
	}
	res.send(result);
});

router.get("/omsproxy/status/EOMS2", (req, res) => {
	let result = {
		status: "NotOK",
		version: "V1",
		messageDate: getCurrentDateTime(),
		data: [],
	};

	let general = true;

	if (snapshotStatus.E2.Fix.length === 0) {
		general = false;
	} else {
		snapshotStatus.E2.Fix.forEach((element) => {
			general = general && element.State === "true";
			let statusString = element.State === "true" ? "OK" : "NotOk";
			let state = {
				name: element.SessionID,
				status: statusString,
				message: "Connection " + element.SessionID + " " + statusString,
			};
			result.data.push(state);
		});

		let kafka = {
			name: "E2 -> Kafka",
			status: "",
			message: "Connection between E2 and Kafka ",
		};

		if (snapshotStatus.E2.Kafka.length > 0 && snapshotStatus.E2.Kafka[0].Connection >= 1) {
			kafka.status = "OK";
		} else {
			kafka.status = "NotOK";
			general = false;
		}
		kafka.message = kafka.message + kafka.status;
		result.data.push(kafka);

		if (snapshotStatus.E2.DbPool.length > 0)
		{
			snapshotStatus.E2.DbPool.forEach((element) => {
				let status = element.AvailableConnectionsCount >= element.MinPoolSize;
				general = general && status;
				let statusString = status ? "OK" : "NotOK";
				let state = {
					name: element.PoolId,
					status: statusString,
					message: "Connection pool " + element.PoolId + " is " + statusString,
				};
				result.data.push(state);
			});
		} else {
			general = false;
		}

		general = general && snapshotStatus.E2.State === "Started";

		result.status = general ? "OK" : "NotOk";
	}
	res.send(result);
});

router.get("/omsproxy/status/IOMS1", (req, res) => {
	let result = {
		status: "NotOK",
		version: "V1",
		messageDate: getCurrentDateTime(),
		data: [],
	};

	let general = true;

	if (snapshotStatus.I1.Fix.length === 0) {
		general = false;
	} else {
		snapshotStatus.I1.Fix.forEach((element) => {
			general = general && element.State === "true";
			let statusString = element.State === "true" ? "OK" : "NotOk";
			let state = {
				name: element.RouteId,
				status: statusString,
				message: "Connection " + element.RouteId + " " + statusString,
			};
			result.data.push(state);
		});

		if (snapshotStatus.I1.DbPool.length > 0)
		{
			snapshotStatus.I1.DbPool.forEach((element) => {
				let status = element.AvailableConnectionsCount >= element.MinPoolSize;
				general = general && status;
				let statusString = status ? "OK" : "NotOK";
				let state = {
					name: element.PoolId,
					status: statusString,
					message: "Connection pool " + element.PoolId + " is " + statusString,
				};
				result.data.push(state);
			});
		} else {
			general = false;
		}

		general = general && snapshotStatus.I1.State === "Started";
		result.status = general ? "OK" : "NotOk";
	}
	res.send(result);
});

router.get("/omsproxy/status/IOMS2", (req, res) => {
	let result = {
		status: "NotOK",
		version: "V1",
		messageDate: getCurrentDateTime(),
		data: [],
	};

	let general = true;

	if (snapshotStatus.I2.Fix.length === 0) {
		general = false;
	} else {
		snapshotStatus.I2.Fix.forEach((element) => {
			general = general && element.State === "true";
			let statusString = element.State === "true" ? "OK" : "NotOk";
			let state = {
				name: element.RouteId,
				status: statusString,
				message: "Connection " + element.RouteId + " " + statusString,
			};
			result.data.push(state);
		});

		if (snapshotStatus.I2.DbPool.length > 0)
		{
			snapshotStatus.I2.DbPool.forEach((element) => {
				let status = element.AvailableConnectionsCount >= element.MinPoolSize;
				general = general && status;
				let statusString = status ? "OK" : "NotOK";
				let state = {
					name: element.PoolId,
					status: statusString,
					message: "Connection pool " + element.PoolId + " is " + statusString,
				};
				result.data.push(state);
			});
		} else {
			general = false;
		}

		general = general && snapshotStatus.I2.State === "Started";
		result.status = general ? "OK" : "NotOk";
	}
	res.send(result);
});

router.get("/omsproxy/status/OMSService1", (req, res) => {
	let result = {
		status: "NotOK",
		version: "V1",
		messageDate: getCurrentDateTime(),
		data: [],
	};

	let general = true;

	let db = {
		name: "OMSService1 -> DB",
		status: "",
		message: "Connection between OMSService1 and DB ",
	};
		
	if (snapshotStatus.OMSService1.DbPool.length > 0)
	{
		let status = true;
		snapshotStatus.OMSService1.DbPool.forEach((element) => {
			status = status && element.AvailableConnectionsCount >= element.MinPoolSize;
			general = general && status;
		});
		db.status = status ? "OK": "NotOK";
	} else {
		db.status = "NotOK";
		general = false;
	}

	db.message = db.message + db.status;
	result.data.push(db);

	general = general && snapshotStatus.OMSService1.State === "Started";
	result.status = general ? "OK" : "NotOk";

	res.send(result);
});

router.get("/omsproxy/status/OMSService2", (req, res) => {
	let result = {
		status: "NotOK",
		version: "V1",
		messageDate: getCurrentDateTime(),
		data: [],
	};
	let general = true;

	let db = {
		name: "OMSService2 -> DB",
		status: "",
		message: "Connection between OMSService2 and DB ",
	};
		
	if (snapshotStatus.OMSService2.DbPool.length > 0)
	{
		let status = true;
		snapshotStatus.OMSService2.DbPool.forEach((element) => {
			status = status && element.AvailableConnectionsCount >= element.MinPoolSize;
			general = general && status;
		});
		db.status = status ? "OK": "NotOK";
	} else {
		db.status = "NotOK";
		general = false;
	}

	db.message = db.message + db.status;
	result.data.push(db);

	general = general && snapshotStatus.OMSService2.State === "Started";
	result.status = general ? "OK" : "NotOk";

	res.send(result);
});

router.get("/omsproxy/status/BOSync", (req, res) => {
	let result = {
		status: "NotOK",
		version: "V1",
		messageDate: getCurrentDateTime(),
		data: [],
	};	
	let state = {
		name: "BOSync State",
		status: "",
		message: "",
	};
	state.status = snapshotStatus.BO.State === "Started" ? "OK" : "NotOk";
	state.message = snapshotStatus.BO.State === "Started" ? "BoSync is available" : "BoSync is not available";

	result.status = snapshotStatus.BO.State === "Started" ? "OK" : "NotOk";
	result.data.push(state);

	res.send(result);
});

router.get("/omsproxy/status/OMSSync", (req, res) => {
	let result = {
		status: "NotOK",
		version: "V1",
		messageDate: getCurrentDateTime(),
		data: [],
	};

	let state = {
		name: "OMSSync State",
		status: "",
		message: "",
	};
	state.status = snapshotStatus.ORS.State === "Started" ? "OK" : "NotOk";
	state.message = snapshotStatus.ORS.State === "Started" ? "OMSSync is available" : "OMSSync is not available";

	result.status = snapshotStatus.ORS.State === "Started" ? "OK" : "NotOk";
	result.data.push(state);

	res.send(result);
});

// router.get("/omsproxy/status/MOMS", (req, res) => {
// 	let result = {
// 		status: "NotOK",
// 		version: "V1",
// 		messageDate: getCurrentDateTime(),
// 		data: [],
// 	};
//
// 	let state = {
// 		name: "Kafka connection",
// 		status: "",
// 		message: "",
// 	};
// 	state.status = snapshotStatus.MOMS.KafkaState === "Started" ? "OK" : "NotOk";
// 	state.message = snapshotStatus.MOMS.KafkaState === "Started" ? "Kafka connection is available" : "Kafka connection is not available";
//
// 	result.status = ((snapshotStatus.MOMS.KafkaState === "Started") &&
// 		(snapshotStatus.MOMS.State === "Started"))? "MOMS is OK" : "MOMS is notOK";
// 	result.data.push(state);
//
// 	res.send(result);
// });

router.get("/omsproxy/status/ORDERCACHE", (req, res) => {
	let result = {
		status: "NotOK",
		version: "V1",
		messageDate: getCurrentDateTime(),
		data: [],
	};

	let state = {
		name: "Kafka connection",
		status: "",
		message: "",
	};
	state.status = snapshotStatus.ORDERCACHE.KafkaState === "Started" ? "OK" : "NotOk";
	state.message = snapshotStatus.ORDERCACHE.KafkaState === "Started" ? "Kafka connection is available" : "Kafka connection is not available";

	result.status = ((snapshotStatus.ORDERCACHE.KafkaState === "Started") &&
		(snapshotStatus.ORDERCACHE.State === "Started"))? "ORDERCACHE is OK" : "ORDERCACHE is notOK";
	result.data.push(state);

	res.send(result);
});

router.get("/omsproxy/status/ENGINE", (req, res) => {
	console.log('Here')
	let result = {
		status: "NotOK",
		version: "V1",
		messageDate: getCurrentDateTime(),
		data: [],
	};

	let general = true;

	if (snapshotStatus.ENGINE.length === 0) {
		general = false;
	} else {
		for (const [key, value] of Object.entries(snapshotStatus.ENGINE)) {
			general = general && value === "true";
			let statusString = value === "true" ? "OK" : "NotOk";
			let state = {
				name: key,
				status: statusString,
				message: "Connection to " + key + " " + statusString,
			};
			result.data.push(state);
		}
		result.status = general ? "OK" : "NotOk";
	}
	res.send(result);
});
// router.get("/omsproxy/status/ENGINEBANKAPI", (req, res) => {
// 	console.log('Here')
// 	let result = {
// 		status: "NotOK",
// 		version: "V1",
// 		messageDate: getCurrentDateTime(),
// 		data: [],
// 	};
//
// 	let general = true;
//
// 	if (snapshotStatus.ENGINEBANKAPI.length === 0) {
// 		general = false;
// 	} else {
// 		for (const [key, value] of Object.entries(snapshotStatus.ENGINEBANKAPI)) {
// 			general = general && value === "true";
// 			let statusString = value === "true" ? "OK" : "NotOk";
// 			let state = {
// 				name: key,
// 				status: statusString,
// 				message: "Connection to " + key + " " + statusString,
// 			};
// 			result.data.push(state);
// 		}
// 		result.status = general ? "OK" : "NotOk";
// 	}
// 	res.send(result);
// });

router.get("/omsproxy/status/DB", (req, res) => {
  console.log('Here')
	let result = {
		status: "NotOK",
		version: "V1",
		messageDate: getCurrentDateTime(),
		data: [],
	};

	let general = true;

	if (snapshotStatus.DB.length === 0) {
		general = false;
	} else {
		for (const [key, value] of Object.entries(snapshotStatus.DB)) {
			general = general && value === "true";
			let statusString = value === "true" ? "OK" : "NotOk";
			let state = {
				name: key,
				status: statusString,
				message: "Connection to " + key + " " + statusString,
			};
			result.data.push(state);
		}
		result.status = general ? "OK" : "NotOk";
	}
	res.send(result);
});

router.get("/omsproxy/checkOrder", async (req, res) => {
	let result = true;
	var cancelData = {data: {
		accountNo:'',
		isForced: 'N',
		orderID:'',
		userCustID: 'OmsAdmin',
		via: 'F'
	}};
	//Get data from config file
	const configFile = require("../ConfigOrder.json");
	for (element of configFile.orders) {
		let url = process.env.OMS1 + "oms-api/instruments?symbol=" + element.symbol;
		let resPrice = await axios.get(url);
		//Get floor price
		let price = resPrice.data.floorPrice;
		//Call API for create order
		url = process.env.E1API + "accounts/" + element.accountNo + "/orders";
		element.price = price;
		var date = new Date();
		let dateString =  date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2) + ("0" + date.getHours() ).slice(-2) + ("0" + date.getMinutes()).slice(-2) + ("0" + date.getSeconds()).slice(-2);
	
		element.clordID = 'Admin' + dateString;
		const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
		//If one order cannot place: return false and break the process
		try {
			resPrice = await axios.post(url, element);			
			await delay(1000);
			//Call cancel order
			let cancelUrl = process.env.E1API + "accounts/" + element.accountNo + "/orders/" + resPrice.data.orderID;
			cancelData.data.accountNo = element.accountNo;
			cancelData.data.orderID = resPrice.data.orderID;
			cancelData.data.userCustID = element.accountNo;
			let resCancel = await axios.delete(cancelUrl,cancelData);
		} catch (error) {
			result = false; 
			break;
		}
	}
	res.send(result);
});

router.get("/omsproxy/clearMsgTypeLog", async (req, res) => {
	let result = true;	
	try {
		let url = process.env.OMS1 + "oms-api/msgtypelog";
		await axios.delete(url);
	} catch (error) {
		result = false;
	}	
	res.send(result);
});

router.get("/omsproxy/getConfigTimeout", async (req, res) => {
	let result = 10000;
	try {
		result = process.env.TIMEOUT
	} catch (error) {
		result = 10000;
	}
	res.send(result);
});
//
router.get("/omsproxy/getTotalCount", async (req, res) => {
	//let result = true;
	//Get data from config file
	const configFile = require("../ConfigTradeApi.json");
	let result = {
		data: [],
	};
	for (element of configFile.tradeApiList) {
		try
		{
			let url = element.ref;
			let tradeApiAccount = await axios.get(url);
			let accountNumber = tradeApiAccount.data.totalCount;

			let res = {
				tradeApi: element.name,
				accountNo: accountNumber,
			};
			result.data.push(res);
		}
		catch (error) {}
	}
	res.send(result);
});

exports.statusSplit = router;