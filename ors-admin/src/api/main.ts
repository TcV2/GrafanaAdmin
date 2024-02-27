// @ts-nocheck
import { BackendSrvRequest, getBackendSrv } from '@grafana/runtime';
import { handleErrorAxios, kaxios } from './axios';
import { Constant } from './Consant';

import axios from 'axios';
import { toast } from 'react-toastify';

let saxios = axios.create({
  timeout: 100000,
});

const checkAuthAPI = async (password: string) => {
  try {
    let res = await kaxios.get(window.location.origin + '/api/user', {
      auth: {
        username: Constant.getInstance().username,
        password,
      },
    });
    if (res.data.login === Constant.getInstance().username) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

//Get DS
const getDS = (key: string) => {
  console.log(key);
  return kaxios.get(window.location.origin + '/api/datasources/name/mainAPI', {
    headers: {
      Authorization: 'Bearer ' + key,
    },
  });
};

//Get order hist
const getOrderDetailAPI = (orderID: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy +
          '/omsproxy/oms1' +
          '/oms-api/admin/orderdetail/' +
          orderID
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

// Get msgLOG
const getMsgLog = (msgID: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy +
        '/omsproxy/boapi' +
        `/oms-api/admin/resend/order2bo?`+
        `msgId=${msgID}`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

//Remove order
const removeOrderAPI = (account: string, orderID: string, targetId: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      //Process base on targetId
      let endpoint = '/omsproxy/e1api';
      if(targetId === 'EORS.02'){
        endpoint = '/omsproxy/e2api';
      }
      let res = await kaxios.delete(
        Constant.getInstance().proxy +
          endpoint +
          '/accounts/' +
          account +
          '/orders/' +
          orderID,
        { data: { accountNo: account, orderID, isForced: 'N', via: 'F', userCustID: 'OmsAdmin'} }
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
  // return doReq(
  //   '/accounts/' + account + '/orders/' + orderID,
  //   'DELETE',
  //   Constant.getInstance().type,
  //   {
  //     accountNo: account,
  //     orderID,
  //     isForced: 'N',
  //   }
  // );
};

//Edit order
const editOrderAPI = (data: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      //Process base on targetId
      let endpoint = '/omsproxy/e1api';
      if(data.targetId === 'EORS.02'){
        endpoint = '/omsproxy/e2api';
      }
      let res = await kaxios.put(
        Constant.getInstance().proxy +
          endpoint +
          '/accounts/' +
          data.account +
          '/orders/' +
          data.orderID,
        {
          accountNo: data.account,
          orderID: data.orderID,
          quantity: data.quantity,
          price: data.price,
          isForced: 'N',
          via: 'F',
          userCustID: 'OmsAdmin',
        }
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

//Get symbolinfo
const symbolInfoAPI = (symbol: string) => {
  return kaxios.get(
    Constant.getInstance().proxy +
      '/omsproxy/oms1' +
      '/oms-api/instruments?symbol=' +
      symbol
  );
};

//Search Order
const searchOrderAPI = (data: any, page: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy +
          '/omsproxy/oms1' +
          `/oms-api/admin/orders?` +
          `accountId=${data.account !== '' ? data.account : ''}` +
          `&orderid=` +
          `&orderType=${data.type !== 'ALL' ? data.type : ''}` +
          `&side=${data.side !== 'ALL' ? data.side : ''}` +
          `&status=${data.status !== 'ALL' ? data.status : ''}` +
          `&substatus=&oddLot=&disposal=&norb=N` +
          `&via=&symbol=${data.symbol !== 'ALL' ? data.symbol : ''}` +
          `&exchange=${data.floor !== 'ALL' ? data.floor : ''}` +
          `&custodycd=${data.custodycd !== '' ? data.custodycd : ''}` +
          `&pageIndex=${page}&pageSize=100&id=${new Date().getTime()}-${Math.random()}`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};
//Search Order clone
const searchOrderAPIClone = (data: any, page: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy +
          '/omsproxy/oms1' +
          `/oms-api/admin/orders-clone?` +
          `accountId=${data.account !== '' ? data.account : ''}` +
          `&orderid=` +
          `&orderType=${data.type !== 'ALL' ? data.type : ''}` +
          `&side=${data.side !== 'ALL' ? data.side : ''}` +
          `&status=${data.status !== 'ALL' ? data.status : ''}` +
          `&substatus=&oddLot=&disposal=` +
          `&via=&symbol=${data.symbol !== 'ALL' ? data.symbol : ''}` +
          `&exchange=${data.floor !== 'ALL' ? data.floor : ''}` +
          `&custodycd=${data.custodycd !== '' ? data.custodycd : ''}` +
          `&pageIndex=${page}&pageSize=100&id=${new Date().getTime()}-${Math.random()}`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

//Place order
const placeOrderAPI = (data: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.post(
        Constant.getInstance().proxy +
          '/omsproxy/e1api' +
          '/accounts/' +
          data.account +
          '/orders/',
        {
          object: 'order',
          accountNo: data.account,
          symbol: data.symbol,
          side: data.side,
          orderType: data.type,
          timeType: 'N',
          quantity: Number(data.quantity),
          price: Number(data.price),
          via: 'F',
          clordID: 'ADMIN' + new Date().getTime(),
          userName: Constant.getInstance().username,
          userCustID: 'OmsAdmin',
        }
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

//Get account detail
const getAccountAPI = (accountSearch: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy +
          '/omsproxy/oms1' +
          '/oms-api/accounts/' +
          accountSearch +
          '/ci'
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

//Get account SE
const getAccountSEAPI = (accountSearch: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy +
          '/omsproxy/oms1' +
          '/oms-api/accounts/' +
          accountSearch +
          '/se'
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

//Edit accountci
const editAccountCIAPI = (data: any) => {
  let { accountNo, ...d } = data;
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.put(
        Constant.getInstance().proxy +
          '/omsproxy/oms1' +
          '/oms-api/accounts/' +
          accountNo +
          '/ci',
        {
          type: d.type,
          balance: d.balance.toString(),
          totalDebt: d.totalDebt.toString(),
          totalDebtDue: d.totalDebtDue.toString(),
          mrcrlimitMax: d.mrcrlimitMax.toString(),
          tdAmount: d.tdAmount.toString(),
          t0limit: d.t0limit.toString(),
        }
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

//Get accountOMS (omstag, soLuuKy, loaiHinhTK)
const getAccountOMSAPI = (account: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy +
          '/omsproxy/oms1' +
          '/oms-api/accounts/' +
          account
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

//Update accountci
const updateAccountCIAPI = (data: any) => {
  let { accountNo, ...d } = data;
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.delete(
        Constant.getInstance().proxy +
          '/omsproxy/oms1' +
          '/oms-api/accounts/' +
          accountNo +
          '/ci',
        {
          data: {
            balance: d.balance.toString(),
            totalDebt: d.totalDebt.toString(),
            totalDebtDue: d.totalDebtDue.toString(),
            mrcrlimitMax: d.mrcrlimitMax.toString(),
            tdAmount: d.tdAmount.toString(),
            t0limit: d.t0limit.toString(),
          },
        }
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

//Edit symbol balance of account
const editCKAPI = (accountNo: any, data: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.put(
        Constant.getInstance().proxy +
          '/omsproxy/oms1' +
          '/oms-api/accounts/' +
          accountNo +
          '/se',
        {
          ...data,
        }
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

const editPoolRoomAPI = (data: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.put(
        Constant.getInstance().proxy +
        '/omsproxy/oms1' +
        '/oms-api/update-poolroom/',
        {
          ...data,
        }
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

// Setup
const doReq = (url: string, method: string, type: number, data?: object) => {
  if (type === 1) {
    if (data) {
      const req: BackendSrvRequest = {
        url: Constant.getInstance().baseUrl + url,
        method,
        data,
      };
      return doReqTP(req);
    } else {
      const req: BackendSrvRequest = {
        url: Constant.getInstance().baseUrl + url,
        method,
      };
      return doReqTP(req);
    }
  } else {
    if (data) {
      return doReqDirect(Constant.getInstance().apiHost + url, method, data);
    } else {
      return doReqDirect(Constant.getInstance().apiHost + url, method);
    }
  }
};

const doReqTP = async (req: BackendSrvRequest) => {
  try {
    let data = await getBackendSrv().request(req);
    return data;
  } catch (error) {
    return null;
  }
};

const doReqDirect = async (url: string, method: string, data?: object) => {
  try {
    if (method === 'GET') {
      let res = await kaxios.get(url);
      return res.data;
    } else if (data != null) {
      let res = await kaxios.post(url, data);
      return res.data;
    } else {
      let res = await kaxios.post(url);
      return res.data;
    }
  } catch (error) {
    return null;
  }
};

const getSymbolFullInfo = (symbol: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy +
          '/omsproxy/oms1' +
          `/oms-api/instruments?symbol=${symbol}`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

//Add new symbol
const addNewSymbolAPI = (data: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.post(
        Constant.getInstance().proxy +
          '/omsproxy/oms1' +
          '/orssvr/exchange/updateinstrument',
        data
      );
      resolve(res.data.err_msg);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

//Edit symbol
const editSymbolAPI = (data: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let d = data;
      let res = await kaxios.put(
        Constant.getInstance().proxy + '/omsproxy/oms1' + '/orssvr/updatePrice',
        {
          symbol: d.code,
          cficode: d.secType,
          price_ce: d.ceilingPrice,
          price_fl: d.floorPrice,
          price_rf: d.basicPrice,
          froom: d.totalRoom,
          halt: d.haltResumeFlag,
          price_pt_ce: d.cellingPricePT,
          price_pt_fl: d.floorPricePT,
          trade_price: d.matchPrice,
          close_price: d.closePrice,
          halt_ol: d.haltOddLot,
          trade_place: d.tradePlace,
          room_limit: d.roomLimit,
          listing_qtty: d.listingQtty,
        }
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

//Suc mua
const getPP0API = (account: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy +
          '/omsproxy/oms1' +
          `/oms-api/accounts/${account}/pp0`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

//Tien ky quy mua
const getSecAmountAPI = (account: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy +
          '/omsproxy/oms1' +
          `/oms-api/accounts/${account}/secured`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

//Tien cho ve
const getReceiveT0 = (account: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy +
          '/omsproxy/oms1' +
          `/oms-api/accounts/${account}/ci/return`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

//Get exchange status
const getExStatusAPI = (exchange: string) => {
  return new Promise(async (resolve, reject) => {
    try {

      let res = await kaxios.get(
        Constant.getInstance().proxy +
          '/omsproxy/oms1' +
          `/oms-api/sessions?exchange=${exchange}`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};
//Update exchange status
const updateExStatusAPI = (data: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await saxios.put(
        Constant.getInstance().proxy + '/omsproxy/oms2' + `/oms-api/sessions`,
        {
          exchange: data.exchange,
          sessionex: data.status,
        }
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

//Update exchange status
const pushMsgToEngine = (data: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let date = new Date();
      let month = String(date.getMonth() + 1).length > 1 ? (date.getMonth() + 1) : "0" + (date.getMonth() + 1);
      let currDate = date.getDate() + "/" + month + "/" + date.getFullYear();
      let currTime = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
      let realTime = currDate + " " + currTime;
      let res = await saxios.post(
        Constant.getInstance().proxy +
        '/omsproxy/boapi' +
        `/oms-api/bo-oms/admin/pushEngine`,
        {
          source: 'order',
          TXDATE: currDate,
          realtime: realTime,
          SIGNALTYPE: data.SIGNALTYPE,
          EXCHANGE: 'HO',
        }
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

//Unhold order
const unholdOrderAPI = (orderID: string, accountID: string, targetId: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      //Process base on targetId
      let endpoint = '/omsproxy/e1api';
      if(targetId === 'EOMS02'){
        endpoint = '/omsproxy/e2api';
      }
      // if(targetId === 'EOMS05'){
      //   endpoint = '/omsproxy/e5api';
      // }
      let res = await kaxios.post(
        Constant.getInstance().proxy +
          endpoint +
          `/accounts/${accountID}/orders/${orderID}/free`,
        { isActive: 'Y' }
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

//Unhold all order
const unholdAllOrderAPI = () => {
  return new Promise(async (resolve, reject) => {
    try {
      //Call both E for unhold all
      let res = await kaxios.post(
        Constant.getInstance().proxy +
          '/omsproxy/e1api' +
          `/admin/${Constant.getInstance().username}/orders/unhold`,
        {}
      );
      //toast.success(res.data);
      res = await kaxios.post(
        Constant.getInstance().proxy +
          '/omsproxy/e2api' +
          `/admin/${Constant.getInstance().username}/orders/unhold`,
        {}
      );

      // res = await kaxios.post(
      //   Constant.getInstance().proxy +
      //     '/omsproxy/e5api' +
      //     `/admin/${Constant.getInstance().username}/orders/unhold`,
      //   {}
      // );
      toast.success(res.data);
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

//Get PPSE by account symbol price
const getPPSEAPI = (account: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy +
          '/omsproxy/oms1' +
          `/oms-api/accounts/${account}/ppse`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

//Get QMax
const getQMaxAPI = (account: any, symbol: any, type: any, price: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy +
          '/omsproxy/oms1' +
          `/oms-api/accounts/${account}/ppse?symbol=${symbol}&orderType=${type}&side=NB&price=${price}`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

//Get order by status
const getOrderByStatus = (status: string) => {
  return kaxios.get(
    Constant.getInstance().proxy +
      '/omsproxy/oms1' +
      '/oms-api/admin/orders?accountId=&orderid=&orderType=&side=&norb=N&status=' +
      status +
      '&substatus=&via=&symbol=&exchange=&custodycd=&oddLot=&disposal=&pageIndex=&pageSize=100'
  );
};
const getRejectedOrder = (status: string) => {
  return kaxios.get(
    Constant.getInstance().proxy +
      '/omsproxy/oms1' +
      '/oms-api/admin/orders/reject?accountId=&orderid=&orderType=&side=&status=' +
      status +
      '&subStatus=&via=&symbol=&exchange=&rejectBy=&pageIndex=&pageSize=100'
  );
};

const searchRejectedOrderAPI = (data: any, page: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy +
          '/omsproxy/oms1' +
          `/oms-api/admin/orders/reject?` +
          `accountId=${data.account !== '' ? data.account : ''}` +
          `&orderid=` +
          `&orderType=${data.type !== 'ALL' ? data.type : ''}` +
          `&side=${data.side !== 'ALL' ? data.side : ''}` +
          `&status=${data.status !== 'ALL' ? data.status : ''}` +
          `&subStatus=${data.subStatus !== 'ALL' ? data.subStatus : ''}` +
          `&via=&symbol=${data.symbol !== 'ALL' ? data.symbol : ''}` +
          `&exchange=${data.floor !== 'ALL' ? data.floor : ''}` +
          `&rejectBy=${data.by !== 'ALL' ? data.by : ''}` +
          `&pageIndex=${page}&pageSize=100`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

const changeAccountStatus = (accountID: string, status: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.put(
        Constant.getInstance().proxy +
          '/omsproxy/oms1' +
          `/orssvr/customer/status`,
        {
          accountId: accountID,
          status: status,
        }
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

//Resend Messages, Orders
const getMessagesAPI = (data: any, page: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy +
          '/omsproxy/oms1' +
          `/oms-api/admin/resend?` +
          `autoId=${data.autoId !== '' ? data.autoId : ''}` +
          `&msgId=${data.msgId !== '' ? data.msgId : ''}` +
          `&msgLog=${data.msgLog !== '' ? data.msgLog : ''}` +
          `&msgstatus=${data.status !== 'ALL' ? data.status : ''}` +
          `&fromTime=${data.fromTime !== '' ? data.fromTime : ''}` +
          `&toTime=${data.toTime !== '' ? data.toTime : ''}` +
          `&pageIndex=${page}&pageSize=100`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

const resendMessagesAll = (data: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.post(
        Constant.getInstance().proxy +
          '/omsproxy/oms1' +
          `/oms-api/admin/resend?` +
          `msgstatus=${data.status !== 'ALL' ? data.status : ''}` +
          `&fromTime=${data.fromTime !== '' ? data.fromTime : ''}` +
          `&toTime=${data.toTime !== '' ? data.toTime : ''}` +
          `&msgLog=${data.msgLog !== '' ? data.msgLog : ''}`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

const resendMessagesAPI = (messageId: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.post(
        Constant.getInstance().proxy +
          '/omsproxy/oms1' +
          `/oms-api/admin/resend?` +
          `msgId=${messageId}`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

const getOrdersAPI = (data: any, page: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy +
          '/omsproxy/boapi' +
          `/oms-api/admin/resend/order2bo?` +
          `autoId=${data.autoId !== '' ? data.autoId : ''}` +
          `&msgId=${data.msgId !== '' ? data.msgId : ''}` +
          `&msgLog=${data.msgLog !== '' ? data.msgLog : ''}` +
          `&msgstatus=${data.status !== 'ALL' ? data.status : ''}` +
          `&fromTime=${data.fromTime !== '' ? data.fromTime : ''}` +
          `&toTime=${data.toTime !== '' ? data.toTime : ''}` +
          `&orderId=${data.orderID !== '' ? data.orderID : ''}` +
          `&accountId=${data.account !== '' ? data.account : ''}` +
          `&symbol=${data.symbol !== '' ? data.symbol : ''}` +
          `&ordStatus=${data.ordStatus !== 'All' ? data.ordStatus : ''}` +
          `&pageIndex=${page}&pageSize=100`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

const resendOrdersAll = (data: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.post(
        Constant.getInstance().proxy +
        '/omsproxy/boapi' +
        `/oms-api/admin/resend/order2bo?` +
        `msgstatus=${data.status !== 'ALL' ? data.status : ''}` +
        `&fromTime=${data.fromTime !== '' ? data.fromTime : ''}` +
        `&toTime=${data.toTime !== '' ? data.toTime : ''}` +
        `&orderId=${data.orderID !== '' ? data.orderID : ''}` +
        `&accountId=${data.account !== '' ? data.account : ''}` +
        `&symbol=${data.symbol !== '' ? data.symbol : ''}` +
        `&ordStatus=${data.ordStatus !== 'All' ? data.ordStatus : ''}`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

const resendOrdersAPI = (msgId: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.post(
        Constant.getInstance().proxy +
        '/omsproxy/boapi' +
        `/oms-api/admin/resend/order2bo?` +
          `msgId=${msgId}`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

const getPoolAPI = (data: any, page: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy +
        '/omsproxy/oms1' +
        `/oms-api/admin/poolinfo?` +
        `prtype=${data.prtype !== 'ALL' ? data.prtype : ''}` +
        `&policyId=${data.id !== '' ? data.id : ''}`+
        `&modetype=${data.modetype !== 'ALL' ? data.modetype : ''}`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

const getTotalPoolAPI = (data: any, page: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy +
        '/omsproxy/oms1' +
        `/oms-api/admin/totalPool?` +
        `prtype=${data.prtype !== 'ALL' ? data.prtype : ''}` +
        `&policyId=${data.id !== '' ? data.id : ''}`+
        `&modetype=${data.modetype !== 'ALL' ? data.modetype : ''}`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

const getRoomAPI = (data: any, page: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let timeout = await kaxios.get(
        Constant.getInstance().proxy + '/omsproxy/getConfigTimeout',
      );
      let haxios = axios.create({
        timeout: timeout,
      });
      let res = await haxios.get(
        Constant.getInstance().proxy +
        '/omsproxy/oms1' +
        `/oms-api/admin/roominfo?` +
        `prtype=${data.prtype !== 'ALL' ? data.prtype : ''}` +
        `&policyId=${data.id !== '' ? data.id : ''}` +
        `&symbol=${data.symbol !== '' ? data.symbol : ''}` +
        `&modetype=${data.modetype !== 'ALL' ? data.modetype : ''}` +
        `&pageIndex=${page}&pageSize=30`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

const getTotalRoomAPI = (data: any, page: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let timeout = await kaxios.get(
        Constant.getInstance().proxy + '/omsproxy/getConfigTimeout',
      );
      let haxios = axios.create({
        timeout: timeout,
      });
      let res = await haxios.get(
        Constant.getInstance().proxy +
        '/omsproxy/oms1' +
        `/oms-api/admin/totalRoom?` +
        `prtype=${data.prtype !== 'ALL' ? data.prtype : ''}` +
        `&policyId=${data.id !== '' ? data.id : ''}` +
        `&symbol=${data.symbol !== '' ? data.symbol : ''}` +
        `&modetype=${data.modetype !== 'ALL' ? data.modetype : ''}` +
        `&pageIndex=${page}&pageSize=30`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

const countOrdersAPI = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy +
        '/omsproxy/oms1' +
        `/oms-api/admin/unhold-order`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

const getCurrentTime = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy + '/omsproxy/current-time',
      );
      resolve(res);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

const getSysConfigAPI = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy +
        '/omsproxy/oms1' +
        `/oms-api/admin/sysconfig`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

const resendPendingNewAPI = (data: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.post(
        Constant.getInstance().proxy +
        '/omsproxy/oms1' +
        `/oms-api/accounts/${data.accountNo}/orders/${data.orderID}/push`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

//Resend Messages order from GW to OMS
const getOrderResponseAPI = (data: any, page: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy +
        '/omsproxy/oms1' +
        `/oms-api/admin/resendGwMsg?` +
        `autoId=${data.autoId !== '' ? data.autoId : ''}` +
        `&msgLog=${data.msgLog !== '' ? data.msgLog : ''}` +
        `&status=${data.status !== 'ALL' ? data.status : ''}` +
        `&targetId=${data.targetId !== '' ? data.targetId : ''}` +
        `&fromTime=${data.fromTime !== '' ? data.fromTime : ''}` +
        `&toTime=${data.toTime !== '' ? data.toTime : ''}` +
        `&pageIndex=${page}&pageSize=100`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

const resendAllOrderResponse = (data: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.post(
        Constant.getInstance().proxy +
        '/omsproxy/oms1' +
        `/oms-api/admin/resendGwMsg?` +
        `autoId=${data.autoId !== '' ? data.autoId : ''}` +
        `&msgLog=${data.msgLog !== '' ? data.msgLog : ''}` +
        `&status=${data.status !== 'ALL' ? data.status : ''}` +
        `&targetId=${data.targetId !== '' ? data.targetId : ''}` +
        `&fromTime=${data.fromTime !== '' ? data.fromTime : ''}` +
        `&toTime=${data.toTime !== '' ? data.toTime : ''}` +
        `&pageIndex=&pageSize=`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

const resendOrderResponse = (autoId: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.post(
        Constant.getInstance().proxy +
        '/omsproxy/oms1' +
        `/oms-api/admin/resendGwMsg?` +
        `autoId=${autoId}&msgLog=&status=&targetId=&fromTime&toTime&pageIndex=&pageSize=`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

const searchAccountByCustodyCD = (custodycd: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy +
        '/omsproxy/oms1' +
        `/oms-api/getAccounts?custodycd=${custodycd}`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

export {
  checkAuthAPI,
  getDS,
  getOrderDetailAPI,
  getMsgLog,
  removeOrderAPI,
  editOrderAPI,
  searchOrderAPI,
  placeOrderAPI,
  getAccountAPI,
  symbolInfoAPI,
  getAccountSEAPI,
  editAccountCIAPI,
  editCKAPI,
  editPoolRoomAPI,
  getSymbolFullInfo,
  updateAccountCIAPI,
  addNewSymbolAPI,
  editSymbolAPI,
  getAccountOMSAPI,
  getPP0API,
  getSecAmountAPI,
  getReceiveT0,
  getExStatusAPI,
  updateExStatusAPI,
  unholdOrderAPI,
  getPPSEAPI,
  unholdAllOrderAPI,
  getQMaxAPI,
  getOrderByStatus,
  getRejectedOrder,
  searchRejectedOrderAPI,
  changeAccountStatus,
  getMessagesAPI,
  resendMessagesAll,
  resendMessagesAPI,
  getOrdersAPI,
  resendOrdersAll,
  resendOrdersAPI,
  getPoolAPI,
  getRoomAPI,
  countOrdersAPI,
  pushMsgToEngine,
  getCurrentTime,
  searchOrderAPIClone,
  getSysConfigAPI,
  getTotalPoolAPI,
  getTotalRoomAPI,
  resendPendingNewAPI,
  getOrderResponseAPI,
  resendAllOrderResponse,
  resendOrderResponse,
  searchAccountByCustodyCD
};
