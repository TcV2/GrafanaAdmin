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
  handleFunction2: () => Promise<void> | void;
  handleUnholdAll: () => Promise<void> | void;
  order: any[];
  childFunc: any
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
  type: string;
  status: string;
  floor: string;
}

export const SearchForm: React.FC<SearchComponentOptions> = ({
  handleFunction,
  handleFunction2,
  handleUnholdAll,
  order,
  childFunc
}) => {
  //Init validate
  const { handleSubmit } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = () => {
    preTrigger(handleFunction, 1);
    setPage(1);
  };

  const callFromParent = () => {
    preTrigger(handleFunction, 1)
  }

  React.useEffect(() => {
    childFunc.current = callFromParent
  }, [])

  const [data, setData] = useState({
    account: '',
    custodycd: '',
    symbol: '',
    side: 'ALL',
    type: 'ALL',
    status: 'ALL',
    floor: 'ALL',
  });

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

  // const handleOnchangeSelect = (
  //   e: React.FormEvent<HTMLSelectElement>,
  //   key: string
  // ) => {
  //   let newData: Data = { ...data };
  //   newData[key] = e.currentTarget.value;
  //   setData(newData);
  // };

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
              <InlineField label="Account">
                <Input
                  width={14}
                  css={''}
                  value={data.account}
                  onChange={e => handleOnchange(e, 'account')}
                />
              </InlineField>
              <InlineField label="CustodyCD">
                <Input
                  width={14}
                  css={''}
                  value={data.custodycd}
                  onChange={e => handleOnchange(e, 'custodycd')}
                />
              </InlineField>
              <InlineField label="Symbol">
                <Input
                  // {...(register('symbol'), { required: true, minLength: 3 })}
                  width={12}
                  css={''}
                  value={data.symbol}
                  onChange={e => handleOnchange(e, 'symbol')}
                />
              </InlineField>
              <InlineField label="Side">
                <Select
                  value={data.side}
                  width={12}
                  onChange={e => handleOnchangeSelectNew(e, 'side')}
                  options={[
                    { label: 'ALL', value: 'ALL' },
                    { label: 'Sell', value: 'S' },
                    { label: 'Buy', value: 'B' },
                  ]}
                />
              </InlineField>
              <InlineField label="Type">
                <Select
                  value={data.type}
                  onChange={e => handleOnchangeSelectNew(e, 'type')}
                  width={12}
                  options={[
                    { label: 'ALL', value: 'ALL' },
                    { label: 'LO', value: 'LO' },
                    { label: 'MP', value: 'MP' },
                    { label: 'ATC', value: 'ATC' },
                    { label: 'ATO', value: 'ATO' },
                    { label: 'MOK', value: 'MOK' },
                    { label: 'MAK', value: 'MAK' },
                    { label: 'PLO', value: 'PLO' },
                    { label: 'MTL', value: 'MTL' },
                  ]}
                />
              </InlineField>
              <InlineField label="Status">
                <Select
                  value={data.status}
                  onChange={e => handleOnchangeSelectNew(e, 'status')}
                  width={20}
                  options={[
                    { label: 'ALL', value: 'ALL' },
                    { label: 'Pending New', value: 'PendingNew' },
                    { label: 'New', value: 'New' },
                    { label: 'Filled', value: 'Filled' },
                    { label: 'Partially Filled', value: 'PartiallyFilled' },
                    { label: 'Pending Cancel', value: 'PendingCancel' },
                    { label: 'Canceled', value: 'Canceled' },
                    { label: 'Pending Replace', value: 'PendingReplace' },
                    { label: 'ORS Rejected', value: 'ORSRejected' },
                    { label: 'Rejected', value: 'Rejected' },
                    { label: 'Expired', value: 'Expired' },
                    { label: 'Done for day', value: 'DoneForDay' },
                    { label: 'Unknown', value: 'Unknown' },
                  ]}
                />
              </InlineField>
              <InlineField label="Floor">
                <Select
                  value={data.floor}
                  onChange={e => handleOnchangeSelectNew(e, 'floor')}
                  width={12}
                  options={[
                    { label: 'ALL', value: 'ALL' },
                    { label: 'HOSE', value: 'HSX' },
                    { label: 'HNX', value: 'HNX' },
                    { label: 'UPCOM', value: 'UPCOM' },
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
              {/* <InlineField disabled={!active}>
                <Button
                  type="button"
                  onClick={() => preTrigger(handleFunction2)}
                  icon="sync"
                  title="Refresh"
                ></Button>
              </InlineField> */}
              {Constant.getInstance().canEdit && (
                <InlineField disabled={!active}>
                  <Button
                    type="button"
                    style={{ backgroundColor: 'orange' }}
                    onClick={() => preTrigger(handleUnholdAll)}
                  >
                    Unhold all
                  </Button>
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
      // </div>
    );
  };

  return <React.Fragment>{renderForm()}</React.Fragment>;
};
