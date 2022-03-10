import { React, useState, useEffect } from "react";
import { Input, Button, Form } from "@fluentui/react-northstar";
import { getUserByMail, getMappingsList, sendInvitation, getMe } from "../data/provider";
import validator from "validator";
import "./UserInvite.css";
import { UserEdit } from "./UserEdit";
import { FormLabel } from "@mui/material";

export function UserInvite(props) {
    const [inputEmail, setInputEmail] = useState("");
    const [formVisible, setFormVisible] = useState(false);
    const [userRegistered, setUserRegistered] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [me, setMe] = useState({});

    const
        [mapppings, setMappings] = useState([]);

    const [selectedUser, setSelectedUser] = useState({
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

    });

    useEffect(() => {
        (async () => {
            let myProfile = await getMe();
            setMe(myProfile);
            if (myProfile.NFP) {
                selectedUser.Country = myProfile.Country;
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
                selectedUser.Email = inputEmail;
                setFormVisible(existingUser === undefined);
            } else {
                setWarningText("Invalid email. Please correct the email address");
                setUserRegistered(true);
            }

        },
        inviteUser = async () => {
            return await sendInvitation(selectedUser, mapppings);
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
                    {userRegistered && <FormLabel className="note-label warning" error>{warningText}</FormLabel>}
                </div>
                {formVisible && <UserEdit user={selectedUser} saveFunction={inviteUser} newYN={true}></UserEdit>}
            </div >
        </div >
    );
}
