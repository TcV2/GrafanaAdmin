// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Button,
  Select,
  InlineFieldRow,
  Input,
  InlineField,
} from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import { toast } from 'react-toastify';
import {
  placeOrderAPI,
  symbolInfoAPI,
  getExStatusAPI,
  getPP0API,
  getPPSEAPI,
  getQMaxAPI,
} from 'api/main';
import { useForm, SubmitHandler } from 'react-hook-form';

interface SearchComponentOptions {
  waitFunction: () => void
}

type Inputs = {
  account: string;
  symbol: string;
  quantity: number;
};

interface ObjectKeys {
  [key: string]: string | number;
}
interface Data extends ObjectKeys {
  account: string;
  symbol: string;
  side: string;
  type: string;
  quantity: string;
  price: string;
}

let intervalFetch: any;

export const OrderForm: React.FC<SearchComponentOptions> = ({waitFunction}

) => {
  //Init validate
  const { register, handleSubmit } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = () => placeOrder();

  useEffect(() => {
    fetchStatus();
    intervalFetch = setInterval(async () => {
      await fetchStatus();
    }, 30000);
    return function cleanup() {
      clearInterval(intervalFetch);
    };
  });

  const fetchStatus = async () => {
    let res: any = await getExStatusAPI('HNX');
    setStatusHNX(res.sessionEx);
    res = await getExStatusAPI('HSX');
    setStatusHSX(res.sessionEx);
    res = await getExStatusAPI('UPCOM');
    setStatusUPCOM(res.sessionEx);
  };
  const [statusHNX, setStatusHNX] = useState<string>('');
  const [statusHSX, setStatusHSX] = useState<string>('');
  const [statusUPCOM, setStatusUPCOM] = useState<string>('');
  const [pp0, setPP0] = useState<ObjectKeys>();
  const [ppSE, setPPSE] = useState<ObjectKeys>();

  const [data, setData] = useState({
    account: '',
    symbol: '',
    side: 'NB',
    type: 'LO',
    quantity: '',
    price: '',
  });

  const [symbolInfor, setSymbolInfo] = useState<ObjectKeys>({});
  const [qmax, setQMax] = useState<ObjectKeys>({});

  const handleOnchange = (
    e: React.FormEvent<HTMLInputElement>,
    key: string
  ) => {
    let newData: Data = { ...data };
    if (key === 'symbol') {
      newData[key] = e.currentTarget.value.toUpperCase();
      if (e.currentTarget.value.length >= 3) {
        symbolInfoAPI(e.currentTarget.value.toUpperCase()).then(res => {
          setSymbolInfo(res.data);
          //if (data.account !== '' && data.type === 'LO')
          if (data.account !== '') {
            getQMaxAPI(data.account, newData[key],data.type, res.data.cellingPrice).then(
              (data: any) => {
                setQMax(data);
              }
            );
          }
        });
      }
    } else if (key === 'account') {
      newData[key] = e.currentTarget.value;
      if (e.currentTarget.value.length >= 10) {
        getPP0API(e.currentTarget.value).then((data: any) => {
          setPP0(data);
        });
        getPPSEAPI(e.currentTarget.value).then((data: any) => {
          setPPSE(data);
        });
        //if (data.account !== '' && data.type === 'LO' && data.symbol !== '')
        if (data.account !== '' && data.symbol !== '') {
          getQMaxAPI(data.account, data.symbol, data.type, e.currentTarget.value).then(
            (data: any) => {
              setQMax(data);
            }
          );
        }
      }
    } else if (key === 'price') {
      newData[key] = e.currentTarget.value;
      //if (data.account !== '' && data.type === 'LO' && data.symbol !== '')
      if (data.account !== '' && data.symbol !== '') {
        getQMaxAPI(data.account, data.symbol,data.type,  e.currentTarget.value).then(
          (data: any) => {
            setQMax(data);
          }
        );
      }
    } else {
      newData[key] = e.currentTarget.value;
    }
    setData(newData);
  };

  const handleOnchangeSelect = (e: SelectableValue, key: string) => {
    let newData: Data = { ...data };
    if (key === 'type' && e.value !== 'lo') {
      newData['price'] = '';
      data.type = e.value;
    }
    newData[key] = e.value;
    setData(newData);

    if (symbolInfor.symbol.toString().length >= 3) {
      symbolInfoAPI(symbolInfor.symbol.toString().toUpperCase()).then(res => {
        setSymbolInfo(res.data);
        if (data.account !== '') {
          getQMaxAPI(data.account, symbolInfor.symbol,data.type, res.data.cellingPrice).then(
            (data: any) => {
              setQMax(data);
            }
          );
        }
      });
    }
  };

  const [active, setActive] = useState(true);

  const placeOrder = async () => {
    if (Number(data.quantity) < 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }
    if (symbolInfor !== null && symbolInfor.symbol === data.symbol) {
      if (
        data.type === 'LO' &&
        (Number(data.price) > symbolInfor.cellingPrice ||
          Number(data.price) < symbolInfor.floorPrice)
      ) {
        toast.error(
          'Price for LO invalid. Price must be within (' +
            symbolInfor.floorPrice +
            ' - ' +
            symbolInfor.cellingPrice +
            ')'
        );
        return;
      }
    }
    try {
      setActive(false);
      await placeOrderAPI(data);
      // setData({
      //   account: '',
      //   symbol: '',
      //   side: 'NB',
      //   type: 'LO',
      //   quantity: '',
      //   price: '',
      // });
      toast.success('Order: DONE');
      preTrigger(handleFunction)
    } catch (e) {
      toast.error(e);
    } finally {
      setActive(true);
      waitFunction();
    }
  };

  const renderForm = () => {
    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <InlineFieldRow>
          <InlineField label="Account" required>
            <Input
              {...(register('account'), { required: true })}
              width={14}
              css={''}
              value={data.account}
              onChange={e => handleOnchange(e, 'account')}
            />
          </InlineField>
          <InlineField label="Symbol">
            <Input
              {...(register('symbol'), { required: true, minLength: 3 })}
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
              onChange={e => handleOnchangeSelect(e, 'side')}
              options={[
                { label: 'NB', value: 'NB' },
                { label: 'NS', value: 'NS' },
                // { label: 'MS', value: 'MS' },
              ]}
            />
          </InlineField>
          <InlineField label="Type">
            <Select
              value={data.type}
              width={12}
              onChange={e => handleOnchangeSelect(e, 'type')}
              options={[
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
          <InlineField label={'Quantity'}>
            <Input
              {...(register('quantity'),
              {
                required: true,
              })}
              type="number"
              width={12}
              css={''}
              value={data.quantity}
              onChange={e => handleOnchange(e, 'quantity')}
            />
          </InlineField>
          <InlineField label={'Price'} disabled={data.type !== 'LO'}>
            <Input
              type="number"
              width={12}
              css={''}
              value={data.price}
              onChange={e => handleOnchange(e, 'price')}
            />
          </InlineField>
          <InlineField disabled={!active}>
            <Button type="submit">Order</Button>
          </InlineField>
        </InlineFieldRow>
        <InlineFieldRow style={{ marginTop: '5px' }}>
          <span
            style={{
              fontSize: '11px',
              fontStyle: 'italic',
              color: 'orange',
              marginRight: '5px',
            }}
          >
            [Ex]{' '}
          </span>
          <span style={{ fontSize: '11px', marginRight: '20px' }}>
            {'HNX: ' +
              statusHNX +
              ' | HSX: ' +
              statusHSX +
              ' | UPCOM: ' +
              statusUPCOM}
          </span>
          {pp0 && pp0.accountNo === data.account && (
            <React.Fragment>
              <span
                style={{
                  fontSize: '11px',
                  fontStyle: 'italic',
                  color: 'orange',
                  marginRight: '5px',
                }}
              >
                [Acc]{' '}
              </span>
              <span style={{ fontSize: '11px', marginRight: '5px' }}>
                PP0: {Intl.NumberFormat('en-US').format(Number(pp0.pp0))}
              </span>
            </React.Fragment>
          )}
          {ppSE && ppSE.accountNo === data.account && (
            <span style={{ fontSize: '11px', marginRight: '5px' }}>
              PPCash: {Intl.NumberFormat('en-US').format(Number(ppSE.ppse))}
            </span>
          )}
          {/* {ppSE &&
            ppSE.accountNo === data.account &&
            Number(data.price) > 0 &&
            data.type === 'LO' &&
            data.side === 'NB' && (
              <span style={{ fontSize: '11px', marginRight: '5px' }}>
                QMax:{' '}
                {Intl.NumberFormat('en-US').format(
                  Math.round(Number(ppSE.ppse) / Number(data.price))
                )}
              </span>
            )} */}
          {ppSE &&
            ppSE.accountNo === data.account &&
            //data.type === 'LO' &&
            data.side === 'NB' &&
            qmax.symbol === data.symbol &&
            qmax.accountNo === data.account &&
            symbolInfor.symbol === data.symbol && (
              <span style={{ fontSize: '11px', marginRight: '5px' }}>
                QMax: {Intl.NumberFormat('en-US').format(Number(qmax.qmax))}
              </span>
            )}
          {symbolInfor !== null && symbolInfor.symbol === data.symbol && (
            <React.Fragment>
              <span
                style={{
                  fontSize: '11px',
                  marginLeft: '15px',
                  color: 'orange',
                  fontStyle: 'italic',
                }}
              >
                [Sym]{' '}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  color: '#196be6',
                  marginLeft: '5px',
                }}
              >
                {symbolInfor.floorPrice}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  color: '#d1b91b',
                  marginLeft: '5px',
                }}
              >
                {symbolInfor.basicPrice}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  color: '#ab139e',
                  marginLeft: '5px',
                }}
              >
                {symbolInfor.cellingPrice}
              </span>
            </React.Fragment>
          )}
        </InlineFieldRow>
      </form>
    );
  };

  return <React.Fragment>{renderForm()}</React.Fragment>;
};
