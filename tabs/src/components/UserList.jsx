import { React, useState, useEffect, } from "react";
import { getUser, } from "../data/provider";
import { getInvitedUsers } from "../data/sharepointProvider";
import { DataGrid } from "@mui/x-data-grid";
import "./UserList.css";
import { TextField, Button, Chip, Dialog, DialogTitle, IconButton, Backdrop, CircularProgress, Box } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import CreateIcon from '@mui/icons-material/Create';
import { UserEdit } from "./UserEdit";

export function UserList({ userInfo }) {
    const [users, setUsers] = useState([]),
        [filteredUsers, setFilteredUsers] = useState([]),
        [selectedUser, setSelectedUser] = useState({}),
        [formVisible, setFormVisible] = useState(false),
        [loading, setloading] = useState(false);

    const renderEditButton = (params) => {
        return (
            <strong>
                <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    style={{ marginLeft: 16 }}
                    endIcon={<CreateIcon />}
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
            let invitedUsers = await getInvitedUsers(userInfo);
            if (invitedUsers) {
                setUsers(invitedUsers);
                setFilteredUsers(invitedUsers);
            }
        },
        handleClose = () => {
            setFormVisible(false);
        };

    const columns = [
        { field: 'Title', headerName: 'Name', flex: 1 },
        { field: 'Email', headerName: 'Email', flex: 1 },
        { field: 'MembershipString', headerName: 'Membership', renderCell: renderMembershipTags, flex: 1 },
        { field: 'Country', headerName: 'Country', flex: 0.5 },
        { field: 'Organisation', headerName: 'Organisation', flex: 1 },
        {
            field: 'Edit', headerName: '', width: 150, renderCell: renderEditButton, disableClickEventBubbling: true,
        },
    ];
    useEffect(() => {
        (async () => {
            setloading(true);
            let invitedUsers = await getInvitedUsers(userInfo);
            if (invitedUsers) {
                setUsers(invitedUsers);
                setFilteredUsers(invitedUsers);
            }
            setloading(false);
        })();
    }, []);

    return (
        <div className="welcome page main page-padding">
            <Box sx={{
                boxShadow: 2,
            }}>
                <Backdrop
                    sx={{ color: '#6b32a8', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={loading}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
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
                        pageSize={25}
                        rowsPerPageOptions={[10, 25, 50, 100]}
                        hideFooterSelectedRowCount={true}
                        getRowHeight={(params) => { return 36; }}
                    />
                </div>
                <Dialog open={formVisible} onClose={handleClose} maxWidth='xl'>
                    <DialogTitle>
                        <IconButton
                            aria-label="close"
                            onClick={handleClose}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                color: (theme) => theme.palette.grey[500],
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                        User details
                    </DialogTitle>
                    <div className="page-padding">
                        <UserEdit user={selectedUser} refreshRow={refreshRow} newYN={false} userInfo={userInfo}></UserEdit>
                    </div>
                </Dialog>
            </Box>
        </div >
    );
}
