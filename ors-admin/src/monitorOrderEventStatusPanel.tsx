// @ts-nocheck
import {
  HorizontalGroup,
  InlineField,
  InlineFieldRow,
  Button,
  VerticalGroup,
} from '@grafana/ui';
import {
  blockOrderEvent,
} from 'api/monitorAPI';
import {
  getOrderEventStatus,
} from 'api/monitorAPI';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

let intervalFetch: any;

export const MonitorOrderEventStatusPanel: React.FC<Props> = ({ width, height }) => {
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
    let res: any = await getOrderEventStatus();
    if(res.status == true) setState("Connected");
    else setState("Not Connected");
  };

  const [state, setState] = useState<any>({});

  const OnOffOrderEvent = async (status: boolean) => {
    toast.success('Pending');
    let res = await blockOrderEvent(status);
    if (res) {
      toast.success('OK');
      if(res.status == true) setState("Connected");
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
          <Button style={{ backgroundColor: 'green'}} onClick={async () => { OnOffOrderEvent(true); }} >On Booms2Bo@</Button>
        </InlineField>
        <InlineField>
          <Button style={{ backgroundColor: 'darkred'}} onClick={async () => { OnOffOrderEvent(false); }} >Off Booms2Bo@</Button>
        </InlineField>
      </InlineFieldRow>
    </HorizontalGroup>
  );

};
