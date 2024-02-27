const axios = require("axios");
const tcpp = require("tcp-ping");

const fetchStatusData = (snapshotStatus, snapshotStatusProm) => {

	const configFile = require("./Connection.json");
	let i1toE = "";
	let i2toE = "";
	let i1toGW= "";
	let i2toGW = "";
	let senderCompID1 = "";
	let senderCompID2 = "";
	for (element of configFile.fixConnection) {
		if (element.server === "I1"){
			i1toE = element.sender2E.toString();
			i1toGW = element.sender2GW.toString();
		}
		if (element.server === "I2"){
			i2toE = element.sender2E.toString();
			i2toGW = element.sender2GW.toString();
		}
		if (element.server === "E1"){
			senderCompID1 = element.senderCompID.toString();
		}
		if (element.server === "E2"){
			senderCompID2 = element.senderCompID.toString();
		}
	}

	getEState("E1")
		.then((data) => {
			snapshotStatus.E1.State = data.value.State;
			snapshotStatusProm.state.labels("E1").set(data.value.State === "Started" ? 1 : 0);
		})
		.catch((e) => {
			snapshotStatus.E1.State = "none";
			snapshotStatusProm.state.labels("E1").set(0);
		});

	getFixConnectionForE("E1", senderCompID1)
		.then((data) => {
			data = data.value;
			let rs = Object.keys(data).map((key) => {
				snapshotStatusProm.fix.labels("E1", data[key].SessionID).set(data[key].LoggedOn ? 1 : 0);
				return {
					SessionID: data[key].SessionID,
					State: data[key].LoggedOn.toString(),
				};
			});
			snapshotStatus.E1.Fix = rs;
		})
		.catch((e) => {
			snapshotStatus.E1.Fix = [];
			snapshotStatusProm.fix.set(0);
		});

	getKafkaConnectionForE("E1")
		.then((data) => {
			data = data.value;
			rs = Object.keys(data).map((key) => {
        snapshotStatusProm.kafka.labels("E1").set(data[key]["connection-count"])
				return {
					Connection: data[key]["connection-count"],
				};
			});
			snapshotStatus.E1.Kafka = rs;
		})
		.catch((e) => {
			snapshotStatus.E1.Kafka = [];
      snapshotStatusProm.kafka.labels("E1").set(0);
		});
	
	getDBConnectionPoolState("E1")
	.then((data) => {
		data = data.value;
		rs = Object.keys(data).map((key) => {
			snapshotStatusProm.db.labels("E1", 
				data[key].poolName).set(data[key].availableConnectionsCount >= data[key].minPoolSize ? 1 : 0);
			return {
				PoolId: data[key].poolName,
				AvailableConnectionsCount: data[key].availableConnectionsCount,
				MinPoolSize: data[key].minPoolSize,
			};
		});
		snapshotStatus.E1.DbPool = rs;
	})
	.catch((e) => {
		snapshotStatus.E1.DbPool = [];
		snapshotStatusProm.db.labels("E1").set(0);
	});

	//E2
	getEState("E2")
	.then((data) => {
		snapshotStatus.E2.State = data.value.State;
		snapshotStatusProm.state.labels("E2").set(data.value.State === "Started" ? 1 : 0);
	})
	.catch((e) => {
		snapshotStatus.E2.State = "none";
		snapshotStatusProm.state.labels("E2").set(0);
	});

	getFixConnectionForE("E2", senderCompID2)
	.then((data) => {
		data = data.value;
		let rs = Object.keys(data).map((key) => {
		snapshotStatusProm.fix.labels("E2", data[key].SessionID).set(data[key].LoggedOn ? 1 : 0);
		return {
			SessionID: data[key].SessionID,
			State: data[key].LoggedOn.toString(),
		};
		});
		snapshotStatus.E2.Fix = rs;
	})
	.catch((e) => {
		snapshotStatus.E2.Fix = [];
		snapshotStatusProm.fix.set(0);
	});

	getKafkaConnectionForE("E2")
	.then((data) => {
		data = data.value;
		rs = Object.keys(data).map((key) => {
		snapshotStatusProm.kafka.labels("E2").set(data[key]["connection-count"])
		return {
			Connection: data[key]["connection-count"],
		};
		});
		snapshotStatus.E2.Kafka = rs;
	})
	.catch((e) => {
		snapshotStatus.E2.Kafka = [];
		snapshotStatusProm.kafka.labels("E2").set(0);
	});

	getDBConnectionPoolState("E2")
	.then((data) => {
		data = data.value;
		rs = Object.keys(data).map((key) => {
			snapshotStatusProm.db.labels("E2", 
				data[key].poolName).set(data[key].availableConnectionsCount >= data[key].minPoolSize ? 1 : 0);
			return {
				PoolId: data[key].poolName,
				AvailableConnectionsCount: data[key].availableConnectionsCount,
				MinPoolSize: data[key].minPoolSize,
			};
		});
		snapshotStatus.E2.DbPool = rs;
	})
	.catch((e) => {
		snapshotStatus.E2.DbPool = [];
		snapshotStatusProm.db.set(0);
	});

	//I1
	getIState("I1")
		.then((data) => {
			snapshotStatus.I1.State = data.value.State;
      snapshotStatusProm.state.labels("I1").set(data.value.State === "Started" ? 1 : 0);
		})
		.catch((e) => {
			snapshotStatus.I1.State = "none";
      snapshotStatusProm.state.labels("I1").set(0);
		});

	getFixConnectionForI("I1", i1toE, i1toGW)
		.then((data) => {
			data = data.value;
			let rs = Object.keys(data).map((key) => {
				snapshotStatusProm.fix.labels("I1", data[key].SessionID).set(data[key].LoggedOn ? 1 : 0);
				return {
					SessionID: data[key].SessionID,
					State: data[key].LoggedOn.toString(),
				};
			});
			snapshotStatus.I1.Fix = rs;
		})
		.catch((e) => {
			snapshotStatus.I1.Fix = [];
			snapshotStatusProm.fix.set(0);
		});

	getDBConnectionPoolState("I1")
	.then((data) => {
		data = data.value;
		rs = Object.keys(data).map((key) => {
			snapshotStatusProm.db.labels("I1", 
				data[key].poolName).set(data[key].availableConnectionsCount >= data[key].minPoolSize ? 1 : 0);
			return {
				PoolId: data[key].poolName,
				AvailableConnectionsCount: data[key].availableConnectionsCount,
				MinPoolSize: data[key].minPoolSize,
			};
		});
		snapshotStatus.I1.DbPool = rs;
	})
	.catch((e) => {
		snapshotStatus.I1.DbPool = [];
		snapshotStatusProm.db.set(0);
	});

	//I2
	getIState("I2")
	.then((data) => {
		snapshotStatus.I2.State = data.value.State;
		snapshotStatusProm.state.labels("I2").set(data.value.State === "Started" ? 1 : 0);
	})
	.catch((e) => {
		snapshotStatus.I2.State = "none";
		snapshotStatusProm.state.labels("I2").set(0);
	});

	getFixConnectionForI("I2", i1toE, i2toGW)
		.then((data) => {
			data = data.value;
			let rs = Object.keys(data).map((key) => {
				snapshotStatusProm.fix.labels("I2", data[key].SessionID).set(data[key].LoggedOn ? 1 : 0);
				return {
					SessionID: data[key].SessionID,
					State: data[key].LoggedOn.toString(),
				};
			});
			snapshotStatus.I2.Fix = rs;
		})
		.catch((e) => {
			snapshotStatus.I2.Fix = [];
			snapshotStatusProm.fix.set(0);
		});

	getDBConnectionPoolState("I2")
	.then((data) => {
		data = data.value;
		rs = Object.keys(data).map((key) => {
			snapshotStatusProm.db.labels("I2", 
				data[key].poolName).set(data[key].availableConnectionsCount >= data[key].minPoolSize ? 1 : 0);
			return {
				PoolId: data[key].poolName,
				AvailableConnectionsCount: data[key].availableConnectionsCount,
				MinPoolSize: data[key].minPoolSize,
			};
		});
		snapshotStatus.I2.DbPool = rs;
	})
	.catch((e) => {
		snapshotStatus.I2.DbPool = [];
		snapshotStatusProm.db.set(0);
	});

	axios.get(process.env.OMS1 + "oms-api/admin/process_msg").then(({ data }) => {
		let d = data.ref_cursor;
		snapshotStatusProm.processApps.labels("E-OMS").set(0);
		snapshotStatusProm.processApps.labels("I-OMS").set(0);
		snapshotStatusProm.processApps.labels("OMS-Sync").set(0);
		snapshotStatusProm.processApps.labels("BO-Sync").set(0);
		let bosync_count = 0;
		axios.get(process.env.BOAPI + "oms-api/admin/msg2oms/process_msg").then(({ data }) => {
			let d = data.ref_cursor;
			d.forEach((e) => {
				if (e.app_process === "BO-Sync") {
					bosync_count += e.num_process;
				}
			});
		});

		d.forEach((e) => {
			if (e.app_process === "E-OMS") {
				snapshotStatusProm.processApps.labels("E-OMS").set(e.num_process);
			} else if (e.app_process === "I-OMS") {
				snapshotStatusProm.processApps.labels("I-OMS").set(e.num_process);
			} else if(e.app_process === "OMS-Sync"){
        		snapshotStatusProm.throughput.labels("OMS-Sync").set(e.num_process);
		    }
		});

		snapshotStatusProm.processApps.labels("BO-Sync").set(bosync_count);
		
	}).catch(e => {
		snapshotStatusProm.processApps.labels("E-OMS").set(0);
		snapshotStatusProm.processApps.labels("I-OMS").set(0);
		snapshotStatusProm.processApps.labels("OMS-Sync").set(0);
		snapshotStatusProm.processApps.labels("BO-Sync").set(0);
  	});

  // Get data chart
  axios.get(process.env.OMS1 + "oms-api/admin/order/status").then(({ data }) => {
		let d = data.ref_cursor;
		snapshotStatusProm.throughput.labels("PendingNew").set(0);
		snapshotStatusProm.throughput.labels("New").set(0);
		snapshotStatusProm.throughput.labels("Filled").set(0);
		let filled = 0;
		let pendingNew = 0;
		d.forEach((e) => {
			if (e.orderStatus === "PendingNewBB" || e.orderStatus === "PendingNewNN" || e.orderStatus === "PendingNewQQ") {
				pendingNew += e.orderNum;
				
			} else if (e.orderStatus === "PartiallyFilled" || e.orderStatus === "Filled") {
				filled += e.orderNum;
			} else if(e.orderStatus === "New"){
        		snapshotStatusProm.throughput.labels("New").set(e.orderNum);
		    }
		});
		snapshotStatusProm.throughput.labels("Filled").set(filled);
		snapshotStatusProm.throughput.labels("PendingNew").set(pendingNew);
	}).catch(e => {
		snapshotStatusProm.throughput.labels("PendingNew").set(0);
		snapshotStatusProm.throughput.labels("New").set(0);
		snapshotStatusProm.throughput.labels("Filled").set(0);
  });

	//BO-ORS
	getBOState("BOSync")
		.then((data) => {
			snapshotStatus.BO.State = data.value.State;
            snapshotStatusProm.state.labels("BO-ORS").set(data.value.State === 'Started' ? 1 : 0)
		})
		.catch((e) => {
			snapshotStatus.BO.State = "none";
			snapshotStatusProm.state.labels("BO-ORS").set(0)
		});

	getBoKafkaState("BOSync")
	.then((data) => {
		snapshotStatus.BO.KafkaState = data.value.State;
		snapshotStatusProm.kafka.labels("BO-ORS").set(data.value.State === "Started" ? 1 : 0);
	})
	.catch((e) => {
		snapshotStatus.BO.KafkaState = "none";
		snapshotStatusProm.kafka.labels("BO-ORS").set(0);
	});

	//ORS-Sync
	getORSState("ORSSync")
		.then((data) => {
			snapshotStatus.ORS.State = data.value.State;
            snapshotStatusProm.state.labels("ORS-Sync").set(data.value.State === 'Started' ? 1 : 0)
		})
		.catch((e) => {
			snapshotStatus.ORS.State = "none";
			snapshotStatusProm.state.labels("ORS-Sync").set(0)
		});
	
	getORSKafkaState("ORSSync")
	.then((data) => {
		snapshotStatus.ORS.KafkaState = data.value.State;
		snapshotStatusProm.kafka.labels("ORS-Sync").set(data.value.State === "Started" ? 1 : 0);
	})
	.catch((e) => {
		snapshotStatus.ORS.KafkaState = "none";
		snapshotStatusProm.kafka.labels("ORS-Sync").set(0);
	});
	//OMSService1
	getOMSServiceState("OMSService1")
		.then((data) => {
			snapshotStatus.OMSService1.State = data.value.State;
      snapshotStatusProm.state.labels("OMSService1").set(data.value.State === "Started" ? 1 : 0);
		})
		.catch((e) => {
			snapshotStatus.OMSService1.State = "none";
			snapshotStatusProm.state.labels("OMSService1").set(0);
		});
	
	getDBConnectionPoolState("OMSService1")
	.then((data) => {
		data = data.value;
		rs = Object.keys(data).map((key) => {
			snapshotStatusProm.db.labels("OMSService1", 
				data[key].poolName).set(data[key].availableConnectionsCount >= data[key].minPoolSize ? 1 : 0);
			return {
				PoolId: data[key].poolName,
				AvailableConnectionsCount: data[key].availableConnectionsCount,
				MinPoolSize: data[key].minPoolSize,
			};
		});
		snapshotStatus.OMSService1.DbPool = rs;
	})
	.catch((e) => {
		snapshotStatus.OMSService1.DbPool = [];
		snapshotStatusProm.db.set(0);
	});

	//OMSService2
	getOMSServiceState("OMSService2")
		.then((data) => {
			snapshotStatus.OMSService2.State = data.value.State;
      snapshotStatusProm.state.labels("OMSService2").set(data.value.State === "Started" ? 1 : 0);
		})
		.catch((e) => {
			snapshotStatus.OMSService2.State = "none";
			snapshotStatusProm.state.labels("OMSService2").set(0);
		});

	getDBConnectionPoolState("OMSService2")
	.then((data) => {
		data = data.value;
		rs = Object.keys(data).map((key) => {
			snapshotStatusProm.db.labels("OMSService2", 
				data[key].poolName).set(data[key].availableConnectionsCount >= data[key].minPoolSize ? 1 : 0);
			return {
				PoolId: data[key].poolName,
				AvailableConnectionsCount: data[key].availableConnectionsCount,
				MinPoolSize: data[key].minPoolSize,
			};
		});
		snapshotStatus.OMSService2.DbPool = rs;
	})
	.catch((e) => {
		snapshotStatus.OMSService2.DbPool = [];
		snapshotStatusProm.db.set(0);
	});

    let DB1 = process.env.DB1;
    let DB2 = process.env.DB2;
    let DB3 = process.env.DB3;
    let ENGINE = process.env.ENGINE;
    // let ENGINEBANKAPI = process.env.ENGINEBANKAPI;
	// if (ConnectDB("", "", "") === 1) {
    // snapshotStatusProm.state.labels(DB1).set(1);
	// 	snapshotStatus.DB[DB1] = "true";
	// } else {
    // snapshotStatusProm.state.labels(DB1).set(0);
	// 	snapshotStatus.DB[DB1] = "false";
	// }
	//Ping service
	tcpp.probe(DB1, 1521, function (err, available) {
		if (available) {
			snapshotStatus.DB[DB1] = "true";
			snapshotStatusProm.state.labels(DB1).set(1);
		} else {
            snapshotStatusProm.state.labels(DB1).set(0);
			snapshotStatus.DB[DB1] = "false";
		}
	});
	tcpp.probe(DB2, 1521, function (err, available) {
		if (available) {
			snapshotStatus.DB[DB2] = "true";
            snapshotStatusProm.state.labels(DB2).set(1);
		} else {
            snapshotStatusProm.state.labels(DB2).set(0);
			snapshotStatus.DB[DB2] = "false";
		}
	});
	tcpp.probe(DB3, 1521, function (err, available) {
		if (available) {
			snapshotStatus.DB[DB3] = "true";
            snapshotStatusProm.state.labels(DB3).set(1);
		} else {
			snapshotStatus.DB[DB3] = "false";
            snapshotStatusProm.state.labels(DB3).set(0);
		}
	});
	tcpp.probe(ENGINE, 1997, function (err, available) {
		if (available) {
			snapshotStatus.ENGINE.State = "Started";
			snapshotStatusProm.state.labels("ENGINE").set(1);
		} else {
			snapshotStatus.ENGINE.State = "none";
			snapshotStatusProm.state.labels("ENGINE").set(0);
		}
	});
	// tcpp.probe(ENGINEBANKAPI, 8084, function (err, available) {
	// 	if (available) {
	// 		snapshotStatus.ENGINEBANKAPI[ENGINEBANKAPI] = "true";
	// 		snapshotStatusProm.state.labels(ENGINEBANKAPI).set(1);
	// 	} else {
	// 		snapshotStatus.ENGINEBANKAPI[ENGINEBANKAPI] = "false";
	// 		snapshotStatusProm.state.labels(ENGINEBANKAPI).set(1);
	// 	}
	// });

	// getMOMSState("MOMS")
	// 	.then((data) => {
	// 		snapshotStatus.MOMS.State = data.value.State;
	// 		snapshotStatusProm.state.labels("MOMS").set(data.value.State === "Started" ? 1 : 0);
	// 	})
	// 	.catch((e) => {
	// 		snapshotStatus.MOMS.State = "none";
	// 		snapshotStatusProm.state.labels("MOMS").set(0);
	// });
	//
	// getMOMSKafkaState("MOMS")
	// 	.then((data) => {
	// 		snapshotStatus.MOMS.KafkaState = data.value.State;
	// 		snapshotStatusProm.kafka.labels("MOMS").set(data.value.State === "Started" ? 1 : 0);
	// 	})
	// 	.catch((e) => {
	// 		snapshotStatus.MOMS.KafkaState = "none";
	// 		snapshotStatusProm.kafka.labels("MOMS").set(0);
	// });

	getORDERCACHEState("ORDERCACHE")
		.then((data) => {
			snapshotStatus.ORDERCACHE.State = data.value.State;
			snapshotStatusProm.state.labels("ORDERCACHE").set(data.value.State === "Started" ? 1 : 0);
		})
		.catch((e) => {
			snapshotStatus.ORDERCACHE.State = "none";
			snapshotStatusProm.state.labels("ORDERCACHE").set(0);
	});

	getORDERCACHEKafkaState("ORDERCACHE")
		.then((data) => {
			snapshotStatus.ORDERCACHE.KafkaState = data.value.State;
			snapshotStatusProm.kafka.labels("ORDERCACHE").set(data.value.State === "Started" ? 1 : 0);
		})
		.catch((e) => {
			snapshotStatus.ORDERCACHE.KafkaState = "none";
			snapshotStatusProm.kafka.labels("ORDERCACHE").set(0);
	});

	//Get values of pending messages in queue
	axios.get(process.env.BOAPI + "oms-api/admin/msg2oms/pending").then(({ data }) => {
		let d = data.ref_cursor;
		let pendingMessages = 0;
		let sentMessages = 0;
		d.forEach((e) => {
			pendingMessages += e.MSGPENDING;
			sentMessages += e.MSGSENT
		});
		snapshotStatusProm.throughput.labels("PendingMessage").set(pendingMessages);
		snapshotStatusProm.throughput.labels("SentMessage").set(sentMessages);
	}).catch(e => {
    snapshotStatusProm.throughput.labels("PendingMessage").set(0);
	snapshotStatusProm.throughput.labels("SentMessage").set(0);
  });

};

