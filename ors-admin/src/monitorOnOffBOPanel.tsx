// @ts-nocheck
import {
  HorizontalGroup,
  InlineField,
  InlineFieldRow,
  Button,
  VerticalGroup,
} from '@grafana/ui';
import {
  placeOnKafka2BO,
} from 'api/monitorAPI';
import {
  placeOffKafka2BO,
} from 'api/monitorAPI';
import {
  checkKafka2BOStatus,
} from 'api/monitorAPI';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

let intervalFetch: any;

export const MonitorOnOffBOPanel: React.FC<Props> = ({ width, height }) => {
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
    let res: any = await checkKafka2BOStatus();
    if(res.status == 200 && res.value == "Started") setState("Connected");
    else setState("Not Connected");
  };

  const [state, setState] = useState<any>({});

  const OnKafka2BO = async () => {
    toast.success('Pending');
    let res = await placeOnKafka2BO();
    if (res) {
      toast.success('OK');
      if(res.status == 200) setState("Connected");
      else setState("Not Connected");
    }
    else {
      toast.error('Not OK');
    }
  };

  const OffKafka2BO = async () => {
    toast.success('Pending');
    let res = await placeOffKafka2BO();
    if (res) {
      toast.success('OK');
      if(res.status == 200) setState("Not Connected");
      else setState("Connected");
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
          <Button style={{ backgroundColor: 'green'}} onClick={async () => { OnKafka2BO(); }} >On Kafka2BO</Button>
        </InlineField>
        <InlineField>
          <Button style={{ backgroundColor: 'darkred'}} onClick={async () => { OffKafka2BO(); }} >Off Kafka2BO</Button>
        </InlineField>
      </InlineFieldRow>
    </HorizontalGroup>
  );

};
