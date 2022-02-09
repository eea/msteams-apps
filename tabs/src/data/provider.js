import { TeamsUserCredential, createMicrosoftGraphClient } from '@microsoft/teamsfx';

var graphClient = undefined;
function getGraphClient() {
    if (!graphClient) {
        const credential = new TeamsUserCredential(),
            client = createMicrosoftGraphClient(credential, ["User.Read", "User.Read.All", "Sites.ReadWrite.All"]);

        graphClient = client;
    }

    return graphClient;
}

export async function getMe() {
    const graphClient = getGraphClient();
    const profile = await graphClient.api("/me").get();
    return profile
}

export async function getUserByMail(email) {
    try {
        const graphClient = getGraphClient();
        const profile = await graphClient.api("/users/" + email).get();
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
const sharepointSiteId = "7lcpdm.sharepoint.com,7bee771c-d555-44b1-aced-a7a3af485bad,9f851d9f-4d9b-4525-8656-612a369973f0",
    userListId = "3232e2a3-37f5-4e32-8897-eef98b4067d0",
    organisationListId = "f9cdde45-ec19-4090-9876-3097eedfae3e";

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

export async function getComboLists() {
    //TODO: move to configuration

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

export async function saveUser(user) {
    try {
        const graphClient = getGraphClient();

        const response = await graphClient.api("/sites/" + sharepointSiteId + "/lists/" + userListId + "/items")
            .header('Content-Type', 'application/json')
            .post(user);

        return response;
    }
    catch (err) {
        console.log(err);
    }
}



