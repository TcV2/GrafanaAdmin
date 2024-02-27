// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { SelectableValue } from '@grafana/data';
import {
  Button,
  Select,
  InlineFieldRow,
  Input,
  InlineField,
} from '@grafana/ui';

import { Constant } from 'api/Consant';
import { useForm, SubmitHandler } from 'react-hook-form';

interface SearchComponentOptions {
  handleFunction: (data?: object, page?: any) => Promise<void> | void;
  handleResendAll: () => Promise<void> | void;
  messages: any[];
}

type Inputs = {
  autoId: string;
  msgId: string;
  msgLog: string;
  ordStatus: string;
  orderID: string;
  account: string;
  symbol: string;
};

interface ObjectKeys {
  [key: string]: string | number;
}
interface Data extends ObjectKeys {
  autoId: string;
  msgId: string;
  msgLog: string;
  ordStatus: string;
  orderID: string;
  account: string;
  symbol: string;
  status: string;
  fromTime: string;
  toTime: string;
}

export const SearchFormResendOrder: React.FC<SearchComponentOptions> = ({
  handleFunction,
  handleResendAll,
  messages,
  width
}) => {
  //Init validate
  const { handleSubmit } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = () => {
    preTrigger(handleFunction, 1);
    setPage(1);
  };

  const [data, setData] = useState({
    autoId: '',
    msgId: '',
    msgLog: '',
    ordStatus: 'All',
    orderID: '',
    account: '',
    symbol: '',
    status: 'ALL',
    fromTime: '',
    toTime: '',
  });

  const handleOnchange = (
    e: React.FormEvent<HTMLInputElement>,
    key: string
  ) => {
    let newData: Data = { ...data };
    newData[key] = e.currentTarget.value;
    setData(newData);
  };

  const handleOnchangeSelectNew = (e: SelectableValue, key: string) => {
    let newData: Data = { ...data };
    newData[key] = e.value;
    setData(newData);
  };

  const [active, setActive] = useState(true);

  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    document.getElementById('fssinputpage')!.value = page;
  }, [page]);

  useEffect(() => {
    preTrigger(handleFunction, 1);
  }, []);

  const preTrigger = async (
    f: (data?: object, page?: any) => Promise<void> | void,
    pageNum?: any
  ) => {
    setActive(false);
    await f(data, pageNum - 1);
    setActive(true);
  };

  // const onkeydown = (e: any) => {
  //   if (e.keyCode === 13) {
  //     preTrigger(handleFunction, Number(e.currentTarget.value));
  //     setPage(Number(e.currentTarget.value));
  //   }
  // };

  const renderForm = () => {
    return (
      <div style={{ marginBottom: '18px'}}>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <InlineFieldRow>
              <InlineField label="OrderId">
                <Input
                  width={30}
                  css={''}
                  value={data.orderID}
                  onChange={e => handleOnchange(e, 'orderID')}
                />
              </InlineField>
              <InlineField label="Account">
                <Input
                  width={16}
                  css={''}
                  value={data.account}
                  onChange={e => handleOnchange(e, 'account')}
                />
              </InlineField>
              <InlineField label="Symbol">
                <Input
                  width={16}
                  css={''}
                  value={data.symbol}
                  onChange={e => handleOnchange(e, 'symbol')}
                />
              </InlineField>
              <InlineField label="Status">
                <Select
                  value={data.status}
                  width={16}
                  onChange={e => handleOnchangeSelectNew(e, 'status')}
                  options={[
                    { label: 'ALL', value: 'ALL' },
                    { label: 'New', value: 'N' },
                    { label: 'Error', value: 'E' },
                    { label: 'Complete', value: 'C' },
                  ]}
                />
              </InlineField>
              <InlineField disabled={!active}>
                <Button type="submit" icon="search" title="Search"></Button>
              </InlineField>
              {messages.length >= 0 && (
                <InlineField
                  label={
                    messages.length + (messages.length > 1 ? ' results' : ' result')
                  }
                >
                  <div></div>
                </InlineField>
              )}
            </InlineFieldRow>
            <InlineFieldRow>
              <InlineField label="FromTime">
                <Input
                  type="datetime-local"
                  max="9999-12-31"
                  // id = "fromTime"
                  value={data.fromTime}
                  onChange={e => handleOnchange(e, 'fromTime')}
                />
              </InlineField>
              <InlineField label="ToTime">
                <Input
                  type="datetime-local"
                  max='12/31/9999 11:59 PM'
                  // id = "toTime"
                  value={data.toTime}
                  onChange={e => handleOnchange(e, 'toTime')}
                />
              </InlineField>
              <InlineField label="OrdStatus">
                <Select
                  value={data.ordStatus}
                  width={20}
                  onChange={e => handleOnchangeSelectNew(e, 'ordStatus')}
                  options={[
                    { label: 'ALL', value: 'All' },
                    { label: 'New', value: 'New' },
                    { label: 'PendingNew', value: 'PendingNew' },
                    { label: 'Replace', value: 'Replace' },
                    { label: 'PendingReplace', value: 'PendingReplace' },
                    { label: 'Cancel', value: 'Cancel' },
                    { label: 'PendingCancel', value: 'PendingCancel' },
                    { label: 'Expired', value: 'Expired' },
                    { label: 'Filled', value: 'Filled' },
                    { label: 'Reject', value: 'Reject' },
                    { label: 'DoneForDay', value: 'DoneForDay' },
                  ]}
                />
              </InlineField>
            </InlineFieldRow>
          </form>
          {Constant.getInstance().canEdit && (
                     <div style={{position: 'absolute', top:'90px', left: 'calc(100% - 110px)' }} disabled={!active}>
                     <Button
                       type="button"
                       style={{ backgroundColor: 'orange',  position: 'absolute',left: '100%'}}
                       onClick={() => preTrigger(handleResendAll)}
                     >
                       Resend All
                     </Button>
                   </div>
              )}
        </div>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            margin: '0px',
          }}
        >
          <InlineFieldRow style={{ transform: 'scale(0.7)', padding: 0 }}>
            <span>Page:</span>
            <input
              disabled={page === 1 && messages.length < 100}
              id="fssinputpage"
              type="text"
              style={{ width: '30px', marginLeft: '5px' }}
              onKeyDown={e => onkeydown(e)}
            />
            <Button
              disabled={page === 1}
              icon="angle-left"
              size="sm"
              style={{ marginLeft: '5px' }}
              onClick={() => {
                preTrigger(handleFunction, page - 1);
                setPage(page - 1);
              }}
            ></Button>
            <Button
              disabled={messages.length < 100}
              icon="angle-right"
              size="sm"
              style={{ marginLeft: '5px' }}
              onClick={() => {
                preTrigger(handleFunction, page + 1);
                setPage(page + 1);
              }}
            ></Button>
          </InlineFieldRow>
        </div>
      </div>
      // </div>
    );
  };

  return <div>{renderForm()}</div>;
};