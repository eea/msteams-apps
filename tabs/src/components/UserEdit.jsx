import { React, useState, useEffect, useRef } from "react";
import { getComboLists, getOrganisationList, getMappingsList, getMe, editUser } from "../data/provider";
import "./UserEdit.css";
import { Box, TextField, Tooltip, Autocomplete, Button, FormLabel, CircularProgress, Checkbox } from "@mui/material";

export function UserEdit({ user, refreshRow, saveFunction, newYN }) {
    const [loading, setLoading] = useState(false),
        [success, setSuccess] = useState(false),
        [isNFP, setIsNFP] = useState(false),
        [oldMembership, setOldMembership] = useState(user.Membership);

    const timer = useRef();

    const [countries, setCountries] = useState([]),
        [memberships, setMemberships] = useState([]),
        [genders, setGenders] = useState([]),
        [organisations, setOrganisations] = useState([]),
        [mapppings, setMappings] = useState([]);

    const onSubmit = async (e) => {
        if (!loading) {
            setSuccess(false);
            setLoading(true);
            if (saveFunction) {
                await saveFunction();
            } else {
                let result = await editUser(user, mapppings, oldMembership);
                if (result && refreshRow) {
                    await refreshRow();
                }
            }
            setSuccess(true);
            setLoading(false);
        }
    };

    useEffect(() => {
        (async () => {
            let myProfile = await getMe();
            if (myProfile.NFP) {
                setIsNFP(true);
            }

            let items = await getComboLists();
            if (items) {
                setCountries(items.countries);
                setMemberships(items.memberships);
                setGenders(items.genders);
            }

            let organisations = await getOrganisationList();
            if (organisations) {
                setOrganisations(organisations);
            }

            let mapppings = await getMappingsList();
            if (mapppings) {
                setMappings(mapppings);
            }

            clearTimeout(timer.current);

        })();
    }, []);

    return (
        <div className="welcome page main">
            <div className="page-padding">
                <h2>User details</h2>
                <Box
                    component="form"
                    sx={{
                        '& .MuiTextField-root': { m: 1, width: '50ch' },
                    }}
                    autoComplete="off"
                    noValidate
                >

                    <div className="row">
                        <Autocomplete

                            disablePortal
                            id="combo-box-gender"
                            defaultValue={
                                {
                                    id: user.Gender,
                                    label: user.GenderTitle
                                }
                            }
                            options={genders}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            onChange={(e, value) => {
                                user.Gender = value.id;
                                user.GenderTitle = value.label;
                            }}
                            renderInput={(params) => <TextField {...params} label="Title" variant="standard" />}
                        />
                        <TextField required className="control" id="firstName" label="First name" variant="standard" defaultValue={user.FirstName} onChange={e => {
                            user.FirstName = e.target.value;
                        }} />
                        <TextField required className="control" id="lastName" label="Last name" variant="standard" defaultValue={user.LastName} onChange={e => {
                            user.LastName = e.target.value;
                        }} />
                    </div>
                    <div className="row">
                        <TextField type="number" className="control" id="phone" label="Phone" variant="standard" defaultValue={user.Phone}
                            onChange={e => {
                                user.Phone = e.target.value;
                            }} />
                        <Tooltip title="Email used for creating the account." arrow>
                            <TextField disabled required className="control" id="email" defaultValue={user.Email} label="Email" variant="standard" />
                        </Tooltip>
                        <Autocomplete
                            disablePortal
                            id="combo-box-organisation"
                            defaultValue={
                                {
                                    content: user.OrganisationLookupId,
                                    header: user.Organisation
                                }
                            }
                            options={organisations}
                            getOptionLabel={(option) => option.hasOwnProperty("header") ? option.header : option}
                            isOptionEqualToValue={(option, value) => option.content === value.content}
                            onChange={(e, value) => {
                                user.OrganisationLookupId = value.content;
                                user.Organisation = value.header;
                            }}
                            renderInput={(params) => <TextField required {...params} label="Organisation" variant="standard" />}
                        />
                        <Autocomplete

                            disablePortal
                            disabled={isNFP}
                            id="combo-box-country"
                            defaultValue={user.Country}
                            options={countries}
                            onChange={(e, value) => {
                                user.Country = value;
                            }}
                            renderInput={(params) => <TextField required {...params} label="Country" variant="standard" />}
                        />

                    </div>
                    <div className="row">
                        <Autocomplete
                            required
                            multiple
                            limitTags={1}
                            id="tags-membership"
                            defaultValue={user.Membership}
                            options={memberships}
                            getOptionLabel={(option) => option}
                            onChange={(e, value) => {
                                user.Membership = value;
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    required
                                    variant="standard"
                                    label="Memberships"
                                />
                            )}
                        />
                    </div>
                    <div className="row">
                        <Box sx={{ m: 1, position: 'relative' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="secondary"
                                size="medium"
                                className="button"
                                disabled={loading}
                                onClick={onSubmit}
                            >
                                Save
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

                    </div>
                    {!newYN && <div className="row">
                        <FormLabel className="note-label">Note: If the email needs to be changed, kindly contact Eionet Helpdesk. </FormLabel>
                    </div>}
                </Box>
            </div >
        </div >
    );
}
