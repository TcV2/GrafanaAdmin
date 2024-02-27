// @ts-nocheck
import {
  HorizontalGroup,
  InlineField,
  InlineFieldRow,
  Button,
  Select,
  Label,
} from '@grafana/ui';
import {
  pushOrderBoD,
} from 'api/monitorAPI';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';



export const OperationalPushOrderPanel: React.FC<Props> = ({ width, height }) => {
  useEffect(() => {
    setState(false);
    setExchange('HSX');
  }, []);

  const PushOrders = async () => {
    // toast.success('Removing log');
    let res = await pushOrderBoD(exchange);
    if (res) {
      toast.success('OK');
      setState(true);
    }
    else
    {
      toast.error('Not OK');
      setState(false);
    }
  };

  const [state, setState] = useState<any>({});
  const [exchange, setExchange] = useState<any>({});

  const handleOnchangeSelect = (
    e: SelectableValue
  ) => {
    setExchange(e.value)
  };

  return (
    <HorizontalGroup
      justify="center"
      align="flex-start"
      style={{ width, height, overflow: 'auto' }}
    >
      <InlineFieldRow>

        <InlineField label="Push Order For">
          <Select
            value={exchange}
            width={15}
            onChange={(e) => handleOnchangeSelect(e)}
            options={[
              { label: 'HSX', value: 'HSX' },
              { label: 'HNX', value: 'HNX' },
              { label: 'UPCOM', value: 'UPCOM' },
            ]}
          />
        </InlineField>
        <InlineField>
          <Button style={{ backgroundColor: state ? 'green' : 'darkred', cursor:'default' }}>State</Button>
        </InlineField>
        <InlineField>
          <Button onClick={async () => { PushOrders(); }} >Push</Button>
        </InlineField>

      </InlineFieldRow>
    </HorizontalGroup>
  );
};
