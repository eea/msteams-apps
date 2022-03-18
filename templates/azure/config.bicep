@secure()
param provisionParameters object
param provisionOutputs object
var simpleAuthCurrentAppSettings = list('${provisionOutputs.simpleAuthOutput.value.webAppResourceId}/config/appsettings', '2021-02-01').properties

module teamsFxSimpleAuthConfig './teamsFx/simpleAuth.bicep' = {
  name: 'addTeamsFxSimpleAuthConfiguration'
  params: {
    provisionParameters: provisionParameters
    provisionOutputs: provisionOutputs
    currentAppSettings: simpleAuthCurrentAppSettings
  }
}
// Get existing app settings and site config for merge
var functionCurrentConfigs = reference('${provisionOutputs.functionOutput.value.functionAppResourceId}/config/web', '2021-02-01')
var functionCurrentAppSettings = list('${provisionOutputs.functionOutput.value.functionAppResourceId}/config/appsettings', '2021-02-01').properties

// Merge TeamsFx configurations to Azure Functions resources
module teamsFxFunctionConfig './teamsFx/function.bicep' = {
  name: 'addTeamsFxFunctionConfiguration'
  params: {
    provisionParameters: provisionParameters
    provisionOutputs: provisionOutputs
    currentConfigs: functionCurrentConfigs
    currentAppSettings: functionCurrentAppSettings
  }
}