import React from "react";
import { Input, Button, Tooltip, Dropdown, } from "@fluentui/react-northstar";
import "./UserInvite.css";

export function UserInvite(props) {
    const genderItems = ["Male", "Female"],
        inputItems = [
            'Bruce Wayne',
            'Natasha Romanoff',
            'Steven Strange',
            'Alfred Pennyworth',
            `Scarlett O'Hara`,
            'Imperator Furiosa',
            'Bruce Banner',
            'Peter Parker',
            'Selina Kyle',
        ],
        countryItems = [
            'Romania',
            'Denmark',
            'Germany',
        ];

    return (
        <div className="welcome page main">
            <div className="page-padding">

                <h2>Start with e-mail</h2>
                <div className="row">
                    <Input className="control" placeholder="Email"></Input>
                    <Button content="Check" />
                </div>
                <h2>Fill other attributes</h2>
                <div className="row">
                    <div className="column">
                        <Tooltip trigger={<Input fluid="true" isRequired={true} className="control" placeholder="Name" ></Input>} content="Please fill the user's name!"
                        ></Tooltip>
                        <Dropdown className="control" items={genderItems} placeholder="Gender"></Dropdown>
                        <Input fluid="true" className="control" placeholder="Link to account"></Input>
                    </div>
                    <div className="column">
                        <Dropdown className="control" items={countryItems} placeholder="Country"></Dropdown>
                        <Dropdown className="control" items={inputItems} placeholder="Membership"></Dropdown>
                        <Dropdown className="control" items={inputItems} placeholder="NFP"></Dropdown>
                    </div>
                    <div className="column">
                        <Input fluid="true" className="control" placeholder="Phone"></Input>
                        <Dropdown className="control" items={inputItems} placeholder="Organisation"></Dropdown>
                        <Input fluid="true" className="control" placeholder="Org"></Input>
                    </div>
                </div>
                <Button content="Invite user" />
            </div>
        </div >
    );
}
