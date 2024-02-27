// @ts-nocheck
import {
  Button,
  VerticalGroup,
  ConfirmModal,
  InlineField,
  Input,
  Icon,
  IconSize,
} from '@grafana/ui';
import React, { useState, useEffect } from 'react';
import { OrderBookPanelOptions } from 'types';
import { SearchForm } from 'component/SearchForm';
import { OrderForm } from 'component/OrderForm';
import { toast } from 'react-toastify';
import {
  getOrdersAPI,
  getOrderDetailAPI,
  removeOrderAPI,
  searchOrderAPI,
  checkAuthAPI,
  editOrderAPI,
  symbolInfoAPI,
  unholdOrderAPI,
  unholdAllOrderAPI,
} from 'api/main';
import { Constant } from 'api/Consant';
var dateFormat = require('dateformat');

interface Props extends OrderBookPanelOptions { }

interface ObjectKeys {
  [key: string]: string | number;
}

const btnSize: IconSize = 'xl';

export const OrderBookPanel: React.FC<Props> = ({ width, height }) => {
  const [order, setOrder] = useState([]);
  const [orderHist, setOrderHist] = useState<ObjectKeys[]>([]);
  const [showDetail, setShowDetail] = useState(false);
  const [showEditOrder, setShowEditOrder] = useState(false);
  const [editOrderData, setEditOrderData] = useState({
    orderID: '',
    account: '',
    quantity: 0,
    price: 0,
    symbol: '',
    targetId: '',
  });
  const [unholdType, setUnholdType] = useState('');
  const [unholdData, setUnholdData] = useState({ orderID: '', account: '', targetId: '' });

  // useEffect(() => {
  //   fetchData();
  // }, []);

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

  const [sideDetail, setSideDetail] = useState<string>('');

  const renderTableData = () => {
    return (
      <div
        id="fss-table-wrapper"
        style={{ overflow: 'auto', width, height: height - 125, zIndex: 1 }}
      >
        {showDetail && renderDetail()}
        {showEditOrder && renderEdit()}
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
              <th>Actions</th>
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
                  <td>
                    {Constant.getInstance().canEdit && (
                      <span>
                        <Icon
                          name="edit"
                          title="Replace Order"
                          style={{ cursor: 'pointer', color: 'blue' }}
                          size={btnSize}
                          onClick={async () => {
                            setEditOrderData({
                              orderID,
                              account,
                              quantity: o.quantity,
                              price: o.price,
                              symbol: o.symbol,
                              targetId: targetId,
                            });
                            setShowEditOrder(true);
                          }}
                        >
                          Edit
                        </Icon>
                        <Icon
                          name="minus-circle"
                          title="Cancel Order"
                          style={{ cursor: 'pointer', color: 'red' }}
                          size={btnSize}
                          onClick={() => {
                            setShowModalConfirmRemoveOrder(true);
                            setRemoveOrderData({ account, orderID, targetId });
                          }}
                        >
                          Remove
                        </Icon>
                        <Icon
                          name="times"
                          size={btnSize}
                          title="Unhold"
                          style={{ cursor: 'pointer', color: 'orange' }}
                          onClick={() => {
                            setUnholdType('1');
                            unholdOne(orderID, account, targetId);
                          }}
                        >
                          Unhold
                        </Icon>
                      </span>
                    )}
                  </td>
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
    return (
      <ConfirmModal
        isOpen={showModal}
        title={
          'Unhold ' +
          (unholdType === 'all'
            ? 'all orders?'
            : 'order: ' + unholdData.orderID + '?')
        }
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
          setPassword('');
          setShowModal(false);
        }}
      />
    );
  };

  const [removeOrderData, setRemoveOrderData] = useState<ObjectKeys>({});
  const [showModalConfirmRemoveOrder, setShowModalConfirmRemoveOrder] =
    useState<boolean>(false);
  const renderConfirmRemoveOrderModal = () => {
    const doRemove = async () => {
      try {
        let res: any = await removeOrderAPI(
          removeOrderData.account as string,
          removeOrderData.orderID as string,
          removeOrderData.targetId as string
        );
        updateItem(removeOrderData.orderID, 'status', res.status);
        toast.success('Canceled order:' + removeOrderData.orderID);
      } catch (error) {
        toast.error(error);
      }
    };
    return (
      <ConfirmModal
        isOpen={showModalConfirmRemoveOrder}
        title={'Cancel order: ' + removeOrderData.orderID + '?'}
        confirmText="OK"
        body=""
        onDismiss={() => {
          setShowModalConfirmRemoveOrder(false);
        }}
        onConfirm={async () => {
          await doRemove();
          setShowModalConfirmRemoveOrder(false);
          waitFunction();
        }}
      />
    );
  };

  const updateItem = (id: any, whichvalue: string, newvalue: any) => {
    var index = order.findIndex((x: any) => x.orderID === id);
    let g: ObjectKeys = order[index];
    g[whichvalue] = newvalue;
    if (index === -1) {
      // handle error
    } else {
      if (newvalue = 'DoneForDay') {
        g['remainingQuantity'] = 0;
      }

      setOrder([...order.slice(0, index), g, ...order.slice(index + 1)]);
    }
  };

  const renderEdit = () => {
    return (
      <ConfirmModal
        isOpen={showEditOrder}
        title={'Replace order: ' + editOrderData.orderID}
        confirmText={'Place'}
        key="edit-modal-orderbook"
        body={
          <React.Fragment>
            <InlineField label="AccountNo" labelWidth={20} disabled>
              <Input width={30} css={''} value={editOrderData.account} />
            </InlineField>
            <InlineField label="symbol" labelWidth={20} disabled>
              <Input width={30} css={''} value={editOrderData.symbol} />
            </InlineField>
            <InlineField label="OrderID" labelWidth={20} disabled>
              <Input width={30} css={''} value={editOrderData.orderID} />
            </InlineField>
            <InlineField label="New quantity" labelWidth={20}>
              <Input
                type="number"
                width={30}
                css={''}
                value={editOrderData.quantity}
                onChange={(e) => {
                  let newData: any = { ...editOrderData };
                  newData.quantity = e.currentTarget.value;
                  setEditOrderData(newData);
                }}
              />
            </InlineField>
            <InlineField label="New Price" labelWidth={20}>
              <Input
                type="number"
                width={30}
                css={''}
                value={editOrderData.price}
                onChange={(e) => {
                  let newData: any = { ...editOrderData };
                  newData.price = e.currentTarget.value;
                  setEditOrderData(newData);
                }}
              />
            </InlineField>
          </React.Fragment>
        }
        onDismiss={() => {
          setShowEditOrder(false);
        }}
        onConfirm={async () => {
          try {
            let symbolInfor: ObjectKeys = {};
            try {
              let res = await symbolInfoAPI(editOrderData.symbol);
              symbolInfor = res.data;
            } catch (error) { }
            if (editOrderData.quantity === 0) {
              toast.error('Quantity must be greater than 0');
              return;
            }
            if (symbolInfor !== null) {
              if (
                editOrderData.price < symbolInfor.floorPrice ||
                editOrderData.price > symbolInfor.cellingPrice
              ) {
                toast.error(
                  'Price invalid. Price must be within (' +
                  symbolInfor.floorPrice +
                  ' - ' +
                  symbolInfor.cellingPrice +
                  ')'
                );
                return;
              } else {
                try {
                  await editOrderAPI(editOrderData);
                  toast.success('Replace order: ' + editOrderData.orderID);
                  updateItem(
                    editOrderData.orderID,
                    'quantity',
                    editOrderData.quantity
                  );
                  updateItem(
                    editOrderData.orderID,
                    'price',
                    editOrderData.price
                  );
                  setShowEditOrder(false);
                  waitFunction();
                } catch (error) {
                  toast.error(error);
                }
              }
            }
          } catch (error) { }
        }}
      />
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
      let res: any = await searchOrderAPI(searchData, page);
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
    setUnholdType('all');
    setShowModal(true);
  };

  //Handle button unhold on each row trigger
  const unholdOne = async (orderID: string, account: string, targetId: string) => {
    setUnholdType('1');
    setUnholdData({ orderID, account, targetId });
    setShowModal(true);
  };

  //Call api checkAuth + unhold by type
  const doUnhold = async () => {
    if (password === '') {
      toast.error('Password can not be empty');
      return;
    }
    let auth = await checkAuthAPI(password);
    if (auth) {
      if (unholdType === 'all') {
        try {
          await unholdAllOrderAPI();
          toast.success('Unhold all orders');
        } catch (error) {
          toast.error(error);
        }
      } else {
        try {
          let res: any = await unholdOrderAPI(
            unholdData.orderID,
            unholdData.account,
            unholdData.targetId
          );
          toast.success('Unhold order: ' + unholdData.orderID);
          updateItem(unholdData.orderID, 'status', res.status);
          //updateItem(unholdData.orderID, 'remainingQuantity', '0');
        } catch (error) {
          toast.error(error);
        }
      }
      waitFunction();
    } else {
      toast.error('Wrong password. Do not unhold at all!');
    }
  };

  const childFunc = React.useRef(null)

  return (
    <VerticalGroup justify="flex-start" align="center">
      <SearchForm
        childFunc={childFunc}
        handleFunction={search}
        handleFunction2={fetchData}
        handleUnholdAll={unholdAll}
        order={order}
      />
      {renderTableData()}
      {Constant.getInstance().canEdit && <OrderForm waitFunction={waitFunction} />}
      {renderModal()}
      {renderConfirmRemoveOrderModal()}
    </VerticalGroup>
  );
};
