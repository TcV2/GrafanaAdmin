// @ts-nocheck
import {
  Button,
  ConfirmModal,
  Icon,
  InlineField,
  Input,
  VerticalGroup,
} from '@grafana/ui';
import React, { useState, useEffect } from 'react';
import { OrderBookPanelOptions } from 'types';
import _ from 'lodash';
import { toast } from 'react-toastify';
import { SearchFormPT } from 'component/SearchFormPT';
import { getPTAPI, unholdAllCrossAPI, unholdCrossAPI } from 'api/ptAPI';
import { Constant } from 'api/Consant';
import { checkAuthAPI } from 'api/main';
var dateFormat = require('dateformat');

interface Props extends OrderBookPanelOptions {}

interface ObjectKeys {
  [key: string]: string | number;
}

export const PTPanel: React.FC<Props> = ({ width, height }) => {
  const [order, setOrder] = useState([]);

  //Handle search call from SearchForm
  const search = async (searchData?: any, page?: any) => {
    if (searchData === null) {
      return;
    }
    if (page === null) {
      page = 0;
    }
    try {
      let res: any = await getPTAPI(searchData, page);
      if (res.ref_cursor) {
        setOrder(res.ref_cursor);
        document.getElementById('fss-table-wrapper')!.scrollTop = 0;
      } else {
        setOrder([]);
      }
    } catch (e) {
      setOrder([]);
      toast.error(e);
    }
  };

  const renderOrderData = () => {
    return (
      <div
        id="fss-table-wrapper"
        style={{ overflow: 'auto', width, height: height - 70, zIndex: 1 }}
      >
        <table style={{ width: '100%' }} id="fsstable">
          <thead>
            <tr>
              <th>Time</th>
              <th>CrossID</th>
              <th>Type</th>
              <th>F-Sell</th>
              <th>T-Sell</th>
              <th>Acc-Sell</th>
              <th>F-Buy</th>
              <th>T-Buy</th>
              <th>Acc-Buy</th>
              <th>Symbol</th>
              <th>Qty</th>
              <th>Price</th>
              <th>ExID</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {order.map((o: any) => {
              let date = new Date(parseInt(o.createdTime, 10));
              let dateString = dateFormat(date, 'yyyy-mm-dd HH:MM:ss.l');
              return (
                <tr>
                  <td>{dateString}</td>
                  <td>{o.crossID}</td>
                  <td>{o.crosstype}</td>
                  <td>{o.sellerFirm}</td>
                  <td>{o.sellerTradeID}</td>
                  <td>{o.sellerAcctno}</td>
                  <td>{o.buyerFirm}</td>
                  <td>{o.buyerTraderID}</td>
                  <td>{o.buyerAcctno}</td>
                  <td>{o.symbol}</td>
                  <td style={{ textAlign: 'right' }}>
                    {Intl.NumberFormat('en-US').format(Number(o.quantity))}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {Intl.NumberFormat('en-US').format(Number(o.price))}
                  </td>
                  <td>{o.execID}</td>
                  <td>{o.status}</td>
                    <td style={{ textAlign: 'center' }}>
                    {Constant.getInstance().canEdit && (
                      <Icon
                        name="times"
                        size="lg"
                        title="Unhold"
                        style={{ color: 'orange', cursor: 'pointer' }}
                        onClick={() => {
                          setUnholdType('1');
                          unholdOne(o.crossID, o.sellerAcctno);
                        }}
                      />)}
                    </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const handleOnchange = (
    e: React.FormEvent<HTMLInputElement>,
    key?: string
  ) => {
    setPassword(e.currentTarget.value);
  };

  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [unholdType, setUnholdType] = useState('');
  const [unholdData, setUnholdData] = useState({ orderID: '', account: '' });
  const renderModal = () => {
    return (
      <ConfirmModal
        isOpen={showModal}
        title={
          'Unhold ' +
          (unholdType === 'all'
            ? 'all cross?'
            : 'cross: ' + unholdData.orderID + '?')
        }
        confirmText={'OK'}
        body={
          <InlineField label="Password" labelWidth={20}>
            <Input
              type="password"
              width={35}
              required={true}
              css={''}
              value={password}
              onChange={(e) => handleOnchange(e, 'password')}
            />
          </InlineField>
        }
        onDismiss={() => {
          setShowModal(false);
          setPassword('');
        }}
        onConfirm={async () => {
          setShowModal(false);
          setPassword('');
          await doUnhold();
        }}
      />
    );
  };

  //Call api checkAuth + unhold by type
  const doUnhold = async () => {
    if (password === '') {
      toast.error('Password can not be empty');
      return;
    }
    let auth = await checkAuthAPI(password);
    if (auth) {
      if (unholdType === 'all') {
        try {
          await unholdAllCrossAPI();
          toast.success('Unhold all cross');
        } catch (error) {
          toast.error(error);
        }
      } else {
        try {
          await unholdCrossAPI(unholdData.orderID);
          toast.success('Unhold cross: ' + unholdData.orderID);
        } catch (error) {
          toast.error(error);
        }
      }
    } else {
      toast.error('Wrong password. Do not unhold at all!');
    }
  };

  const updateItem = (id: any, whichvalue: string, newvalue: any) => {
    var index = order.findIndex((x: any) => x.orderID === id);

    let g: ObjectKeys = order[index];
    g[whichvalue] = newvalue;
    if (index === -1) {
      // handle error
    } else {
      setOrder([...order.slice(0, index), g, ...order.slice(index + 1)]);
    }
  };

  //Handle button unhold on each row trigger
  const unholdOne = async (orderID: string, account: string) => {
    setUnholdType('1');
    setUnholdData({ orderID, account });
    setShowModal(true);
  };

  const unholdAll = async () => {
    setUnholdType('all');
    setShowModal(true);
  };

  return (
    <VerticalGroup justify="flex-start" align="center">
      <SearchFormPT
        handleFunction={search}
        order={order}
        handleUnholdAll={unholdAll}
      />
      {renderOrderData()}
      {renderModal()}
    </VerticalGroup>
  );
};
