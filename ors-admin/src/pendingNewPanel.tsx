// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { OrderBookPanelOptions } from 'types';
import { SearchFormPending } from 'component/SearchFormPending';
import {
  getOrderByStatus,
  searchOrderAPI,
  resendPendingNewAPI,
  checkAuthAPI,
} from 'api/main';
import { toast } from 'react-toastify';
import {
  VerticalGroup,
  IconSize,
  Icon,
  ConfirmModal,
  InlineField,
  Input,
} from '@grafana/ui';
import {Constant} from "./api/Consant";
var dateFormat = require('dateformat');
interface Props extends OrderBookPanelOptions {}
const btnSize: IconSize = 'xxl';

export const PendingNewPanel: React.FC<Props> = ({ width, height }) => {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetchData();
  }, []);

  const handleOnchange = (
    e: React.FormEvent<HTMLInputElement>,
    key?: string
  ) => {
    setPassword(e.currentTarget.value);
  };
  const [resendType, setResendType] = useState('');
  const [resendData, setResendData] = useState({
    accountNo: '',
    orderID: ''
  });

  const resendOne = async (accountNo: string, orderID: string) => {
    setResendType('1');
    setResendData({
      accountNo: accountNo,
      orderID: orderID
    });
    setShowModal(true);
  };

  //Call api checkAuth + resend
  const doResend = async () => {
    if (password === '') {
      toast.error('Password can not be empty');
      return;
    }
    let auth = await checkAuthAPI(password);
    if (auth) {
      let res: any = null;
      try {
        res = await resendPendingNewAPI(resendData);
      } catch (error) {
        toast.error(error);
      }
      const resMsg = JSON.parse(JSON.stringify(res));
      if(resMsg.err_code === "0")
      {
        toast.success('Resend successfully');
      }
      else
      {
        toast.error('Resend was failed, please check! Error code: ' + resMsg.err_code);
      }
    } else {
      toast.error('Wrong password. Do not resend at all!');
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const renderModal = () => {
    return (
      <ConfirmModal
        isOpen={showModal}
        title={
          `Resend order: ${resendData.orderID}?`
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
          await doResend();
          setShowModal(false);
          setPassword('');
        }}
      />
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
      searchData.status = 'PendingNew';
      let res: any = await searchOrderAPI(searchData, page);
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

  const fetchData = async () => {
    try {
      let data = await getOrderByStatus('PendingNew');
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
              <th>ACTIONS</th>
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
                  <td>{o.side}</td>
                  <td>{o.orderType}</td>
                  <td style={{ textAlign: 'right' }}>{o.quantity}</td>
                  <td style={{ textAlign: 'right' }}>{o.price}</td>
                  <td style={{ textAlign: 'right' }}>{o.remainingQuantity}</td>
                  <td>{o.status}</td>
                  <td style={{ textAlign: 'center' }}>
                    {Constant.getInstance().canEdit && (
                      <span>
                        <Icon
                          name="repeat"
                          size={btnSize}
                          title="ReSend"
                          style={{ cursor: 'pointer', color: 'orange' }}
                          onClick={() => {
                            resendOne(o.accountNo, o.orderID);
                          }}
                        >
                          ReSend
                        </Icon>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            </tbody>
          )}
        </table>
      </div>
    );
  };
  return (
    <VerticalGroup justify="flex-start" align="center">
      <div id="searchForm"></div>
      <SearchFormPending handleFunction={search} order={data} />
      {renderTableData()}
      {renderModal()}
    </VerticalGroup>
  );
};
