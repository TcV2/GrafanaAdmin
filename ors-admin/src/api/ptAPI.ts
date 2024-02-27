import { kaxios, handleErrorAxios } from './axios';
import { Constant } from './Consant';

const getPTAPI = (data: any, page: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy +
          '/omsproxy/oms1' +
          `/oms-api/admin/cross?` +
          `accountId=${data.account !== '' ? data.account : ''}` +
          `&side=${data.side !== 'ALL' ? data.side : ''}` +
          `&symbol=${data.symbol !== 'ALL' ? data.symbol : ''}` +
          `&pageIndex=${page}&pageSize=100`
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

const unholdCrossAPI = (orderID: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.post(
        Constant.getInstance().proxy +
          '/omsproxy/e1api' +
          `/admin/${Constant.getInstance().username}/cross/${orderID}/free`,
        {}
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

const unholdAllCrossAPI = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.post(
        Constant.getInstance().proxy +
          '/omsproxy/e1api' +
          `/admin/${Constant.getInstance().username}/cross/unhold`,
        {}
      );
      resolve(res.data);
    } catch (error) {
      handleErrorAxios(reject, error);
    }
  });
};

export { getPTAPI, unholdCrossAPI, unholdAllCrossAPI };
