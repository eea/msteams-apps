
import { apiGet } from './apiProvider';

const sharepointSiteId = "7lcpdm.sharepoint.com,bf9359de-0f13-4b00-8b5a-114f6ef3bfb0,6609a994-5225-4a1d-bd05-a239c7b45f72",
    configurationListId = "010b1be2-0df5-4ab1-b2a7-17e010aae775";

var _configuration = undefined;
export async function getConfiguration() {
    try {
        if (!_configuration) {
            const response = await apiGet("/sites/" + sharepointSiteId + "/lists/" + configurationListId + "/items?$expand=fields");
            _configuration = {};
            response.graphClientMessage.value.forEach(function (item) {
                _configuration[item.fields.Title] = item.fields.Value;
            });
            _configuration.SharepointSiteId = sharepointSiteId;
        }
        return _configuration;
    }
    catch (err) {
        console.log(err);
        return undefined;
    }
}

export async function getOrganisationList(country) {
    const config = await getConfiguration();
    try {
        let path = "/sites/" + sharepointSiteId + "/lists/" + config.OrganisationListId + "/items?$expand=fields"
        if (country) {
            path += "&$filter=fields/Country eq '" + country + "' or fields/Unspecified eq 1";
        }
        const response = await apiGet(path);
        return response.graphClientMessage.value.map(function (organisation) {
            return {
                header: organisation.fields.Title,
                content: organisation.id,
                unspecified: organisation.fields.Unspecified,
            };
        });
    }
    catch (err) {
        console.log(err);
        return [];
    }
}

var mappingsList = undefined;
export async function getMappingsList() {
    const config = await getConfiguration();
    try {
        if (!mappingsList) {
            const response = await apiGet("/sites/" + sharepointSiteId + "/lists/" + config.MappingListId + "/items?$expand=fields");
            mappingsList = response.graphClientMessage.value.map(function (mapping) {
                return {
                    TeamURL: mapping.fields.TeamURL,
                    O365Group: mapping.fields.O365group,
                    O365GroupId: mapping.fields.O365GroupId,
                    Membership: mapping.fields.Membership,
                    Tag: mapping.fields.Tag
                };
            });
        }
        return mappingsList;
    }
    catch (err) {
        console.log(err);
    }
}
var genderList = [
    { id: "Male", label: "Mr." }, { id: "Female", label: "Ms." }
];

export async function getComboLists() {
    const config = await getConfiguration();
    let lists = {};
    try {
        const response = await apiGet("/sites/" + sharepointSiteId + "/lists/" + config.UserListId + "/columns");
        const columns = response.graphClientMessage.value;
        var genderColumn = columns.find(column => column.name === 'Gender');
        if (genderColumn && genderColumn.choice) {
            lists.genders = genderList//genderColumn.choice.choices;
        }
        var countryColumn = columns.find(column => column.name === 'Country');
        if (countryColumn && countryColumn.choice) {
            lists.countries = countryColumn.choice.choices;
        }
        var membershipColumn = columns.find(column => column.name === 'Membership');
        if (membershipColumn && membershipColumn.choice) {
            lists.memberships = membershipColumn.choice.choices;
        }
        var nfpColumn = columns.find(column => column.name === 'NFP');
        if (nfpColumn && nfpColumn.choice) {
            lists.nfps = nfpColumn.choice.choices;
        }

        return lists
    }
    catch (err) {
        console.log(err);
    }
}


export async function getSPUserByMail(email) {
    const config = await getConfiguration();
    try {
        const path = "/sites/" + sharepointSiteId + "/lists/" + config.UserListId + "/items?$filter=fields/Email eq '" + email + "'&$expand=fields",
            response = await apiGet(path),
            profile = response.graphClientMessage;
        if (profile.value && profile.value.length) {
            return profile.value[0];
        }
        return undefined;

    }
    catch (err) {
        console.log(err);
    }
}

export async function getInvitedUsers(userInfo) {
    const config = await getConfiguration();
    try {
        let path = "/sites/" + sharepointSiteId + "/lists/" + config.UserListId + "/items?$expand=fields&$top=999";
        if (userInfo.isNFP) {
            path += "&$filter=fields/Country eq '" + userInfo.country + "'";
        }
        const response = await apiGet(path),
            users = await response.graphClientMessage,
            organisations = await getOrganisationList();

        return users.value.map(function (user) {
            var organisation = organisations.find((o) => o.content === user.fields.OrganisationLookupId);
            return {
                Title: user.fields.Title,
                Email: user.fields.Email,
                Membership: user.fields.Membership,
                MembershipString: user.fields.Membership && user.fields.Membership.toString(),
                Country: user.fields.Country,
                OrganisationLookupId: user.fields.OrganisationLookupId,
                Organisation: organisation ? organisation.header : "",
                Phone: user.fields.Phone,
                ADUserId: user.fields.ADUserId,
                Gender: user.fields.Gender,
                GenderTitle: user.fields.Gender ? genderList.find((g) => g.id === user.fields.Gender).label : '',
                NFP: user.fields.NFP,
                SuggestedOrganisation: user.fields.SuggestedOrganisation,
                id: user.fields.id,
            };
        });
    }
    catch (err) {
        console.log(err);
    }
}