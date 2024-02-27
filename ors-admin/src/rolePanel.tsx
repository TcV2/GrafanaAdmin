// @ts-nocheck
import {
  Button,
  VerticalGroup,
  InlineField,
  InlineFieldRow,
  Input,
  Badge,
  RadioButtonGroup,
  Checkbox,
  Icon,
} from '@grafana/ui';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { OrderBookPanelOptions } from 'types';
import {
  addNewUserAPI,
  getAllTeam,
  getAllUsers,
  getTeamMembers,
  removeTeamMemberAPI,
  addTeamMemberAPI,
  deleteUserAPI,
  getUserByID,
  logging,
} from 'api/adminAPI';
import _ from 'lodash';

interface Props extends OrderBookPanelOptions { }

interface ObjectKeys {
  [key: string]: string | number;
}

export const RolePanel: React.FC<Props> = ({ width, height }) => {
  const [users, setUsers] = useState<ObjectKeys[]>([]);
  const [allTeams, setAllTeams] = useState<ObjectKeys[]>([]);

  useEffect(() => {
    getAllUsers().then((data: any) => {
      setUsers(data);
      getAllTeam().then((data: any) => {
        setAllTeams(data);
      });
    });
  }, []);

  useEffect(() => {
    if (allTeams.length > 0) {
      allTeams.map(async (team: any) => {
        await getUsersInTeams(team.id, team.name);
      });
      console.log('------------------', users);
    }
  }, [allTeams]);

  const getUsersInTeams = async (id: string, name: string) => {
    let res: any = await getTeamMembers(id);
    res.map((user: any) => {
      updateItem(user.userId, 'role', name);
    });
  };

  const updateItem = (id: any, whichvalue: string, newvalue: any) => {
    var index = users.findIndex((x: any) => x.id === id);
    if (index === -1) {
    } else {
      let g: ObjectKeys = users[index];
      g[whichvalue] = newvalue;
      setUsers([...users.slice(0, index), g, ...users.slice(index + 1)]);
    }
  };

  const [addUser, setAddUser] = useState<string>('');

  const handleOnChangeTeam = async (e: any, userId: any) => {
    let oldRole = '';
    let username = '';
    users.map((u: any) => {
      if (u.id === userId) {
        username = u.login;
        oldRole = u.role;
      }
    });
    let oldTeamID = -1;
    let newTeamID = -1;
    if (oldRole !== '') {
      allTeams.map((t: any) => {
        if (t.name === oldRole) {
          oldTeamID = t.id;
        }
      });
    }
    allTeams.map((t: any) => {
      if (t.name === e) {
        newTeamID = t.id;
      }
    });
    try {
      if (oldTeamID !== -1) {
        await removeTeamMemberAPI(oldTeamID, userId);
        await logging("Removed user " + username + " to team " + oldRole);
        // logger.info("Removed user " + username + " to team " + oldRole);
      }
      await addTeamMemberAPI(newTeamID, userId);
      await logging("Added user " + username + " to team " + e);
      // logger.info("Added user " + username + " to team " + e);
      updateItem(userId, 'role', e);
    } catch (err) { }
  };

  const renderAddUser = () => {
    const addNewUser = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        if (!addUser.match(/^[a-zA-Z0-9]+$/)) {
          toast.error('Username is not valid');
          return;
        }
        let res: any = await addNewUserAPI(addUser);
        await logging("Added new user " + addUser);
        // logger.info("Added new user " + addUser);
        let newUserID = res.id;
        let newUser: any = await getUserByID(newUserID);
        let reportTeamID = -1;
        allTeams.map((t: any) => {
          if (t.name === 'report') {
            reportTeamID = t.id;
          }
        });
        await addTeamMemberAPI(reportTeamID, newUserID);
        await logging("Added new user " + addUser + " to team report");
        // logger.info("Added new user " + addUser + " to team report");
        newUser.role = 'report';
        setAddUser('');
        setUsers([...users, newUser]);
      } catch (error) {
        toast.error(error);
      }
    };

    return (
      <form onSubmit={(e) => addNewUser(e)}>
        <InlineFieldRow>
          <InlineField label="Username">
            <Input
              value={addUser}
              width={30}
              css={''}
              onChange={(e) => {
                setAddUser(e.currentTarget.value);
              }}
            />
          </InlineField>
          <InlineField>
            <Button type="submit">Add user</Button>
          </InlineField>
        </InlineFieldRow>
      </form>
    );
  };

  const renderUserTable = () => {
    if (users) {
      return (
        <table id="fsstable">
          <thead>
            <tr>
              <th>Username</th>
              <th style={{ textAlign: 'center' }}>Admin</th>
              <th style={{ textAlign: 'center' }}>QTRR</th>
              <th style={{ textAlign: 'center' }}>QTRR View</th>
              <th style={{ textAlign: 'center' }}>Nghiệp vụ</th>
              <th style={{ textAlign: 'center' }}>Xem Report</th>
              <th style={{ textAlign: 'center' }}>DVKH</th>
              <th style={{ textAlign: 'center' }}>GDNV</th>
              <th style={{ textAlign: 'center' }}>PTSP</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr>
                <td>
                  {user.login}
                  {user.isAdmin && <Badge text="Grafana Admin" color="green" />}
                </td>
                <td style={{ width: '80px', textAlign: 'center' }}>
                  <Checkbox
                    value={user.role === 'admin'}
                    css=""
                    onChange={async (e) => {
                      await handleOnChangeTeam('admin', user.id);
                    }}
                  />
                </td>
                <td style={{ width: '80px', textAlign: 'center' }}>
                  <Checkbox
                    value={user.role === 'qtrr'}
                    css=""
                    onChange={async (e) => {
                      await handleOnChangeTeam('qtrr', user.id);
                    }}
                  />
                </td>
                <td style={{ width: '80px', textAlign: 'center' }}>
                  <Checkbox
                    value={user.role === 'qtrr-view'}
                    css=""
                    onChange={async (e) => {
                      await handleOnChangeTeam('qtrr-view', user.id);
                    }}
                  />
                </td>
                <td style={{ width: '80px', textAlign: 'center' }}>
                  <Checkbox
                    value={user.role === 'nghiep-vu'}
                    css=""
                    onChange={async (e) => {
                      await handleOnChangeTeam('nghiep-vu', user.id);
                    }}
                  />
                </td>
                <td style={{ width: '80px', textAlign: 'center' }}>
                  <Checkbox
                    value={user.role === 'report'}
                    css=""
                    onChange={async (e) => {
                      await handleOnChangeTeam('report', user.id);
                    }}
                  />
                </td>
                <td style={{ width: '80px', textAlign: 'center' }}>
                  <Checkbox
                    value={user.role === 'dvkh'}
                    css=""
                    onChange={async (e) => {
                      await handleOnChangeTeam('dvkh', user.id);
                    }}
                  />
                </td>
                <td style={{ width: '80px', textAlign: 'center' }}>
                  <Checkbox
                    value={user.role === 'gdnv'}
                    css=""
                    onChange={async (e) => {
                      await handleOnChangeTeam('gdnv', user.id);
                    }}
                  />
                </td>
                <td style={{ width: '80px', textAlign: 'center' }}>
                  <Checkbox
                    value={user.role === 'ptsp'}
                    css=""
                    onChange={async (e) => {
                      await handleOnChangeTeam('ptsp', user.id);
                    }}
                  />
                </td>
                <td style={{ width: '80px', textAlign: 'center' }}>
                  {!user.isAdmin && (
                    <Icon
                      name="trash-alt"
                      style={{ cursor: 'pointer' }}
                      title="Delete User"
                      onClick={async () => {
                        if (confirm(`Delete user ` + user.login)) {
                          await deleteUserAPI(user.id);
                          await logging("Removed user " + user.login);
                          // logger.info("Removed user " + user.login);
                          setUsers(users.filter((u) => u.id !== user.id));
                        }
                      }}
                    ></Icon>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    return null;
  };

  return (
    <VerticalGroup justify="flex-start" align="center">
      {renderAddUser()}
      <div style={{ height: '400px', maxHeight: '500px', overflow: 'auto' }}>
        {renderUserTable()}
      </div>
    </VerticalGroup>
  );
};
