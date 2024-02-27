// @ts-nocheck
import {
  Button,
  VerticalGroup,
  InlineField,
  Input,
  Icon,
  InlineFieldRow,
  Select,
  HorizontalGroup,
} from '@grafana/ui';
import React, { useState } from 'react';
import { OrderBookPanelOptions } from 'types';
import { useForm, SubmitHandler, SubmitErrorHandler } from 'react-hook-form';
import { toast } from 'react-toastify';
import { addNewSymbolAPI, editSymbolAPI, getSymbolFullInfo } from 'api/main';
import * as _ from 'lodash';
import { SelectableValue } from '@grafana/data';
import { Constant } from 'api/Consant';

interface Props extends OrderBookPanelOptions {}

interface ObjectKeys {
  [key: string]: string | number;
}

type Inputs = {
  symbol: string;
};

type InputsEdit = {
  basicPrice: number;
  ceilingPrice: number;
  floorPrice: number;
  priorClosePrice: number;
  matchPrice: number;
  closePrice: number;
  code: string;
  totalRoom: number;
  haltResumeFlag: string;
  haltOddLot: string;
  cellingPricePT: number;
  floorPricePT: number;
  tradePlace: string;
};

type InputsAdd = {
  symbol: string;
  symbolnum: string;
  fullname: string;
  secType: string;
  exchange: string;
  board: string;
  price_ce: number;
  price_fl: number;
  price_rf: number;
  qttysum: number;
  fqtty: number;
  halt: string;
  halt_ol: string;
  price_pt_ce: number;
  price_pt_fl: number;
  closePrice: number;
  tradePrice: number;
};

const dataEditDefault = {
  secType: 'S',
  basicPrice: 0,
  ceilingPrice: 0,
  floorPrice: 0,
  matchPrice: 0,
  closePrice: 0,
  code: '',
  totalRoom: 0,
  haltResumeFlag: 'N',
  haltOddLot: 'N',
  cellingPricePT: 0,
  floorPricePT: 0,
  tradePlace: 'HNX',
  roomLimit: 0,
  listingQtty: 0,
};

const dataAddDefault = {
  symbol: '',
  symbolnum: '',
  fullname: '',
  secType: 'S',
  exchange: 'HSX',
  board: 'HSX',
  price_ce: 0,
  price_fl: 0,
  price_rf: 0,
  price_pt_ce: 0,
  price_pt_fl: 0,
  close_price: 0,
  trade_price: 0,
  qttysum: 0,
  fqtty: 0,
  halt: 'N',
  halt_ol: 'N',
  price_nav: 0,
  qtty_avrtrade: 0,
  isnet: 1,
};

