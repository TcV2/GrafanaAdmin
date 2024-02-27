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
};

interface ObjectKeys {
  [key: string]: string | number;
}
interface Data extends ObjectKeys {
  autoId: string;
  msgLog: string;
  status: string;
  targetId: string;
  fromTime: string;
  toTime: string;
}

export const SearchFormOrderResponse: React.FC<SearchComponentOptions> = ({
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
    msgLog: '',
    status: 'ALL',
    targetId: '',
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

  const renderForm = () => {
    return (
      <div style={{marginBottom: '18px'}}>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <InlineFieldRow>
              <InlineField label="TargetId">
                <Input
                  width={16}
                  css={''}
                  value={data.targetId}
                  onChange={e => handleOnchange(e, 'targetId')}
                />
              </InlineField>
              <InlineField label="MsgLog">
                <Input
                  width={30}
                  css={''}
                  value={data.msgLog}
                  onChange={e => handleOnchange(e, 'msgLog')}
                />
              </InlineField>
              <InlineField label="Status">
                <Select
                  value={data.status}
                  width={16}
                  onChange={e => handleOnchangeSelectNew(e, 'status')}
                  options={[
                    { label: 'ALL', value: 'ALL' },
                    { label: 'Reject', value: 'R' },
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
            {/*<InlineFieldRow>*/}
            {/*  <InlineField label="FromTime">*/}
            {/*    <Input*/}
            {/*      type="datetime-local"*/}
            {/*      max="9999-12-31"*/}
            {/*      value={data.fromTime}*/}
            {/*      onChange={e => handleOnchange(e, 'fromTime')}*/}
            {/*    />*/}
            {/*  </InlineField>*/}
            {/*  <InlineField label="ToTime">*/}
            {/*    <Input*/}
            {/*      type="datetime-local"*/}
            {/*      max='12/31/9999 11:59 PM'*/}
            {/*      value={data.toTime}*/}
            {/*      onChange={e => handleOnchange(e, 'toTime')}*/}
            {/*    />*/}
            {/*  </InlineField>*/}
            {/*  <InlineField disabled={!active}>*/}
            {/*    <Button type="submit" icon="search" title="Search"></Button>*/}
            {/*  </InlineField>*/}
            {/*  {messages.length >= 0 && (*/}
            {/*    <InlineField*/}
            {/*      label={*/}
            {/*        messages.length + (messages.length > 1 ? ' results' : ' result')*/}
            {/*      }*/}
            {/*    >*/}
            {/*      <div></div>*/}
            {/*    </InlineField>*/}
            {/*  )}*/}
            {/*</InlineFieldRow>*/}
          </form>
          {Constant.getInstance().canEdit && (
            <div disabled={!active} style={{position: 'absolute', top:'45px', left: 'calc(100% - 200px)' }}>
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
            />
            <Button
              disabled={messages.length < 100}
              icon="angle-right"
              size="sm"
              style={{ marginLeft: '5px' }}
              onClick={() => {
                preTrigger(handleFunction, page + 1);
                setPage(page + 1);
              }}
            />
          </InlineFieldRow>
        </div>
      </div>
    );
  };

  return <div>{renderForm()}</div>;
};
