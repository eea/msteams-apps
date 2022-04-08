import { React, useState, useEffect, } from "react";
import { getUserByMail, sendInvitation } from "../data/provider";
import { getMappingsList } from "../data/sharepointProvider";
import messages from "../data/messages.json";
import validator from "validator";
import "./UserInvite.css";
import { UserEdit } from "./UserEdit";
import { Box, CircularProgress, FormLabel, TextField, Button, } from "@mui/material";
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';

export function UserInvite({ userInfo }) {
    const [inputEmail, setInputEmail] = useState(""),
        [formVisible, setFormVisible] = useState(false),
        [warningVisible, setWarningVisible] = useState(false),
        [warningText, setWarningText] = useState(""),
        [loading, setLoading] = useState(false);

    const [mapppings, setMappings] = useState([]);

    const defaultUser = {
        Phone: "",
        Email: "",
        Country: "",
        Membership: [],
        FirstName: "",
        LastName: "",
        Gender: "",
        GenderTitle: "",
        Organisation: "",
        OrganisationLookupId: "",
        NFP: "",
        ADProfile: {}

    };
    const [selectedUser, setSelectedUser] = useState(defaultUser);

    useEffect(() => {
        (async () => {
            if (userInfo.isNFP) {
                selectedUser.Country = userInfo.country;
            }

            let mapppings = await getMappingsList();
            if (mapppings) {
                setMappings(mapppings);
            }
        })();
    }, [selectedUser, userInfo]);

    const onInputEmailChange = (e) => {
        setInputEmail(e.target.value);
        setSelectedUser(defaultUser);
        setWarningVisible(false);
        setFormVisible(false);
    },
        onCheckEmail = async (value) => {
            setFormVisible(false);
            setLoading(true);

            //check for plus sign because AD rejects emails with "+" even though they are correct
            if (validator.isEmail(inputEmail) && !inputEmail.includes("+")) {
                if (inputEmail.includes("@eea.europa.eu")) {
                    setWarningText(messages.UserInvite.EEAUserError);
                    setWarningVisible(true);
                } else {
                    const response = await getUserByMail(inputEmail);
                    setWarningText(messages.UserInvite.UserAlreadyRegistered);
                    setWarningVisible(!response.Continue);
                    selectedUser.Email = inputEmail;
                    selectedUser.ADProfile = response.ADUser;
                    setFormVisible(response.Continue);
                }
            } else {
                setWarningText(messages.UserInvite.InvalidEmail);
                setWarningVisible(true);
            }
            setLoading(false);
        },
        inviteUser = async () => {
            return await sendInvitation(selectedUser, mapppings);
        };

    return (
        <div className="welcome page main">
            <div className="page-padding page-size">

                <div className="row">
                    <Box
                        component="form"
                        sx={{
                            '& .MuiTextField-root': { m: 1, width: '50ch' }, boxShadow: 2,
                            padding: '1rem', width: '100%', alignItems: 'center'
                        }}
                        autoComplete="off"
                        noValidate
                        onSubmit={(e) => {
                            e.preventDefault();
                            onCheckEmail();
                        }}
                    >
                        <h2>Invite user to join Eionet team</h2>
                        <div className="row">
                            <TextField required className="control" id="firstName" label="Email" variant="standard"
                                onChange={e => {
                                    onInputEmailChange(e);
                                }}
                            />
                            <Box sx={{ m: 1, position: 'relative', }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="secondary"
                                    size="medium"
                                    className="check-button"
                                    disabled={loading}
                                    endIcon={loading ? <HourglassTopIcon /> : <PersonSearchIcon />}
                                >
                                    Check

                                </Button>
                                {loading && (
                                    <CircularProgress
                                        size={24}
                                        sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            marginTop: '-12px',
                                            marginLeft: '-12px',
                                        }}
                                    />
                                )}
                            </Box>

                            {warningVisible && <FormLabel className="note-label warning" error>{warningText}</FormLabel>}
                        </div>

                    </Box>

                </div>
                {formVisible &&
                    <Box sx={{
                        boxShadow: 2,
                        padding: '1rem', width: '100%', alignItems: 'center'
                    }}>
                        <h2>User details</h2>
                        <UserEdit user={selectedUser} saveFunction={inviteUser} newYN={true} userInfo={userInfo}></UserEdit>
                    </Box>}
            </div >
        </div >
    );
}
