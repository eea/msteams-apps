import { React, useState, useEffect } from "react";
import { Input, Button, Tooltip, Dropdown, Form, Text, Loader } from "@fluentui/react-northstar";
import { getUserByMail, getComboLists, getOrganisationList, getMappingsList, sendInvitation, getMe } from "../data/provider";
import validator from "validator";
import "./UserInvite.css";

export function UserInvite(props) {
    const [inputEmail, setInputEmail] = useState("");
    const [formVisible, setFormVisible] = useState(false);
    const [userRegistered, setUserRegistered] = useState(false);
    const [loaderVisible, setLoaderVisible] = useState(false);
    const [inviteDone, setInviteDone] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [me, setMe] = useState({});

    const [countries, setCountries] = useState([]),
        [memberships, setMemberships] = useState([]),
        [nfps, setNfps] = useState([]),
        [genders, setGenders] = useState([]),
        [organisations, setOrganisations] = useState([]),
        [mapppings, setMappings] = useState([]);

    const [userName, setUserName] = useState(""),
        [gender, setGender] = useState(""),
        [country, setCountry] = useState(""),
        [phone, setPhone] = useState(""),
        [membership, setMembership] = useState([]),
        [organisation, setOrganisation] = useState("");


    useEffect(() => {
        (async () => {
            let myProfile = await getMe();
            setMe(myProfile);
            if (myProfile.NFP) {
                setCountry(myProfile.Country);
            }

            let items = await getComboLists();
            if (items) {
                setCountries(items.countries);
                setMemberships(items.memberships);
                setNfps(items.nfp);
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

        })();
    }, []);



    const onInputEmailChange = (e) => {
        setInputEmail(e.target.value);
        setUserRegistered(false);
        setFormVisible(false);
    },
        onCheckEmail = async (value) => {
            if (validator.isEmail(inputEmail)) {
                const existingUser = await getUserByMail(inputEmail);
                setWarningText("User with this email already registered.");
                setUserRegistered(existingUser !== undefined);
                setFormVisible(existingUser === undefined);
            } else {
                setWarningText("Invalid email. Please correct the email address");
                setUserRegistered(true);
            }

        },
        inviteUser = async () => {
            setLoaderVisible(true);
            const user = {
                fields: {
                    Phone: phone,
                    Email: inputEmail,
                    Country: country,
                    Membership: membership,
                    Title: userName,
                    Gender: gender,
                    Organisation: organisation
                }
            }
            var result = await sendInvitation(user, mapppings);
            setInviteDone(result);
            setLoaderVisible(!result);
        };

    const checkFields = [
        {
            name: 'email',
            id: 'check_email',
            key: 'check_email',
            required: true,
            control: {
                as: Input,
                showSuccessIndicator: false,
                onChange: (e) => onInputEmailChange(e),
                className: 'control',
                placeholder: 'Email'
            },
        },
        {
            control: {
                as: Button,
                content: 'Check',
            },
            key: 'submit',
        },
    ];

    return (
        <div className="welcome page main">
            <div className="page-padding">
                <h2>Invite user to join Eionet team</h2>
                <div className="row">
                    <Form class="row"
                        onSubmit={() => {
                            onCheckEmail();
                        }}
                        fields={checkFields}
                    ></Form>
                    {userRegistered && <Text className="warning" content={warningText} />}
                </div>
                {formVisible && <div>
                    <h2>User details</h2>
                    <div className="row">
                        <div className="column">
                            <Tooltip dismissOnContentMouseEnter trigger={<Input fluid className="control" placeholder="Name" onChange={(e) => { setUserName(e.target.value); }} ></Input>}
                                content="Thie field specified the name of the user."
                            ></Tooltip>
                            <Tooltip dismissOnContentMouseEnter trigger={<Dropdown className="control" items={genders} placeholder="Gender" onChange={(e, selectedOption) => { setGender(selectedOption.value); }}></Dropdown>}
                                content="This field specifies the gender of the person using the account."
                            ></Tooltip>
                        </div>
                        <div className="column">
                            {!me.NFP &&
                                <Tooltip dismissOnContentMouseEnter trigger={<Dropdown className="control" items={countries} placeholder="Country" onChange={(e, selectedOption) => { setCountry(selectedOption.value); }}></Dropdown>}
                                    content="Choose the country of the user."
                                ></Tooltip>
                            }
                            {me.NFP &&
                                <Tooltip dismissOnContentMouseEnter trigger={<Input disabled fluid className="control" placeholder={country} value={country} ></Input>}
                                    content="Country set by default for the user."
                                ></Tooltip>
                            }
                            <Tooltip dismissOnContentMouseEnter trigger={<Dropdown multiple className="control" items={memberships} placeholder="Membership" onChange={(e, selectedOption) => { setMembership(selectedOption.value); }}></Dropdown>}
                                content="This field will be used to assign the user to a specific team and O365 group."
                            ></Tooltip>
                        </div>
                        <div className="column">
                            <Tooltip dismissOnContentMouseEnter trigger={<Input fluid className="control" placeholder="Phone" onChange={(e) => { setPhone(e.target.value); }}></Input>}
                                content="Specify a phone number that can be used to contect user."
                            ></Tooltip>
                            <Tooltip dismissOnContentMouseEnter trigger={<Dropdown className="control" items={organisations} placeholder="Organisation" onChange={(e, selectedOption) => { setOrganisation(selectedOption.value); }}>
                            </Dropdown>}
                                content="Choose the organisation that the user belongs to."
                            ></Tooltip>
                        </div>
                    </div>
                    <Button disabled={inviteDone} content="Invite user" onClick={() => { inviteUser(); }} />
                    {loaderVisible && <Loader />}
                    {inviteDone && <Text className="success" content="User invited successfully" />}
                </div>}
            </div >
        </div >
    );
}
