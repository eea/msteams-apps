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

var domain = undefined;
async function getDomain() {
    if (!domain) {
        const graphClient = getGraphClient();
        const domainValue = await graphClient.api("/domains").get();

        domain = domainValue.value[0];
    }

    return domain;
}

export async function getUserByMail(email) {
    try {
        const graphClient = getGraphClient();
        let domain = await getDomain();
        let path = "/users/" + email.replace("@", "_") + "#EXT#@" + domain.id;
        console.log(encodeURIComponent(path));
        const profile = await graphClient.api(encodeURIComponent(path)).get();
        return profile
    }
    catch (err) {
        if (err.statusCode === 404) {
            return undefined;
        } else {
            console.log(err);
        }
    }
}

//TODO: move to configuration
const sharepointSiteId = "7lcpdm.sharepoint.com,bf9359de-0f13-4b00-8b5a-114f6ef3bfb0,6609a994-5225-4a1d-bd05-a239c7b45f72",
    mappingsListId = "651ffab6-a4cd-4a77-8f2e-8723ff79e515",
    userListId = "8880f574-2ee6-4e22-8f5a-40ceb768f045",
    organisationListId = "e7ccdaa9-443c-44bc-966a-e2d8526043d5";

export async function getOrganisationList() {
    try {
        const graphClient = getGraphClient();
        const response = await graphClient.api("/sites/" + sharepointSiteId + "/lists/" + organisationListId + "/items?$expand=fields").get();

        return response.value.map(function (organisation) {
            return organisation.fields.Title;
        });
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
            lists.genders = genderColumn.choice.choices;
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

        mappings.filter(m => user.fields.Membership.includes(m.Membership)).forEach(async (mapping) => {
            let invitationResponse = await graphClient.api("/invitations/")
                .header('Content-Type', 'application/json')
                .post({
                    invitedUserEmailAddress: user.fields.Email,
                    invitedUserDisplayName: user.fields.Title,
                    inviteRedirectUrl: mapping.TeamURL,
                    sendInvitationMessage: true,
                    invitedUserMessageInfo: {
                        customizedMessageBody: "The European Environment Agency invites you to to join the Eionet space in Microsoft Teams. Click on the link to accept the invitation and follow the instructions to sign-in that you received in another email from the EEA. We would like to ask you to complete the registration and sign in to the new platform by 24 January latest."
                    }
                });

            if (invitationResponse.invitedUser) {
                let userId = invitationResponse.invitedUser.id;
                setTimeout(await graphClient.api("/groups/" + mapping.O365GroupId + "/members/$ref")
                    .header('Content-Type', 'application/json')
                    .post({
                        "@odata.id": "https://graph.microsoft.com/beta/directoryObjects/" + userId
                    }), 50);

                //Issues with permissions

                try {
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
                catch (err) {
                    console.log(err);
                }
            }

        });

        //TODO comment after fixing membership saving
        delete user.fields.Membership;

        await graphClient.api("/sites/" + sharepointSiteId + "/lists/" + userListId + "/items")
            .header('Content-Type', 'application/json')
            .post(user);


        return true;

    }
    catch (err) {
        console.log(err);
    }
}



