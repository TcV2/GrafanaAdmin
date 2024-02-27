// @ts-nocheck
import {
  InlineField,
  VerticalGroup,
  ConfirmModal,
  Input,
  Icon,
} from '@grafana/ui';
import React, {useEffect, useState} from 'react';
import {toast} from 'react-toastify';
import { OrderBookPanelOptions } from 'types';
import {
  checkAuthAPI,
  unholdAllOrderAPI,
  getCurrentTime,
  getOrderDetailAPI,
  searchOrderAPIClone,
} from 'api/main';
var dateFormat = require('dateformat');
import {SearchFormClone} from "./component/SearchFormClone";
interface Props extends OrderBookPanelOptions { }

let intervalFetch: any;
export const UnholdOrderPanel: React.FC<Props> = ({ width, height }) => {

  const [order, setOrder] = useState([]);
  const [orderHist, setOrderHist] = useState<ObjectKeys[]>([]);
  const [showDetail, setShowDetail] = useState(false);
  const [sideDetail, setSideDetail] = useState<string>('');
  const [disable, setDisable] = useState(true);

  // useEffect(() => {
  //   let res = fetchData2();
  //   intervalFetch = setInterval(async () => {
  //     await fetchData2();
  //   }, 10000);
  //   return function cleanup() {
  //     clearInterval(intervalFetch);
  //   };
  // }, []);

  // const fetchData2 = async () => {
  //   let res: any = await getCurrentTime();
  //   setDisable(res.data);
  // };

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
        {showDetail && renderDetail()}
        <table style={{ width: '100%' }} id="fsstable">
          <thead>
          <tr>
            <th>Time</th>
            <th>OrderID</th>
            <th>CustodyCD</th>
            <th>AccountNo</th>
            <th>Symbol</th>
            <th>Side</th>
            <th>Type</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Match Qty</th>
            <th>Avg Price</th>
            <th>Remain</th>
            <th>Via</th>
            <th>Status</th>
          </tr>
          </thead>
          <tbody>
          {order.map((o: any) => {
            const { orderID, accountNo } = o;
            let account = accountNo;
            let targetId = o.targetId
            let date = new Date(parseInt(o.createdTime, 10));
            let dateString = dateFormat(date, 'HH:MM:ss.l');
            return (
              <tr key={orderID}>
                <td>{dateString}</td>
                <td>{o.originOrderID}</td>
                <td>{o.custodycd}</td>
                <td>{o.accountNo}</td>
                <td>{o.symbol}</td>
                <td>{o.side === 'B' ? 'Buy' : 'Sell'}</td>
                <td>{o.orderType}</td>
                <td style={{ textAlign: 'right' }}>
                  {Intl.NumberFormat('en-US').format(Number(o.quantity))}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {Intl.NumberFormat('en-US').format(Number(o.price))}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {Intl.NumberFormat('en-US').format(
                    Number(o.executedQuantity)
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {Intl.NumberFormat('en-US').format(Number(o.avgPrice))}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {Intl.NumberFormat('en-US').format(
                    Number(o.remainingQuantity)
                  )}
                </td>
                <td>{o.via}</td>
                <td><a className="lbl-link" onClick={async () => {
                  try {
                    let data: any = await getOrderDetailAPI(
                      o.originOrderID
                    );
                    setSideDetail(o.side);
                    setShowDetail(true);
                    setOrderHist(data.ref_cursor);
                  } catch (error) {
                    toast.error(error);
                  }
                }}>{o.status}</a></td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderDetail = () => {
    const renderData = () => {
      return orderHist.reverse().map((o: any) => {
        let date = new Date(o.updatedTime);
        let dateString = dateFormat(date, 'HH:MM:ss.l');
        return (
          <tr style={{ fontSize: '12px !important' }}>
            <td style={{ textAlign: 'center' }}>{dateString}</td>
            <td style={{ textAlign: 'center' }}>{o.execType}</td>
            <td style={{ textAlign: 'center' }}>{o.orderId}</td>
            <td style={{ textAlign: 'center' }}>{o.custodycd}</td>
            <td style={{ textAlign: 'center' }}>{o.account}</td>
            <td style={{ textAlign: 'center' }}>{o.symbol}</td>
            <td style={{ textAlign: 'center' }}>
              {sideDetail === 'B' ? 'Buy' : 'Sell'}
            </td>
            <td style={{ textAlign: 'center' }}>{o.orderType}</td>
            <td style={{ textAlign: 'center' }}>
              {Intl.NumberFormat('en-US').format(Number(o.quantity))}
            </td>
            <td style={{ textAlign: 'center' }}>
              {Intl.NumberFormat('en-US').format(Number(o.price))}
            </td>
            <td style={{ textAlign: 'center' }}>
              {Intl.NumberFormat('en-US').format(Number(o.executedQuantity))}
            </td>
            <td style={{ textAlign: 'center' }}>
              {Intl.NumberFormat('en-US').format(Number(o.executedPrice))}
            </td>
            <td style={{ textAlign: 'center' }}>
              {Intl.NumberFormat('en-US').format(Number(o.remainingQuantity))}
            </td>
            <td style={{ textAlign: 'center' }}>{o.orderStatus}</td>
          </tr>
        );
      });
    };
    return (
      <div
        id="fssedit-wrapper"
        onClick={(e) => {
          let modal = document.getElementById('fssedit-wrapper');
          if (e.target === modal) {
            setShowDetail(false);
          }
        }}
      >
        <div
          id="editmodal"
          style={{
            minWidth: '400px',
            maxWidth: width,
            left: '50%',
            maxHeight: '500px',
            zIndex: 20,
            position: 'absolute',
            overflow: 'auto',
            padding: '10px',
            top: '20%',
            transform: 'translateX(-50%)',
            paddingBottom: '40px',
            // border: '1px solid white',
          }}
        >
          <Icon
            name="times"
            style={{
              position: 'absolute',
              border: '1px solid white',
              borderRadius: '20px',
              color: 'white',
              right: '10px',
              top: '10px',
              cursor: 'pointer',
            }}
            title="Close"
            size={'xl'}
            onClick={() => {
              setShowDetail(false);
            }}
          />
          <table style={{ width: '100%', marginTop: '10px' }} id="fsstable">
            <thead>
            <tr>
              <th>Time</th>
              <th>Event</th>
              <th>OrderID</th>
              <th>CustodyCD</th>
              <th>AccountNo</th>
              <th>Symbol</th>
              <th>Side</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Price</th>
              <th>MatchQty</th>
              <th>MatchPx</th>
              <th>Remain</th>
              <th>Status</th>
            </tr>
            </thead>
            <tbody>{orderHist !== null && renderData()}</tbody>
          </table>
        </div>
      </div>
    );
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
    // return (
    //   <ConfirmModal
    //     isOpen={showModal}
    //     title={'Unhold all orders?'}
    //     confirmText={'OK'}
    //     body={
    //       <InlineField label="Password" labelWidth={20}>
    //         <Input
    //           type="password"
    //           width={50}
    //           required={true}
    //           css={''}
    //           value={password}
    //           onChange={(e) => handleOnchange(e, 'password')}
    //         />
    //       </InlineField>
    //     }
    //     onDismiss={() => {
    //       setShowModal(false);
    //       setPassword('');
    //     }}
    //     onConfirm={async () => {
    //       await doUnhold();
    //       setPassword('');
    //       setShowModal(false);
    //     }}
    //   />
    // );
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
      let res: any = await searchOrderAPIClone(searchData, page);
      if (res.ref_cursor) {
        setOrder(res.ref_cursor);
        document.getElementById('fss-table-wrapper')!.scrollTop = 0;
      } else {
        setOrder([]);
      }
    } catch (e) {
      setOrder([]);
      toast.error(e);
    } finally {
    }
  };

  //Handle button unholdAll trigger
  const unholdAll = async () => {
    // if (!disable){
    //   setShowModal(true);
    // }
    // else {
    //   toast.error("Could not unhold in this time!");
    // }
  };

  //Call api checkAuth + unhold by type
  const doUnhold = async () => {
    // if (password === '') {
    //   toast.error('Password can not be empty');
    //   return;
    // }
    // let auth = await checkAuthAPI(password);
    // if (auth) {
    //   try {
    //     await unholdAllOrderAPI();
    //     toast.success('Unhold all orders: DONE');
    //   } catch (error) {
    //     toast.error(error);
    //   }
    //   waitFunction();
    // } else {
    //   toast.error('Wrong password. Do not unhold at all!');
    // }
  };

  const childFunc = React.useRef(null);

  return (
    <VerticalGroup justify="flex-start" align="center">
      <SearchFormClone
        childFunc={childFunc}
        handleFunction={search}
        handleUnholdAll={unholdAll}
        order={order}
      />
      {renderTableData()}
      {renderModal()}
    </VerticalGroup>
  );

};
