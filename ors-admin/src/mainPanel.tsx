// @ts-nocheck
import { PanelProps } from '@grafana/data';
import React, { useEffect, useState } from 'react';
import { Options } from 'types';
import { VerticalGroup } from '@grafana/ui';
import { OrderBookPanel } from 'orderBookPanel';
import { SyncAccountPanel } from 'syncAccountPanel';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getBackendSrv } from '@grafana/runtime';
import { Constant } from 'api/Consant';
import { SecInfoPanel } from 'secInfoPanel';
import { MonitorPanel } from 'monitorPanel';
import { MonitorStatePanel } from 'monitorStatePanel';
import { MonitorCheckOrderPanel } from 'monitorCheckOrderPanel';
import { RolePanel } from 'rolePanel';
import { ReportPanel } from 'reportPanel';
import { PTPanel } from 'ptPanel';
import { getKey } from 'api/adminAPI';
import { PendingNewPanel } from 'pendingNewPanel';
import { RejectedPanel } from 'rejectedPanel';
import { MonitorNewPanel } from 'monitorNew';
import { MenuPanel } from 'menu';
import { AlertPanel } from 'alertpanel';
import { ResendPanel } from 'resendPanel';
import { ResendOrderPanel } from 'resendOrderPanel';
import { MonitorOffMarketPanel } from 'monitorOffMarketPanel';
import { MonitorOnOffBOPanel } from 'monitorOnOffBOPanel';
import { MonitorErrorMessagePanel } from 'monitorErrorMessagePanel';
import { MonitorOrderEventStatusPanel } from 'monitorOrderEventStatusPanel';
import { PoolPanel } from 'poolPanel';
import { RoomPanel } from 'roomPanel';
import { OperationalPushOrderPanel } from 'operationalPushOrderPanel';
import { MonitorReceiveSecStatusPanel } from 'monitorReceiveSecStatusPanel';
import { PriorityPanel } from 'priorityPanel';
import { UnholdOrderPanel } from 'unholdOrderPanel';
import { PushMsgToEnginePanel } from 'pushMsgToEnginePanel';
import { SystemInfoPanel } from 'systemInfoPanel';
import { CountOrdersPanel } from './countOrdersPanel';
import { OrderResponsePanel } from './orderResponsePanel';

interface Props extends PanelProps<Options> { }

let canEditList: string[] = ['admin', 'qtrr', 'gdnv', 'nghiep-vu'];

export const MainPanel: React.FC<Props> = ({
  options,
  width,
  height,
  replaceVariables,
}) => {
  useEffect(() => {
    console.log("Proxy: " + options.proxy);
    Constant.getInstance().proxy = (options.proxy&&options.proxy.substring(options.proxy.length-1,1)=="/")?options.proxy.substring(0,options.proxy.length-1): options.proxy;
    // Constant.getInstance().folderID = options.folderID;
    let username = replaceVariables('${__user.login}');
    Constant.getInstance().username = username;
    getBackendSrv()
      .get('/api/user/teams')
      .then((result: any) => {
        if (result![0].name) {
          let teamList = result.map((t: any) => t.name);
          let canEdit = teamList.some((r: any) => canEditList.includes(r));
          Constant.getInstance().canEdit = canEdit;
        }
        setLoadingRole(false);
      })
      .catch((e) => {
        setLoadingRole(false);
      });

    getKey()
      .then(() => {
        setLoadingBase(false);
      })
      .catch((e) => setLoadingBase(true));
  }, []);

  const [loadingRole, setLoadingRole] = useState(true);
  const [loadingBase, setLoadingBase] = useState(true);

  const renderEdit = () => {
    if (options.tab === 'orderBook') {
      return <OrderBookPanel width={width} height={height} />;
    } else if (options.tab === 'syncAccount') {
      return <SyncAccountPanel width={width} height={height} />;
    } else if (options.tab === 'secInfo') {
      return <SecInfoPanel width={width} height={height} />;
    } else if (options.tab === 'monitor') {
      return <MonitorPanel width={width} height={height} />;
    } else if (options.tab === 'monitorState') {
      return <MonitorStatePanel width={width} height={height} />;
    } else if (options.tab === 'monitorCheckOrder') {
      return <MonitorCheckOrderPanel width={width} height={height} />;
    } else if (options.tab === 'role') {
      return <RolePanel width={width} height={height} />;
    } else if (options.tab === 'report') {
      return <ReportPanel width={width} height={height} />;
    } else if (options.tab === 'pt') {
      return <PTPanel width={width} height={height} />;
    } else if (options.tab === 'pendingNew') {
      return <PendingNewPanel width={width} height={height} />;
    } else if (options.tab === 'rejected') {
      return <RejectedPanel width={width} height={height} />;
    } else if (options.tab === 'monitorNew') {
      return <MonitorNewPanel width={width} height={height} />;
    } else if (options.tab === 'menu') {
      return <MenuPanel width={width} height={height} />;
    } else if (options.tab === 'alert') {
      return <AlertPanel width={width} height={height} />;
    } else if (options.tab === 'resend') {
      return <ResendPanel width={width} height={height} />;
    }else if (options.tab === 'resendOrder') {
      return <ResendOrderPanel width={width} height={height} />;
    }else if (options.tab === 'monitorOffMarket') {
      return <MonitorOffMarketPanel width={width} height={height} />;
    }else if (options.tab === 'monitorOnOffBO') {
      return <MonitorOnOffBOPanel width={width} height={height} />;
    }else if (options.tab === 'monitorErrorMessage') {
      return <MonitorErrorMessagePanel width={width} height={height} />;
    }else if (options.tab === 'monitorOrderEventStatus') {
      return <MonitorOrderEventStatusPanel width={width} height={height} />;
    }else if (options.tab === 'pool') {
      return <PoolPanel width={width} height={height} />;
    }else if (options.tab === 'room') {
      return <RoomPanel width={width} height={height} />;
    }else if (options.tab === 'operationalPushOrder') {
      return <OperationalPushOrderPanel width={width} height={height} />;
    }else if (options.tab === 'priority') {
      return <PriorityPanel width={width} height={height} />;
    }else if (options.tab === 'monitorReceiveSecStatus') {
      return <MonitorReceiveSecStatusPanel width={width} height={height}/>;
    }else if (options.tab === 'unholdOrder') {
      return <UnholdOrderPanel width={width} height={height}/>;
    }else if (options.tab === 'pushMsgToEngine') {
      return <PushMsgToEnginePanel width={width} height={height}/>;
    }else if (options.tab === 'systemInfo') {
      return <SystemInfoPanel width={width} height={height}/>;
    }else if (options.tab === 'countOrders') {
      return <CountOrdersPanel width={width} height={height}/>;
    }else if (options.tab === 'orderResponse') {
      return <OrderResponsePanel width={width} height={height}/>;
    }else {
      return null;
    }
  };

  if (loadingRole || loadingBase) {
    return <h2>Loading</h2>;
  }

  return (
    <VerticalGroup justify="center" align="center" style={{ width:'100%' }}>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div style={{ width:'100%', height }}>{renderEdit()}</div>
    </VerticalGroup>
  );
};
