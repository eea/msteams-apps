import { TeamsUserCredential, createMicrosoftGraphClient } from '@microsoft/teamsfx';
//import sharepointConfig from 'sharepointConfig.json';

var graphClient = undefined;
function getGraphClient() {
    if (!graphClient) {
        const credential = new TeamsUserCredential(),
            client = createMicrosoftGraphClient(credential, ["User.Read", "User.Read.All", "User.ReadBasic.All", "Sites.ReadWrite.All", "Domain.ReadWrite.All", "Directory.ReadWrite.All", "TeamMember.ReadWrite.All", "TeamSettings.ReadWrite.All", "Contacts.ReadWrite"]);

        client.config.defaultVersion = 'beta';
        graphClient = client;
    }

    return graphClient;
}

export async function getMe() {
    const graphClient = getGraphClient();
    const profile = await graphClient.api("me?$select=id,displayName,mail,mobilePhone&$expand=extensions").get();
    if (profile.extensions) {
        let eionetExtension = profile.extensions.find((extension) => { return extension.id === "com.eionet.nfp"; });
        if (eionetExtension) {
            profile.NFP = eionetExtension.nfp === 'true';
            if (eionetExtension.country) { profile.Country = eionetExtension.country; }
        }
        else {
            profile.NFP = false;
        }
    }
    return profile;
}

export async function getUserByMail(email) {
    try {
        const graphClient = getGraphClient();
        let path = "/users/?$filter=mail eq '" + email + "'";
        const profile = await graphClient.api(path).get();

        if (profile.value && profile.value.length) {
            return profile.value[0];
        }
        return undefined;

    }
    catch (err) {
        console.log(err);
    }
}

//TODO: move to configuration
const sharepointSiteId = "7lcpdm.sharepoint.com,bf9359de-0f13-4b00-8b5a-114f6ef3bfb0,6609a994-5225-4a1d-bd05-a239c7b45f72",
    mappingsListId = "651ffab6-a4cd-4a77-8f2e-8723ff79e515",
    userListId = "8880f574-2ee6-4e22-8f5a-40ceb768f045",
    organisationListId = "e7ccdaa9-443c-44bc-966a-e2d8526043d5";

var genderList = [
    { id: "Male", label: "Mr." }, { id: "Female", label: "Ms." }
];
export async function getInvitedUsers() {
    try {
        const graphClient = getGraphClient();
        const response = await graphClient.api("/sites/" + sharepointSiteId + "/lists/" + userListId + "/items?$expand=fields").get();
        const organisations = await getOrganisationList();

        return response.value.map(function (user) {
            return {
                Title: user.fields.Title,
                Email: user.fields.Email,
                Membership: user.fields.Membership,
                Country: user.fields.Country,
                OrganisationLookupId: user.fields.OrganisationLookupId,
                Organisation: organisations.find((o) => o.content === user.fields.OrganisationLookupId).header,
                Phone: user.fields.Phone,
                ADUserId: user.fields.ADUserId,
                Gender: user.fields.Gender,
                GenderTitle: genderList.find((g) => g.id === user.fields.Gender).label,
                id: user.fields.id,
            };
        });
    }
    catch (err) {
        console.log(err);
    }
}

export async function getUser(userId) {
    try {
        const graphClient = getGraphClient();
        const response = await graphClient.api("/users/" + userId).get();

        return response;
    }
    catch (err) {
        console.log(err);
    }
}

var organisationListItems = undefined;
export async function getOrganisationList() {
    try {
        if (!organisationListItems) {
            const graphClient = getGraphClient();
            const response = await graphClient.api("/sites/" + sharepointSiteId + "/lists/" + organisationListId + "/items?$expand=fields").get();

            organisationListItems = response.value.map(function (organisation) {
                return {
                    header: organisation.fields.Title,
                    content: organisation.id
                };
            });
        }
        return organisationListItems;
    }
    catch (err) {
        console.log(err);
    }
}

export async function getMappingsList() {
    try {
        const graphClient = getGraphClient();
        const response = await graphClient.api("/sites/" + sharepointSiteId + "/lists/" + mappingsListId + "/items?$expand=fields").get();

        return response.value.map(function (config) {
            return {
                TeamURL: config.fields.TeamURL,
                O365Group: config.fields.O365group,
                O365GroupId: config.fields.O365GroupId,
                Membership: config.fields.Membership,
                Tag: config.fields.Tag
            };
        });
    }
    catch (err) {
        console.log(err);
    }
}

export async function getComboLists() {
    let lists = {};
    try {
        const graphClient = getGraphClient();
        const response = await graphClient.api("/sites/" + sharepointSiteId + "/lists/" + userListId + "/columns").get(),
            columns = response.value;
        var genderColumn = columns.find(column => column.name === 'Gender');
        if (genderColumn) {
            lists.genders = genderList//genderColumn.choice.choices;
        }
        var countryColumn = columns.find(column => column.name === 'Country');
        if (countryColumn) {
            lists.countries = countryColumn.choice.choices;
        }
        var membershipColumn = columns.find(column => column.name === 'Membership');
        if (membershipColumn) {
            lists.memberships = membershipColumn.choice.choices;
        }
        var nfpColumn = columns.find(column => column.name === 'NFP');
        if (nfpColumn) {
            lists.nfp = nfpColumn.choice.choices;
        }

        return lists
    }
    catch (err) {
        console.log(err);
    }
}

