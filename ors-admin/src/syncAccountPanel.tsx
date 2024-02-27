// @ts-nocheck
import {
  VerticalGroup,
  HorizontalGroup,
  Button,
  InlineFieldRow,
  Input,
  InlineField,
  Icon,
  ConfirmModal,
  Select,
  Field,
} from '@grafana/ui';
import React, { useState } from 'react';
import { OrderBookPanelOptions } from 'types';
import {
  getAccountAPI,
  getAccountSEAPI,
  editAccountCIAPI,
  editCKAPI,
  checkAuthAPI,
  updateAccountCIAPI,
  getAccountOMSAPI,
  getPP0API,
  getSecAmountAPI,
  getReceiveT0,
  changeAccountStatus,
  searchAccountByCustodyCD
} from 'api/main';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';
import * as _ from 'lodash';
import { SelectableValue } from '@grafana/data';
import { Constant } from 'api/Consant';

interface Props extends OrderBookPanelOptions {}

type Inputs = {
  account: string;
};

type InputsEdit = {
  balance: string;
  avlAdvance: string;
  totalDebt: string;
  mrcrlimitMax: string;
  tdAmount: string;
  t0limit: string;
  totalDebtDue: string;
  exlimit: string;
  avlAdvanceT0: string;
  type: string;
};

interface ObjectKeys {
  [key: string]: string | number | any[];
}

