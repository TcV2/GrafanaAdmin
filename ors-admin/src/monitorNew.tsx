// @ts-nocheck
import { SelectableValue } from '@grafana/data';
import {
  Button,
  InlineField,
  InlineFieldRow,
  VerticalGroup,
  Modal,
  HorizontalGroup,
  Tooltip,
  ConfirmModal,
  Select
} from '@grafana/ui';
import { Constant } from 'api/Consant';
import { getExStatusAPI, updateExStatusAPI } from 'api/main';
import { getStatus, placeCheckOrders } from 'api/monitorAPI';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { OrderBookPanelOptions } from 'types';

interface Props extends OrderBookPanelOptions { }

interface ObjectKeys {
  [key: string]: string | number;
}

let intervalFetch: any;

export const MonitorNewPanel: React.FC<Props> = ({ width, height }) => {
  useEffect(() => {
    fetchStatus();
    // fetchStatusEx();
    intervalFetch = setInterval(async () => {
      await fetchStatus();
      // await fetchStatusEx();
    }, 30000);
    return function cleanup() {
      clearInterval(intervalFetch);
    };
  }, []);

  const fetchStatusEx = async () => {
    let res: any = await getExStatusAPI('HNX');
    setStatusHNX(res.sessionEx);
    res = await getExStatusAPI('HSX');
    setStatusHSX(res.sessionEx);
    res = await getExStatusAPI('UPCOM');
    setStatusUPCOM(res.sessionEx);
  };
  const [statusHNX, setStatusHNX] = useState<string>('');
  const [statusHSX, setStatusHSX] = useState<string>('');
  const [statusUPCOM, setStatusUPCOM] = useState<string>('');
  const [editStatus, setEditStatus] = useState<ObjectKeys>({
    exchange: 'HSX',
    status: '',
  });

  const fetchStatus = async () => {
    let res: any = await getStatus();
    let general = true;
    if (res.E1.Fix.length === 0) {
      res.E1.FixGeneral = false;
      res.E1.activeFix = 0
    } else {
      res.E1.Fix.forEach(element => {
        general = general && (element.State === 'true');
      });
      res.E1.FixGeneral = general
      let active = res.E1.Fix.filter((element: any) => {
        if (element.State === 'false') return false;
        return true;
      }).length
      res.E1.activeFix = active;
    }


    general = true;
    if (res.E2.Fix.length === 0) {
      res.E2.FixGeneral = false;
      res.E2.activeFix = 0
    } else {
      res.E2.Fix.forEach(element => {
        general = general && (element.State === 'true');
      });
      res.E2.FixGeneral = general
      let active = res.E2.Fix.filter((element: any) => {
        if (element.State === 'false') return false;
        return true;
      }).length
      res.E2.activeFix = active;
    }

    // general = true;
    // if (res.E3.Fix.length === 0) {
    //   res.E3.FixGeneral = false;
    //   res.E3.activeFix = 0
    // } else {
    //   res.E3.Fix.forEach(element => {
    //     general = general && (element.State === 'true');
    //   });
    //   res.E3.FixGeneral = general
    //   let active = res.E3.Fix.filter((element: any) => {
    //     if (element.State === 'false') return false;
    //     return true;
    //   }).length
    //   res.E3.activeFix = active;
    // }
    //
    // general = true;
    // if (res.E4.Fix.length === 0) {
    //   res.E4.FixGeneral = false;
    //   res.E4.activeFix = 0
    // } else {
    //   res.E4.Fix.forEach(element => {
    //     general = general && (element.State === 'true');
    //   });
    //   res.E4.FixGeneral = general
    //   let active = res.E4.Fix.filter((element: any) => {
    //     if (element.State === 'false') return false;
    //     return true;
    //   }).length
    //   res.E4.activeFix = active;
    // }

    general = true;
    // if (res.I1.Fix.length == 0) {
    //   res.I1.FixGeneral = false
    //   res.I1.activeFix = 0
    // } else {
    //   res.I1.Fix.forEach(element => {
    //     general = general && (element.State == 'Started');
    //   });
    //   res.I1.FixGeneral = general
    //   let active = res.I1.Fix.filter((element: any) => {
    //     if (element.State !== 'Started') return false;
    //     return true;
    //   }).length
    //   res.I1.activeFix = active
    // }
    if (res.I1.Fix.length === 0) {
      res.I1.FixGeneral = false;
      res.I1.activeFix = 0
    } else {
      res.I1.Fix.forEach(element => {
        general = general && (element.State === 'true');
      });
      res.I1.FixGeneral = general
      let active = res.I1.Fix.filter((element: any) => {
        if (element.State === 'false') return false;
        return true;
      }).length
      res.I1.activeFix = active;
    }

    general = true;
    // if (res.I2.Fix.length == 0) {
    //   res.I2.FixGeneral = false
    //   res.I2.activeFix = 0
    // } else {
    //   res.I2.Fix.forEach(element => {
    //     general = general && (element.State == 'Started');
    //   });
    //   res.I2.FixGeneral = general
    //   let active = res.I2.Fix.filter((element: any) => {
    //     if (element.State !== 'Started') return false;
    //     return true;
    //   }).length
    //   res.I2.activeFix = active
    // }
    if (res.I2.Fix.length === 0) {
      res.I2.FixGeneral = false;
      res.I2.activeFix = 0
    } else {
      res.I2.Fix.forEach(element => {
        general = general && (element.State === 'true');
      });
      res.I2.FixGeneral = general
      let active = res.I2.Fix.filter((element: any) => {
        if (element.State === 'false') return false;
        return true;
      }).length
      res.I2.activeFix = active;
    }

    general = true;
    let active = 0;
    Object.keys(res.DB).map((key: any) => {
      if (res.DB[key] === 'false') {
        general = false;
      } else {
        active++;
      }
    })
    res.activeDB = active;
    res.DBGeneral = general;
    setState(res)
  };

  const [state, setState] = useState<any>({});
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openModalDB, setOpenModalDB] = useState<boolean>(false);
  const [openModalDBOMS, setOpenModalDBOMS] = useState<boolean>(false);

  const renderModal = () => {
    if (state.E1)
      return (
        <Modal title="Detail Fix Connection" isOpen={openModal} onClickBackdrop={() => setOpenModal(false)} onDismiss={() => setOpenModal(false)}>
          <VerticalGroup style={{ overflow: 'auto', backgroundColor: 'rgb(9, 10, 13, 0.5)', padding: '5px', width: '1500px !important' }}
            justify="flex-start"
            align="center">
            <InlineFieldRow>
              <InlineField style={{ backgroundColor: 'rgb(9, 10, 13, 0.5)', width: '300px' }}>
                <div>
                  <h3 style={{ textAlign: 'center' }}>E1</h3>
                  <div style={{ width: '100%', fontSize: '12px' }}>
                    {state.E1.Fix.map((o: any) => {
                      const { SessionID } = o;
                      return (
                        <InlineFieldRow style={{ padding: '2px', margin: '2px' }}>
                          <div style={{ width: '10px', backgroundColor: o.State === 'true' ? 'green' : 'darkred', marginRight: '5px' }}></div>
                          <span>{SessionID}</span>
                        </InlineFieldRow>
                      );
                    })}
                  </div>
                </div>
              </InlineField>
              <InlineField style={{ backgroundColor: 'rgb(9, 10, 13, 0.5)', width: '300px' }}>
                <div>
                  <h3 style={{ textAlign: 'center' }}>E2</h3>
                  <div style={{ width: '100%', fontSize: '12px' }}>
                    {state.E2.Fix.map((o: any) => {
                      const { SessionID } = o;
                      return (
                        <InlineFieldRow style={{ padding: '2px', margin: '2px' }}>
                          <div style={{ width: '10px', backgroundColor: o.State === 'true' ? 'green' : 'darkred', marginRight: '5px' }}></div>
                          <span>{SessionID}</span>
                        </InlineFieldRow>
                      );
                    })}
                  </div>
                </div>
              </InlineField>
              {/*<InlineField style={{ backgroundColor: 'rgb(9, 10, 13, 0.5)', width: '300px' }}>*/}
              {/*  <div>*/}
              {/*    <h3 style={{ textAlign: 'center' }}>E3</h3>*/}
              {/*    <div style={{ width: '100%', fontSize: '12px' }}>*/}
              {/*      {state.E3.Fix.map((o: any) => {*/}
              {/*        const { SessionID } = o;*/}
              {/*        return (*/}
              {/*          <InlineFieldRow style={{ padding: '2px', margin: '2px' }}>*/}
              {/*            <div style={{ width: '10px', backgroundColor: o.State === 'true' ? 'green' : 'darkred', marginRight: '5px' }}></div>*/}
              {/*            <span>{SessionID}</span>*/}
              {/*          </InlineFieldRow>*/}
              {/*        );*/}
              {/*      })}*/}
              {/*    </div>*/}
              {/*  </div>*/}
              {/*</InlineField>*/}
              {/*<InlineField style={{ backgroundColor: 'rgb(9, 10, 13, 0.5)', width: '300px' }}>*/}
              {/*  <div>*/}
              {/*    <h3 style={{ textAlign: 'center' }}>E4</h3>*/}
              {/*    <div style={{ width: '100%', fontSize: '12px' }}>*/}
              {/*      {state.E4.Fix.map((o: any) => {*/}
              {/*        const { SessionID } = o;*/}
              {/*        return (*/}
              {/*          <InlineFieldRow style={{ padding: '2px', margin: '2px' }}>*/}
              {/*            <div style={{ width: '10px', backgroundColor: o.State === 'true' ? 'green' : 'darkred', marginRight: '5px' }}></div>*/}
              {/*            <span>{SessionID}</span>*/}
              {/*          </InlineFieldRow>*/}
              {/*        );*/}
              {/*      })}*/}
              {/*    </div>*/}
              {/*  </div>*/}
              {/*</InlineField>*/}
            </InlineFieldRow>
            <InlineFieldRow>
              <InlineField style={{ backgroundColor: 'rgb(9, 10, 13, 0.5)', width: '300px' }}>
                <div style={{ width: '100%' }}>
                  <h3 style={{ textAlign: 'center' }}>I1</h3>
                  <div style={{ width: '100%', fontSize: '12px' }}>
                    {/*{state.I1.Fix.map((o: any) => {*/}
                    {/*  const { RouteId } = o;*/}
                    {/*  return (*/}
                    {/*    <InlineFieldRow style={{ padding: '2px', margin: '2px' }}>*/}
                    {/*      <div style={{ width: '10px', backgroundColor: o.State === 'Started' ? 'green' : 'darkred', marginRight: '5px' }}></div>*/}
                    {/*      <span>{RouteId}</span>*/}
                    {/*    </InlineFieldRow>*/}
                    {/*  );*/}
                    {/*})}*/}
                    {state.I1.Fix.map((o: any) => {
                      const { SessionID } = o;
                      return (
                        <InlineFieldRow style={{ padding: '2px', margin: '2px' }}>
                          <div style={{ width: '10px', backgroundColor: o.State === 'true' ? 'green' : 'darkred', marginRight: '5px' }}></div>
                          <span>{SessionID}</span>
                        </InlineFieldRow>
                      );
                    })}
                  </div>
                </div>
              </InlineField>
              <InlineField style={{ backgroundColor: 'rgb(9, 10, 13, 0.5)', width: '300px' }}>
                <div>
                  <h3 style={{ textAlign: 'center' }}>I2</h3>
                  <div style={{ width: '100%', fontSize: '12px' }}>
                    {/*{state.I2.Fix.map((o: any) => {*/}
                    {/*  const { RouteId } = o;*/}
                    {/*  return (*/}
                    {/*    <InlineFieldRow style={{ padding: '2px', margin: '2px' }}>*/}
                    {/*      <div style={{ width: '10px', backgroundColor: o.State === 'Started' ? 'green' : 'darkred', marginRight: '5px' }}></div>*/}
                    {/*      <span>{RouteId}</span>*/}
                    {/*    </InlineFieldRow>*/}
                    {/*  );*/}
                    {/*})}*/}
                    {state.I2.Fix.map((o: any) => {
                      const { SessionID } = o;
                      return (
                        <InlineFieldRow style={{ padding: '2px', margin: '2px' }}>
                          <div style={{ width: '10px', backgroundColor: o.State === 'true' ? 'green' : 'darkred', marginRight: '5px' }}></div>
                          <span>{SessionID}</span>
                        </InlineFieldRow>
                      );
                    })}
                  </div>
                </div>
              </InlineField>
            </InlineFieldRow>
          </VerticalGroup>
        </Modal>
      )
  }

  const renderModalDB = () => {
    if (state.E1)
      return (
        <Modal title="Detail DB Pool" isOpen={openModalDB} onClickBackdrop={() => setOpenModalDB(false)} onDismiss={() => setOpenModalDB(false)}>
          <VerticalGroup style={{ overflow: 'auto', backgroundColor: 'rgb(9, 10, 13, 0.5)', padding: '5px', width: '1500px !important' }}
            justify="flex-start"
            align="center">
            <InlineFieldRow>
              <InlineField style={{ backgroundColor: 'rgb(9, 10, 13, 0.5)', width: '300px' }}>
                <div style={{ width: '100%' }}>
                  <h3 style={{ textAlign: 'center' }}>E1</h3>
                  <table id="fsstable" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Avl</th>
                        <th>Min</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.E1.DbPool.map((o: any) => {
                        return (
                          <tr>
                            <td>{o.PoolId.split(/-(.*)/)[1].split(/-(.*)/)[1]}</td>
                            <td>{o.AvailableConnectionsCount}</td>
                            <td>{o.MinPoolSize}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </InlineField>
              <InlineField style={{ backgroundColor: 'rgb(9, 10, 13, 0.5)', width: '300px' }}>
                <div style={{ width: '100%' }}>
                  <h3 style={{ textAlign: 'center' }}>E2</h3>
                  <table id="fsstable" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Avl</th>
                        <th>Min</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.E2.DbPool.map((o: any) => {
                        return (
                          <tr>
                            <td>{o.PoolId.split(/-(.*)/)[1].split(/-(.*)/)[1]}</td>
                            <td>{o.AvailableConnectionsCount}</td>
                            <td>{o.MinPoolSize}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </InlineField>
              {/*<InlineField style={{ backgroundColor: 'rgb(9, 10, 13, 0.5)', width: '300px' }}>*/}
              {/*  <div style={{ width: '100%' }}>*/}
              {/*    <h3 style={{ textAlign: 'center' }}>E3</h3>*/}
              {/*    <table id="fsstable" style={{ width: '100%' }}>*/}
              {/*      <thead>*/}
              {/*        <tr>*/}
              {/*          <th>Name</th>*/}
              {/*          <th>Avl</th>*/}
              {/*          <th>Min</th>*/}
              {/*        </tr>*/}
              {/*      </thead>*/}
              {/*      <tbody>*/}
              {/*        {state.E3.DbPool.map((o: any) => {*/}
              {/*          return (*/}
              {/*            <tr>*/}
              {/*              <td>{o.PoolId.split(/-(.*)/)[1].split(/-(.*)/)[1]}</td>*/}
              {/*              <td>{o.AvailableConnectionsCount}</td>*/}
              {/*              <td>{o.MinPoolSize}</td>*/}
              {/*            </tr>*/}
              {/*          );*/}
              {/*        })}*/}
              {/*      </tbody>*/}
              {/*    </table>*/}
              {/*  </div>*/}
              {/*</InlineField>*/}
              {/*<InlineField style={{ backgroundColor: 'rgb(9, 10, 13, 0.5)', width: '300px' }}>*/}
              {/*  <div style={{ width: '100%' }}>*/}
              {/*    <h3 style={{ textAlign: 'center' }}>E4</h3>*/}
              {/*    <table id="fsstable" style={{ width: '100%' }}>*/}
              {/*      <thead>*/}
              {/*      <tr>*/}
              {/*        <th>Name</th>*/}
              {/*        <th>Avl</th>*/}
              {/*        <th>Min</th>*/}
              {/*      </tr>*/}
              {/*      </thead>*/}
              {/*      <tbody>*/}
              {/*      {state.E4.DbPool.map((o: any) => {*/}
              {/*        return (*/}
              {/*          <tr>*/}
              {/*            <td>{o.PoolId.split(/-(.*)/)[1].split(/-(.*)/)[1]}</td>*/}
              {/*            <td>{o.AvailableConnectionsCount}</td>*/}
              {/*            <td>{o.MinPoolSize}</td>*/}
              {/*          </tr>*/}
              {/*        );*/}
              {/*      })}*/}
              {/*      </tbody>*/}
              {/*    </table>*/}
              {/*  </div>*/}
              {/*</InlineField>*/}
            </InlineFieldRow>
            <InlineFieldRow>
              <InlineField style={{ backgroundColor: 'rgb(9, 10, 13, 0.5)', width: '300px' }}>
                <div style={{ width: '100%' }}>
                  <h3 style={{ textAlign: 'center' }}>I1</h3>
                  <table id="fsstable" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Avl</th>
                        <th>Min</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.I1.DbPool.map((o: any) => {
                        return (
                          <tr>
                            <td>{o.PoolId.split(/-(.*)/)[1].split(/-(.*)/)[1]}</td>
                            <td>{o.AvailableConnectionsCount}</td>
                            <td>{o.MinPoolSize}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </InlineField>
              <InlineField style={{ backgroundColor: 'rgb(9, 10, 13, 0.5)', width: '300px' }}>
                <div style={{ width: '100%' }}>
                  <h3 style={{ textAlign: 'center' }}>I2</h3>
                  <table id="fsstable" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Avl</th>
                        <th>Min</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.I2.DbPool.map((o: any) => {
                        return (
                          <tr>
                            <td>{o.PoolId.split(/-(.*)/)[1].split(/-(.*)/)[1]}</td>
                            <td>{o.AvailableConnectionsCount}</td>
                            <td>{o.MinPoolSize}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </InlineField>
            </InlineFieldRow>
          </VerticalGroup>
        </Modal>
      )
  }

  const renderModalDBOMS = () => {
    if (state.E1)
      return (
        <Modal title="Detail DB Pool" isOpen={openModalDBOMS} onClickBackdrop={() => setOpenModalDBOMS(false)} onDismiss={() => setOpenModalDBOMS(false)}>
          <VerticalGroup style={{ overflow: 'auto', backgroundColor: 'rgb(9, 10, 13, 0.5)', padding: '5px', width: '1500px !important' }}
            justify="flex-start"
            align="center">
            <InlineFieldRow>
              <InlineField style={{ backgroundColor: 'rgb(9, 10, 13, 0.5)', width: '300px' }}>
                <div style={{ width: '100%' }}>
                  <h3 style={{ textAlign: 'center' }}>OMSService1</h3>
                  <table id="fsstable" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Avl</th>
                        <th>Min</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.OMSService1.DbPool.map((o: any) => {
                        return (
                          <tr>
                            <td>{o.PoolId.split(/-(.*)/)[1].split(/-(.*)/)[1]}</td>
                            <td>{o.AvailableConnectionsCount}</td>
                            <td>{o.MinPoolSize}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </InlineField>
              <InlineField style={{ backgroundColor: 'rgb(9, 10, 13, 0.5)', width: '300px' }}>
                <div style={{ width: '100%' }}>
                  <h3 style={{ textAlign: 'center' }}>OMSService2</h3>
                  <table id="fsstable" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Avl</th>
                        <th>Min</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.OMSService2.DbPool.map((o: any) => {
                        return (
                          <tr>
                            <td>{o.PoolId.split(/-(.*)/)[1].split(/-(.*)/)[1]}</td>
                            <td>{o.AvailableConnectionsCount}</td>
                            <td>{o.MinPoolSize}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </InlineField>
              {/*<InlineField style={{ backgroundColor: 'rgb(9, 10, 13, 0.5)', width: '300px' }}>*/}
              {/*  <div style={{ width: '100%' }}>*/}
              {/*    <h3 style={{ textAlign: 'center' }}>OMSService3</h3>*/}
              {/*    <table id="fsstable" style={{ width: '100%' }}>*/}
              {/*      <thead>*/}
              {/*      <tr>*/}
              {/*        <th>Name</th>*/}
              {/*        <th>Avl</th>*/}
              {/*        <th>Min</th>*/}
              {/*      </tr>*/}
              {/*      </thead>*/}
              {/*      <tbody>*/}
              {/*      {state.OMSService3.DbPool.map((o: any) => {*/}
              {/*        return (*/}
              {/*          <tr>*/}
              {/*            <td>{o.PoolId.split(/-(.*)/)[1].split(/-(.*)/)[1]}</td>*/}
              {/*            <td>{o.AvailableConnectionsCount}</td>*/}
              {/*            <td>{o.MinPoolSize}</td>*/}
              {/*          </tr>*/}
              {/*        );*/}
              {/*      })}*/}
              {/*      </tbody>*/}
              {/*    </table>*/}
              {/*  </div>*/}
              {/*</InlineField>*/}
              {/*<InlineField style={{ backgroundColor: 'rgb(9, 10, 13, 0.5)', width: '300px' }}>*/}
              {/*  <div style={{ width: '100%' }}>*/}
              {/*    <h3 style={{ textAlign: 'center' }}>OMSService4</h3>*/}
              {/*    <table id="fsstable" style={{ width: '100%' }}>*/}
              {/*      <thead>*/}
              {/*      <tr>*/}
              {/*        <th>Name</th>*/}
              {/*        <th>Avl</th>*/}
              {/*        <th>Min</th>*/}
              {/*      </tr>*/}
              {/*      </thead>*/}
              {/*      <tbody>*/}
              {/*      {state.OMSService4.DbPool.map((o: any) => {*/}
              {/*        return (*/}
              {/*          <tr>*/}
              {/*            <td>{o.PoolId.split(/-(.*)/)[1].split(/-(.*)/)[1]}</td>*/}
              {/*            <td>{o.AvailableConnectionsCount}</td>*/}
              {/*            <td>{o.MinPoolSize}</td>*/}
              {/*          </tr>*/}
              {/*        );*/}
              {/*      })}*/}
              {/*      </tbody>*/}
              {/*    </table>*/}
              {/*  </div>*/}
              {/*</InlineField>*/}
            </InlineFieldRow>
          </VerticalGroup>
        </Modal>
      )
  }

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
                ]}
              />
            </InlineField>
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
                    description: 'Phiên đẩy lệnh lên gateway ',
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
                      'Phiên riêng của VND đồng bộ đầu ngày, không nhận lệnh',
                  },
                ]}
              />
            </InlineField>
          </div>
        }
      />
    );
  };

  return (
    <VerticalGroup
      justify="flex-start"
      align="flex-start"
      style={{ width, height, overflow: 'auto' }}
    >
      {state.OMSService1 &&
        (<InlineFieldRow>
          <InlineField>
            <Button style={{ textAlign: 'center', width: '180px', backgroundColor: '#22252B', cursor: 'default' }}>OMS Service</Button>
          </InlineField>
          <InlineField>
            <Button style={{ textAlign: 'center', width: '100px', backgroundColor: state.OMSService1.State === 'Started' ? 'darkgreen' : 'darkred', cursor: 'default' }}>OMS1</Button>
          </InlineField>
          <InlineField>
            <Button style={{ textAlign: 'center', width: '100px', backgroundColor: state.OMSService2.State === 'Started' ? 'darkgreen' : 'darkred', cursor: 'default' }}>OMS2</Button>
          </InlineField>
          {/*<InlineField>*/}
          {/*  <Button style={{ textAlign: 'center', width: '100px', backgroundColor: state.OMSService3.State === 'Started' ? 'darkgreen' : 'darkred', cursor: 'default' }}>OMS3</Button>*/}
          {/*</InlineField>*/}
          {/*<InlineField>*/}
          {/*  <Button style={{ textAlign: 'center', width: '100px', backgroundColor: state.OMSService4.State === 'Started' ? 'darkgreen' : 'darkred', cursor: 'default' }}>OMS4</Button>*/}
          {/*</InlineField>*/}
        </InlineFieldRow>)}

      {state.E1 &&
        (<InlineFieldRow>
          <InlineField>
            <Button style={{ textAlign: 'center', width: '180px', backgroundColor: '#22252B', cursor: 'default' }}>OMS Connector</Button>
          </InlineField>
          <InlineField>
            <Button style={{ textAlign: 'center', width: '100px', backgroundColor: state.E1.State === 'Started' ? 'darkgreen' : 'darkred', cursor: 'default' }}>E1</Button>
          </InlineField>
          <InlineField>
            <Button style={{ textAlign: 'center', width: '100px', backgroundColor: state.E2.State === 'Started' ? 'darkgreen' : 'darkred', cursor: 'default' }}>E2</Button>
          </InlineField>
          {/*<InlineField>*/}
          {/*  <Button style={{ textAlign: 'center', width: '100px', backgroundColor: state.E3.State === 'Started' ? 'darkgreen' : 'darkred', cursor: 'default' }}>E3</Button>*/}
          {/*</InlineField>*/}
          {/*<InlineField>*/}
          {/*  <Button style={{ textAlign: 'center', width: '100px', backgroundColor: state.E4.State === 'Started' ? 'darkgreen' : 'darkred', cursor: 'default' }}>E4</Button>*/}
          {/*</InlineField>*/}
          <InlineField>
            <Button style={{ textAlign: 'center', width: '100px', backgroundColor: state.I1.State === 'Started' ? 'darkgreen' : 'darkred', cursor: 'default' }}>I1</Button>
          </InlineField>
          <InlineField>
            <Button style={{ textAlign: 'center', width: '100px', backgroundColor: state.I2.State === 'Started' ? 'darkgreen' : 'darkred', cursor: 'default' }}>I2</Button>
          </InlineField>
        </InlineFieldRow>)}

      {state.E1 &&
        (<InlineFieldRow style={{ width }}>
          <InlineField>
            <Button style={{ textAlign: 'center', width: '180px', backgroundColor: '#22252B', cursor: 'default' }}>Fix Connection</Button>
          </InlineField>
          <InlineField>
            <Button style={{ textAlign: 'center', width: '100px', backgroundColor: state.E1.FixGeneral === true ? 'darkgreen' : 'darkred', cursor: 'default' }}>E1{' (' + state.E1.activeFix + '/' + state.E1.Fix.length + ')'}</Button>
          </InlineField>
          <InlineField>
            <Button style={{ textAlign: 'center', width: '100px', backgroundColor: state.E2.FixGeneral === true ? 'darkgreen' : 'darkred', cursor: 'default' }}>E2{' (' + state.E2.activeFix + '/' + state.E2.Fix.length + ')'}</Button>
          </InlineField>
          {/*<InlineField>*/}
          {/*  <Button style={{ textAlign: 'center', width: '100px', backgroundColor: state.E3.FixGeneral === true ? 'darkgreen' : 'darkred', cursor: 'default' }}>E3{' (' + state.E3.activeFix + '/' + state.E3.Fix.length + ')'}</Button>*/}
          {/*</InlineField>*/}
          {/*<InlineField>*/}
          {/*  <Button style={{ textAlign: 'center', width: '100px', backgroundColor: state.E4.FixGeneral === true ? 'darkgreen' : 'darkred', cursor: 'default' }}>E4{' (' + state.E4.activeFix + '/' + state.E4.Fix.length + ')'}</Button>*/}
          {/*</InlineField>*/}
          <InlineField>
            <Button style={{ textAlign: 'center', width: '100px', backgroundColor: state.I1.FixGeneral === true ? 'darkgreen' : 'darkred', cursor: 'default' }}>I1{' (' + state.I1.activeFix + '/' + state.I1.Fix.length + ')'}</Button>
          </InlineField>
          <InlineField>
            <Button style={{ textAlign: 'center', width: '100px', backgroundColor: state.I2.FixGeneral === true ? 'darkgreen' : 'darkred', cursor: 'default' }}>I2{' (' + state.I2.activeFix + '/' + state.I2.Fix.length + ')'}</Button>
          </InlineField>
          <InlineField grow={true} style={{ display: 'block', textAlign: 'right' }}>
            <Button style={{ width: '80px' }} onClick={() => setOpenModal(true)}>Detail</Button>
          </InlineField>
        </InlineFieldRow>)}

      {state.E1 &&
        (<InlineFieldRow style={{ width }}>
          <InlineField>
            <Button style={{ textAlign: 'center', width: '180px', backgroundColor: '#22252B', cursor: 'default' }}>DbPool</Button>
          </InlineField>
          <InlineField>
            <Button style={{ textAlign: 'center', width: '100px', backgroundColor: state.E1.DbPool.length > 0 ? 'darkgreen' : 'darkred', cursor: 'default' }}>E1{' (' + state.E1.DbPool.length + ')'}</Button>
          </InlineField>
          <InlineField>
            <Button style={{ textAlign: 'center', width: '100px', backgroundColor: state.E2.DbPool.length > 0 ? 'darkgreen' : 'darkred', cursor: 'default' }}>E2{' (' + state.E2.DbPool.length + ')'}</Button>
          </InlineField>
          {/*<InlineField>*/}
          {/*  <Button style={{ textAlign: 'center', width: '100px', backgroundColor: state.E3.DbPool.length > 0 ? 'darkgreen' : 'darkred', cursor: 'default' }}>E3{' (' + state.E3.DbPool.length + ')'}</Button>*/}
          {/*</InlineField>*/}
          {/*<InlineField>*/}
          {/*  <Button style={{ textAlign: 'center', width: '100px', backgroundColor: state.E4.DbPool.length > 0 ? 'darkgreen' : 'darkred', cursor: 'default' }}>E4{' (' + state.E4.DbPool.length + ')'}</Button>*/}
          {/*</InlineField>*/}
          <InlineField>
            <Button style={{ textAlign: 'center', width: '100px', backgroundColor: state.I1.DbPool.length > 0 ? 'darkgreen' : 'darkred', cursor: 'default' }}>I1{' (' + state.I1.DbPool.length + ')'}</Button>
          </InlineField>
          <InlineField>
            <Button style={{ textAlign: 'center', width: '100px', backgroundColor: state.I2.DbPool.length > 0 ? 'darkgreen' : 'darkred', cursor: 'default' }}>I2{' (' + state.I2.DbPool.length + ')'}</Button>
          </InlineField>
          <InlineField grow={true} style={{ display: 'block', textAlign: 'right' }}>
            <Button style={{ width: '80px' }} onClick={() => setOpenModalDB(true)}>Detail</Button>
          </InlineField>
        </InlineFieldRow>)}

      {state.E1 &&
        (<InlineFieldRow style={{ width }}>
          <InlineField>
            <Button style={{ textAlign: 'center', width: '180px', backgroundColor: '#22252B', cursor: 'default' }}>DbPool OMS</Button>
          </InlineField>
          <InlineField>
            <Button style={{ textAlign: 'center', width: '100px', backgroundColor: state.OMSService1.DbPool.length > 0 ? 'darkgreen' : 'darkred', cursor: 'default' }}>OMS1{' (' + state.OMSService1.DbPool.length + ')'}</Button>
          </InlineField>
          <InlineField>
            <Button style={{ textAlign: 'center', width: '103px', backgroundColor: state.OMSService2.DbPool.length > 0 ? 'darkgreen' : 'darkred', cursor: 'default' }}>OMS2{' (' + state.OMSService2.DbPool.length + ')'}</Button>
          </InlineField>
          {/*<InlineField>*/}
          {/*  <Button style={{ textAlign: 'center', width: '100px', backgroundColor: state.OMSService3.DbPool.length > 0 ? 'darkgreen' : 'darkred', cursor: 'default' }}>OMS3{' (' + state.OMSService3.DbPool.length + ')'}</Button>*/}
          {/*</InlineField>*/}
          {/*<InlineField>*/}
          {/*  <Button style={{ textAlign: 'center', width: '103px', backgroundColor: state.OMSService4.DbPool.length > 0 ? 'darkgreen' : 'darkred', cursor: 'default' }}>OMS4{' (' + state.OMSService4.DbPool.length + ')'}</Button>*/}
          {/*</InlineField>*/}
          <InlineField grow={true} style={{ display: 'block', textAlign: 'right' }}>
            <Button style={{ width: '80px' }} onClick={() => setOpenModalDBOMS(true)}>Detail</Button>
          </InlineField>
        </InlineFieldRow>)}

      {state.E1 &&
        (<InlineFieldRow>
          <InlineField>
            <Button style={{ textAlign: 'center', width: '180px', backgroundColor: '#22252B', cursor: 'default' }}>Kafka</Button>
          </InlineField>
          <InlineField>
            <Button style={{ textAlign: 'center', width: '100px', backgroundColor: (state.E1.Kafka.length > 0) && state.E1.Kafka[0].Connection === 1 ? 'darkgreen' : 'darkred', cursor: 'default' }}>E1</Button>
          </InlineField>
          <InlineField>
            <Button style={{ textAlign: 'center', width: '100px', backgroundColor: (state.E2.Kafka.length > 0) && state.E2.Kafka[0].Connection === 1 ? 'darkgreen' : 'darkred', cursor: 'default' }}>E2</Button>
          </InlineField>
          {/*<InlineField>*/}
          {/*  <Button style={{ textAlign: 'center', width: '100px', backgroundColor: (state.E3.Kafka.length > 0) && state.E3.Kafka[0].Connection === 1 ? 'darkgreen' : 'darkred', cursor: 'default' }}>E3</Button>*/}
          {/*</InlineField>*/}
          {/*<InlineField>*/}
          {/*  <Button style={{ textAlign: 'center', width: '100px', backgroundColor: (state.E4.Kafka.length > 0) && state.E4.Kafka[0].Connection === 1 ? 'darkgreen' : 'darkred', cursor: 'default' }}>E4</Button>*/}
          {/*</InlineField>*/}
          <InlineField>
            <Button style={{ textAlign: 'center', width: '100px', backgroundColor: state.ORS.KafkaState !== 'none' ? 'darkgreen' : 'darkred', cursor: 'default' }}>OMS-Sync</Button>
          </InlineField>
          <InlineField>
            <Button style={{ textAlign: 'center', width: '100px', backgroundColor: state.BO.KafkaState !== 'none' ? 'darkgreen' : 'darkred', cursor: 'default' }}>BO-Sync</Button>
          </InlineField>
          {/*<InlineField>*/}
          {/*  <Button style={{ textAlign: 'center', width: '100px', backgroundColor: state.MOMS.kafkaState !== 'none' ? 'darkgreen' : 'darkred', cursor: 'default' }}>M-OMS</Button>*/}
          {/*</InlineField>*/}
        </InlineFieldRow>)}
      {state.E1 &&
        (<InlineFieldRow >
          <InlineField>
            <Button style={{ textAlign: 'center', width: '180px', backgroundColor: '#22252B', cursor: 'default' }}>OMS DB State</Button>
          </InlineField>
          {Object.keys(state.DB).map((key: any) => {
            const v = state.DB[key];
            return (
              <InlineField>
                <Button style={{ padding: 'auto', fontSize: '10px', textAlign: 'center', width: '100px', backgroundColor: v === 'true' ? 'darkgreen' : 'darkred', cursor: 'default' }}>{key}</Button>
              </InlineField>
            );
          })}
        </InlineFieldRow>)}
      {state.E1 &&
        (<InlineFieldRow>
          <InlineField>
            <Button style={{ textAlign: 'center', width: '180px', backgroundColor: '#22252B', cursor: 'default' }}>State</Button>
          </InlineField>
          <InlineField>
            <Button style={{ textAlign: 'center', width: '100px', backgroundColor: state.ORS.State === 'Started' ? 'darkgreen' : 'darkred', cursor: 'default' }}>OMS-Sync</Button>
          </InlineField>
          <InlineField>
            <Button style={{ textAlign: 'center', width: '100px', backgroundColor: state.BO.State === 'Started' ? 'darkgreen' : 'darkred', cursor: 'default' }}>BO-Sync</Button>
          </InlineField>
          <InlineField>
            <Button style={{ paddingLeft: '10px', textAlign: 'center', width: '100px', backgroundColor: state.ORDERCACHE.State === 'Started' ? 'darkgreen' : 'darkred', cursor: 'default' }}>Order Cache</Button>
          </InlineField>
          {/*{Object.keys(state.ENGINE).map((key: any) => {*/}
          {/*  const v = state.ENGINE[key];*/}
          {/*  return (*/}
          {/*    <InlineField>*/}
          {/*      <Button style={{ textAlign: 'center', width: '100px', backgroundColor: v === 'true' ? 'darkgreen' : 'darkred', cursor: 'default' }}>Engine</Button>*/}
          {/*    </InlineField>*/}
          {/*  );*/}
          {/*})}*/}
          {/*{Object.keys(state.ENGINEBANKAPI).map((key: any) => {*/}
          {/*  const v = state.ENGINEBANKAPI[key];*/}
          {/*  return (*/}
          {/*    <InlineField>*/}
          {/*      <Button style={{ paddingLeft: '6px', textAlign: 'center', width: '100px', backgroundColor: v === 'true' ? 'darkgreen' : 'darkred', cursor: 'default' }}>HoldBankAPI</Button>*/}
          {/*    </InlineField>*/}
          {/*  );*/}
          {/*})}*/}
        </InlineFieldRow>)}
      {renderModal()}
      {renderModalDB()}
      {renderModalDBOMS()}
      {renderModalChangeEXStatus()}
    </VerticalGroup>
  );
};
