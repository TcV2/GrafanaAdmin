// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { OrderBookPanelOptions } from 'types';
import { SearchFormRejected } from 'component/SearchFormRejected';
import { getRejectedOrder, searchRejectedOrderAPI } from 'api/main';
import { toast } from 'react-toastify';
import { VerticalGroup } from '@grafana/ui';
var dateFormat = require('dateformat');
interface Props extends OrderBookPanelOptions {}

export const RejectedPanel: React.FC<Props> = ({ width, height }) => {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      let data = await getRejectedOrder('Rejected');
      setData(data.data.ref_cursor);
      console.log(data);
      document.getElementById('fss-table-wrapper')!.scrollTop = 0;
    } catch (e) {
      toast.error('Fetch Failed: ' + e);
    }
  };

  const renderTableData = () => {
    return (
      <div
        id="fss-table-wrapper"
        style={{ overflow: 'auto', width, height: height - 120, zIndex: 1 }}
      >
        <table style={{ width: '100%' }} id="fsstable">
          <thead>
            <tr>
              <th>TIME</th>
              <th>ORDERID</th>
              <th>ACCOUNT</th>
              <th>SYMBOL</th>
              <th>SIDE</th>
              <th>TYPE</th>
              <th>QTY</th>
              <th>PRICE</th>
              <th>REMAIN</th>
              <th>STATUS</th>
              <th>REJECTED</th>
              <th>BY</th>
              <th>TEXT</th>
            </tr>
          </thead>
          {data != null && (
            <tbody>
            {data.map((o: any) => {
              const { orderID } = o;
              let date = new Date(parseInt(o.createdTime, 10));
              let dateString = dateFormat(date, 'yyyy-mm-dd HH:MM:ss.l');
              return (
                <tr key={orderID}>
                  <td>{dateString}</td>
                  <td>{o.orderID}</td>
                  <td>{o.accountNo}</td>
                  <td>{o.symbol}</td>
                  <td>{o.side === 'B' ? 'Buy' : 'Sell'}</td>
                  <td>{o.orderType}</td>
                  <td style={{ textAlign: 'right' }}>{o.quantity}</td>
                  <td style={{ textAlign: 'right' }}>{o.price}</td>
                  <td style={{ textAlign: 'right' }}>{o.remainingQuantity}</td>
                  <td>{o.status}</td>
                  <td>{o.subStatus}</td>
                  <td>{o.rejectBy}</td>
                  <td>{o.rejectMessage}</td>
                </tr>
              );
            })}
            </tbody>
          )}
        </table>
      </div>
    );
  };

  const search = async (searchData?: any, page?: any) => {
    if (searchData === null) {
      return;
    }
    if (page == null) {
      page = 0;
    }
    try {
      searchData.status = 'Rejected';
      let res: any = await searchRejectedOrderAPI(searchData, page);
      if (res.ref_cursor) {
        setData(res.ref_cursor);
        document.getElementById('fss-table-wrapper')!.scrollTop = 0;
      } else {
        setData([]);
      }
    } catch (e) {
      setData([]);
      toast.error(e);
    } finally {
    }
  };

  return (
    <VerticalGroup justify="flex-start" align="center">
      <div id="searchForm"></div>
      <SearchFormRejected handleFunction={search} order={data} />
      {renderTableData()}
    </VerticalGroup>
  );
};
