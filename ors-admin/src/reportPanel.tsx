// @ts-nocheck
import { Button, InlineField, VerticalGroup } from '@grafana/ui';
import React, { useState, useEffect } from 'react';
import { OrderBookPanelOptions } from 'types';
import _ from 'lodash';
import {
  getPendingNewAPI,
  getPendingNewStatusAPI,
  getStatusAPI,
  getStatusBuViaAPI,
} from 'api/reportAPI';
import { toast } from 'react-toastify';

interface Props extends OrderBookPanelOptions {}

interface ObjectKeys {
  [key: string]: string | number;
}

let statusDF = {
  Replaced: 0,
  New: 0,
  PendingNew: 0,
  PendingNewBB: 0,
  PendingNewQQ: 0,
  Rejected: 0,
  PendingReplace: 0,
  Filled: 0,
  PartiallyFilled: 0,
  PendingCancel: 0,
  Expired: 0,
  Canceled: 0,
  DoneForDay: 0,
  total: 0,
};
let statusDefault = {
  orderNum: 0,
  order_valid: 0,
  order_reject: 0,
  qtty: 0,
  matchqtty: 0,
  ordervalue: 0,
  matchvalue: 0,
};
let statusViaDefault = {
  T: _.cloneDeep(statusDefault),
  O: _.cloneDeep(statusDefault),
  P: _.cloneDeep(statusDefault),
  BD: _.cloneDeep(statusDefault),
  M: _.cloneDeep(statusDefault),
  F: _.cloneDeep(statusDefault),
  B: _.cloneDeep(statusDefault),
  Other: _.cloneDeep(statusDefault),
};

const viaArr = ['O', 'P', 'BD', 'M', 'T', 'F', 'B', 'Other'];

