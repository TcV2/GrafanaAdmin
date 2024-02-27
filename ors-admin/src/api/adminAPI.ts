import { getBackendSrv } from '@grafana/runtime';
import { kaxios } from './axios';
import { Constant } from './Consant';

const addNewUserAPI = (username: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = getBackendSrv().post('/api/admin/users', {
        name: username,
        email: username + '@grafana',
        login: username,
        password: '123456',
        OrgId: 1,
      });
      resolve(res);
    } catch (error) {
      reject(error.message);
    }
  });
};

const getAllUsers = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await getBackendSrv().get('/api/users?perpage=100&page=1');
      resolve(res);
    } catch (error) {
      reject(error.message);
    }
  });
};

const getAllTeam = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let res: any = await getBackendSrv().get(
        '/api/teams/search?perpage=100&page=1'
      );
      resolve(res.teams);
    } catch (error) {
      reject(error.message);
    }
  });
};

const getTeamMembers = (id: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await getBackendSrv().get(`/api/teams/${id}/members`);
      resolve(res);
    } catch (error) {
      reject(error.message);
    }
  });
};

const removeTeamMemberAPI = (teamID: any, userID: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await getBackendSrv().delete(
        `/api/teams/${teamID}/members/${userID}`
      );
      resolve(res);
    } catch (error) {
      reject(error.message);
    }
  });
};

const addTeamMemberAPI = (teamID: any, userID: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await getBackendSrv().post(`/api/teams/${teamID}/members`, {
        userId: userID,
      });
      resolve(res);
    } catch (error) {
      reject(error.message);
    }
  });
};

const deleteUserAPI = (userID: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await getBackendSrv().delete(`/api/admin/users/${userID}`);
      resolve(res);
    } catch (error) {
      reject(error.message);
    }
  });
};

const getUserByID = (userID: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await getBackendSrv().get(`/api/users/${userID}`);
      resolve(res);
    } catch (error) {
      reject(error.message);
    }
  });
};

const getKey = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy + '/omsproxy/getkey'
      );
      resolve(res);
    } catch (error) {
      reject(error.message);
    }
  });
};
const logging = (data: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await kaxios.get(
        Constant.getInstance().proxy + '/omsproxy/logging',
        {
          headers: {
            'log4js': data,
          },
        }
      );
      resolve(res);
    } catch (error) {
      reject(error.message);
    }
  });
};

export {
  addNewUserAPI,
  getAllUsers,
  getAllTeam,
  getTeamMembers,
  removeTeamMemberAPI,
  addTeamMemberAPI,
  deleteUserAPI,
  getUserByID,
  getKey,
  logging,
};
