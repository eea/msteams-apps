import { TeamsUserCredential, getResourceConfiguration, ResourceType } from '@microsoft/teamsfx';
import * as axios from "axios";

async function callApiFunction(command, method, options, params) {
    var message = [];
    var funcErrorMsg = "";
    try {
        const credential = new TeamsUserCredential();
        const accessToken = await credential.getToken("");
        const apiConfig = getResourceConfiguration(ResourceType.API);
        const response = await axios.default.request({
            method: method,
            url: apiConfig.endpoint + "/api/" + command,
            headers: {
                authorization: "Bearer " + accessToken.token
            },
            data: options,
            params
        });
        message = response.data;
    } catch (err) {
        if (err.response && err.response.status && err.response.status === 404) {
            funcErrorMsg =
                'There may be a problem with the deployment of Azure Function App, please deploy Azure Function (Run command palette "TeamsFx - Deploy Package") first before running this App';
        } else if (err.message === "Network Error") {
            funcErrorMsg =
                "Cannot call Azure Function due to network error, please check your network connection status and ";
            if (err.config.url.indexOf("localhost") >= 0) {
                funcErrorMsg +=
                    'make sure to start Azure Function locally (Run "npm run start" command inside api folder from terminal) first before running this App';
            } else {
                funcErrorMsg +=
                    'make sure to provision and deploy Azure Function (Run command palette "TeamsFx - Provision Resource" and "TeamsFx - Deploy Package") first before running this App';
            }
        } else {
            funcErrorMsg = err.toString();
            if (err.response?.data?.error) {
                funcErrorMsg += ": " + err.response.data.error;
            }
            alert(funcErrorMsg);
        }
    }
    return message;
}

export async function apiGet(path, credentialType = 'app') {
    return await callApiFunction('graphData', 'get', undefined, { path: path, credentialType: credentialType });
}

export async function apiPost(path, data, credentialType = 'app',) {
    return await callApiFunction('graphData', 'post', {
        credentialType: credentialType,
        data: data,
        path: path
    });
}

export async function apiPatch(path, data, credentialType = 'app',) {
    return await callApiFunction('graphData', 'patch', {
        credentialType: credentialType,
        data: data,
        path: path
    });
}

export async function apiDelete(path, credentialType = 'app') {
    return await callApiFunction('graphData', 'delete', {
        credentialType: credentialType,
        path: path
    });
}
