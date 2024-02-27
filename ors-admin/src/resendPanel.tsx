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
import { SearchFormResendMessages } from 'component/SearchFormResendMessages';
import { toast } from 'react-toastify';
import {
  getMessagesAPI,
  resendMessagesAPI,
  resendMessagesAll,
  checkAuthAPI,
} from 'api/main';
import { Constant } from 'api/Consant';
import _ from 'lodash';
var dateFormat = require('dateformat');

import { OrderBookPanelOptions } from 'types';
interface Props extends OrderBookPanelOptions { }
const btnSize: IconSize = 'xxl';

export const ResendPanel: React.FC<Props> = ({ width, height }) => {
  const handleOnchange = (
    e: React.FormEvent<HTMLInputElement>,
    key?: string
  ) => {
    setPassword(e.currentTarget.value);
  };

  const [messages, setMessages] = useState([]);
  const [resendType, setResendType] = useState('');
  const [resendData, setResendData] = useState({msgId: ''});

  // const [showResendRange, setShowResendRange] = useState(false);
  // const [rangeMessagesData, setRangeMessagesData] = useState({
  //   fromId: 0,
  //   toId: 0,
  // });

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
            : 'message: ' + resendData.msgId + '?')
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

  // const renderEdit = () => {
  //   return (
  //     <ConfirmModal
  //       isOpen={showResendRange}
  //       title={'Resend messages range: '}
  //       confirmText={'Resend'}
  //       key="edit-modal-resendMessage"
  //       body={
  //         <React.Fragment>
  //           <InlineField label="From AutoId" labelWidth={20}>
  //             <Input
  //               type="number"
  //               width={30}
  //               css={''}
  //               value={rangeMessagesData.fromId}
  //               onChange={(e) => {
  //                 let newData: any = { ...rangeMessagesData };
  //                 newData.fromId = e.currentTarget.value;
  //                 setRangeMessagesData(newData);
  //               }}
  //             />
  //           </InlineField>
  //           <InlineField label="To AutoId" labelWidth={20}>
  //             <Input
  //               type="number"
  //               width={30}
  //               css={''}
  //               value={rangeMessagesData.toId}
  //               onChange={(e) => {
  //                 let newData: any = { ...rangeMessagesData };
  //                 newData.toId = e.currentTarget.value;
  //                 setRangeMessagesData(newData);
  //               }}
  //             />
  //           </InlineField>
  //         </React.Fragment>
  //       }
  //       onDismiss={() => {
  //         setShowResendRange(false);
  //       }}
  //       onConfirm={async () => {
  //         try {
  //           if (rangeMessagesData.fromId < 0 || rangeMessagesData.toId <=0 || rangeMessagesData.toId < rangeMessagesData.fromId) {
  //             toast.error('Range values is invalid!');
  //             return;
  //           }
  //           await resendAll();
  //         }
  //         catch (error) {
  //           toast.error(error);
  //         }
  //         setShowResendRange(false);
  //         setShowModal(true);
  //       }
  //      }
  //     />
  //   );
  // };

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
              <th>AutoId</th>
              <th>MsgId</th>
              <th>MsgLog</th>
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
                  <td style={{ textAlign: 'center' }}>{m.AUTOID}</td>
                  <td>{m.MSGID}</td>
                  <td style={{ textAlign: 'left', wordBreak: 'break-all'}}>{m.MSGLOG}</td>
                  <td style={{ textAlign: 'center' }}>{m.STATUS}</td>
                  <td style={{ textAlign: 'center' }}>
                    {Constant.getInstance().canEdit && (
                      <span>
                        <Icon
                          name="repeat"
                          size={btnSize}
                          title="ReSend"
                          style={{ cursor: 'pointer', color: 'orange' }}
                          onClick={() => {
                            resendOne(m.MSGID);
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

      let res: any = await getMessagesAPI(searchData, page);
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
      //setShowResendRange(true);
      setShowModal(true);
  };

  //Handle button resend on each row trigger
  const resendOne = async (msgId: string) => {
      setResendType('1');
      setResendData({msgId});
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
        res = await resendMessagesAll(resendData);
      } catch (error) {
        toast.error(error);
      }
    } else {
      try {
        res = await resendMessagesAPI(resendData.msgId);
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
     <SearchFormResendMessages
      handleFunction={search}
      handleResendAll={resendAll}
      messages={messages}
      width={width}
    />
    {renderTableData()}
    {/* {renderEdit()} */}
    {renderModal()}
  </VerticalGroup>
);
};