export const SyncAccountPanel: React.FC<Props> = ({ width, height }) => {
  const { register, handleSubmit } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async () => {
    try {
      let res: any = await getAccountAPI(accountSearch);
      setAccount(res);
      let se: any = await getAccountSEAPI(accountSearch);
      setAccountSE(se.data);
      getAccountOMSAPI(accountSearch)
        .then((data: any) => {
          setAccountOMS(data);
        })
        .catch((e) => toast.error(e));
      getPP0API(accountSearch)
        .then((data: any) => {
          setAccountPP0(data);
        })
        .catch((e) => toast.error(e));
      getSecAmountAPI(accountSearch)
        .then((data: any) => {
          setAccountSecAmount(data);
        })
        .catch((e) => toast.error(e));
      getReceiveT0(accountSearch)
        .then((data: any) => {
          setAccountReceive(data);
        })
        .catch((e) => toast.error(e));
    } catch (e) {
      toast.error(e);
    } finally {
    }
  };

  const { register: registerEdit, handleSubmit: handleSubmitEdit } =
    useForm<InputsEdit>();
  const onSubmitEdit: SubmitHandler<InputsEdit> = async () => {
    try {
      console.log(accountTemp);
      if (accountTemp && accountTemp.type === 'R') {
        let res: any = await updateAccountCIAPI(accountTemp);
        setAccount(res);
      } else {
        let res: any = await editAccountCIAPI(accountTemp);
        setAccount(res);
      }
      setShowEdit(false);
      toast.success('Edit: DONE');
    } catch (error) {
      toast.error(error);
    }
  };

  const [account, setAccount] = useState<ObjectKeys>();
  const [accountOMS, setAccountOMS] = useState<ObjectKeys>();
  const [accountPP0, setAccountPP0] = useState<ObjectKeys>({});
  const [accountSecAmount, setAccountSecAmount] = useState<ObjectKeys>({});
  const [accountReceive, setAccountReceive] = useState<ObjectKeys>({});
  const [accountTemp, setAccountTemp] = useState<ObjectKeys>();
  const [accountSE, setAccountSE] = useState<ObjectKeys[]>([]);
  const [editCK, setEditCK] = useState<ObjectKeys>();
  const [accountSearch, setAccountSearch] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [custodyCd, setCustodyCd] = useState('');
  const [options, setOptions] = useState<ObjectKeys[]>([{ value: 'null', label: 'null' }]);
  const defaultOption = [{ value: 'null', label: 'null' }];

  const handleOnchangeSelectAccount = (e: SelectableValue) => {
    setAccountSearch(e.value);
  };
  const handleOnchangeCustodyCD = (e: React.FormEvent<HTMLInputElement>) => {
    if (e.currentTarget.value.length > 10){
      toast.error('CustodyCD invalid! Maxlength of CustodyCD is 10 character!');
      return;
    } else {
      setCustodyCd(e.currentTarget.value);

      if (e.currentTarget.value.length == 10) {
        let result = [];
        let res: any = {
          ref_cursor: [
            {
              ACCTNO: "null",
              CUSTODYCD: "null",
              DESCRIPTION: "null"
            }
          ]
        };
        searchAccountByCustodyCD(e.currentTarget.value)
          .then((res) => {
            res.ref_cursor.forEach((element)=>{
              let objectTemp = {value: element.ACCTNO, label: element.DESCRIPTION}
              result.push(objectTemp);
            });
            setOptions(result);
            setAccountSearch(result[0].value);
          })
          .catch((e) => {
              setOptions(defaultOption);
              setAccountSearch('null');
              toast.error(e);
          });
      }
    }
  };

  const renderSearchForm = () => {
    return (
      <form style={{ width: '600px' }} onSubmit={handleSubmit(onSubmit)}>
        <InlineFieldRow>
          <InlineField label="CustodyCD">
            <Input
              {...(register('custodyCd'), { required: true })}
              width={15}
              css={''}
              value={custodyCd}
              onChange={(e) => handleOnchangeCustodyCD(e)}
            />
          </InlineField>
          <InlineField label="Account">
            <Select
              value={accountSearch}
              width={25}
              onChange={e => handleOnchangeSelectAccount(e)}
              options={options}
              defaultValue={options.length > 0 ? options[0] : 'null'}
            />
          </InlineField>
          <InlineField>
            <Button type="submit">Search</Button>
          </InlineField>
        </InlineFieldRow>
        {/* <label>Account: </label>
        <input
          style={{ width: '300px' }}
          value={accountSearch}
          onChange={e => handleOnchangeAccount(e)}
        /> */}
      </form>
    );
  };

  const renderUserDataTable = () => {
    if (account && accountOMS) {
      return (
        <div
          id="fss-table-wrapper"
          style={{ overflow: 'auto', height: height - 50, width }}
        >
          {showEdit && renderEdit()}
          <HorizontalGroup
            justify="center"
            align="flex-start"
            style={{ width, zIndex: 1 }}
          >
            <InlineFieldRow>
              <InlineField>
                <div style={{ maxWidth: width }}>
                  {Constant.getInstance().canEdit && (
                    <InlineFieldRow>
                      <Button
                        onClick={() => {
                          let {
                            balance,
                            accountNo,
                            totalDebt,
                            mrcrlimitMax,
                            tdAmount,
                            t0limit,
                            totalDebtDue,
                          } = account;
                          setAccountTemp({
                            balance,
                            accountNo,
                            totalDebt,
                            mrcrlimitMax,
                            tdAmount,
                            t0limit,
                            totalDebtDue,
                            type: 'R',
                          });
                          setShowEdit(true);
                        }}
                      >
                        Edit Account Info
                      </Button>
                    </InlineFieldRow>
                  )}
                  <InlineField label="Status" labelWidth={20}>
                    <InlineField
                      label={accountOMS.status}
                      labelWidth={20}
                      style={{ cursor: 'pointer' }}
                    >
                      <div>
                        {Constant.getInstance().canEdit && (
                          <Icon
                            name="sync"
                            onClick={() => {
                              setShowModalConfirmPW(true);
                            }}
                          />
                        )}
                      </div>
                    </InlineField>
                  </InlineField>
                  <InlineField label="OMS" labelWidth={20}>
                    <InlineField label={accountOMS.omsTag} labelWidth={20}>
                      <div></div>
                    </InlineField>
                  </InlineField>
                  <InlineField label="Số lưu ký" labelWidth={20}>
                    <InlineField label={accountOMS.custodycd} labelWidth={20}>
                      <div></div>
                    </InlineField>
                  </InlineField>
                  <InlineField label="Loại hình tk" labelWidth={20}>
                    <InlineField label={accountOMS.actype} labelWidth={20}>
                      <div></div>
                    </InlineField>
                  </InlineField>
                  <InlineField label="AccountNo" labelWidth={20}>
                    <InlineField
                      label={account.accountNo.toString()}
                      labelWidth={20}
                    >
                      <div></div>
                    </InlineField>
                  </InlineField>
                  <InlineField label="Tiền mặt" labelWidth={20}>
                    <InlineField
                      label={Intl.NumberFormat('en-US').format(
                        Number(account.balance)
                      )}
                      labelWidth={20}
                    >
                      <div></div>
                    </InlineField>
                  </InlineField>
                  <InlineField label="Sức mua" labelWidth={20}>
                    <InlineField
                      label={Intl.NumberFormat('en-US').format(
                        Number(accountPP0.pp0SR)
                      )}
                      labelWidth={20}
                    >
                      <div></div>
                    </InlineField>
                  </InlineField>
                  <InlineField label="Tiền ký quỹ mua" labelWidth={20}>
                    <InlineField
                      label={Intl.NumberFormat('en-US').format(
                        Number(accountSecAmount.securedAmount)
                      )}
                      labelWidth={20}
                    >
                      <div></div>
                    </InlineField>
                  </InlineField>
                  <InlineField label="Tiền chờ về" labelWidth={20}>
                    <InlineField
                      label={Intl.NumberFormat('en-US').format(
                        Number(accountReceive.receivet0)
                      )}
                      labelWidth={20}
                    >
                      <div></div>
                    </InlineField>
                  </InlineField>
                  <InlineField label="Hạn mức T0" labelWidth={20}>
                    <InlineField
                      label={Intl.NumberFormat('en-US').format(
                        Number(account.t0limit)
                      )}
                      labelWidth={20}
                    >
                      <div></div>
                    </InlineField>
                  </InlineField>
                  <InlineField label="Hạn mức cấp" labelWidth={20}>
                    <InlineField
                      label={Intl.NumberFormat('en-US').format(
                        Number(account.mrcrlimitMax)
                      )}
                      labelWidth={20}
                    >
                      <div></div>
                    </InlineField>
                  </InlineField>
                  <InlineField label="Tiền gửi hỗ trợ lãi suất" labelWidth={20}>
                    <InlineField
                      label={Intl.NumberFormat('en-US').format(
                        Number(account.tdAmount)
                      )}
                      labelWidth={20}
                    >
                      <div></div>
                    </InlineField>
                  </InlineField>
                  <InlineField label="Tổng nợ" labelWidth={20}>
                    <InlineField
                      label={Intl.NumberFormat('en-US').format(
                        Number(account.totalDebt)
                      )}
                      labelWidth={20}
                    >
                      <div></div>
                    </InlineField>
                  </InlineField>
                  <InlineField label="Nợ đến hạn, quá hạn" labelWidth={20}>
                    <InlineField
                      label={Intl.NumberFormat('en-US').format(
                        Number(account.totalDebtDue)
                      )}
                      labelWidth={20}
                    >
                      <div></div>
                    </InlineField>
                  </InlineField>
                </div>
              </InlineField>
              <InlineField>
                <div
                  style={{
                    height: '500px',
                    maxWidth: width,
                    minWidth: '100px',
                    overflow: 'auto',
                  }}
                >
                  <table id="fsstable">
                    <thead>
                      <tr>
                        <th style={{ width: '100px' }}>Symbol</th>
                        <th style={{ width: '100px' }}>Giao dịch NS</th>
                        <th style={{ width: '100px' }}>Giao dịch MS</th>
                        <th style={{ width: '100px' }}>Ký quỹ bán</th>
                        <th style={{ width: '100px' }}>Khớp mua trong ngày</th>
                        <th style={{ width: '100px' }}>Chờ về T1</th>
                        <th style={{ width: '100px' }}>Chờ về T2</th>
                        {Constant.getInstance().canEdit && (
                          <th>
                            <Button
                              icon="plus"
                              onClick={() => {
                                setEditCK({
                                  symbol: '',
                                  trade: 0,
                                  mortgage: 0,
                                  // t1Receiving: 0,
                                  // t2Receiving: 0,
                                  type: 'C',
                                });
                                setCKEditType('add');
                                setShowModalEditCK(true);
                              }}
                            ></Button>
                          </th>
                        )}
                      </tr>
                    </thead>
                    {accountSE != null && (
                      <tbody>
                        {accountSE.map((se) => (
                          <tr>
                            <td>{se.symbol}</td>
                            <td style={{ textAlign: 'right' }}>
                              {Intl.NumberFormat('en-US').format(
                                Number(se.avlTrade)
                              )}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              {Intl.NumberFormat('en-US').format(
                                Number(se.mortgage)
                              )}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              {Intl.NumberFormat('en-US').format(
                                Number(se.securedSell)
                              )}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              {Intl.NumberFormat('en-US').format(
                                Number(se.t3Receiving)
                              )}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              {Intl.NumberFormat('en-US').format(
                                Number(se.t1Receiving)
                              )}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              {Intl.NumberFormat('en-US').format(
                                Number(se.t2Receiving)
                              )}
                            </td>
                            {Constant.getInstance().canEdit && (
                              <td>
                                <Icon
                                  name="edit"
                                  title="Edit"
                                  style={{ color: 'blue', cursor: 'pointer' }}
                                  onClick={() => {
                                    let temp: any = {
                                      symbol: se.symbol,
                                      trade: se.trade,
                                      mortgage: se.mortgage,
                                      // t1Receiving: se.t1Receiving,
                                      // t2Receiving: se.t2Receiving,
                                    };
                                    temp.type = 'C';
                                    setEditCK(temp);
                                    setCKEditType('edit');
                                    setShowModalEditCK(true);
                                  }}
                                />
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    )}
                  </table>
                </div>
              </InlineField>
            </InlineFieldRow>
          </HorizontalGroup>
        </div>
      );
    }
    return null;
  };

  const [showModalConfirmPW, setShowModalConfirmPW] = useState(false);
  const [password, setPassword] = useState('');
  const renderConfirmPassword = () => {
    const handleOnchangePW = (e: React.FormEvent<HTMLInputElement>) => {
      setPassword(e.currentTarget.value);
    };

    const doChangeActiveUser = async (accountId: string, newStatus: string) => {
      if (password === '') {
        toast.error('Password can not be empty');
        return;
      }
      let auth = await checkAuthAPI(password);
      //var res;
      if (auth) {
        if (newStatus === 'C') {
          await changeAccountStatus(accountId, 'A');
        } else {
          await changeAccountStatus(accountId, 'C');
        }
        //let res: any = await getAccountAPI(accountId);
        //setAccount(res);
        getAccountOMSAPI(accountSearch)
          .then((data: any) => {
            setAccountOMS(data);
          })
          .catch((e) => toast.error(e));
      } else {
        toast.error('Wrong password. Do not change account status!');
      }
    };
    return (
      <ConfirmModal
        isOpen={showModalConfirmPW}
        title="Confirm to change status"
        confirmText="Change"
        body={
          <InlineField label="Password" labelWidth={20}>
            <Input
              type="password"
              width={35}
              required={true}
              css={''}
              value={password}
              onChange={(e) => handleOnchangePW(e)}
            />
          </InlineField>
        }
        onDismiss={() => {
          setShowModalConfirmPW(false);
          setPassword('');
        }}
        onConfirm={async () => {
          setShowModalConfirmPW(false);
          setPassword('');
          doChangeActiveUser(accountOMS.accountNo, accountOMS.status);
        }}
      />
    );
  };

  const handleOnchangeEdit = (
    e: React.FormEvent<HTMLInputElement>,
    key: string
  ) => {
    let newData: ObjectKeys = { ...accountTemp };
    newData[key] = Number(e.currentTarget.value);
    setAccountTemp(newData);
  };

  const handleOnchangeEditSelect = (e: SelectableValue, key: string) => {
    let newData: ObjectKeys = { ...accountTemp };
    newData[key] = e.value;
    setAccountTemp(newData);
  };

  const renderEdit = () => {
    return (
      <div
        id="fssedit-wrapper"
        onClick={(e) => {
          let modal = document.getElementById('fssedit-wrapper');
          if (e.target === modal) {
            setShowEdit(false);
          }
        }}
      >
        <div
          id="editmodal"
          style={{
            width: '400px',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            height: '500px',
            zIndex: 20,
            position: 'absolute',
            overflow: 'auto',
            padding: '10px',
            top: '50%',
            border: '1px solid white',
          }}
        >
          {accountTemp != null && (
            <HorizontalGroup justify="center" align="flex-start">
              <form
                onSubmit={handleSubmitEdit(onSubmitEdit)}
                style={{ width: '320px', height: '320px' }}
              >
                <InlineField>
                  <h2>Edit account</h2>
                </InlineField>
                <InlineField label="Account" disabled labelWidth={20}>
                  <Input width={30} css={''} value={accountTemp.accountNo} />
                </InlineField>
                <InlineField label="Balance" labelWidth={20}>
                  <Input
                    {...(registerEdit('balance'), { required: true })}
                    width={30}
                    css={''}
                    value={accountTemp.balance}
                    onChange={(e) => handleOnchangeEdit(e, 'balance')}
                  />
                </InlineField>
                <InlineField label="TotalDebt" labelWidth={20}>
                  <Input
                    {...(registerEdit('totalDebt'), { required: true })}
                    width={30}
                    css={''}
                    value={accountTemp.totalDebt}
                    onChange={(e) => handleOnchangeEdit(e, 'totalDebt')}
                  />
                </InlineField>
                <InlineField label="MRCRLimitMax" labelWidth={20}>
                  <Input
                    {...(registerEdit('mrcrlimitMax'), { required: true })}
                    width={30}
                    css={''}
                    value={accountTemp.mrcrlimitMax}
                    onChange={(e) => handleOnchangeEdit(e, 'mrcrlimitMax')}
                  />
                </InlineField>
                <InlineField label="TDAmount" labelWidth={20}>
                  <Input
                    {...(registerEdit('tdAmount'), { required: true })}
                    width={30}
                    css={''}
                    value={accountTemp.tdAmount}
                    onChange={(e) => handleOnchangeEdit(e, 'tdAmount')}
                  />
                </InlineField>
                <InlineField label="T0Limit" labelWidth={20}>
                  <Input
                    {...(registerEdit('t0limit'), { required: true })}
                    width={30}
                    css={''}
                    value={accountTemp.t0limit}
                    onChange={(e) => handleOnchangeEdit(e, 't0limit')}
                  />
                </InlineField>
                <InlineField label="TotalDebtDue" labelWidth={20}>
                  <Input
                    {...(registerEdit('totalDebtDue'), { required: true })}
                    width={30}
                    css={''}
                    value={accountTemp.totalDebtDue}
                    onChange={(e) => handleOnchangeEdit(e, 'totalDebtDue')}
                  />
                </InlineField>
                <InlineField label="Type" labelWidth={20}>
                  <Select
                    value={accountTemp.type}
                    {...(registerEdit('type'), { required: true })}
                    width={30}
                    onChange={(e) => handleOnchangeEditSelect(e, 'type')}
                    options={[
                      { label: 'C', value: 'C' },
                      { label: 'D', value: 'D' },
                      { label: 'Reset', value: 'R' },
                    ]}
                  />
                </InlineField>
                <InlineFieldRow>
                  <InlineField>
                    <Button
                      style={{ backgroundColor: 'red', margin: '0 5px' }}
                      onClick={() => setShowEdit(false)}
                    >
                      Cancel
                    </Button>
                  </InlineField>
                  <InlineField>
                    <Button type="submit">Update</Button>
                  </InlineField>
                </InlineFieldRow>
              </form>
            </HorizontalGroup>
          )}
        </div>
      </div>
    );
  };

  const handleOnchangeEditCK = (
    e: React.FormEvent<HTMLInputElement>,
    key: string
  ) => {
    let newData: ObjectKeys = { ...editCK };
    if (key === 'symbol') {
      newData[key] = e.currentTarget.value.toUpperCase();
    } else {
      newData[key] = Number(e.currentTarget.value);
    }
    setEditCK(newData);
  };
  const handleOnchangeEditCKSelect = (e: SelectableValue, key: string) => {
    let newData: ObjectKeys = { ...editCK };
    newData[key] = e.value;
    setEditCK(newData);
  };
  const [showModalEditCK, setShowModalEditCK] = useState<boolean>(false);
  const [ckEditType, setCKEditType] = useState<string>('edit');
  const renderEditCK = () => {
    if (editCK != null && account != null) {
      return (
        <ConfirmModal
          isOpen={showModalEditCK}
          title={ckEditType === 'edit' ? 'Edit: ' + editCK.symbol : 'Add'}
          confirmText={ckEditType === 'edit' ? 'Update' : 'Add'}
          key="edit-mack"
          body={
            <React.Fragment>
              <InlineField
                label="Symbol"
                labelWidth={20}
                disabled={ckEditType === 'edit'}
              >
                <Input
                  width={30}
                  css={''}
                  value={editCK.symbol}
                  onChange={(e) => handleOnchangeEditCK(e, 'symbol')}
                />
              </InlineField>
              <InlineField label="Trade" labelWidth={20}>
                <Input
                  width={30}
                  css={''}
                  type="number"
                  value={editCK.trade}
                  onChange={(e) => handleOnchangeEditCK(e, 'trade')}
                />
              </InlineField>
              <InlineField label="Mortgage" labelWidth={20}>
                <Input
                  width={30}
                  css={''}
                  type="number"
                  value={editCK.mortgage}
                  onChange={(e) => handleOnchangeEditCK(e, 'mortgage')}
                />
              </InlineField>
              {/*<InlineField label="t1Receiving" labelWidth={20}>*/}
              {/*  <Input*/}
              {/*    width={30}*/}
              {/*    css={''}*/}
              {/*    type="number"*/}
              {/*    value={editCK.t1Receiving}*/}
              {/*    onChange={(e) => handleOnchangeEditCK(e, 't1Receiving')}*/}
              {/*  />*/}
              {/*</InlineField>*/}
              {/*<InlineField label="t2Receiving" labelWidth={20}>*/}
              {/*  <Input*/}
              {/*    width={30}*/}
              {/*    css={''}*/}
              {/*    type="number"*/}
              {/*    value={editCK.t2Receiving}*/}
              {/*    onChange={(e) => handleOnchangeEditCK(e, 't2Receiving')}*/}
              {/*  />*/}
              {/*</InlineField>*/}
              <InlineField
                label="Type"
                labelWidth={20}
                disabled={ckEditType !== 'edit'}
              >
                <Select
                  value={editCK.type}
                  width={30}
                  onChange={(e) => handleOnchangeEditCKSelect(e, 'type')}
                  options={[
                    { label: 'C', value: 'C' },
                    { label: 'D', value: 'D' },
                  ]}
                />
              </InlineField>
            </React.Fragment>
          }
          onDismiss={() => {
            setShowModalEditCK(false);
          }}
          onConfirm={async () => {
            try {
              if (ckEditType === 'add' && _.isEmpty(editCK.symbol)) {
                toast.error('Symbol must not be empty');
              } else {
                let res: any = await editCKAPI(account.accountNo, editCK);
                if (ckEditType === 'edit') {
                  let { object, accountNo, ...d } = res;
                  replaceOneItemCK(editCK.symbol, d);
                  toast.success('Edit ' + editCK.symbol + ': DONE');
                } else {
                  let newData: any = _.cloneDeep(accountSE);
                  let { object, accountNo, ...d } = res;
                  newData.unshift(d);
                  newData.avlTrade = editCK.trade;
                  setAccountSE(newData);
                  toast.success('Added');
                }
                setShowModalEditCK(false);
              }
            } catch (error) {
              toast.error(error);
            }
          }}
        />
      );
    }
  };

  const replaceOneItemCK = (symbol: any, data: any) => {
    let index = accountSE.findIndex((o: any) => o.symbol === symbol);
    setAccountSE([
      ...accountSE.slice(0, index),
      data,
      ...accountSE.slice(index + 1),
    ]);
  };

  return (
    <VerticalGroup justify="flex-start" align="center">
      {renderConfirmPassword()}
      {renderSearchForm()}
      {renderEditCK()}
      {account != null && renderUserDataTable()}
    </VerticalGroup>
  );
};
