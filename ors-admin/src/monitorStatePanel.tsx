// @ts-nocheck
import {
  VerticalGroup,
  HorizontalGroup,
  InlineField,
  InlineFieldRow,
} from '@grafana/ui';
import {
  getStatus,
} from 'api/monitorAPI';
import React, { useState, useEffect } from 'react';
import { OrderBookPanelOptions } from 'types';

interface Props extends OrderBookPanelOptions { }

let intervalFetch: any;

export const MonitorStatePanel: React.FC<Props> = ({ width, height }) => {
  useEffect(() => {
    fetchStatus();
    let myLabels = document.querySelectorAll('.lbl-toggle');

    Array.from(myLabels).forEach(label => {
      label.addEventListener('keydown', e => {
        if (e.which === 32 || e.which === 13) {
          e.preventDefault();
          label.click();
        };
      });
    });
    intervalFetch = setInterval(async () => {
      await fetchStatus();
    }, 30000);
    return function cleanup() {
      clearInterval(intervalFetch);
    };
  }, []);

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

    general = true;
    if (res.I1.Fix.length == 0) {
      res.I1.FixGeneral = false
      res.I1.activeFix = 0
    } else {
      res.I1.Fix.forEach(element => {
        general = general && (element.State == 'Started');
      });
      res.I1.FixGeneral = general
      active = res.I1.Fix.filter((element: any) => {
        if (element.State !== 'Started') return false;
        return true;
      }).length
      res.I1.activeFix = active
    }

    general = true;
    if (res.I2.Fix.length == 0) {
      res.I2.FixGeneral = false
      res.I2.activeFix = 0
    } else {
      res.I2.Fix.forEach(element => {
        general = general && (element.State == 'Started');
      });
      res.I2.FixGeneral = general
      active = res.I2.Fix.filter((element: any) => {
        if (element.State !== 'Started') return false;
        return true;
      }).length
      res.I2.activeFix = active
    }

    // general = true;
    // res.I2.Fix.forEach(element => {
    //   general = general && element.State == 'Started';
    // });
    // setFixI2General(general);

    general = true;
    active = 0;
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

  const renderE1State = () => {
    return (
      <InlineFieldRow>
        <InlineField>
          <React.Fragment>
            <div style={{ width: '10px', height: '100%', backgroundColor: state.E1.State === 'Started' ? 'green' : 'darkred', marginRight: '5px' }}></div>
            <span>E1 {state.E1.State === 'Started' ? 'Started' : 'Not started'}</span>
          </React.Fragment>
        </InlineField>
        <InlineField style={{ marginLeft: '10px' }}>
          <React.Fragment>
            <div style={{ width: '10px', height: '100%', backgroundColor: state.E1.Kafka.length > 0 && state.E1.Kafka[0].Connection === 1 ? 'green' : 'darkred', marginRight: '5px' }}></div>
            <span>E1 -{'>'} Kafka</span>
          </React.Fragment>
        </InlineField>
      </InlineFieldRow>
    );
  };

  const renderE1FixConncetionTable = () => {
    return (
      <div className="wrap-collabsible">
        <input id="collapsibleE1" className="toggle" type="checkbox" />
        <label for="collapsibleE1" className="lbl-toggle" style={{ backgroundColor: state.E1.FixGeneral === true ? "green" : "darkred" }}>
          E1 FIX CONNECTION ({state.E1.activeFix + '/' + state.E1.Fix.length})
        </label>
        <div className="collapsible-content">
          <div className="content-inner">
            <div
              id="fss-table-wrapper"
              style={{ overflow: 'auto', width: width - 30, zIndex: 1 }}
            >
              <div style={{ width: '100%' }}>
                {state.E1.Fix.map((o: any) => {
                  const { SessionID } = o;
                  return (
                    <InlineFieldRow style={{ padding: '2px', margin: '5px' }}>
                      <div style={{ width: '10px', backgroundColor: o.State === 'true' ? 'green' : 'darkred', marginRight: '5px' }}></div>
                      <span>{SessionID}</span>
                    </InlineFieldRow>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderE2State = () => {
    return (
      <InlineFieldRow>
        <InlineField>
          <React.Fragment>
            <div style={{ width: '10px', height: '100%', backgroundColor: state.E2.State === 'Started' ? 'green' : 'darkred', marginRight: '5px' }}></div>
            <span>E2 {state.E2.State === 'Started' ? 'Started' : 'Not started'}</span>
          </React.Fragment>
        </InlineField>
        <InlineField style={{ marginLeft: '10px' }}>
          <React.Fragment>
            <div style={{ width: '10px', height: '100%', backgroundColor: state.E2.Kafka.length > 0 && state.E2.Kafka[0].Connection === 1 ? 'green' : 'darkred', marginRight: '5px' }}></div>
            <span>E2 -{'>'} Kafka</span>
          </React.Fragment>
        </InlineField>
      </InlineFieldRow>
    );
  };

  const renderE2FixConncetionTable = () => {
    return (
      <div className="wrap-collabsible">
        <input id="collapsibleE2" className="toggle" type="checkbox" />
        <label for="collapsibleE2" className="lbl-toggle" style={
          state.E2.FixGeneral ? { backgroundColor: 'green' } : { backgroundColor: 'darkred' }
        }>E2 Fix Connection ({state.E2.activeFix + '/' + state.E2.Fix.length})</label>
        <div className="collapsible-content">
          <div className="content-inner">
            <div
              id="fss-table-wrapper"
              style={{ overflow: 'auto', width: width - 30, zIndex: 1 }}
            >
              <div style={{ width: '100%' }}>
                {state.E2.Fix.map((o: any) => {
                  const { SessionID } = o;
                  return (
                    <InlineFieldRow style={{ padding: '2px', margin: '5px' }}>
                      <div style={{ width: '10px', backgroundColor: o.State === 'true' ? 'green' : 'darkred', marginRight: '5px' }}></div>
                      <span>{SessionID}</span>
                    </InlineFieldRow>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderI1State = () => {
    return (
      <InlineFieldRow>
        <InlineField>
          <React.Fragment>
            <div style={{ width: '10px', height: '100%', backgroundColor: state.I1.State === 'Started' ? 'green' : 'darkred', marginRight: '5px' }}></div>
            <span>I1 {state.I1.State === 'Started' ? 'Started' : 'Not started'}</span>
          </React.Fragment>
        </InlineField>
      </InlineFieldRow>
    );
  };

  const renderI1FixConncetionTable = () => {
    return (
      <div className="wrap-collabsible">
        <input id="collapsibleI1" className="toggle" type="checkbox" />
        <label for="collapsibleI1" className="lbl-toggle" style={
          state.I1.FixGeneral ? { backgroundColor: 'green' } : { backgroundColor: 'darkred' }
        }>I1 Fix Connection ({state.I1.activeFix + '/' + state.I1.Fix.length})</label>
        <div className="collapsible-content">
          <div className="content-inner">
            <div
              id="fss-table-wrapper"
              style={{ overflow: 'auto', width: width - 30, zIndex: 1 }}
            >
              <div style={{ width: '100%' }}>
                {state.I1.Fix.map((o: any) => {
                  const { RouteId } = o;
                  return (
                    <InlineFieldRow style={{ padding: '2px', margin: '5px' }}>
                      <div style={{ width: '10px', backgroundColor: o.State === 'Started' ? 'green' : 'darkred', marginRight: '5px' }}></div>
                      <span>{RouteId}</span>
                    </InlineFieldRow>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderI2State = () => {
    return (
      <InlineFieldRow>
        <InlineField>
          <React.Fragment>
            <div style={{ width: '10px', height: '100%', backgroundColor: state.I2.State === 'Started' ? 'green' : 'darkred', marginRight: '5px' }}></div>
            <span>I2 {state.I2.State === 'Started' ? 'Started' : 'Not started'}</span>
          </React.Fragment>
        </InlineField>
      </InlineFieldRow>
    );
  };

  const renderI2FixConncetionTable = () => {
    return (
      <div className="wrap-collabsible">
        <input id="collapsibleI2" className="toggle" type="checkbox" />
        <label for="collapsibleI2" className="lbl-toggle" style={
          state.I2.FixGeneral ? { backgroundColor: 'green' } : { backgroundColor: 'darkred' }
        }>I2 Fix Connection ({state.I2.activeFix + '/' + state.I2.Fix.length})</label>
        <div className="collapsible-content">
          <div className="content-inner">
            <div
              id="fss-table-wrapper"
              style={{ overflow: 'auto', width: width - 30, zIndex: 1 }}
            >
              <div style={{ width: '100%' }}>
                {state.I2.Fix.map((o: any) => {
                  const { RouteId } = o;
                  return (
                    <InlineFieldRow style={{ padding: '2px', margin: '5px' }}>
                      <div style={{ width: '10px', backgroundColor: o.State === 'Started' ? 'green' : 'darkred', marginRight: '5px' }}></div>
                      <span>{RouteId}</span>
                    </InlineFieldRow>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDBState = () => {
    return (
      <InlineFieldRow>
        <InlineField>
          <React.Fragment>
            <div style={{ width: '10px', height: '100%', backgroundColor: state.DBGeneral ? 'green' : 'darkred', marginRight: '5px' }}></div>
            <span>DB Connection</span>
          </React.Fragment>
        </InlineField>
      </InlineFieldRow>
    );
  };

  const renderDBFixConncetionTable = () => {
    return (
      <div className="wrap-collabsible">
        <input id="collapsibleDB" className="toggle" type="checkbox" />
        <label for="collapsibleDB" className="lbl-toggle" style={
          state.DBGeneral ? { backgroundColor: 'green' } : { backgroundColor: 'darkred' }
        }>DB Connection Detail ({state.activeDB + '/' + Object.keys(state.DB).length})</label>
        <div className="collapsible-content">
          <div className="content-inner">
            <div
              id="fss-table-wrapper"
              style={{ overflow: 'auto', width: width - 30, zIndex: 1 }}
            >
              <div style={{ width: '100%' }}>
                {Object.keys(state.DB).map((key: any) => {
                  const v = state.DB[key];
                  return (
                    <InlineFieldRow style={{ padding: '2px', margin: '5px' }}>
                      <div style={{ width: '10px', backgroundColor: v === 'true' ? 'green' : 'darkred', marginRight: '5px' }}></div>
                      <span>{key}</span>
                    </InlineFieldRow>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOMSService1State = () => {
    return (
      <InlineFieldRow>
        <InlineField style={{ width:width-5 }}>
          <label className="lbl-button" style={{ width: '100%', backgroundColor: state.OMSService1.State === 'Started' ? "green" : "darkred" }}>
            OMS SERVICE 1 {state.OMSService1.State === 'Started' ? "Started" : "Not started"}
          </label>
        </InlineField>
      </InlineFieldRow>
    );
  };

  const renderOMSService2State = () => {
    return (
      <InlineFieldRow>
        <InlineField style={{ width:width-5 }}>
          <label className="lbl-button" style={{ width: '100%', backgroundColor: state.OMSService2.State === 'Started' ? "green" : "darkred" }}>
            OMS SERVICE 2 {state.OMSService2.State === 'Started' ? "Started" : "Not started"}
          </label>
        </InlineField>
      </InlineFieldRow>
    );
  };

  const renderBOState = () => {
    return (
      <InlineFieldRow>
        <InlineField style={{ width:width-5 }}>
          <label className="lbl-button" style={{ width: '100%', backgroundColor: state.BO.State === 'Started' ? "green" : "darkred" }}>
            BO Sync {state.BO.State === 'Started' ? "Started" : "Not started"}
          </label>
        </InlineField>
      </InlineFieldRow>
    );
  };

  const renderORSState = () => {
    return (
      <InlineFieldRow>
        <InlineField style={{ width:width-5 }}>
          <label className="lbl-button" style={{ width: '100%', backgroundColor: state.ORS.State === 'Started' ? "green" : "darkred" }}>
            ORS Sync {state.ORS.State === 'Started' ? "Started" : "Not started"}
          </label>
        </InlineField>
      </InlineFieldRow>
    );
  };

  if (state === {}) {
    return null;
  } else
    return (
      state.E1 !== undefined &&
      <HorizontalGroup
        justify="flex-start"
        align="flex-start"
        style={{ width, height, overflow: 'auto' }}
      >
        <InlineFieldRow style={{ height, overflow: 'auto', paddingRight: '5px' }}>
          <InlineField style={{ marginBottom: '15px', padding: '5px', backgroundColor: '#22252B' }}>
            <VerticalGroup justify="flex-start" align="flex-start">
              {renderE1State()}
              {renderE1FixConncetionTable()}
            </VerticalGroup>
          </InlineField>

          <InlineField style={{ marginBottom: '15px', padding: '5px', backgroundColor: '#22252B' }}>
            <VerticalGroup justify="flex-start" align="flex-start" width='100%'>
              {renderOMSService1State()}
            </VerticalGroup>
          </InlineField>

          <InlineField style={{ marginBottom: '15px', padding: '5px', backgroundColor: '#22252B' }}>
            <VerticalGroup justify="flex-start" align="flex-start">
              {renderE2State()}
              {renderE2FixConncetionTable()}
            </VerticalGroup>
          </InlineField>

          <InlineField style={{ marginBottom: '15px', padding: '5px', backgroundColor: '#22252B' }}>
            <VerticalGroup justify="flex-start" align="flex-start" width='100%'>
              {renderOMSService2State()}
            </VerticalGroup>
          </InlineField>

          <InlineField style={{ marginBottom: '15px', padding: '5px', backgroundColor: '#22252B' }}>
            <VerticalGroup justify="flex-start" align="flex-start">
              {renderI1State()}
              {renderI1FixConncetionTable()}
            </VerticalGroup>
          </InlineField>

          <InlineField style={{ marginBottom: '15px', padding: '5px', backgroundColor: '#22252B' }}>
            <VerticalGroup justify="flex-start" align="flex-start">
              {renderI2State()}
              {renderI2FixConncetionTable()}
            </VerticalGroup>
          </InlineField>

          <InlineField style={{ marginBottom: '15px', padding: '5px', backgroundColor: '#22252B' }}>
            <VerticalGroup justify="flex-start" align="flex-start">
              {renderBOState()}
            </VerticalGroup>
          </InlineField>

          <InlineField style={{ marginBottom: '15px', padding: '5px', backgroundColor: '#22252B' }}>
            <VerticalGroup justify="flex-start" align="flex-start">
              {renderORSState()}
            </VerticalGroup>
          </InlineField>

          <InlineField style={{ marginBottom: '15px', padding: '5px', backgroundColor: '#22252B' }}>
            <VerticalGroup justify="flex-start" align="flex-start">
              {renderDBState()}
              {renderDBFixConncetionTable()}
            </VerticalGroup>
          </InlineField>

        </InlineFieldRow>
      </HorizontalGroup>
    );
};