const getEState = (server) => {
	let message = {
		type: "read",
		mbean: 'org.apache.camel:context=e-oms-BusSystemAPI,name="netty-http",type=components',
	};
	return SendPostMessage(server, message);
};

const getOMSServiceState = (server) => {
	let message = {
		type: "read",
		mbean: 'org.apache.camel:context=oms-service-ORSServiceMain,name="netty-http",type=components',
	};
	return SendPostMessage(server, message);
};

const getFixConnectionForE = (server, name) => {
	let message = {
		type: "read",
		mbean: "org.quickfixj:beginString=FIX.4.4,senderCompID=" + name + ",*,type=Session",
	};
	return SendPostMessage(server, message);
};

const getKafkaConnectionForE = (server) => {
	let message = {
		type: "read",
		mbean: "kafka.producer:client-id=*,type=producer-metrics",
	};
	return SendPostMessage(server, message);
};

const SendPostMessage = (server, message) => {
	return new Promise(async (resolve, reject) => {
		try {
			let res = await axios.post(
				"http://localhost:13111/omsproxy/" + server + "/jolokia",
				message,
				{
					auth: {
						username: "karaf",
						password: "karaf",
					},
				}
			);
			resolve(res.data);
		} catch (error) {
			handleErrorAxios(reject, error);
		}
	});
};
const SendPostMessageForI = (server, msg2E, msg2GW) => {
	return new Promise(async (resolve, reject) => {
		try {
			let resE = await axios.post(
				"http://localhost:13111/omsproxy/" + server + "/jolokia",
				msg2E,
				{
					auth: {
						username: "karaf",
						password: "karaf",
					},
				}
			);
			let resGW = await axios.post(
				"http://localhost:13111/omsproxy/" + server + "/jolokia",
				msg2GW,
				{
					auth: {
						username: "karaf",
						password: "karaf",
					},
				}
			);
			// let arr = [];
			// arr.push(resE.data.value);
			// arr.push(resGW.data.value);
			// resGW.data.value = arr[0];
			resolve(resGW.data);
		} catch (error) {
			handleErrorAxios(reject, error);
		}
	});
};

