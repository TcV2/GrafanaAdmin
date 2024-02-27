// @ts-nocheck
import {
  Button,
  HorizontalGroup,
  InlineField,
  InlineFieldRow,
  VerticalGroup,
  ConfirmModal,
  Input,
} from '@grafana/ui';
import React, {useEffect, useState} from 'react';
import {toast} from 'react-toastify';
import { OrderBookPanelOptions } from 'types';
import {
  checkAuthAPI,
  countOrdersAPI,
  unholdAllOrderAPI,
  unholdOrderAPI,
  getCurrentTime
} from 'api/main';
import {Constant} from "./api/Consant";
interface Props extends OrderBookPanelOptions { }

let intervalFetch: any;
let intervalFetch2: any;
export const CountOrdersPanel: React.FC<Props> = ({ width, height }) => {

  const [totalCount, setTotalCount] = useState('');
  const [disable, setDisable] = useState(true);

  useEffect(() => {
    if (totalCount === '') {
      let res = fetchData();
    }
    intervalFetch = setInterval(async () => {
      await fetchData();
    }, 30000);
    return function cleanup() {
      clearInterval(intervalFetch);
    };
  }, []);

  useEffect(() => {
    if (totalCount === '') {
      let res = fetchData2();
    }
    intervalFetch2 = setInterval(async () => {
      await fetchData2();
    }, 5000);
    return function cleanup() {
      clearInterval(intervalFetch);
    };
  }, []);

  const fetchData = async () => {
    let res: any = await countOrdersAPI();
    setTotalCount(res.TOTALCOUNT);
  };

  const fetchData2 = async () => {
    let res: any = await getCurrentTime();
    setDisable(res.data);
  };

  const waitFunction = () => {
    setTimeout(() => {
      childFunc.current()
    }, 5000)
  }

  const doUnhold = async () => {
    if (password === '') {
      toast.error('Password can not be empty!');
      return;
    }
    let auth = await checkAuthAPI(password);
    if (auth) {
      try {
        await unholdAllOrderAPI();
        toast.success('Unhold all orders: DONE');
      } catch (error) {
        toast.error(error);
      }
      waitFunction();
    } else {
      toast.error('Wrong password. Do not unhold at all!');
    }
  };

  const handleOnchange = (
    e: React.FormEvent<HTMLInputElement>,
    key?: string
  ) => {
    setPassword(e.currentTarget.value);
  };

  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const renderModal = () => {
    return (
      <ConfirmModal
        isOpen={showModal}
        title={'Unhold all orders?'}
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
          await doUnhold();
          let res: any = await countOrdersAPI();
          setTotalCount(res.TOTALCOUNT);
          setPassword('');
          setShowModal(false);
        }}
      />
    );
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
            <td>TOTAL REMAIN ORDERS</td>
            <td>{totalCount}</td>
          </tr>
          </tbody>
        </table>
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
        <InlineFieldRow align="center">
          <InlineField>
            {Constant.getInstance().canEdit && (<Button
              style={{backgroundColor: 'orange'}}
              onClick={async () => {
                if (!disable){
                  setShowModal(true);
                }
                else {
                  toast.error("Could not unhold in this time!");
                }
              }}>
              Unhold all
            </Button>)}
          </InlineField>
        </InlineFieldRow>
        <InlineFieldRow>
          <InlineField>
            <VerticalGroup justify="flex-start" align="center">
              {renderStatus()}
              {renderModal()}
            </VerticalGroup>
          </InlineField>
        </InlineFieldRow>
      </VerticalGroup>
    </HorizontalGroup>
  );

};
