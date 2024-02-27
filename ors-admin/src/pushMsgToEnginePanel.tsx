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
import {
  pushMsgToEngine,
} from 'api/main';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { OrderBookPanelOptions } from 'types';
import {Constant} from "./api/Consant";

interface Props extends OrderBookPanelOptions { }

interface ObjectKeys {
  [key: string]: string | number;
}

export const PushMsgToEnginePanel: React.FC<Props> = ({ width, height }) => {

  const [editStatus, setEditStatus] = useState<ObjectKeys>({
    SIGNALTYPE: 'CWD',
  });

  const [showModal, setShowModal] = useState<boolean>(false);

  const renderStatus = () => {
    return (
      <InlineFieldRow>
        <InlineField label={'Send message to Engine ...'}>
          <div/>
        </InlineField>
        {Constant.getInstance().canEdit && (
          <InlineField>
            <Button
              onClick={() => setShowModal(true)}
            >Set</Button>
          </InlineField>
        )}
      </InlineFieldRow>
    );
  };

  const handleOnchangeEditStatusSelect = (
    e: SelectableValue,
    key: string
  ) => {
    let newData: ObjectKeys = { ...editStatus };
    newData[key] = e.value;
    setEditStatus(newData);
  };

  const loadSignalType = (data: any) => {
    return (
      <InlineField label="Message type" labelWidth={12}>
        <Select
          value={editStatus.SIGNALTYPE}
          width={30}
          onChange={(e) => handleOnchangeEditStatusSelect(e, 'SIGNALTYPE')}
          options={[
            {
              label: 'CWD',
              value: 'CWD',
              description: 'Đổi ngày để Engine load lại lệnh, giá, ngày, phiên',
            },
            {
              label: 'CLD',
              value: 'CLD',
              description: 'Đóng ngày',
            },
            {
              label: 'AB',
              value: 'AB',
              description: 'Đẩy tín hiệu active time lệnh LO-GTC, OCO, OCO-GTC',
            },
          ]
          }
        />
      </InlineField>
    );
  };

  const renderModalPushToEngine = () => {
    return (
      <ConfirmModal
        title="Send message to Engine"
        confirmText="Set"
        isOpen={showModal}
        onDismiss={() => setShowModal(false)}
        onConfirm={async () => {
          try {
            if(editStatus.SIGNALTYPE ==='')
            {
              toast.error('Please select one type to set');
              return;
            }
            await pushMsgToEngine(editStatus);
            toast.success('DONE');
          } catch (error) {
            toast.error(error);
          }
        }}
        body={
          <div style={{ height: '350px' }}>
            {loadSignalType(editStatus.SIGNALTYPE)}
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
            {renderModalPushToEngine()}
          </VerticalGroup>
        </InlineField>
      </InlineFieldRow>
    </HorizontalGroup>
  );
};