export const ReportPanel: React.FC<Props> = ({ width, height }) => {
  useEffect(() => {
    fetchData();
  }, []);

  const [pending, setPending] = useState<ObjectKeys>({});
  const [pendingStatus, setPendingStatus] = useState<ObjectKeys>({});
  const [status, setStatus] = useState<ObjectKeys>({});
  const [statusByVia, setStatusByVia] = useState<any>();
  const [total, setTotal] = useState<any>({});

  const fetchData = async () => {
    // getPendingNewAPI()
    //   .then((data: any) => {
    //     if (data.ref_cursor[0]) {
    //       setPending(data.ref_cursor[0]);
    //     }
    //   })
    //   .catch((e) => toast.error(e));

    getPendingNewStatusAPI()
    .then((data: any) => {
      if (data.ref_cursor[0]) {
        setPendingStatus(data.ref_cursor[0]);
      }
    })
    .catch((e) => toast.error(e));

    getStatusAPI()
      .then((data: any) => {
        if (data.ref_cursor.length > 0) {
          let temp: ObjectKeys = _.cloneDeep(statusDF);
          data.ref_cursor.map((d: ObjectKeys) => {
            temp[d.orderStatus] = d.orderNum;
            temp.total = Number(temp.total) + Number(d.orderNum);
          });
          setStatus(temp);
        } else {
          setStatus(_.cloneDeep(statusDF));
        }
      })
      .catch((e) => {
        toast.error(e);
        setStatus(_.cloneDeep(statusDF));
      });
    getStatusBuViaAPI().then((data: any) => {
      let temp: any = _.cloneDeep(statusViaDefault);
      let total: any = _.cloneDeep(statusDefault);
      if (data.ref_cursor.length > 0) {
        data.ref_cursor.map((d: any) => {
          if (['O', 'P', 'BD', 'M', 'T', 'F', 'B'].includes(d.viacode)) {
            temp[d.viacode] = d;
          } else {
            temp['Other'].orderNum += d.orderNum;
            temp['Other'].order_valid += d.order_valid;
            temp['Other'].order_reject += d.order_reject;
            temp['Other'].qtty += d.qtty;
            temp['Other'].matchqtty += d.matchqtty;
            temp['Other'].ordervalue += d.ordervalue;
            temp['Other'].matchvalue += d.matchvalue;
          }
          Object.keys(d).map((k: any) => {
            if (k !== 'viacode' && k !== 'VIA') {
              total[k] += d[k];
            }
          });
        });
      }
      setTotal(total);
      setStatusByVia(temp);
    });
  };

  const renderTablePending = () => {
    if (!_.isEmpty(pendingStatus)) {
      return (
        <div style={{ minWidth: '200px', maxWidth: width, overflow: 'auto' }}>
          <table id="fsstable">
            <thead>
              <tr>
                <th style={{ width: '200px' }}>Pending New NN HOSE</th>
                <th style={{ width: '200px' }}>Pending New BB HOSE</th>
                <th style={{ width: '200px' }}>Pending New QQ HOSE</th>
                <th style={{ width: '200px' }}>Pending New NN HNX</th>
                <th style={{ width: '200px' }}>Pending New BB HNX</th>
                <th style={{ width: '200px' }}>Pending New QQ HNX</th>
                <th style={{ width: '200px' }}>Pending New NN UPCOM</th>
                <th style={{ width: '200px' }}>Pending New BB UPCOM</th>
                <th style={{ width: '200px' }}>Pending New QQ UPCOM</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ textAlign: 'right' }}>{pendingStatus.hsx_orderPending_NN}</td>
                <td style={{ textAlign: 'right' }}>{pendingStatus.hsx_orderPending_BB}</td>
                <td style={{ textAlign: 'right' }}>{pendingStatus.hsx_orderPending_QQ}</td>
                <td style={{ textAlign: 'right' }}>{pendingStatus.hnx_orderPending_NN}</td>
                <td style={{ textAlign: 'right' }}>{pendingStatus.hnx_orderPending_BB}</td>
                <td style={{ textAlign: 'right' }}>{pendingStatus.hnx_orderPending_QQ}</td>
                <td style={{ textAlign: 'right' }}>{pendingStatus.upcom_orderPending_NN}</td>
                <td style={{ textAlign: 'right' }}>{pendingStatus.upcom_orderPending_BB}</td>
                <td style={{ textAlign: 'right' }}>{pendingStatus.upcom_orderPending_QQ}</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    };
  };
    
  const renderTableStatus = () => {
    if (!_.isEmpty(status)) {
      return (
        <div style={{ minWidth: '300px', maxWidth: width, overflow: 'auto' }}>
          <table id="fsstable">
            <thead>
              <tr>
                <th style={{ minWidth: '100px' }}>Pending New</th>
                <th style={{ minWidth: '100px' }}>Pending New BB</th>
                <th style={{ minWidth: '100px' }}>Pending New QQ</th>
                <th style={{ minWidth: '100px' }}>New</th>
                <th style={{ minWidth: '100px' }}>Partially Filled</th>
                <th style={{ minWidth: '100px' }}>Filled</th>
                <th style={{ minWidth: '100px' }}>Pending Replace</th>
                <th style={{ minWidth: '100px' }}>Replaced</th>
                <th style={{ minWidth: '100px' }}>Pending Cancel</th>
                <th style={{ minWidth: '100px' }}>Canceled</th>
                <th style={{ minWidth: '100px' }}>Expired</th>
                <th style={{ minWidth: '100px' }}>DoneForDay</th>
                <th style={{ minWidth: '100px' }}>Rejected</th>
                <th style={{ minWidth: '100px' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ textAlign: 'right' }}>
                  {Intl.NumberFormat('en-US').format(status.PendingNew)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {Intl.NumberFormat('en-US').format(status.PendingNewBB)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {Intl.NumberFormat('en-US').format(status.PendingNewQQ)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {Intl.NumberFormat('en-US').format(status.New)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {Intl.NumberFormat('en-US').format(status.PartiallyFilled)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {Intl.NumberFormat('en-US').format(status.Filled)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {Intl.NumberFormat('en-US').format(status.PendingReplace)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {Intl.NumberFormat('en-US').format(status.Replaced)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {Intl.NumberFormat('en-US').format(status.PendingCancel)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {Intl.NumberFormat('en-US').format(status.Canceled)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {Intl.NumberFormat('en-US').format(status.Expired)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {Intl.NumberFormat('en-US').format(status.DoneForDay)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {Intl.NumberFormat('en-US').format(status.Rejected)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {Intl.NumberFormat('en-US').format(status.total)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }
  };

  const renderTableStatusByVia = () => {
    if (statusByVia) {
      return (
        <div style={{ minWidth: '300px', maxWidth: width, overflow: 'auto' }}>
          <table id="fsstable">
            <thead>
              <tr>
                <th style={{ minWidth: '100px' }}></th>
                <th style={{ minWidth: '100px' }}>Online</th>
                <th style={{ minWidth: '100px' }}>ProTrade</th>
                <th style={{ minWidth: '100px' }}>BD</th>
                <th style={{ minWidth: '100px' }}>Mobile </th>
                <th style={{ minWidth: '100px' }}>Tele</th>
                <th style={{ minWidth: '100px' }}>Floor</th>
                <th style={{ minWidth: '100px' }}>Bloomberg</th>
                <th style={{ minWidth: '100px' }}>Other</th>
                <th style={{ minWidth: '180px' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Order Num</td>
                {viaArr.map((k: any) => (
                  <td style={{ textAlign: 'right' }}>
                    {Intl.NumberFormat('en-US').format(statusByVia[k].orderNum)}
                  </td>
                ))}
                <td style={{ textAlign: 'right' }}>
                  {Intl.NumberFormat('en-US').format(total.orderNum)}
                </td>
              </tr>
              <tr>
                <td>Order Valid</td>
                {viaArr.map((k: any) => (
                  <td style={{ textAlign: 'right' }}>
                    {Intl.NumberFormat('en-US').format(
                      statusByVia[k].order_valid
                    )}
                  </td>
                ))}
                <td style={{ textAlign: 'right' }}>
                  {Intl.NumberFormat('en-US').format(total.order_valid)}
                </td>
              </tr>
              <tr>
                <td>Order Reject</td>
                {viaArr.map((k: any) => (
                  <td style={{ textAlign: 'right' }}>
                    {Intl.NumberFormat('en-US').format(
                      statusByVia[k].order_reject
                    )}
                  </td>
                ))}
                <td style={{ textAlign: 'right' }}>
                  {Intl.NumberFormat('en-US').format(total.order_reject)}
                </td>
              </tr>
              <tr>
                <td>Quantity</td>
                {viaArr.map((k: any) => (
                  <td style={{ textAlign: 'right' }}>
                    {Intl.NumberFormat('en-US').format(statusByVia[k].qtty)}
                  </td>
                ))}
                <td style={{ textAlign: 'right' }}>
                  {Intl.NumberFormat('en-US').format(total.qtty)}
                </td>
              </tr>
              <tr>
                <td>Match Qtty</td>
                {viaArr.map((k: any) => (
                  <td style={{ textAlign: 'right' }}>
                    {Intl.NumberFormat('en-US').format(
                      statusByVia[k].matchqtty
                    )}
                  </td>
                ))}
                <td style={{ textAlign: 'right' }}>
                  {Intl.NumberFormat('en-US').format(total.matchqtty)}
                </td>
              </tr>
              <tr>
                <td>Order Value</td>
                {viaArr.map((k: any) => (
                  <td style={{ textAlign: 'right' }}>
                    {Intl.NumberFormat('en-US').format(
                      statusByVia[k].ordervalue
                    )}
                  </td>
                ))}
                <td style={{ textAlign: 'right' }}>
                  {Intl.NumberFormat('en-US').format(total.ordervalue)}
                </td>
              </tr>
              <tr>
                <td>Match Value</td>
                {viaArr.map((k: any) => (
                  <td style={{ textAlign: 'right' }}>
                    {Intl.NumberFormat('en-US').format(
                      statusByVia[k].matchvalue
                    )}
                  </td>
                ))}
                <td style={{ textAlign: 'right' }}>
                  {Intl.NumberFormat('en-US').format(total.matchvalue)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }
  };

  return (
    <VerticalGroup justify="flex-start" align="flex-start">
      <span style={{ fontSize: '20px' }}>Statistic By Status</span>
      {renderTablePending()}
      <div style={{ height: '10px' }}></div>
      {renderTableStatus()}
      <div style={{ height: '2px', width, backgroundColor: 'black' }}></div>
      {/* <span style={{ fontSize: '20px' }}>Statistic By Channel</span>
      {renderTableStatusByVia()} */}
      <InlineField>
        <Button onClick={() => fetchData()}>Refresh</Button>
      </InlineField>
    </VerticalGroup>
  );
};
