import { handleErrorAxios, kaxios } from './axios';
import { Constant } from './Consant';
import { probe } from '@network-utils/tcp-ping'

const getEState = (server: string) => {
  let message = {
    type: 'read',
    mbean:
      'org.apache.camel:context=E-ORS-BusSystemMain,name="netty-http",type=components',
  };
  return SendPostMessage(server, message);
};

const getFixConnectionForE = (server: string, name: string) => {
  let message = {
    type: 'read',
    mbean:
      'org.quickfixj:beginString=FIX.4.4,senderCompID=' +
      name +
      ',*,type=Session',
  };
  return SendPostMessage(server, message);
};

const getKafkaConnectionForE = (server: string) => {
  let message = {
    type: 'read',
    mbean: 'kafka.producer:client-id=*,type=producer-metrics',
  };
  return SendPostMessage(server, message);
};

const SendPostMessage = (server: string, message: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.post(
        Constant.getInstance().proxy + '/omsproxy/' + server + '/jolokia',
        message,
        {
          auth: {
            username: 'karaf',
            password: 'karaf',
          },
        }
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

const getIState = (server: string) => {
  let message = {
    type: 'read',
    mbean:
      'org.apache.camel:context=i-ors-IORSMain,name="netty-http",type=components',
  };
  return SendPostMessage(server, message);
};

const getFixConnectionForI = (server: string, name: string) => {
  {
    let message = {
      type: 'read',
      mbean: 'org.apache.camel:context=i-ors-IORSFIX,*,type=consumers',
    };
    return SendPostMessage(server, message);
  }
};

const checkServiceAvailable = async (server: string, port: number) => {
  let m = 'UnAvailable';
  probe(port, server, 1500).then(hostReachable => {
    if (hostReachable) m = 'Available';
  })
  return m;
}

const getStatus = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy + '/omsproxy/status',
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

const placeCheckOrders = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy + '/omsproxy/checkOrder',
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
}

const clearMsgTypeLog = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy + '/omsproxy/clearMsgTypeLog',
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
}

//Update exchange status
const pushOrderBoD = (exchange: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.post(
        Constant.getInstance().proxy + '/omsproxy/i2api' + `/admin/session`,
        {
          exchange: exchange,
          sessionEx: 'RECV',
        }
      );

      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

// on m-moms market message
const placeOnMarketMsg = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.post(
        Constant.getInstance().proxy + '/omsproxy/oms1' + `/oms-api/admin/market`,
        {isUpdate : true}
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
}

// off m-moms market message
const placeOffMarketMsg = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.post(
        Constant.getInstance().proxy + '/omsproxy/oms1' + `/oms-api/admin/market`,
        {isUpdate : false}
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
}

// check m-moms market message
const checkMarketStatus = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy + '/omsproxy/oms1' + `/oms-api/admin/market`,
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
}

// on Kafka2BO
const placeOnKafka2BO = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.post(
        Constant.getInstance().proxy + '/omsproxy/BOSync' + `/jolokia`,
        {
          "type":"EXEC",
          "mbean":"org.apache.camel:context=bo-oms-IORSFIX,type=routes,name=\"Kafka2BO\"",
          "operation":"start()"
        }
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
}

// off Kafka2BO
const placeOffKafka2BO = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.post(
        Constant.getInstance().proxy + '/omsproxy/BOSync' + `/jolokia`,
        {
          "type":"EXEC",
          "mbean":"org.apache.camel:context=bo-oms-IORSFIX,type=routes,name=\"Kafka2BO\"",
          "operation":"stop()"
        }
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
}

// check Kafka2BO
const checkKafka2BOStatus = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.post(
        Constant.getInstance().proxy + '/omsproxy/BOSync' + `/jolokia`,
        {
          "type":"EXEC",
          "mbean":"org.apache.camel:context=bo-oms-IORSFIX,type=routes,name=\"Kafka2BO\"",
          "operation":"getState()"
        }
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
}

// get block order event status
const getOrderEventStatus = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy + '/omsproxy/boapi' + `/oms-api/admin/config/orderevent`,
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
}

// block order event
const blockOrderEvent = (status: boolean) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.post(
        Constant.getInstance().proxy + '/omsproxy/boapi' + `/oms-api/admin/config/orderevent`,
        {status: status}
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
}

// count message order error
const countMessageError = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy + '/omsproxy/oms2/oms-api/admin/msglog-error'
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
}

// count message error
const countMessageOrderError = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy + '/omsproxy/oms2/oms-api/admin/order-msglog-error'
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
}

const getAlert = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let origin = Constant.getInstance().proxy + "/omsproxy/alert"
      let res = await kaxios.get(
        origin + "/api/v2/alerts",
      );
      console.log(res.data)
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
}

// get receive sec status
const getReceiveSecStatus = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy + '/omsproxy/oms1' + `/oms-api/admin/receiv-secstatus`,
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
}

// update receive sec status
// const updateReceiveSecStatus = (value: string) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       let res = await kaxios.post(
//         Constant.getInstance().proxy + '/omsproxy/oms1' + `/oms-api/update/sysconfig`,
//         {
//           desc: "",
//           key: "IS_START_AUTOSETTLEMENT",
//           value: value
//         }
//       );
//       resolve(res.data);
//     } catch (error) {
//       handleErrorAxios(reject, error);
//     }
//   });
// }
const updateReceiveSecStatus = (type: string) => {
  return new Promise(async (resolve, reject) => {
    let endpoint = '';
    if (type === 'sec') {
      endpoint = '/oms-api/auto-settlement';
    } else {
      endpoint = '/oms-api/auto-settlement-bond';
    }
    try {
      let res = await kaxios.post(
        Constant.getInstance().proxy + '/omsproxy/oms1' + endpoint);
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
}


export {
  getEState,
  getFixConnectionForE,
  getKafkaConnectionForE,
  getIState,
  getFixConnectionForI,
  checkServiceAvailable,
  getStatus,
  placeCheckOrders,
  getAlert,
  clearMsgTypeLog,
  pushOrderBoD,
  placeOnMarketMsg,
  placeOffMarketMsg,
  checkMarketStatus,
  placeOnKafka2BO,
  placeOffKafka2BO,
  checkKafka2BOStatus,
  countMessageError,
  countMessageOrderError,
  getOrderEventStatus,
  getReceiveSecStatus,
  updateReceiveSecStatus,
  blockOrderEvent
};
