// @ts-nocheck
import {
  Button,HorizontalGroup, InlineField,
} from '@grafana/ui';
import {
  countMessageError,
  countMessageOrderError
} from 'api/monitorAPI';

import React, { useState, useEffect } from 'react';
import { OrderBookPanelOptions } from 'types';
import {ResendPanel} from "./resendPanel";
import {ResendOrderPanel} from "./resendOrderPanel";

interface Props extends OrderBookPanelOptions { }

let checkInterval: any;

export const MonitorErrorMessagePanel: React.FC<Props> = ({
                                                            width,
                                                            height
                                                          }) => {

  const [message, setMessage] = useState<[]>([])
  const [messageOrder, setMessageOrder] = useState<[]>([])

  useEffect(() => {
    countMessageError().then((data: any) => {
      let newData: any = data.ref_cursor;
      setMessage(newData);
    });
    countMessageOrderError().then((data: any) => {
      let newData: any = data.ref_cursor;
      setMessageOrder(newData);
    });
    checkInterval = setInterval(async () => {
      await countMessageError().then((data: any) => {
        let newData: any = data.ref_cursor;
        setMessage(newData);
      });
      await countMessageOrderError().then((data: any) => {
        let newData: any = data.ref_cursor;
        setMessageOrder(newData);
      });
    }, 30000)
    return () => {
      clearInterval(checkInterval);
    }
  }, [])

  const renderMessage = () => {
    return <ResendPanel width={width} height={height} />;
  };

  const renderOrder = () => {
    return <ResendOrderPanel width={width} height={height} />;
  };

  return (
    <HorizontalGroup
      justify="flex-start"
      align="center"
      style={{ width, height, overflow: 'auto', padding: 0, margin: 0 }}
    >
      <div
        id="fss-table-wrapper"
        style={{ overflow: 'auto', width, height }}
      >
        <table style={{ width: '100%' }} id="fsstable">
          <thead>
          <tr>
            <th>Type</th>
            <th>Total</th>
            {/*<th>View</th>*/}
          </tr>
          </thead>
          <tbody>
          {message.map((e: any) => (
            <tr>
              <td>Message</td>
              <td>{e.TOTALCOUNT}</td>
              {/*<td><Button style={{ backgroundColor: 'green'}} onClick={async () => { renderMessage(); }} >Detail</Button></td>*/}
            </tr>
          ))}
          {messageOrder.map((e: any) => (
            <tr>
              <td>Message Order</td>
              <td>{e.TOTALCOUNT}</td>
              {/*<td><Button style={{ backgroundColor: 'green'}} onClick={async () => { renderOrder(); }} >Detail</Button></td>*/}
            </tr>
          ))}
          </tbody>
        </table>
        {/*<div style={{ width:'100%', height }}>{renderMessage()}</div>*/}
        {/*<div style={{ width:'100%', height }}>{renderOrder()}</div>*/}
      </div>
    </HorizontalGroup>
  );
};
