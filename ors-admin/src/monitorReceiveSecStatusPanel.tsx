// @ts-nocheck
import {Button, HorizontalGroup, InlineField, InlineFieldRow, VerticalGroup,ConfirmModal,Input,} from '@grafana/ui';
import {getReceiveSecStatus, updateReceiveSecStatus,} from 'api/monitorAPI';
import {checkAuthAPI,} from 'api/main';

import React, {useEffect, useState} from 'react';
import {toast} from 'react-toastify';
import {Constant} from "./api/Consant";

let intervalFetch: any;

export const MonitorReceiveSecStatusPanel: React.FC<Props> = ({ width, height }) => {
  useEffect(() => {
    fetchStatus();
    intervalFetch = setInterval(async () => {
      await fetchStatus();
    }, 30000);
    return function cleanup() {
      clearInterval(intervalFetch);
    };
  }, []);

  const fetchStatus = async () => {
    let res: any = await getReceiveSecStatus();
    setPendingAccounts(res.PENDING_ACCOUNTS);
    setPendingAccountsBond(res.PENDING_ACCOUNTS_BOND);
  };

  const [pendingAccounts, setPendingAccounts] = useState('');
  const [pendingAccountsBond, setPendingAccountsBond] = useState('');

  const handleOnchange = (
    e: React.FormEvent<HTMLInputElement>,
    key?: string
  ) => {
    setPassword(e.currentTarget.value);
  };

  const childFunc = React.useRef(null);
  const waitFunction = () => {
    setTimeout(() => {
      childFunc.current()
    }, 5000)
  }

  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [receiveType, setReceiveType] = useState('');
  const renderModal = () => {
    return (
      <ConfirmModal
        isOpen={showModal}
        title={'Start receive Sec/Bond T1?'}
        confirmText={'OK'}
        body={
          <InlineField label="Password" labelWidth={20}>
            <Input
              type="password"
              width={35}
              required={true}
              css={''}
              value={password}
              onChange={(e) => handleOnchange(e, 'password')}
            />
          </InlineField>
        }
        onDismiss={() => {
          setShowModal(false);
          setPassword('');
        }}
        onConfirm={async () => {
          await startReceiveSecOrBond();
          setPassword('');
          setShowModal(false);
        }}
      />
    );
  };

  //Call api checkAuth + start Receive Sec/Bond
  const startReceiveSecOrBond = async () => {
    if (password === '') {
      toast.error('Password can not be empty');
      return;
    }
    let auth = await checkAuthAPI(password);
    if (auth) {
      toast.success('Processing...');
      try {
        let res = await updateReceiveSecStatus(receiveType);
        if(res){
          toast.success('OK');
        } else {
          toast.error('Not OK');
        }
      } catch (error) {
        toast.error(error);
      }
      waitFunction();
    } else {
      toast.error('Wrong password!');
    }
  };

  const renderStatus = () => {
    return (
      <div
        id="fss-table-wrapper"
        style={{overflow: 'auto', width, height}}
      >
        <table style={{width: '100%'}} id="fsstable">
          <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>TOTAL ACCOUNTS PENDING RECEIVE SECURITIES</td>
            <td>{pendingAccounts}</td>
          </tr>
          <tr>
            <td>TOTAL ACCOUNTS PENDING RECEIVE BOND</td>
            <td>{pendingAccountsBond}</td>
          </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderButton = () => {
    return(
      <div>
        <InlineFieldRow align="center">
          {Constant.getInstance().canEdit && (
            <InlineField>
              <Button style={{backgroundColor: 'green'}} onClick={async () => {
                setReceiveType('sec');
                setShowModal(true);
              }}>Receive Securites T1</Button>
            </InlineField>)}
          {Constant.getInstance().canEdit && (
            <InlineField>
              <Button style={{backgroundColor: 'green'}} onClick={async () => {
                setReceiveType('bond');
                setShowModal(true);
              }}>Receive Bond T1</Button>
            </InlineField>)}
        </InlineFieldRow>
      </div>
    );
  };

  return (
    <HorizontalGroup
      justify="center"
      align="flex-start"
      style={{width, height, overflow: 'auto'}}
    >
      <VerticalGroup justify="flex-start" align="center">
        {renderButton()}
        {/*<InlineFieldRow></InlineFieldRow>*/}
        <InlineFieldRow>
          <InlineField>
            <VerticalGroup justify="flex-start" align="center">
              {renderStatus()}
            </VerticalGroup>
          </InlineField>
        </InlineFieldRow>
        {renderModal()}
      </VerticalGroup>
    </HorizontalGroup>
  );

};
