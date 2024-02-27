// @ts-nocheck
import {
  VerticalGroup,
  Icon,
  HorizontalGroup,
  InlineFieldRow,
  InlineField,
} from '@grafana/ui';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { OrderBookPanelOptions } from 'types';
import _ from 'lodash';
import { SearchFormPri } from 'component/SearchFormPri';
import {
  deleteFromQueue,
  getOrder,
  getQueueOrder,
  sendToQueue,
} from 'api/priorityAPI';
import { Constant } from 'api/Consant';

interface Props extends OrderBookPanelOptions {}

interface ObjectKeys {
  [key: string]: string | number;
}

export const PriorityPanel: React.FC<Props> = ({ width, height }) => {
  const [order, setOrder] = useState<ObjectKeys[]>([]);

  const [queue, setQueue] = useState<ObjectKeys[]>([]);

  useEffect(() => {
    getQueueOrder().then((data: any) => {
      if (data.ref_cursor.length >= 0) {
        let newData: any = data.ref_cursor.map((d: any) => ({
          accountNo: d.ACCOUNT,
          orderID: d.ORDERID,
          orderType: d.ORDERTYPE,
          price: d.PRICE,
          quantity: d.QUANTITY,
          side: d.SIDE,
          symbol: d.SYMBOL,
          custodycd: d.CUSTODYCD,
          norb: d.NORB,
        }));
        setQueue(newData);
      }
    });
  }, []);

  const addToPriority = async (index: number) => {
    try {
      let row: ObjectKeys = order[index];
      let check = false;
      queue.map((q: any) => {
        if (q.orderID === row.orderID) {
          check = true;
        }
      });
      if (check) {
        toast.error('Order ' + row.orderID + ' is already in priority queue');
        return;
      }
      await sendToQueue(row);
      toast.success('Add order ' + row.orderID + ' to priority queue');
      setQueue([...queue, row]);
    } catch (error) {
      toast.error(error);
    }
  };

  const addToNormal = async (index: number) => {
    try {
      let row: ObjectKeys = queue[index];
      await deleteFromQueue(row);
      toast.success('Remove order ' + row.orderID + ' from priority queue');
      let g = queue;
      g.splice(index, 1);
      setQueue([...g]);
    } catch (error) {
      toast.error(error);
    }
  };

  const renderTable1 = () => {
    return (
      <div
        id="fss-table-wrapper"
        style={{
          height: height - 100,
          overflow: 'auto',
        }}
      >
        <table id="fsstable" style={{ minWidth: '500px', maxWidth: width }}>
          <thead>
          <tr>
            <th>OrderID</th>
            <th>Account</th>
            <th>Custodycd</th>
            <th>Norb</th>
            <th>Symbol</th>
            <th>Side</th>
            <th>Type</th>
            <th>Qtty</th>
            <th>Price</th>
            {Constant.getInstance().canEdit && <th>Action</th>}
          </tr>
          </thead>
          <tbody>
          {order?.map((d: any, index: number) => (
            <tr>
              <td>{d.orderID}</td>
              <td>{d.accountNo}</td>
              <td>{d.custodycd}</td>
              <td>{d.norb}</td>
              <td>{d.symbol}</td>
              <td>{d.side === 'B' ? 'Buy' : 'Sell'}</td>
              <td>{d.orderType}</td>
              <td style={{ textAlign: 'right' }}>
                {Intl.NumberFormat('en-US').format(Number(d.quantity))}
              </td>
              <td style={{ textAlign: 'right' }}>
                {Intl.NumberFormat('en-US').format(Number(d.price))}
              </td>
              {Constant.getInstance().canEdit && (
                <td style={{ textAlign: 'center' }}>
                  <Icon
                    title="Add to priority queue"
                    name="arrow-right"
                    style={{ cursor: 'pointer' }}
                    onClick={() => addToPriority(index)}
                  />
                </td>
              )}
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTable2 = () => {
    return (
      <div
        style={{
          height: height - 100,
          overflow: 'auto',
        }}
      >
        <table id="fsstable" style={{ minWidth: '500px', maxWidth: width }}>
          <thead>
          <tr>
            {Constant.getInstance().canEdit && <th>Action</th>}
            <th>OrderID</th>
            <th>Account</th>
            <th>Custodycd</th>
            <th>Norb</th>
            <th>Symbol</th>
            <th>Side</th>
            <th>Type</th>
            <th>Qtty</th>
            <th>Price</th>
          </tr>
          </thead>
          <tbody>
          {   queue?.map((d: any, index: number) => (
            <tr>
              {Constant.getInstance().canEdit && (
                <td style={{ textAlign: 'center' }}>
                  <Icon
                    title="Remove from priority queue"
                    name="arrow-left"
                    style={{ cursor: 'pointer' }}
                    onClick={() => addToNormal(index)}
                  />
                </td>
              )}
              <td>{d.orderID}</td>
              <td>{d.accountNo}</td>
              <td>{d.custodycd}</td>
              <td>{d.norb}</td>
              <td>{d.symbol}</td>
              <td>{d.side === 'B' ? 'Buy' : 'Sell'}</td>
              <td>{d.orderType}</td>
              <td style={{ textAlign: 'right' }}>
                {Intl.NumberFormat('en-US').format(Number(d.quantity))}
              </td>
              <td style={{ textAlign: 'right' }}>
                {Intl.NumberFormat('en-US').format(Number(d.price))}
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    );
  };

  //Handle search call from SearchForm
  const search = async (searchData?: any, page?: any) => {
    if (searchData === null) {
      return;
    }
    if (page === null) {
      page = 0;
    }
    try {
      searchData.oddLot='';
      let res: any = await getOrder(searchData, page);
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

  return (
    <HorizontalGroup
      justify="center"
      align="flex-start"
      style={{ width, height, overflow: 'auto' }}
    >
      <InlineFieldRow style={{ height, overflow: 'auto' }}>
        <InlineField>
          <VerticalGroup justify="flex-start" align="center">
            <SearchFormPri handleFunction={search} order={order} />
            {renderTable1()}
          </VerticalGroup>
        </InlineField>
        <InlineField>
          <VerticalGroup justify="flex-start" align="center">
            <h3 style={{ marginTop: '56px' }}>Priority Queue</h3>
            {renderTable2()}
          </VerticalGroup>
        </InlineField>
      </InlineFieldRow>
    </HorizontalGroup>
  );
};
