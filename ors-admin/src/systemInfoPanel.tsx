// @ts-nocheck
import {
  HorizontalGroup,
  Button,
  InlineField,
  InlineFieldRow
} from '@grafana/ui';
import { getSysConfigAPI } from 'api/main';

import React, { useState, useEffect } from 'react';
import { OrderBookPanelOptions } from 'types';

interface Props extends OrderBookPanelOptions { }

let checkInterval: any;

export const SystemInfoPanel: React.FC<Props> = ({ width, height }) => {

  const [config, setConfig] = useState<[]>([])

  useEffect(() => {
    getSysConfigAPI().then(data => {
      setConfig(data.ref_cursor)
    });
    checkInterval = setInterval(async () => {
      let res: any = await getSysConfigAPI();
      setConfig(res.ref_cursor);
    }, 30000)
    return () => {
      clearInterval(checkInterval);
    }
  }, []);

  return (
        <form>
          <InlineFieldRow style={{ marginTop: '5px' }}>
            <span
              style={{
                fontSize: '13px',
                fontStyle: 'italic',
                color: 'orange',
                marginRight: '5px',
              }}
            >
              [Trade date]{' '}
            </span>
            <span style={{ fontSize: '13px', marginRight: '20px' }}>
              {config.map((c: any) => (
                c.TRADE_DATE
              ))}
            </span>
            <span
              style={{
                fontSize: '13px',
                fontStyle: 'italic',
                color: 'orange',
                marginRight: '5px',
              }}
            >
              [Current time]{' '}
            </span>
            <span style={{ fontSize: '13px', marginRight: '20px' }}>
              {config.map((c: any) => (
                c.CURR_TIME
              ))}
            </span>
          </InlineFieldRow>
        </form>
  );
};
