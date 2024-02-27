// @ts-nocheck
import {
  HorizontalGroup,
  InlineField,
  InlineFieldRow,
  Button,
  VerticalGroup, ConfirmModal, Select,
} from '@grafana/ui';
import {
  placeOnMarketMsg,
} from 'api/monitorAPI';
import {
  placeOffMarketMsg,
} from 'api/monitorAPI';
import {
  checkMarketStatus,
} from 'api/monitorAPI';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {SelectableValue} from "@grafana/data";
import {updateExStatusAPI} from "./api/main";

let intervalFetch: any;

export const MonitorOffMarketPanel: React.FC<Props> = ({ width, height }) => {
  useEffect(() => {
    fetchStatus();
    intervalFetch = setInterval(async () => {
      await fetchStatus();
    }, 300000);
    return function cleanup() {
      clearInterval(intervalFetch);
    };
  }, []);

  const fetchStatus = async () => {
    let res: any = await checkMarketStatus();
    if(res.isUpdate == true) setState("Connected");
    else setState("Not Connected");
  };

  const [state, setState] = useState<any>({});

  const OnMOMS = async () => {
    toast.success('Pending');
    let res = await placeOnMarketMsg();
    if (res) {
      toast.success('OK');
      if(res.isUpdate == true) setState("Connected");
      else setState("Not Connected");
    }
    else {
      toast.error('Not OK');
    }
  };

  const OffMOMS = async () => {
    toast.success('Pending');
    let res = await placeOffMarketMsg();
    if (res) {
      toast.success('OK');
      if(res.isUpdate == true) setState("Connected");
      else setState("Not Connected");
    }
    else {
      toast.error('Not OK');
    }
  };

  const renderStatus = () => {
    return (
      <InlineFieldRow>
        <InlineField label={'Status: ' + state}>
          <div></div>
        </InlineField>
      </InlineFieldRow>
    );
  };

  return (
    <HorizontalGroup
      justify="center"
      align="flex-start"
      style={{ width, height, overflow: 'auto' }}
    >
      <InlineFieldRow>
        <InlineField>
          <VerticalGroup justify="flex-start" align="center">
            {renderStatus()}
          </VerticalGroup>
        </InlineField>
        <InlineField>
          <Button style={{ backgroundColor: 'green'}} onClick={async () => { OnMOMS(); }} >On Market M-OMS</Button>
        </InlineField>
        <InlineField>
          <Button style={{ backgroundColor: 'darkred'}} onClick={async () => { OffMOMS(); }} >Off Market M-OMS</Button>
        </InlineField>
      </InlineFieldRow>
    </HorizontalGroup>
  );

};
