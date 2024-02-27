import { kaxios, handleErrorAxios } from './axios';
import { Constant } from './Consant';

const getPendingNewAPI = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy +
          '/omsproxy/oms1' +
          '/oms-api/admin/order/pending'
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

const getPendingNewStatusAPI = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy +
          '/omsproxy/oms1' +
          '/oms-api/admin/order/pendingStatus'
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

const getStatusAPI = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy +
          '/omsproxy/oms1' +
          '/oms-api/admin/order/status'
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

const getStatusByViaAPI = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy +
          '/omsproxy/oms1' +
          '/oms-api/admin/order/statusByVia'
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

export { getPendingNewAPI, getPendingNewStatusAPI, getStatusAPI, getStatusByViaAPI as getStatusBuViaAPI };
