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
  InlineFieldRow,
} from '@grafana/ui';
import React, { useState, useEffect } from 'react';
import { SearchFormPool } from 'component/SearchFormPool';
import { SelectableValue } from '@grafana/data';
import * as _ from 'lodash';

import { toast } from 'react-toastify';
import {
  editPoolRoomAPI,
  getPoolAPI,
  getTotalPoolAPI,
} from 'api/main';
import { Constant } from 'api/Consant';

interface ObjectKeys {
  [key: string]: string | number;
}

const btnSize: IconSize = 'xl';

import { OrderBookPanelOptions } from 'types';
interface Props extends OrderBookPanelOptions { }

export const PoolPanel: React.FC<Props> = ({ width, height }) => {
  const [order, setOrder] = useState([]);
  const [total, setTotal] = useState<ObjectKeys>();
  const [editCK, setEditCK] = useState<ObjectKeys>();
  const [ckEditType, setCKEditType] = useState<string>('edit');
  const [showModalEditCK, setShowModalEditCK] = useState<boolean>(false);

  const waitFunction = () => {
    setTimeout(() => {
      childFunc.current()
    }, 5000)
  }
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
              <th>HM cấp</th>
              <th>Đã sử dụng</th>
              <th>Dự tính trong ngày</th>
              <th>HM còn lại</th>
              {Constant.getInstance().canEdit && (
                <th>
                  <Button
                    icon="plus"
                    onClick={() => {
                      setEditCK({
                        policyType: 'P',
                        modetype: 'OMS1',
                        prtype: 'SY',
                        policyId:'',
                        symbol:'',
                        doc: 'A',
                        granted: 0,
                        inused: 0,
                        account: '',
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
                  <td>{o.prtype === 'SY' ? 'SYSTEM' : o.prtype === 'TY' ? 'TYPE' : o.prtype === 'AF' ? 'ACCOUNT' : 'GROUP' }</td>
                  <td>{o.modetype}</td>
                  <td style={{ textAlign: 'right' }}>
                    {Intl.NumberFormat('en-US').format(Number(o.granted))}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {Intl.NumberFormat('en-US').format(Number(o.inused))}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {Intl.NumberFormat('en-US').format(Number(o.used_inday))}
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
                            inused: o.inused,
                            account: o.account,
                          };
                          temp.policyType = 'P';
                          temp.symbol = '';
                          temp.doc = 'U';
                          setEditCK(temp);
                          setCKEditType('edit');
                          setShowModalEditCK(true);
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
          <InlineField label="Tổng dự tính trong ngày">
            <Input
              width={30}
              css={''}
              value={Intl.NumberFormat('en-US').format(Number(total.totalUsed_inday))}
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
    if (searchData === null) {
      return;
    }
    if (page == null) {
      page = 0;
    }
    try {
      let res: any = await getPoolAPI(searchData, page);
      let resTotal: any = await getTotalPoolAPI(searchData, page);
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
          "totalUsed_inday" : resTotal.totalUsed_inday,
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
                  options={[
                    { label: 'SYSTEM', value: 'SY' },
                    { label: 'TYPE', value: 'TY' },
                    { label: 'ACCOUNT', value: 'AF' },
                    { label: 'GROUP', value: 'GR' },
                  ]}
                />
              </InlineField>
              {/*<InlineField*/}
              {/*  label="Symbol"*/}
              {/*  labelWidth={20}*/}
              {/*  disabled={ckEditType === 'edit'}*/}
              {/*>*/}
              {/*  <Input*/}
              {/*    width={30}*/}
              {/*    css={''}*/}
              {/*    value={editCK.symbol}*/}
              {/*    onChange={(e) => handleOnchangeEditCK(e, 'symbol')}*/}
              {/*  />*/}
              {/*</InlineField>*/}
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
              <InlineField label="Inused" labelWidth={20}>
                <Input
                  width={30}
                  css={''}
                  type="number"
                  value={editCK.inused}
                  onChange={(e) => handleOnchangeEditCK(e, 'inused')}
                />
              </InlineField>
              <InlineField
                label="Account"
                labelWidth={20}
                disabled={(ckEditType === 'add' && (editCK.prtype === 'AF' || editCK.prtype === 'GR')) ? false : true}
              >
                <Input
                  width={30}
                  css={''}
                  value={editCK.account}
                  onChange={(e) => handleOnchangeEditCK(e, 'account')}
                />
              </InlineField>
            </React.Fragment>
          }
          onDismiss={() => {
            setShowModalEditCK(false);
          }}
          onConfirm={async () => {
            try {
              if (_.isEmpty(editCK.policyId)) {
                toast.error('ID must not be empty');
              } else if (((editCK.prtype === 'AF' || editCK.prtype === 'GR') && ckEditType === 'add' && _.isEmpty(editCK.account))
                      ||  (editCK.prtype === 'AF' && ckEditType === 'edit' && _.isEmpty(editCK.account))){
                toast.error('Account must not be empty');
              }  else if (editCK.granted < 0){
                toast.error('Granted must be greater than 0');
              } else if (editCK.inused < 0){
                toast.error('Inused must be greater than 0');
              }  else {
                let res: any = await editPoolRoomAPI(editCK);
                if (ckEditType === 'edit') {
                  toast.success('Edit pool ' + editCK.policyId + ': DONE');
                } else {
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
      <SearchFormPool
        handleFunction={search}
        order={order}
      />
      {renderTableData()}
      {renderEditCK()}
      {total != null && renderTotalForm()}
    </VerticalGroup>
  );
};