const getIState = (server) => {
	let message = {
		type: "read",
		mbean: 'org.apache.camel:context=i-oms-IORSMain,name="netty-http",type=components',
	};
	return SendPostMessage(server, message);
};

const getFixConnectionForI = (server, sender2E, sender2GW) => {
	{
		let msg2E = {
			type: "read",
			mbean: "org.quickfixj:beginString=FIX.4.4,senderCompID=" + sender2E + ",*,type=Session",
		};
		let msg2GW = {
			type: "read",
			mbean: "org.quickfixj:beginString=FIX.4.4,senderCompID=" + sender2GW + ",*,type=Session",
		};
		return SendPostMessageForI(server, msg2E, msg2GW);
	}
};

const getBOState = (server) => {
	let message = {
		type: "read",
		mbean: 'org.apache.camel:context=bo-sync-IORSMain,name="netty-http",type=components',
	};
	return SendPostMessage(server, message);
};

const getORSState = (server) => {
	let message = {
		type: "read",
		mbean: 'org.apache.camel:context=oms-sync-OrsSyncMain,name="http",type=components',
	};
	return SendPostMessage(server, message);
};

const handleErrorAxios = (reject, error) => {
	if (error.response) {
		if (error.response.data.code) {
			let msg = `Code: ${error.response.data.code} Reason: ${error.response.data.reason}`;
			reject(msg);
		} else if (error.response.data.err_msg) {
			let msg = `Code: ${error.response.data.err_code} Reason: ${error.response.data.err_msg}`;
			reject(msg);
		} else {
			reject(error.response.status + ": " + error.response.statusText);
		}
	} else if (error.request) {
		if (error.code === "ECONNABORTED") {
			reject("Request timeout");
		} else {
			reject(error.request);
		}
	} else {
		reject("Error", error.message);
	}
};

