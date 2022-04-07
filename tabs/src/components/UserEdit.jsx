import { React, useState, useEffect, useRef } from "react";
import { editUser } from "../data/provider";
import { getComboLists, getOrganisationList, getMappingsList } from "../data/sharepointProvider";
import { validateName, validatePhone, validateMandatoryField } from "../data/validator";
import "./UserEdit.css";
import { Box, TextField, Autocomplete, Button, FormLabel, CircularProgress, Checkbox, FormControlLabel } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import SaveIcon from '@mui/icons-material/Save';

export function UserEdit({ user, refreshRow, saveFunction, newYN, userInfo }) {
    const [loading, setLoading] = useState(false),
        [success, setSuccess] = useState(false),
        [oldValues, setOldValues] = useState(JSON.parse(JSON.stringify(user)));

    const [errors, setErrors] = useState({});
    const timer = useRef();

    const [countries, setCountries] = useState([]),
        [memberships, setMemberships] = useState([]),
        [genders, setGenders] = useState([]),
        [organisations, setOrganisations] = useState([]),
        [mappings, setMappings] = useState([]);

    const submit = async (e) => {
        if (!loading) {
            e.preventDefault();
            let tempErrors = validateForm();
            if (!tempErrors || !Object.values(tempErrors).some(v => { return v; })) {
                setSuccess(false);
                setLoading(true);
                if (saveFunction) {
                    await saveFunction();
                } else {
                    let result = await editUser(user, mappings, oldValues);
                    if (result) {
                        setOldValues(JSON.parse(JSON.stringify(user)));
                        await refreshRow && refreshRow();
                    }
                }
                setSuccess(true);
                setLoading(false);
            }
        }
    },
        validateField = (e) => {
            let id = e.target.id,
                tempErrors = { ...errors };

            switch (id) {
                case 'firstName':
                    tempErrors.firstName = validateName(user.FirstName);
                    break;
                case 'lastName':
                    tempErrors.lastName = validateName(user.LastName);
                    break;
                case 'phone':
                    tempErrors.phone = validatePhone(user.Phone);
                    break;
                case 'country':
                    tempErrors.country = validateMandatoryField(user.Country);
                    break;
                case 'membership':
                    tempErrors.membership = validateMandatoryField(user.Membership);
                    break;
                case 'organisation':
                    tempErrors.organisation = validateMandatoryField(user.OrganisationLookupId);
                    break;
                default:
                    console.log('Undefined field for validation');
                    break;
            }

            setErrors({ ...tempErrors });
        },
        validateForm = () => {
            let tempErrors = { ...errors };
            tempErrors.firstName = validateName(user.FirstName);
            tempErrors.lastName = validateName(user.LastName);
            tempErrors.phone = validatePhone(user.Phone);
            tempErrors.country = validateMandatoryField(user.Country);
            tempErrors.membership = validateMandatoryField(user.Membership);
            tempErrors.organisation = validateMandatoryField(user.OrganisationLookupId);
            setErrors({ ...tempErrors });
            return tempErrors;
        };



    useEffect(() => {
        (async () => {

            if (userInfo.isNFP && newYN) {
                user.Country = userInfo.country;
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
    }, [userInfo, user, newYN]);

    return (
        <div className="welcome page main">
            <div >
                <Box
                    component="form"
                    sx={{
                        '& .MuiTextField-root': { m: 1, width: '50ch' },

                    }}
                    autoComplete="off"
                    noValidate
                    onSubmit={(e) => {
                        submit(e);
                    }}
                >
                    <div className="row">
                        <Autocomplete
                            disablePortal
                            id="combo-box-gender"
                            className="small-width"
                            defaultValue={
                                {
                                    id: user.Gender,
                                    label: user.GenderTitle
                                }
                            }
                            options={genders}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            onChange={(e, value) => {
                                user.Gender = value ? value.id : "";
                                user.GenderTitle = value ? value.label : "";
                            }}
                            renderInput={(params) => <TextField {...params} autoComplete='off' className="small-width" label="Title" variant="standard" />}
                        />
                    </div>
                    <div className="row">
                        <TextField required autoComplete='off' className="control" id="firstName" label="First name" variant="standard"
                            defaultValue={user.FirstName}
                            onChange={e => {
                                user.FirstName = e.target.value;
                                validateField(e);
                            }}
                            inputProps={{ style: { textTransform: "capitalize" } }}
                            error={Boolean(errors?.firstName)}
                            helperText={(errors?.firstName)}
                            onBlur={validateField}
                        />
                        <TextField required autoComplete='off' className="control" id="lastName" label="Last name" variant="standard"
                            defaultValue={user.LastName}
                            onChange={e => {
                                user.LastName = e.target.value;
                                validateField(e);
                            }}
                            inputProps={{ style: { textTransform: "capitalize" } }}
                            error={Boolean(errors?.lastName)}
                            helperText={(errors?.lastName)}
                            onBlur={validateField}
                        />
                        <Autocomplete
                            disablePortal
                            id="organisation"
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
                                user.OrganisationLookupId = value ? value.content : undefined;
                                user.Organisation = value ? value.header : undefined;
                                validateField(e);
                            }}
                            renderInput={(params) => <TextField required {...params}
                                label="Organisation"
                                variant="standard"
                                error={Boolean(errors?.organisation)}
                                helperText={(errors?.organisation)}
                                onBlur={validateField} />}
                        />
                    </div>
                    <div className="row">
                        <TextField autoComplete='off' className="control" id="phone" label="Phone" variant="standard" defaultValue={user.Phone}
                            onChange={e => {
                                user.Phone = e.target.value;
                                validateField(e);
                            }}
                            inputProps={{ maxLength: 15 }}
                            error={Boolean(errors?.phone)}
                            helperText={(errors?.phone)}
                            onBlur={validateField} />
                        <TextField disabled required autoComplete='off' className="control" id="email" defaultValue={user.Email} label="Email" variant="standard" />

                        <Autocomplete
                            disablePortal
                            disabled={userInfo.isNFP || userInfo.isGuest}
                            id="country"
                            defaultValue={user.Country}
                            options={countries}
                            onChange={(e, value) => {
                                user.Country = value;
                                validateField(e);
                            }}
                            renderInput={(params) => <TextField required autoComplete='off' {...params}
                                label="Country" variant="standard"
                                error={Boolean(errors?.country)}
                                helperText={(errors?.country)}
                                onBlur={validateField} />}
                        />

                    </div>
                    <div className="row">

                        <Autocomplete
                            required
                            multiple
                            limitTags={1}
                            id="membership"
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
                                    autoComplete='off'
                                    variant="standard"
                                    label="Memberships"
                                    error={Boolean(errors?.membership)}
                                    helperText={(errors?.membership)}
                                    onBlur={validateField}
                                />
                            )}
                        />
                        {userInfo.isAdmin && <FormControlLabel
                            control={
                                <Checkbox
                                    defaultChecked={user.NFP}
                                    onChange={(e, value) => {
                                        user.NFP = value;
                                    }}
                                />
                            }
                            label="NFP" />}

                    </div>
                    <div className="row">
                        <Box sx={{ m: 1, position: 'relative' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="secondary"
                                size="medium"
                                className="button"
                                disabled={loading || (newYN && success)}

                                endIcon={success ? <CheckIcon /> : <SaveIcon />}
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
