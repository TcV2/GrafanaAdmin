import { kaxios, handleErrorAxios } from './axios';
import { Constant } from './Consant';

const getOrder = (data: any, page: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy +
        '/omsproxy/oms1' +
        `/oms-api/admin/orders?` +
        `accountId=${data.account !== '' ? data.account : ''}` +
        `&orderid=` +
        `&orderType=` +
        `&side=${data.side !== 'ALL' ? data.side : ''}` +
        `&status=` +
        `&substatus=NN` +
        `&via=&symbol=${data.symbol !== 'ALL' ? data.symbol : ''}` +
        `&disposal=${data.disposal !== 'ALL' ? data.disposal : ''}` +
        `&oddLot=Y` +
        `&exchange=` +
        `&custodycd=${data.custodycd !== '' ? data.custodycd : ''}` +
        `&norb=${data.norb !== 'ALL' ? data.norb : ''}` +
        `&pageIndex=${page}&pageSize=100`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

const sendToQueue = (data: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.post(
        Constant.getInstance().proxy +
        '/omsproxy/oms1' +
        `/oms-api/admin/orders/queue`,
        {
          accountId: data.accountNo,
          orderid: data.orderID,
          ordertype: data.orderType,
          side: data.side,
          symbol: data.symbol,
          quantity: data.quantity,
          price: data.price,
        }
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

const deleteFromQueue = (data: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.delete(
        Constant.getInstance().proxy +
        '/omsproxy/oms1' +
        `/oms-api/admin/orders/queue?orderid=${data.orderID}`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

const getQueueOrder = () => {
  return new Promise(async (resolve, reject) => {
    try {
      // let res = await kaxios.get(
      //   `http://192.168.40.158:13103/192.168.1.86:8582/oms-api/admin/orders/queue`
      // );
      let res = await kaxios.get(
        Constant.getInstance().proxy +
        '/omsproxy/oms1' +
        `/oms-api/admin/orders/queue`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

export { getOrder, sendToQueue, deleteFromQueue, getQueueOrder };