// const getMOMSState = (server) => {
// 	let message = {
// 		type: "read",
// 		mbean: 'org.apache.camel:context=m-oms-MORSSystemMain,name="netty-http",type=components',
// 	};
// 	return SendPostMessage(server, message);
// };

const getORDERCACHEState = (server) => {
	let message = {
		type: "read",
		mbean:'org.apache.camel:context=camel-1,type=context,name="camel-1"',
	};
	return SendPostMessage(server, message);
};

//Connection to Kafka
const getBoKafkaState = (server) => {
	let message = {
		type: "read",
		mbean:'org.apache.camel:context=bo-sync-IORSFIX,type=components,name="kafka"',
	};
	return SendPostMessage(server, message);
};
const getORSKafkaState = (server) => {
	let message = {
		type: "read",
		mbean:'org.apache.camel:context=oms-sync-OrsSyncMain,type=components,name="kafka"',
	};
	return SendPostMessage(server, message);
};
// const getMOMSKafkaState = (server) => {
// 	let message = {
// 		type: "read",
// 		mbean:'org.apache.camel:context=m-oms-MORSSystemMain,type=components,name="kafka"',
// 	};
// 	return SendPostMessage(server, message);
// };
const getORDERCACHEKafkaState = (server) => {
	let message = {
		type: "read",
		mbean:'org.apache.camel:context=camel-1,type=context,name="camel-1"',
	};
	return SendPostMessage(server, message);
};

//Connection to DB
const getDBConnectionPoolState = (server) => {
	let message = {
		type: "read",
		mbean:'oracle.ucp.admin.UniversalConnectionPoolMBean:name=UniversalConnectionPoolManager*',
	};
	return SendPostMessage(server, message);
};

//OMS Service connection
const getBO2OMSState = (server) => {
	let message = {
		type: "read",
		mbean:'org.apache.camel:context=ors-service-ORSServiceMain,name=*10.*,type=endpoints',
	};
	return SendPostMessage(server, message);
};

exports.fetchData = fetchStatusData;
