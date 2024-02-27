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
  order: any[];
}

type Inputs = {
  id: string;
};

interface ObjectKeys {
  [key: string]: string | number;
}
interface Data extends ObjectKeys {
  id: string;
  modetype: string;
  prtype: string;
}

export const SearchFormPool: React.FC<SearchComponentOptions> = ({
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
    id: '',
    modetype: 'ALL',
    prtype: 'ALL',
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
              <InlineField label="ID">
                <Input
                  width={12}
                  css={''}
                  value={data.id}
                  onChange={e => handleOnchange(e, 'id')}
                />
              </InlineField>
            <InlineField label="ModType">
              <Select
                value={data.modetype}
                width={12}
                onChange={e => handleOnchangeSelectNew(e, 'modetype')}
                options={[
                  { label: 'ALL', value: 'ALL' },
                  { label: 'FLEX', value: 'FLEX' },
                  { label: 'OMS1', value: 'OMS1' },
                  { label: 'OMS2', value: 'OMS2' },
                ]}
                />
            </InlineField>

          <InlineField label="Prtype">
            <Select
              value={data.prtype}
              width={12}
              onChange={e => handleOnchangeSelectNew(e, 'prtype')}
              options={[
                { label: 'ALL', value: 'ALL' },
                { label: 'SYSTEM', value: 'SY' },
                { label: 'TYPE', value: 'TY' },
                { label: 'ACCOUNT', value: 'AF' },
                { label: 'GROUP', value: 'GR' },
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
              disabled={page === 1 && order.length < 30}
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
              disabled={order.length < 30}
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

  return <React.Fragment>{renderForm()}</React.Fragment>;
};
