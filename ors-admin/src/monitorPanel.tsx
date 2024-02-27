// @ts-nocheck
import { SelectableValue } from '@grafana/data';
import {
  Button,
  VerticalGroup,
  HorizontalGroup,
  InlineField,
  InlineFieldRow,
  Select,
  ConfirmModal,
} from '@grafana/ui';
import { Constant } from 'api/Consant';
import { getExStatusAPI, updateExStatusAPI } from 'api/main';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { OrderBookPanelOptions } from 'types';

interface Props extends OrderBookPanelOptions { }

interface ObjectKeys {
  [key: string]: string | number;
}

let intervalFetch: any;

export const MonitorPanel: React.FC<Props> = ({ width, height }) => {
  useEffect(() => {
    fetchStatus();
    intervalFetch = setInterval(async () => {
      await fetchStatus();
    }, 300000);
    return function cleanup() {
      clearInterval(intervalFetch);
    };
  }, []);

  const fetchStatus = async () => {
    let res: any = await getExStatusAPI('HNX');
    setStatusHNX(res.sessionEx);

    res = await getExStatusAPI('HSX');
    setStatusHSX(res.sessionEx);
    setStatusHSXOddLot(res.sessionODDEx);

    res = await getExStatusAPI('UPCOM');
    setStatusUPCOM(res.sessionEx);
  };
  const [statusHNX, setStatusHNX] = useState<string>('');
  const [statusHSX, setStatusHSX] = useState<string>('');
  const [statusUPCOM, setStatusUPCOM] = useState<string>('');
  const [statusHSXOddLot, setStatusHSXOddLot] = useState<string>('');
  const [editStatus, setEditStatus] = useState<ObjectKeys>({
    exchange: 'HSX',
    status: '',
  });

  const renderStatus = () => {
    return (
      <InlineFieldRow>
        <InlineField label={'HSX: ' + statusHSX}>
          <div></div>
        </InlineField>
        <InlineField label={'HNX: ' + statusHNX}>
          <div></div>
        </InlineField>
        <InlineField label={'UPCOM: ' + statusUPCOM}>
          <div></div>
        </InlineField>
        <InlineField label={'HSX OddLot: ' + statusHSXOddLot}>
          <div></div>
        </InlineField>
        {Constant.getInstance().canEdit && (
          <InlineField>
            <Button
              onClick={() => setShowModalChangeEXStatus(true)}
            >Set</Button>
          </InlineField>
        )}
      </InlineFieldRow>
    );
  };

  const loadSessionEx = (data: any) => {
    const handleOnchangeEditStatusSelect = (
      e: SelectableValue,
      key: string
    ) => {
      let newData: ObjectKeys = { ...editStatus };
      newData[key] = e.value;
      setEditStatus(newData);
    };
    if(data === 'HSX OddLot') {
      return (
        <InlineField label="Status" labelWidth={12}>
          <Select
            value={editStatus.status}
            width={30}
            onChange={(e) => handleOnchangeEditStatusSelect(e, 'status')}
            options={[
              /*{
                label: 'OPEN1MODD',
                value: 'OPEN1MODD',
                description:
                  'Phiên trước giờ mở cửa',
              },*/
              {
                label: 'OPENODD',
                value: 'OPENODD',
                description:
                  'Phiên giao dịch lô lẻ',
              },
              {
                label: 'INTERODD',
                value: 'INTERODD',
                description:
                  'Phiên nghỉ trưa lô lẻ',
              },
              {
                label: 'CLOSEDODD',
                value: 'CLOSEDODD',
                description:
                  'Phiên đóng cửa lô lẻ',
              },]
            }
          />
        </InlineField>
      );
    }
    else {
      return (
        <InlineField label="Status" labelWidth={12}>
          <Select
            value={editStatus.status}
            width={30}
            onChange={(e) => handleOnchangeEditStatusSelect(e, 'status')}
            options={[
              {
                label: 'NEW',
                value: 'NEW',
                description: 'Phiên trước giờ',
              },
              {
                label: 'RECV',
                value: 'RECV',
                description: 'Phiên đẩy lệnh lên gateway',
              },
              {
                label: 'ATO1M',
                value: 'ATO1M',
                description: 'Phiên ATO in 1 minute',
              },
              { label: 'ATO', value: 'ATO', description: 'Phiên mở cửa' },
              {
                label: 'OPEN',
                value: 'OPEN',
                description: 'Phiên liên tục',
              },
              {
                label: 'INTERMISSION',
                value: 'INTERMISSION',
                description: 'Phiên nghỉ trưa',
              },
              {
                label: 'OPEN1M',
                value: 'OPEN1M',
                description: 'Phiên reopen in 1 minute',
              },
              {
                label: 'ATC1M',
                value: 'ATC1M',
                description: 'Phiên ATC in 1 minute',
              },
              { label: 'ATC', value: 'ATC', description: 'Phiên đóng cửa' },
              {
                label: 'RUNOFF',
                value: 'RUNOFF',
                description: 'Thỏa thuận sau giờ',
              },
              {
                label: 'CLOSE',
                value: 'CLOSE',
                description: 'Đóng cửa thị trường',
              },
              {
                label: 'INIT',
                value: 'INIT',
                description:
                  'Phiên khởi tạo đầu ngày, không nhận lệnh',
              },
              ]
            }
          />
        </InlineField>
      );
    }
  };

  const [showModalChangeEXStatus, setShowModalChangeEXStatus] =
    useState<boolean>(false);
  const renderModalChangeEXStatus = () => {
    const handleOnchangeEditStatusSelect = (
      e: SelectableValue,
      key: string
    ) => {
      let newData: ObjectKeys = { ...editStatus };
      newData[key] = e.value;
      setEditStatus(newData);
    };
    return (
      <ConfirmModal
        title="Change Exchange Status"
        isOpen={showModalChangeEXStatus}
        onDismiss={() => setShowModalChangeEXStatus(false)}
        confirmText="Update"
        onConfirm={async () => {
          try {
            if(editStatus.status ==='')
            {
              toast.error('Please select one status to update');
              return;
            }
            if(editStatus.exchange === 'HSX OddLot') {
              editStatus.exchange = 'HSX';
            }
            await updateExStatusAPI(editStatus);
            toast.success(
              'Update ' +
              editStatus.exchange +
              ' status to ' +
              editStatus.status
            );
            setEditStatus({
              exchange: 'HSX',
              status: '',
            });
            setShowModalChangeEXStatus(false);
            fetchStatus();
          } catch (error) {
            toast.error(error);
          }
        }}
        body={
          <div style={{ height: '350px' }}>
            <InlineField label="Exchange" labelWidth={12}>
              <Select
                value={editStatus.exchange}
                width={30}
                onChange={(e) => handleOnchangeEditStatusSelect(e, 'exchange')}
                options={[
                  { label: 'HSX', value: 'HSX' },
                  { label: 'HNX', value: 'HNX' },
                  { label: 'UPCOM', value: 'UPCOM' },
                  { label: 'HSX OddLot', value: 'HSX OddLot' },
                ]}
              />
            </InlineField>
            {loadSessionEx(editStatus.exchange)}
          </div>
        }
      />
    );
  };

  return (
    <HorizontalGroup
      justify="center"
      align="flex-start"
      style={{ width, height, overflow: 'auto' }}
    >
      <InlineFieldRow style={{ height, overflow: 'auto' }}>
        <InlineField>
          <VerticalGroup justify="flex-start" align="center">
            {renderStatus()}
            {renderModalChangeEXStatus()}
          </VerticalGroup>
        </InlineField>
      </InlineFieldRow>
    </HorizontalGroup>
  );
};
