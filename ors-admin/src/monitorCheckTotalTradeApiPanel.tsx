// @ts-nocheck
import {
  HorizontalGroup,
  InlineField,
  InlineFieldRow,
  Button,
  Modal,
  Label,
  VerticalGroup,
  HorizontalGroup,
  InlineField,
  InlineFieldRow
} from '@grafana/ui';
import {
  placeCheckTotalTradeApi,
} from 'api/monitorAPI';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';



export const MonitorCheckTotalTradeApiPanel: React.FC<Props> = ({ width, height }) => {
  useEffect(() => {
    setState(false);
  }, []);


  const PlaceTradeApi = async () => {
    toast.success('Placing');
    let res = await placeCheckTotalTradeApi();
    if (res) {
      toast.success(res);
      setState(true);
    }
    else {
      toast.error('Not OK');
      setState(false);
    }
  };
  const [openModalTradeApi, setOpenModalTradeApi] = useState<boolean>(false);

  const renderTradeApi = () => {
    return (
      <Modal title="Detail TradeApi" isOpen={openModalTradeApi} onClickBackdrop={() => setOpenModalTradeApi(false)} onDismiss={() => setOpenModalTradeApi(false)}>
        <VerticalGroup style={{ overflow: 'auto', backgroundColor: 'rgb(9, 10, 13, 0.5)', padding: '5px', width: '1500px !important' }}
                       justify="flex-start"
                       align="center">
          <InlineFieldRow>
            <InlineField style={{ backgroundColor: 'rgb(9, 10, 13, 0.5)', width: '300px' }}>
              <div style={{ width: '100%' }}>
                <h3 style={{ textAlign: 'center' }}>TradeApi</h3>
                <table id="fsstable" style={{ width: '100%' }}>
                  <thead>
                  <tr>
                    <th>Name</th>
                    <th>AccountNumber</th>
                  </tr>
                  </thead>
                  {/*<tbody>*/}
                  {/*{state.TradeApi.accountNumber.map((o: any) => {*/}
                  {/*  return (*/}
                  {/*    <tr>*/}
                  {/*      <td>{o.tradeApi}</td>*/}
                  {/*      <td>{o.accountNo}</td>*/}
                  {/*    </tr>*/}
                  {/*  );*/}
                  {/*})}*/}
                  {/*</tbody>*/}
                </table>
              </div>
            </InlineField>
          </InlineFieldRow>
        </VerticalGroup>
      </Modal>
    )
  }

  const [state, setState] = useState<any>({});

  return (
    <HorizontalGroup
      justify="center"
      align="flex-start"
      style={{ width, height, overflow: 'auto' }}
    >
      <InlineFieldRow>
        <InlineField label="TradeApi Check">
          <Button style={{ backgroundColor: state ? 'green' : 'darkred', cursor:'default' }}>Check TradeApi</Button>
        </InlineField>
        <InlineField>
          <Button onClick={async () => { PlaceTradeApi(); }} >Place TradeApi</Button>
        </InlineField>
      </InlineFieldRow>
      {renderTradeApi()}
    </HorizontalGroup>
  );

};
