// @ts-nocheck
import { getBackendSrv } from '@grafana/runtime';
import {
  HorizontalGroup,
  Button,
  InlineField,
} from '@grafana/ui';
import { Constant } from 'api/Consant';
import { getAlert } from 'api/monitorAPI';

import React, { useState, useEffect } from 'react';
import { OrderBookPanelOptions } from 'types';

interface Props extends OrderBookPanelOptions { }

let checkInterval: any;

export const MenuPanel: React.FC<Props> = ({ width, height }) => {

  const [dashboard, setDashboard] = useState<any>([])
  const [alert, setAlert] = useState<string>("")
  const [ready, setReady] = useState<boolean>(false)

  useEffect(() => {
    // getBackendSrv().get("/api/search?folderIds=" + Constant.getInstance().folderID).then((rs: any) => {
    //   setDashboard(rs);
    //   setReady(true)
    // }),
    getAlert().then(data => {
      let alertStr = ""
      data.forEach(element => {
        alertStr += element.labels.alertname + ' ---- '
      });
      setAlert(alertStr.substring(0, alertStr.length - 6))
    });
    checkInterval = setInterval(async () => {
      let data: any = await getAlert();
      let alertStr = ""
      data.forEach(element => {
        alertStr += element.labels.alertname + ' ---- '
      });
      setAlert(alertStr.substring(0, alertStr.length - 6))
    }, 30000)
    return () => {
      clearInterval(checkInterval);
    }
  }, [])

  return (
    <HorizontalGroup
      justify="flex-start"
      align="center"
      style={{ width, height, overflow: 'auto', padding: 0, margin: 0 }}
    >
      {/* {
          dashboard.map((d: any) => {
            let link = window.location.origin + d.url
            return (
              <Button size="sm" style={{ margin: 0 }} onClick={() => {
                window.location.href = window.location.origin + d.url
              }}>{d.title}</Button>
            )
          })
        } */}
      <InlineField style={{ width: width - 30 }}>
        <marquee>{alert}</marquee>
      </InlineField>
    </HorizontalGroup>
  );
};