export async function sendInvitation(user, mappings) {
    try {
        const graphClient = getGraphClient();
        const firstMapping = mappings.find(m => user.Membership.includes(m.Membership));
        let userId = undefined,
            invitationResponse = undefined;

        try {
            invitationResponse = await graphClient.api("/invitations/")
                .header('Content-Type', 'application/json')
                .post({
                    invitedUserEmailAddress: user.Email,
                    invitedUserDisplayName: user.FirstName + ' ' + user.LastName,
                    inviteRedirectUrl: firstMapping.TeamURL,
                    sendInvitationMessage: true,
                    invitedUserMessageInfo: {
                        customizedMessageBody: "The European Environment Agency invites you to to join the Eionet space in Microsoft Teams. Click on the link to accept the invitation and follow the instructions to sign-in that you received in another email from the EEA. We would like to ask you to complete the registration and sign in to the new platform by 24 January latest."
                    }
                });
            if (invitationResponse && invitationResponse.invitedUser) {
                userId = invitationResponse.invitedUser.id;
                //Save contact information
                await graphClient.api("/users/" + userId)
                    .header('Content-Type', 'application/json')
                    .patch({
                        givenName: user.FirstName,
                        surname: user.LastName,
                        displayName: user.FirstName + ' ' + user.LastName + ' (' + user.Country + ')',
                        department: 'Eionet'
                    });
            }
        } catch (err) {
            console.log(err);
        }
        if (userId) {
            mappings.filter(m => user.Membership.includes(m.Membership)).forEach(async (mapping) => {

                try {
                    //Set groups and tags
                    setTimeout(await graphClient.api("/groups/" + mapping.O365GroupId + "/members/$ref")
                        .header('Content-Type', 'application/json')
                        .post({
                            "@odata.id": "https://graph.microsoft.com/beta/directoryObjects/" + userId
                        }), 50);

                    if (mapping.Tag) {
                        //TeamId is the same as O365GroupId
                        await graphClient.api("/teams/" + mapping.O365GroupId + "/tags")
                            .header('Content-Type', 'application/json')
                            .post({
                                displayName: mapping.Tag,
                                members: [
                                    {
                                        userId: userId
                                    }
                                ]
                            });
                    }
                }
                catch (err) {
                    console.log(err);
                }
            });

            //Save to Sharepoint list
            await graphClient.api("/sites/" + sharepointSiteId + "/lists/" + userListId + "/items")
                .header('Content-Type', 'application/json')
                .post({
                    fields: {
                        Phone: user.Phone,
                        Email: user.Email,
                        Country: user.Country,
                        "Membership@odata.type": "Collection(Edm.String)",
                        Membership: user.Membership,
                        Title: user.FirstName + ' ' + user.LastName,
                        Gender: user.Gender,
                        Organisation: user.Organisation,
                        OrganisationLookupId: user.OrganisationLookupId,
                        ADUserId: userId
                    }
                });
        }

        return true;

    }
    catch (err) {
        console.log(err);
        return false;
    }
}

export async function editUser(user, mappings, oldMembership) {
    try {
        const graphClient = getGraphClient();
        mappings.filter(m => user.Membership.includes(m.Membership) && !oldMembership.includes(m.Membership)).forEach(async (mapping) => {
            try {
                //Set groups and tags
                setTimeout(await graphClient.api("/groups/" + mapping.O365GroupId + "/members/$ref")
                    .header('Content-Type', 'application/json')
                    .post({
                        "@odata.id": "https://graph.microsoft.com/beta/directoryObjects/" + user.ADUserId
                    }), 50);

                if (mapping.Tag) {
                    //TeamId is the same as O365GroupId
                    await graphClient.api("/teams/" + mapping.O365GroupId + "/tags")
                        .header('Content-Type', 'application/json')
                        .post({
                            displayName: mapping.Tag,
                            members: [
                                {
                                    userId: user.ADUserId
                                }
                            ]
                        });
                }
            }
            catch (err) {
                console.log(err);
            }
        });

        mappings.filter(m => !user.Membership.includes(m.Membership) && oldMembership.includes(m.Membership)).forEach(async (mapping) => {
            try {
                //Remove from group
                await graphClient.api("/groups/" + mapping.O365GroupId + "/members/" + user.ADUserId + "/$ref")
                    .header('Content-Type', 'application/json')
                    .delete();

                /*if (mapping.Tag) {
                    //TeamId is the same as O365GroupId
                    await graphClient.api("/teams/" + mapping.O365GroupId + "/tags")
                        .header('Content-Type', 'application/json')
                        .post({
                            displayName: mapping.Tag,
                            members: [
                                {
                                    userId: user.ADUserId
                                }
                            ]
                        });
                }*/
            }
            catch (err) {
                console.log(err);
            }
        });

        //Save user
        await graphClient.api("/users/" + user.ADUserId)
            .header('Content-Type', 'application/json')
            .patch({
                givenName: user.FirstName,
                surname: user.LastName,
                displayName: user.FirstName + ' ' + user.LastName + '(' + user.Country + ')',
            });

        //Save to Sharepoint list
        await graphClient.api("/sites/" + sharepointSiteId + "/lists/" + userListId + "/items/" + user.id)
            .header('Content-Type', 'application/json')
            .patch({
                fields: {
                    Phone: user.Phone,
                    Email: user.Email,
                    Country: user.Country,
                    "Membership@odata.type": "Collection(Edm.String)",
                    Membership: user.Membership,
                    Title: user.FirstName + ' ' + user.LastName,
                    Gender: user.Gender,
                    OrganisationLookupId: user.OrganisationLookupId
                }
            });

        return true;
    }
    catch (err) {
        console.log(err);
        return false;
    }
}



