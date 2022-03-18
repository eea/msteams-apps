import { React, useState, useEffect } from "react";
import { getInvitedUsers, getUser } from "../data/provider";
import { DataGrid } from "@mui/x-data-grid";
import "./UserList.css";
import { TextField, Button, Chip, } from "@mui/material";
import { UserEdit } from "./UserEdit";

export function UserList(props) {
    const [users, setUsers] = useState([]),
        [filteredUsers, setFilteredUsers] = useState([]),
        [selectedUser, setSelectedUser] = useState({}),
        [formVisible, setFormVisible] = useState(false);

    const renderEditButton = (params) => {
        return (
            <strong>
                <Button
                    variant="contained"
                    color="secondary"
                    size="medium"
                    style={{ marginLeft: 16 }}
                    onClick={async () => {
                        setFormVisible(false);
                        const user = params.row,
                            userDetails = await getUser(user.ADUserId);

                        user.FirstName = userDetails.givenName;
                        user.LastName = userDetails.surname;
                        setSelectedUser(user);
                        setFormVisible(true);
                    }}
                >
                    Edit
                </Button>
            </strong>
        )
    },
        renderMembershipTags = (params) => {
            let index = 0;
            return params.row.Membership && params.row.Membership.map((m) =>
                <Chip key={index++} label={m} />
            )
        },
        refreshRow = async () => {
            let invitedUsers = await getInvitedUsers();
            if (invitedUsers) {
                setUsers(invitedUsers);
                setFilteredUsers(invitedUsers);
            }
        };

    const columns = [
        { field: 'Title', headerName: 'Name', flex: 1 },
        { field: 'Email', headerName: 'Email', flex: 1 },
        { field: 'Membership', headerName: 'Membership', renderCell: renderMembershipTags, flex: 1 },
        { field: 'Country', headerName: 'Country', flex: 0.5 },
        { field: 'Organisation', headerName: 'Organisation', flex: 1 },
        {
            field: 'Edit', headerName: '', width: 150, renderCell: renderEditButton, disableClickEventBubbling: true,
        },
    ];
    useEffect(() => {
        (async () => {
            let invitedUsers = await getInvitedUsers();
            if (invitedUsers) {
                setUsers(invitedUsers);
                setFilteredUsers(invitedUsers);
            }
        })();
    }, []);

    return (
        <div className="welcome page main">
            <div className="search-bar">
                <TextField id="search" label="Search" variant="standard" className="search-box" onChange={event => {
                    const { value } = event.target;
                    setTimeout(setFilteredUsers(users.filter(u => {
                        return !value || u.Email.toLowerCase().includes(value.toLowerCase())
                            || (u.Title && u.Title.toLowerCase().includes(value.toLowerCase()))
                            || (u.Membership && u.Membership.some((m) => m.toLowerCase().includes(value.toLowerCase())));
                    })), 50);
                }} />
            </div>
            <div className="user-list">
                <DataGrid
                    rows={filteredUsers}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                />
            </div>
            {formVisible && <UserEdit user={selectedUser} refreshRow={refreshRow} newYN={false}></UserEdit>}
        </div >
    );
}
