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
import { useForm, SubmitHandler } from 'react-hook-form';
import _ from 'lodash';

interface SearchComponentOptions {
  handleFunction: (data?: object, page?: any) => Promise<void> | void;
  order: any[];
}

type Inputs = {
  account: string;
  symbol: string;
};

interface ObjectKeys {
  [key: string]: string | number;
}
interface Data extends ObjectKeys {
  account: string;
  symbol: string;
  side: string;
}

export const SearchFormPri: React.FC<SearchComponentOptions> = ({
  handleFunction,
  order,
}) => {
  //Init validate
  const { handleSubmit } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = () => {
    preTrigger(handleFunction, 1);
    setPage(1);
  };

  const [data, setData] = useState({
    account: '',
    custodycd: '',
    symbol: '',
    side: 'ALL',
    disposal: 'ALL',
    norb: 'ALL',
  });

  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    document.getElementById('fssinputpage')!.value = page;
  }, [page]);

  useEffect(() => {
    preTrigger(handleFunction, 1);
  }, []);

  const handleOnchange = (
    e: React.FormEvent<HTMLInputElement>,
    key: string
  ) => {
    let newData: Data = { ...data };
    if (key === 'symbol') {
      newData[key] = e.currentTarget.value.toUpperCase();
    } else {
      newData[key] = e.currentTarget.value;
    }
    setData(newData);
  };

  const handleOnchangeSelectNew = (e: SelectableValue, key: string) => {
    let newData: Data = { ...data };
    newData[key] = e.value;
    setData(newData);
  };

  const [active, setActive] = useState(true);

  const preTrigger = async (
    f: (data?: object, page?: any) => Promise<void> | void,
    pageNum?: any
  ) => {
    setActive(false);
    await f(data, pageNum - 1);
    setActive(true);
  };

  const onkeydown = (e: any) => {
    if (e.keyCode === 13) {
      preTrigger(handleFunction, Number(e.currentTarget.value));
      setPage(Number(e.currentTarget.value));
    }
  };

  const renderForm = () => {
    return (
      <div style={{ position: 'relative', marginBottom: '18px' }}>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <InlineFieldRow>
              <InlineField label="Account">
                <Input
                  width={15}
                  css={''}
                  value={data.account}
                  onChange={e => handleOnchange(e, 'account')}
                />
              </InlineField>

              <InlineField label="Custodycd">
                <Input
                  width={15}
                  css={''}
                  value={data.custodycd}
                  onChange={e => handleOnchange(e, 'custodycd')}
                />
              </InlineField>
              <InlineField label="Symbol">
                <Input
                  width={10}
                  css={''}
                  value={data.symbol}
                  onChange={e => handleOnchange(e, 'symbol')}
                />
              </InlineField>
            </InlineFieldRow>
            <InlineFieldRow>
              <InlineField label="Side">
                <Select
                  value={data.side}
                  width={10}
                  onChange={e => handleOnchangeSelectNew(e, 'side')}
                  options={[
                    { label: 'ALL', value: 'ALL' },
                    { label: 'Sell', value: 'S' },
                    { label: 'Buy', value: 'B' },
                  ]}
                />
              </InlineField>
              <InlineField label="Disposal">
                <Select
                  value={data.disposal}
                  width={10}
                  onChange={e => handleOnchangeSelectNew(e, 'disposal')}
                  options={[
                    { label: 'ALL', value: 'ALL' },
                    { label: 'Y', value: 'Y' },
                    { label: 'N', value: 'N' },
                  ]}
                />
              </InlineField>
              <InlineField label="Norb">
                <Select
                  value={data.norb}
                  width={20}
                  onChange={e => handleOnchangeSelectNew(e, 'norb')}
                  options={[
                    { label: 'ALL', value: 'ALL' },
                    { label: 'Thường', value: 'N' },
                    { label: 'Thỏa thuận', value: 'B' },
                  ]}
                />
              </InlineField>
              <InlineField disabled={!active}>
                <Button type="submit" icon="search" title="Search"></Button>
              </InlineField>
              {order.length >= 0 && (
                <InlineField
                  label={
                    order.length + (order.length > 1 ? ' results' : ' result')
                  }
                >
                  <div></div>
                </InlineField>
              )}
            </InlineFieldRow>
          </form>
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
              disabled={page === 1 && order.length < 100}
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
              disabled={order.length < 100}
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
    );
  };

  return <React.Fragment>{renderForm()}</React.Fragment>;
};
