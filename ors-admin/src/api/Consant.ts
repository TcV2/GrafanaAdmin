class Constant {
  private static instance: Constant;

  baseUrl: string;
  role: string;
  type: number;
  apiHost: string;
  apiHostOMS: string;
  username: string;
  canEdit = false;
  proxy = 'http://localhost';
  folderID = '0'

  private constructor(
    baseUrl: string,
    role: string,
    type: number,
    apiHost: string,
    username: string,
    apiHostOMS: string,
    folderID:string
  ) {
    this.baseUrl = baseUrl;
    this.role = role;
    this.type = type;
    this.apiHost = apiHost;
    this.username = username;
    this.apiHostOMS = apiHostOMS;
    this.folderID = folderID;
  }

  static getInstance(): Constant {
    if (!Constant.instance) {
      Constant.instance = new Constant('', '', 1, '', '', '','0');
    }

    return Constant.instance;
  }
}

export { Constant };
