// @ts-nocheck
import {
  HorizontalGroup,
  InlineField,
  InlineFieldRow,
  Button,
  Label,
} from '@grafana/ui';
import {
  placeCheckOrders,
} from 'api/monitorAPI';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';



export const MonitorCheckOrderPanel: React.FC<Props> = ({ width, height }) => {
  useEffect(() => {
    setState(false);
  }, []);


  const PlaceOrders = async () => {
    toast.success('Placing');
    let res = await placeCheckOrders();
    if (res) {
      toast.success('OK');
      setState(true);
    }
    else {
      toast.error('Not OK');
      setState(false);
    }
  };

  const [state, setState] = useState<any>({});

  return (
    <HorizontalGroup
      justify="center"
      align="flex-start"
      style={{ width, height, overflow: 'auto' }}
    >
      <InlineFieldRow>
        <InlineField label="Order Check">
          <Button style={{ backgroundColor: state ? 'green' : 'darkred', cursor:'default' }}>Check Order</Button>
        </InlineField>
        <InlineField>
          <Button onClick={async () => { PlaceOrders(); }} >Place orders</Button>
        </InlineField>
      </InlineFieldRow>
    </HorizontalGroup>
  );

};
