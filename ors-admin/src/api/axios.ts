import axios from 'axios';

let kaxios = axios.create({
  timeout: 10000,
});

const handleErrorAxios = (reject: any, error: any) => {
  try {
    if (error.response) {
      if (error.response.data.code) {
        let msg = `Code: ${error.response.data.code} Reason: ${error.response.data.reason}`;
        reject(msg);
      } else if (error.response.data.err_msg) {
        let msg = `Code: ${error.response.data.err_code} Reason: ${error.response.data.err_msg}`;
        reject(msg);
      } else {
        reject(error.response.status + ': ' + error.response.statusText);
      }
    } else if (error.request) {
      if (error.code === 'ECONNABORTED') {
        reject('Request timeout');
      } else {
        reject(error.request);
      }
    } else {
      reject('Error', error.message);
    }
  } catch (e) { console.error(e); reject(e); }
};

export { kaxios, handleErrorAxios };
