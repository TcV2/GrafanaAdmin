// @ts-nocheck
import {
  Button,
  VerticalGroup,
  HorizontalGroup,
  InlineField,
  InlineFieldRow,
  ConfirmModal,
  Input,
  Icon,
  IconSize,
} from '@grafana/ui';
import React, { useState, useEffect } from 'react';
import { OrderBookPanelOptions } from 'types';
import { SearchFormOrderResponse } from 'component/SearchFormOrderResponse';
import { toast } from 'react-toastify';
import {
  getOrderResponseAPI,
  resendAllOrderResponse,
  resendOrderResponse,
  checkAuthAPI,
} from 'api/main';
import { Constant } from 'api/Consant';
import _ from 'lodash';
var dateFormat = require('dateformat');

import { OrderBookPanelOptions } from 'types';
interface Props extends OrderBookPanelOptions { }
const btnSize: IconSize = 'xxl';

export const OrderResponsePanel: React.FC<Props> = ({ width, height }) => {
  const handleOnchange = (
    e: React.FormEvent<HTMLInputElement>,
    key?: string
  ) => {
    setPassword(e.currentTarget.value);
  };

  const [messages, setMessages] = useState([]);
  const [resendType, setResendType] = useState('');
  const [resendData, setResendData] = useState({autoId: ''});

  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const renderModal = () => {
    return (
      <ConfirmModal
        isOpen={showModal}
        title={
          'Resend ' +
          (resendType === 'all'
            ? 'all messages?'
            : 'message: ' + resendData.autoId + '?')
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

  const renderTableData = () => {
    return (
      <div
        id="fss-table-wrapper"
        style={{ overflowX: 'none', overflowY: 'auto', width, height: height - 125, zIndex: 1 }}
      >
        <table style={{ width: '100%' }} id="fsstable">
          <thead>
          <tr>
            <th>Time</th>
            <th>MsgLog</th>
            <th>TargetId</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          {messages.map((m: any) => {
            const { AUTOID } = m;
            let date = new Date(parseInt(m.createdTime, 10));
            let dateString = dateFormat(date, 'yyyy-mm-dd HH:MM:ss.l');
            return (
              <tr key={AUTOID}>
                <td>{dateString}</td>
                <td style={{ textAlign: 'left', wordBreak: 'break-all'}}>{m.MSGLOG}</td>
                <td style={{ textAlign: 'center' }}>{m.TARGETID}</td>
                <td style={{ textAlign: 'center' }}>{m.STATUS}</td>
                <td style={{ textAlign: 'center' }}>
                  {Constant.getInstance().canEdit && (
                    <span>
                        <Icon
                          name="repeat"
                          size={btnSize}
                          title="ReSend"
                          style={{ cursor: 'pointer', color: 'orange', visibility: m.STATUS !== 'C' ? 'visible' :'visible' }}
                          onClick={() => {
                            resendOne(m.AUTOID);
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
        </table>
      </div>
    );
  };

  const search = async (searchData1?: any, page?: any) => {
    let searchData = _.cloneDeep(searchData1)
    setResendData(searchData);
    if (searchData === null) {
      return;
    }
    if (page == null) {
      page = 0;
    }
    try {
      if(searchData.fromTime !== '')
      {
        searchData.fromTime = formatDateTime(searchData.fromTime);
      }
      if(searchData.toTime !== '')
      {
        searchData.toTime = formatDateTime(searchData.toTime);
      }

      let res: any = await getOrderResponseAPI(searchData, page);
      if (res.ref_cursor) {
        setMessages(res.ref_cursor);
        document.getElementById('fss-table-wrapper')!.scrollTop = 0;
      } else {
        setMessages([]);
      }
    } catch (e) {
      setMessages([]);
      toast.error(e);
    } finally {
    }
  };

  const formatDateTime = (dateValue) => {
    var newDate = new Date(dateValue);
    let dateTime = newDate.getFullYear().toString()
      + ("0" + (newDate.getMonth() + 1).toString()).slice(-2)
      + ("0" + newDate.getDate()).slice(-2)
      + ("0" +newDate.getHours()).slice(-2)
      + ("0" +newDate.getMinutes()).slice(-2)
      + ("0" +newDate.getSeconds()).slice(-2)
    return dateTime;
  }

  //Handle button resendAll trigger
  const resendAll = async () => {
    setResendType('all');
    setShowModal(true);
  };

  //Handle button resend on each row trigger
  const resendOne = async (autoId: string) => {
    setResendType('1');
    setResendData({autoId});
    setShowModal(true);
  };

  //Call api checkAuth + resend by type
  const doResend = async () => {
    if (password === '') {
      toast.error('Password can not be empty');
      return;
    }
    let auth = await checkAuthAPI(password);
    if (auth) {
      let res: any = null;
      if (resendType === 'all') {
        try {
          res = await resendAllOrderResponse(resendData);
        } catch (error) {
          toast.error(error);
        }
      } else {
        try {
          res = await resendOrderResponse(resendData.autoId);
        } catch (error) {
          toast.error(error);
        }
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

  return (
    <VerticalGroup justify="flex-start" align="center">
      <SearchFormOrderResponse
        handleFunction={search}
        handleResendAll={resendAll}
        messages={messages}
        width={width}
      />
      {renderTableData()}
      {renderModal()}
    </VerticalGroup>
  );
};