export const SecInfoPanel: React.FC<Props> = ({ width, height }) => {
  const [symbol, setSymbol] = useState<string>('');
  const [symbolInfo, setSymbolInfo] = useState<ObjectKeys>({});

  const { register, handleSubmit } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async () => {
    try {
      let res: any = await getSymbolFullInfo(symbol);
      setSymbolInfo(res);
    } catch (e) {
      toast.error(e);
    } finally {
    }
  };

  const handleOnchangeSymbol = (e: React.FormEvent<HTMLInputElement>) => {
    setSymbol(e.currentTarget.value.toUpperCase());
  };

  const renderSearchForm = () => {
    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <InlineFieldRow>
          <InlineField label="Symbol">
            <Input
              {...(register('symbol'), { required: true, minLength: 3 })}
              width={30}
              css={''}
              value={symbol}
              onChange={(e) => handleOnchangeSymbol(e)}
            />
          </InlineField>
          <InlineField>
            <Button type="submit" icon="search"></Button>
          </InlineField>
          {Constant.getInstance().canEdit && (
            <React.Fragment>
              <InlineField title="Add symbol">
                <Button
                  icon="plus"
                  type="button"
                  color="green"
                  onClick={() => setModalAddSI(true)}
                ></Button>
              </InlineField>
              <InlineField title="Update Price">
                <Button type="button">Update Price</Button>
              </InlineField>
            </React.Fragment>
          )}
        </InlineFieldRow>
      </form>
    );
  };

  const { register: registerAdd, handleSubmit: hdSubmitAdd } =
    useForm<InputsAdd>();
  const onSubmittemp: SubmitHandler<InputsAdd> = async () => {
    try {
      let data: any = await addNewSymbolAPI(dataAdd);
      toast.success(data);
      setDataAdd(dataAddDefault);
      setModalAddSI(false);
    } catch (error) {
      toast.error;
    }
  };
  const [modalAddSI, setModalAddSI] = useState<boolean>(false);
  const [dataAdd, setDataAdd] = useState<ObjectKeys>(dataAddDefault);
  const handleOnchangeAdd = (
    e: React.FormEvent<HTMLInputElement>,
    key: string
  ) => {
    let newData: ObjectKeys = { ...dataAdd };
    if (key === 'symbol') {
      newData[key] = e.currentTarget.value.toUpperCase();
    } else if (
      [
        'price_ce',
        'price_fl',
        'price_rf',
        'price_pt_ce',
        'price_pt_fl',
        'close_price',
        'trade_price',
        'qttysum',
        'fqqty',
        'price_nav',
        'qtty_avrtrade',
        'isnet',
      ].includes(key)
    ) {
      newData[key] = Number(e.currentTarget.value);
    } else {
      newData[key] = e.currentTarget.value;
    }
    setDataAdd(newData);
  };
  const handleOnchangeAddSelect = (e: SelectableValue, key: string) => {
    let newData: ObjectKeys = { ...dataAdd };
    newData[key] = e.value;
    setDataAdd(newData);
  };
  const renderModalAddSymbol = () => {
    if (modalAddSI && dataAdd) {
      return (
        <div
          id="fssedit-wrapper2"
          onClick={(e) => {
            let modal = document.getElementById('fssedit-wrapper2');
            if (e.target === modal) {
              setModalAddSI(false);
            }
          }}
        >
          <div
            id="editmodal"
            style={{
              width: '500px',
              left: '50%',
              transform: 'translateX(-50%)',
              height: '700px',
              zIndex: 20,
              position: 'absolute',
              overflow: 'auto',
              padding: '10px',
              top: '10px',
            }}
          >
            <HorizontalGroup justify="center" align="flex-start">
              <form onSubmit={hdSubmitAdd(onSubmittemp)}>
                <InlineField>
                  <h2 style={{ fontSize: 'bold' }}>Add Symbol</h2>
                </InlineField>
                <InlineField label="Symbol" labelWidth={20}>
                  <Input
                    ref={registerAdd({ required: true })}
                    name="symbol"
                    value={dataAdd.symbol}
                    width={30}
                    css={''}
                    onChange={(e) => handleOnchangeAdd(e, 'symbol')}
                  />
                </InlineField>
                <InlineField label="SymbolNum" labelWidth={20}>
                  <Input
                    ref={registerAdd({ required: true })}
                    name="symbolnum"
                    value={dataAdd.symbolnum}
                    width={30}
                    css={''}
                    onChange={(e) => handleOnchangeAdd(e, 'symbolnum')}
                  />
                </InlineField>
                <InlineField label="Fullname" labelWidth={20}>
                  <Input
                    ref={registerAdd({ required: true })}
                    name="fullname"
                    value={dataAdd.fullname}
                    width={30}
                    css={''}
                    onChange={(e) => handleOnchangeAdd(e, 'fullname')}
                  />
                </InlineField>
                <InlineField label="SecType" labelWidth={20}>
                  <Select
                    value={dataAdd.secType}
                    width={30}
                    onChange={(e) => handleOnchangeAddSelect(e, 'secType')}
                    options={[
                      { label: 'S', value: 'S' },
                      { label: 'D', value: 'D' },
                      { label: 'U', value: 'U' },
                      { label: 'E', value: 'E' },
                      { label: 'W', value: 'W' },
                    ]}
                  />
                </InlineField>
                <InlineField label="Exchange" labelWidth={20}>
                  <Select
                    value={dataAdd.exchange}
                    width={30}
                    onChange={(e) => handleOnchangeAddSelect(e, 'exchange')}
                    options={[
                      { label: 'HSX', value: 'HSX' },
                      { label: 'HNX', value: 'HNX' },
                    ]}
                  />
                </InlineField>
                <InlineField label="Board" labelWidth={20}>
                  <Select
                    value={dataAdd.board}
                    width={30}
                    onChange={(e) => handleOnchangeAddSelect(e, 'board')}
                    options={[
                      { label: 'HSX', value: 'HSX' },
                      { label: 'HNX', value: 'HNX' },
                      { label: 'UPCOM', value: 'UPCOM' },
                    ]}
                  />
                </InlineField>
                <InlineField label="Ceiling Price" labelWidth={20}>
                  <Input
                    type="number"
                    ref={registerAdd({ required: true })}
                    name="price_ce"
                    value={dataAdd.price_ce}
                    width={30}
                    css={''}
                    onChange={(e) => handleOnchangeAdd(e, 'price_ce')}
                  />
                </InlineField>
                <InlineField label="Floor Price" labelWidth={20}>
                  <Input
                    type="number"
                    ref={registerAdd({ required: true })}
                    name="price_fl"
                    value={dataAdd.price_fl}
                    width={30}
                    css={''}
                    onChange={(e) => handleOnchangeAdd(e, 'price_fl')}
                  />
                </InlineField>
                <InlineField label="Ref Price" labelWidth={20}>
                  <Input
                    type="number"
                    ref={registerAdd({ required: true })}
                    name="price_rf"
                    value={dataAdd.price_rf}
                    width={30}
                    css={''}
                    onChange={(e) => handleOnchangeAdd(e, 'price_rf')}
                  />
                </InlineField>
                <InlineField label="Price PT CE" labelWidth={20}>
                  <Input
                    type="number"
                    ref={registerAdd({ required: true })}
                    name="price_pt_ce"
                    value={dataAdd.price_pt_ce}
                    width={30}
                    css={''}
                    onChange={(e) => handleOnchangeAdd(e, 'price_pt_ce')}
                  />
                </InlineField>
                <InlineField label="Price PT FL" labelWidth={20}>
                  <Input
                    type="number"
                    ref={registerAdd({ required: true })}
                    name="price_pt_fl"
                    value={dataAdd.price_pt_fl}
                    width={30}
                    css={''}
                    onChange={(e) => handleOnchangeAdd(e, 'price_pt_fl')}
                  />
                </InlineField>
                <InlineField label="Trade Price" labelWidth={20}>
                  <Input
                    type="number"
                    ref={registerAdd({ required: true })}
                    name="trade_price"
                    value={dataAdd.trade_price}
                    width={30}
                    css={''}
                    onChange={(e) => handleOnchangeAdd(e, 'trade_price')}
                  />
                </InlineField>
                <InlineField label="Close Price" labelWidth={20}>
                  <Input
                    type="number"
                    ref={registerAdd({ required: true })}
                    name="close_price"
                    value={dataAdd.close_price}
                    width={30}
                    css={''}
                    onChange={(e) => handleOnchangeAdd(e, 'close_price')}
                  />
                </InlineField>
                <InlineField label="Total room" labelWidth={20}>
                  <Input
                    type="number"
                    ref={registerAdd({ required: true })}
                    name="fqtty"
                    value={dataAdd.fqtty}
                    width={30}
                    css={''}
                    onChange={(e) => handleOnchangeAdd(e, 'fqtty')}
                  />
                </InlineField>
                <InlineField label="Halt" labelWidth={20}>
                  <Select
                    value={dataAdd.halt}
                    width={30}
                    onChange={(e) => handleOnchangeAddSelect(e, 'halt')}
                    options={[
                      { label: 'Y', value: 'Y' },
                      { label: 'N', value: 'N' },
                    ]}
                  />
                </InlineField>
                <InlineField label="HaltOddLot" labelWidth={20}>
                  <Select
                    value={dataAdd.halt_ol}
                    width={30}
                    onChange={(e) => handleOnchangeAddSelect(e, 'halt_ol')}
                    options={[
                      { label: 'Y', value: 'Y' },
                      { label: 'N', value: 'N' },
                    ]}
                  />
                </InlineField>
                <InlineFieldRow>
                  <InlineField>
                    <Button
                      style={{ backgroundColor: 'red' }}
                      onClick={() => setModalAddSI(false)}
                    >
                      Cancel
                    </Button>
                  </InlineField>
                  <InlineField>
                    <Button type="submit">Add</Button>
                  </InlineField>
                </InlineFieldRow>
              </form>
            </HorizontalGroup>
          </div>
        </div>
      );
    }
    return null;
  };

  //Handle edit
  const { register: registerEdit, handleSubmit: hdSubmitEdit } =
    useForm<InputsEdit>();
  const onSubmitEdit: SubmitHandler<InputsAdd> = async () => {
    try {
      await editSymbolAPI(dataEdit);
      toast.success('Edit symbol success');
      let res: any = await getSymbolFullInfo(symbolInfo.symbol);
      setDataEdit(dataEditDefault);
      setSymbolInfo(res);
      setModalEditSI(false);
    } catch (error) {
      toast.error(error);
    }
  };
  const [dataEdit, setDataEdit] = useState<ObjectKeys>(dataEditDefault);
  const handleOnchangeEdit = (
    e: React.FormEvent<HTMLInputElement>,
    key: string
  ) => {
    let newData: ObjectKeys = { ...dataEdit };
    newData[key] = Number(e.currentTarget.value);
    setDataEdit(newData);
  };
  const handleOnchangeEditSelect = (e: SelectableValue, key: string) => {
    let newData: ObjectKeys = { ...dataEdit };
    newData[key] = e.value;
    setDataEdit(newData);
  };
  const renderModalEditSymbol = () => {
    if (modalEditSI && dataEdit) {
      return (
        <div
          id="fssedit-wrapper"
          onClick={(e) => {
            let modal = document.getElementById('fssedit-wrapper');
            if (e.target === modal) {
              setModalEditSI(false);
            }
          }}
        >
          <div
            id="editmodal"
            style={{
              width: '520px',
              maxWidth: width,
              //maxHeight: height,
              left: '50%',
              transform: 'translateX(-50%)',
              height: '600px',
              zIndex: 20,
              position: 'absolute',
              overflow: 'auto',
              padding: '10px',
              top: '10%',
              border: '1px solid white',
            }}
          >
            <HorizontalGroup justify="center" align="flex-start">
              <form onSubmit={hdSubmitEdit(onSubmitEdit)}>
                <InlineField>
                  <h2 style={{ fontSize: 'bold' }}>Edit Symbol</h2>
                </InlineField>
                <InlineField label="SecType" labelWidth={20}>
                  <Select
                    value={dataEdit.secType}
                    width={30}
                    options={[
                      { label: 'S', value: 'S' },
                      { label: 'D', value: 'D' },
                      { label: 'U', value: 'U' },
                      { label: 'E', value: 'E' },
                      { label: 'W', value: 'W' },
                    ]}
                    onChange={(e) => handleOnchangeEditSelect(e, 'secType')}
                  />
                </InlineField>
                <InlineField label="Floor Price" labelWidth={20}>
                  <Input
                    ref={registerEdit({ required: true })}
                    name="floorPrice"
                    value={dataEdit.floorPrice}
                    width={30}
                    css={''}
                    onChange={(e) => handleOnchangeEdit(e, 'floorPrice')}
                  />
                </InlineField>
                <InlineField label="Basic Price" labelWidth={20}>
                  <Input
                    ref={registerEdit({ required: true })}
                    name="basicPrice"
                    value={dataEdit.basicPrice}
                    width={30}
                    css={''}
                    onChange={(e) => handleOnchangeEdit(e, 'basicPrice')}
                  />
                </InlineField>
                <InlineField label="Ceilling Price" labelWidth={20}>
                  <Input
                    ref={registerEdit({ required: true })}
                    name="ceilingPrice"
                    value={dataEdit.ceilingPrice}
                    width={30}
                    css={''}
                    onChange={(e) => handleOnchangeEdit(e, 'ceilingPrice')}
                  />
                </InlineField>
                <InlineField label="Match Price" labelWidth={20}>
                  <Input
                    ref={registerEdit({ required: true })}
                    name="matchPrice"
                    value={dataEdit.matchPrice}
                    width={30}
                    css={''}
                    onChange={(e) => handleOnchangeEdit(e, 'matchPrice')}
                  />
                </InlineField>
                <InlineField label="Close Price" labelWidth={20}>
                  <Input
                    ref={registerEdit({ required: true })}
                    name="closePrice"
                    value={dataEdit.closePrice}
                    width={30}
                    css={''}
                    onChange={(e) => handleOnchangeEdit(e, 'closePrice')}
                  />
                </InlineField>
                <InlineField label="Total room" labelWidth={20}>
                  <Input
                    ref={registerEdit({ required: true })}
                    name="totalRoom"
                    value={dataEdit.totalRoom}
                    width={30}
                    css={''}
                    onChange={(e) => handleOnchangeEdit(e, 'totalRoom')}
                  />
                </InlineField>
                <InlineField label="Ceilling Price PT" labelWidth={20}>
                  <Input
                    ref={registerEdit}
                    name="cellingPricePT"
                    value={dataEdit.cellingPricePT}
                    width={30}
                    css={''}
                    onChange={(e) => handleOnchangeEdit(e, 'cellingPricePT')}
                  />
                </InlineField>
                <InlineField label="Floor Price PT" labelWidth={20}>
                  <Input
                    ref={registerEdit}
                    name="floorPricePT"
                    value={dataEdit.floorPricePT}
                    width={30}
                    css={''}
                    onChange={(e) => handleOnchangeEdit(e, 'floorPricePT')}
                  />
                </InlineField>
                <InlineField label="Halt" labelWidth={20}>
                  <Select
                    value={dataEdit.haltResumeFlag}
                    width={30}
                    onChange={(e) =>
                      handleOnchangeEditSelect(e, 'haltResumeFlag')
                    }
                    options={[
                      { label: 'N', value: 'N' },
                      { label: 'Y', value: 'Y' },
                    ]}
                  />
                </InlineField>
                <InlineField label="HaltOddLot" labelWidth={20}>
                  <Select
                    value={dataEdit.haltOddLot}
                    width={30}
                    onChange={(e) =>
                      handleOnchangeEditSelect(e, 'haltOddLot')
                    }
                    options={[
                      { label: 'N', value: 'N' },
                      { label: 'Y', value: 'Y' },
                    ]}
                  />
                </InlineField>
                <InlineField label="Trade place" labelWidth={20}>
                  <Select
                    value={dataEdit.tradePlace}
                    width={30}
                    onChange={(e) =>
                      handleOnchangeEditSelect(e, 'tradePlace')
                    }
                    options={[
                      { label: 'HNX', value: 'HNX' },
                      { label: 'HSX', value: 'HSX' },
                      { label: 'UPCOM', value: 'UPCOM' },
                    ]}
                  />
                </InlineField>
                <InlineField label="Room Limit" labelWidth={20}>
                  <Input
                    ref={registerEdit}
                    name="roomLimit"
                    value={dataEdit.roomLimit}
                    width={30}
                    css={''}
                    onChange={(e) => handleOnchangeEdit(e, 'roomLimit')}
                  />
                </InlineField>
                <InlineField label="Listing Qtty" labelWidth={20}>
                  <Input
                    ref={registerEdit}
                    name="listingQtty"
                    value={dataEdit.listingQtty}
                    width={30}
                    css={''}
                    onChange={(e) => handleOnchangeEdit(e, 'listingQtty')}
                  />
                </InlineField>
                <InlineFieldRow>
                  <InlineField>
                    <Button
                      style={{ backgroundColor: 'red' }}
                      onClick={() => setModalEditSI(false)}
                    >
                      Cancel
                    </Button>
                  </InlineField>
                  <InlineField>
                    <Button type="submit">Edit</Button>
                  </InlineField>
                </InlineFieldRow>
              </form>
            </HorizontalGroup>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderSymbolInfo = () => {
    return (
      <div style={{ overflow: 'auto', maxWidth: width, minWidth: '400px' }}>
        <table id="fsstable">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Floor Price</th>
              <th>Basic Price</th>
              <th>Ceilling Price</th>
              <th>Floor Px PT</th>
              <th>Ceil Px PT</th>
              <th>Current Price</th>
              <th>Close Price</th>
              <th>Room</th>
              <th>Type</th>
              <th>Halt</th>
              <th>HaltOddLot</th>
              <th>Exchange</th>
              <th>Room Limit</th>
              <th>Listing Qtty</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{symbolInfo.symbol}</td>
              <td>{symbolInfo.floorPrice}</td>
              <td>{symbolInfo.basicPrice}</td>
              <td>{symbolInfo.cellingPrice}</td>
              <td>{symbolInfo.floorPricePT}</td>
              <td>{symbolInfo.cellingPricePT}</td>
              <td>{symbolInfo.currentPrice}</td>
              <td>{symbolInfo.closePrice}</td>
              <td>{symbolInfo.fRoom}</td>
              <td>{symbolInfo.secType}</td>
              <td>{symbolInfo.halt}</td>
              <td>{symbolInfo.haltOddLot}</td>
              <td>{symbolInfo.board}</td>
              <td>{symbolInfo.roomLimit}</td>
              <td>{symbolInfo.listingQtty}</td>
              {Constant.getInstance().canEdit && (
                <td>
                  <Icon
                    name="edit"
                    title="Edit"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setDataEdit({
                        secType: symbolInfo.secType,
                        basicPrice: symbolInfo.basicPrice,
                        code: symbolInfo.symbol,
                        ceilingPrice: symbolInfo.cellingPrice,
                        floorPrice: symbolInfo.floorPrice,
                        matchPrice: symbolInfo.currentPrice,
                        totalRoom: symbolInfo.fRoom,
                        cellingPricePT: symbolInfo.cellingPricePT,
                        floorPricePT: symbolInfo.floorPricePT,
                        haltResumeFlag: symbolInfo.halt,
                        haltOddLot: symbolInfo.haltOddLot,
                        closePrice: symbolInfo.closePrice,
                        tradePlace: symbolInfo.board,
                        roomLimit: symbolInfo.roomLimit,
                        listingQtty: symbolInfo.listingQtty,
                      });
                      setModalEditSI(true);
                    }}
                  />
                </td>
              )}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const [modalEditSI, setModalEditSI] = useState<boolean>(false);

  return (
    <VerticalGroup justify="flex-start" align="center">
      {renderModalAddSymbol()}
      {renderSearchForm()}
      {!_.isEmpty(symbolInfo) && renderSymbolInfo()}
      {renderModalEditSymbol()}
    </VerticalGroup>
  );
};
