// @ts-nocheck
import {
  Button,
  VerticalGroup,
  ConfirmModal,
  InlineField,
  Input,
  Icon,
  IconSize,
  Select,
  InlineFieldRow
} from '@grafana/ui';
import React, { useState, useEffect } from 'react';
import { OrderBookPanelOptions } from 'types';
import { SearchFormRoom } from 'component/SearchFormRoom';
import { SelectableValue } from '@grafana/data';
import * as _ from 'lodash';

import { toast } from 'react-toastify';
import {
  editPoolRoomAPI,
  getRoomAPI, getTotalPoolAPI,
  getTotalRoomAPI,
} from 'api/main';
import { Constant } from 'api/Consant';

interface Props extends OrderBookPanelOptions { }

interface ObjectKeys {
  [key: string]: string | number;
}

const btnSize: IconSize = 'xl';

import { OrderBookPanelOptions } from 'types';
interface Props extends OrderBookPanelOptions { }

export const RoomPanel: React.FC<Props> = ({ width, height }) => {
  const [order, setOrder] = useState([]);
  const [total, setTotal] = useState<ObjectKeys>();
  const [editCK, setEditCK] = useState<ObjectKeys>();
  const [ckEditType, setCKEditType] = useState<string>('edit');
  const [showModalEditCK, setShowModalEditCK] = useState<boolean>(false);
  let firtTime = true;

  const handleOnchangeEditCK = (
    e: React.FormEvent<HTMLInputElement>,
    key: string
  ) => {
    let newData: ObjectKeys = { ...editCK };
    if (key === 'account' && e.currentTarget.value.length > 10){
      toast.error('Account invalid! Length of account is 10 character!');
      return;
    }
    if (key === 'policyId' && e.currentTarget.value.length > 4){
      toast.error('ID invalid! Maxlength of ID is 4 character!');
      return;
    }
    if (key === 'granted') {
      newData[key] = Number(e.currentTarget.value);
    } else {
      newData[key] = e.currentTarget.value.toUpperCase();
    }
    setEditCK(newData);
  };
  const handleOnchangeEditCKSelect = (e: SelectableValue, key: string) => {
    let newData: ObjectKeys = { ...editCK };
    newData[key] = e.value;
    setEditCK(newData);
  };


  const fetchData = async () => {
    // try {
    //   let data: any = await getOrdersAPI();
    //   setOrder(data.ref_cursor);
    //   document.getElementById('fss-table-wrapper')!.scrollTop = 0;
    // } catch (e) {
    //   toast.error('Fetch Failed: ' + e);
    // }
  };

  const waitFunction = () => {
    setTimeout(() => {
      childFunc.current()
    }, 5000)
  }

  const renderTableData = () => {
    return (
      <div
        id="fss-table-wrapper"
        style={{ overflow: 'auto', width, height: height - 125, zIndex: 1 }}
      >
        <table style={{ width: '100%' }} id="fsstable">
          <thead>
            <tr>
              <th>ID</th>
              <th>PRTYPE</th>
              <th>MODETYPE</th>
              <th>REFSYMBOL</th>
              <th>HM cấp</th>
              <th>Đã sử dụng</th>
              <th>HM còn lại</th>
              {Constant.getInstance().canEdit && (
                <th>
                  <Button
                    icon="plus"
                    onClick={() => {
                      setEditCK({
                        policyType: 'R',
                        modetype: 'OMS1',
                        prtype: 'SYSTEM',
                        policyId:'',
                        symbol:'',
                        doc: 'A',
                        granted: 0,
                        account: '',
                        inused: 0,
                      });
                      setCKEditType('add');
                      setShowModalEditCK(true);
                    }}
                  ></Button>
                </th>
              )}
            </tr>
          </thead>
          {order != null && (
            <tbody>
            {order.map((o: any) => {
              return (
                <tr key={o.policyId}>
                  <td>{o.policyId}</td>
                  <td>{o.prtype}</td>
                  <td>{o.modetype}</td>
                  <td>{o.symbol}</td>
                  <td style={{ textAlign: 'right' }}>
                    {Intl.NumberFormat('en-US').format(Number(o.granted))}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {Intl.NumberFormat('en-US').format(Number(o.inused))}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {Intl.NumberFormat('en-US').format(Number(o.remain))}
                  </td>
                  {Constant.getInstance().canEdit && (
                    <td>
                      <Icon
                        name="edit"
                        title="Edit"
                        style={{ color: 'blue', cursor: 'pointer' }}
                        onClick={() => {
                          let temp: any = {
                            modetype: o.modetype,
                            prtype: o.prtype,
                            policyId: o.policyId,
                            granted: o.granted,
                            symbol: o.symbol,
                          };
                          temp.policyType = 'R';
                          temp.doc = 'U';
                          temp.account = '';
                          temp.inused = 0;
                          setEditCK(temp);
                          setCKEditType('edit');
                          setShowModalEditCK(o.modetype !== 'FLEX');
                        }}
                      />
                    </td>
                  )}
                </tr>
              );
            })}
            </tbody>
          )}
        </table>
      </div>
    );
  };

  const renderTotalForm = () => {
    return (
      <form onSubmit={}>
        <InlineFieldRow>
          <InlineField label="Tổng HM cấp" required>
            <Input
              width={30}
              css={''}
              value={Intl.NumberFormat('en-US').format(Number(total.totalGranted))}
            />
          </InlineField>
          <InlineField label="Tổng đã sử dụng">
            <Input
              width={30}
              css={{textAlign: 'right'}}
              value={Intl.NumberFormat('en-US').format(Number(total.totalInused))}
            />
          </InlineField>
          <InlineField label="Tổng HM còn lại">
            <Input
              width={30}
              css={''}
              value={Intl.NumberFormat('en-US').format(Number(total.totalRemain))}
            />
          </InlineField>
        </InlineFieldRow>
      </form>
    );
  };

  //Handle search call from SearchForm
  const search = async (searchData?: any, page?: any) => {
    if(firtTime){
      firtTime = false;
      return;
    }
    if (searchData === null) {
      return;
    }
    if (page == null) {
      page = 0;
    }
    try {
      let res: any = await getRoomAPI(searchData, page);
      let resTotal: any = await getTotalRoomAPI(searchData, page);
      setOrder([]);
      setTotal({});
      if (res.ref_cursor) {
        setOrder(res.ref_cursor);
        document.getElementById('fss-table-wrapper')!.scrollTop = 0;
      } else {
        setOrder([]);
      }
      if (resTotal) {
        setTotal({
          "totalGranted" : resTotal.totalGranted,
          "totalInused" : resTotal.totalInused,
          // "totalUsed_inday" : resTotal.totalUsed_inday,
          "totalRemain" : resTotal.totalRemain
        });
        document.getElementById('fss-table-wrapper')!.scrollTop = 0;
      } else {
        setTotal({});
      }
    } catch (e) {
      setOrder([]);
      setTotal({});
      toast.error(e);
    } finally {
    }
  };

  const renderEditCK = () => {
    if (editCK != null) {
      return (
        <ConfirmModal
          isOpen={showModalEditCK}
          title={ckEditType === 'edit' ? 'Edit: ' + editCK.policyId : 'Add'}
          confirmText={ckEditType === 'edit' ? 'Update' : 'Add'}
          key="edit-mack"
          body={
            <React.Fragment>
              <InlineField
                label="Policytype"
                labelWidth={20}
                disabled={true}
              >
                <Select
                  value={editCK.policyType}
                  width={30}
                  onChange={(e) => handleOnchangeEditCKSelect(e, 'policyType')}
                  options={[
                    { label: 'Pool', value: 'P' },
                    { label: 'Room', value: 'R' },
                  ]}
                />
              </InlineField>
              <InlineField
                label="ID"
                labelWidth={20}
                disabled={ckEditType === 'edit'}
              >
                <Input
                  width={30}
                  css={''}
                  value={editCK.policyId}
                  onChange={(e) => handleOnchangeEditCK(e, 'policyId')}
                />
              </InlineField>
              <InlineField
                label="Prtype"
                labelWidth={20}
                disabled={ckEditType === 'edit'}
              >
                <Select
                  value={editCK.prtype}
                  width={30}
                  onChange={(e) => handleOnchangeEditCKSelect(e, 'prtype')}
                  options={ckEditType === 'edit' ? [
                    { label: 'SYSTEM', value: 'SYSTEM' },
                    { label: 'ACCOUNT', value: 'ACCOUNT' },
                    { label: 'BASKET', value: 'BASKET' },
                  ] : [
                    { label: 'SYSTEM', value: 'SYSTEM' },
                    { label: 'ACCOUNT', value: 'ACCOUNT' },
                  ]}
                />
              </InlineField>
              <InlineField
                label="Account"
                labelWidth={20}
                disabled={ckEditType === 'edit' || editCK.prtype === 'SYSTEM'}
              >
                <Input
                  width={30}
                  css={''}
                  value={editCK.account}
                  onChange={(e) => handleOnchangeEditCK(e, 'account')}
                />
              </InlineField>
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
              <InlineField
                label="Modetype"
                labelWidth={20}
                disabled={ckEditType === 'edit'}
              >
                <Select
                  value={editCK.modetype}
                  width={30}
                  onChange={(e) => handleOnchangeEditCKSelect(e, 'modetype')}
                  options={[
                    { label: 'OMS1', value: 'OMS1' },
                    { label: 'OMS2', value: 'OMS2' },
                  ]}
                />
              </InlineField>
              <InlineField
                label="Type"
                labelWidth={20}
                disabled={true}
              >
                <Select
                  value={editCK.doc}
                  width={30}
                  onChange={(e) => handleOnchangeEditCKSelect(e, 'doc')}
                  options={[
                    { label: 'Update', value: 'U' },
                    { label: 'Add', value: 'A' },
                  ]}
                />
              </InlineField>
              <InlineField label="Granted" labelWidth={20}>
                <Input
                  width={30}
                  css={''}
                  type="number"
                  value={editCK.granted}
                  onChange={(e) => handleOnchangeEditCK(e, 'granted')}
                />
              </InlineField>
            </React.Fragment>
          }
          onDismiss={() => {
            setShowModalEditCK(false);
          }}
          onConfirm={async () => {
            try {
              if (ckEditType === 'add' && _.isEmpty(editCK.policyId)) {
                toast.error('ID must not be empty');
              } else if (ckEditType === 'add' && _.isEmpty(editCK.symbol)){
                toast.error('Symbol must not be empty');
              } else if (editCK.granted < 0){
                toast.error('Granted must be greater than 0');
              } else {
                let res: any = await editPoolRoomAPI(editCK);
                if (ckEditType === 'edit') {
                  // let policyId = res.policyId;
                  // replaceOneItemCK(policyId);
                  toast.success('Edit room ' + editCK.policyId + ': DONE');
                } else {
                  // let newData: any = _.cloneDeep(accountSE);
                  // let { object, accountNo, ...d } = res;
                  // newData.unshift(d);
                  // newData.avlTrade = editCK.trade;
                  // setAccountSE(newData);
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

  const replaceOneItemCK = (policyId: any) => {
    let index = order.findIndex((o: any) => o.policyId === policyId);
    order([
      ...order.slice(0, index),
      ...order.slice(index + 1),
    ]);
  };

  return (
    <VerticalGroup justify="flex-start" align="center">
      <SearchFormRoom
        handleFunction={search}
        order={order}
      />
      {renderTableData()}
      {renderEditCK()}
      {total != null && renderTotalForm()}
    </VerticalGroup>
  );
};
