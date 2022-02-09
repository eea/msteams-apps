import { React, useState, useEffect } from "react";
import { Input, Button, Tooltip, Dropdown, Form, Text } from "@fluentui/react-northstar";
import { getUserByMail, getComboLists, getOrganisationList, saveUser } from "../data/provider";
import "./UserInvite.css";

export function UserInvite(props) {
    const [inputEmail, setInputEmail] = useState("");
    const [formVisible, setFormVisible] = useState(false);
    const [userRegistered, setUserRegistered] = useState(false);

    const [countries, setCountries] = useState([]),
        [memberships, setMemberships] = useState([]),
        [nfps, setNfps] = useState([]),
        [genders, setGenders] = useState([]),
        [organisations, setOrganisations] = useState([]);

    const [userName, setUserName] = useState(""),
        [gender, setGender] = useState(""),
        [country, setCountry] = useState(""),
        [phone, setPhone] = useState(""),
        [membership, setMembership] = useState([]),
        [organisation, setOrganisation] = useState(""),
        [nfp, setNfp] = useState("");


    useEffect(() => {
        (async () => {
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
        })();
    }, []);



    const onInputEmailChange = (e) => {
        setInputEmail(e.target.value);
        setUserRegistered(false);
        setFormVisible(false);
    },
        onCheckEmail = async (value) => {
            const existingUser = await getUserByMail(inputEmail);
            setUserRegistered(existingUser !== undefined);
            setFormVisible(existingUser === undefined);
        },
        inviteUser = async () => {
            const user = {
                fields: {
                    Phone: phone,
                    Email: inputEmail,
                    Country: country,
                    Membership: membership,
                    NFP: nfp,
                    Title: userName
                }
            }
            await saveUser(user);
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
                <h2>Start with e-mail</h2>
                <div className="row">
                    <Form class="row"
                        onSubmit={() => {
                            onCheckEmail();
                        }}
                        fields={checkFields}
                    ></Form>
                    {userRegistered && <Text className="warning" content="User with this email already registered." />}
                </div>
                {formVisible && <div>
                    <h2>Fill other attributes</h2>
                    <div className="row">
                        <div className="column">
                            <Tooltip trigger={<Input fluid className="control" placeholder="Name" onChange={(e) => { setUserName(e.target.value); }} ></Input>} content="Please fill the user's name!"
                            ></Tooltip>
                            <Dropdown className="control" items={genders} placeholder="Gender" onChange={(e, selectedOption) => { setGender(selectedOption.value); }}></Dropdown>
                        </div>
                        <div className="column">
                            <Dropdown className="control" items={countries} placeholder="Country" onChange={(e, selectedOption) => { setCountry(selectedOption.value); }}></Dropdown>
                            <Dropdown multiple className="control" items={memberships} placeholder="Membership" onChange={(e, selectedOption) => { setMembership(selectedOption.value); }}></Dropdown>
                            <Dropdown className="control" items={nfps} placeholder="NFP" onChange={(e, selectedOption) => { setNfp(selectedOption.value); }}></Dropdown>
                        </div>
                        <div className="column">
                            <Input fluid className="control" placeholder="Phone" onChange={(e) => { setPhone(e.target.value); }}></Input>
                            <Dropdown className="control" items={organisations} placeholder="Organisation" onChange={(e, selectedOption) => { setOrganisation(selectedOption.value); }}>
                            </Dropdown>
                        </div>
                    </div>
                    <Button content="Invite user" onClick={() => { inviteUser(); }} />
                </div>}
            </div >
        </div >
    );
}
