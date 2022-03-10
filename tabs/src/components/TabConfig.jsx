import React from "react";
import "./App.css";
import * as microsoftTeams from "@microsoft/teams-js";
import { Autocomplete, TextField } from "@mui/material";

/**
 * The 'Config' component is used to display your group tabs
 * user configuration options.  Here you will allow the user to
 * make their choices and once they are done you will need to validate
 * their choices and communicate that to Teams to enable the save button.
 */
class TabConfig extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTab: {},
      configuredTabs: [
        {
          suggestedDisplayName: "Create user",
          entityId: "Test",
          urlSuffix: "tab",
        },
        {
          suggestedDisplayName: "Edit user",
          entityId: "EditUser",
          urlSuffix: "edittab",

        }
      ],
    }
  }

  render() {
    // Initialize the Microsoft Teams SDK
    microsoftTeams.initialize();

    /**
     * When the user clicks "Save", save the url for your configured tab.
     * This allows for the addition of query string parameters based on
     * the settings selected by the user.
     */
    microsoftTeams.settings.registerOnSaveHandler((saveEvent) => {
      const baseUrl = `https://${window.location.hostname}:${window.location.port}`;
      const tab = this.state.selectedTab;
      if (tab)
        microsoftTeams.settings.setSettings({
          suggestedDisplayName: tab.suggestedDisplayName,
          entityId: tab.entityId,
          contentUrl: baseUrl + "/index.html#/" + tab.urlSuffix,
          websiteUrl: baseUrl + "/index.html#/" + tab.urlSuffix,
        });

      saveEvent.notifySuccess();
    });

    /**
     * After verifying that the settings for your tab are correctly
     * filled in by the user you need to set the state of the dialog
     * to be valid.  This will enable the save button in the configuration
     * dialog.
     */
    microsoftTeams.settings.setValidityState(this.state.selectedTab);

    return (
      <div>
        <h1>Tab Configuration</h1>
        <div>
          <Autocomplete
            disablePortal
            id="combo-box-tabs"
            defaultValue={
              this.state.configuredTabs[0]
            }
            options={this.state.configuredTabs}
            getOptionLabel={(option) => option.suggestedDisplayName}
            isOptionEqualToValue={(option, value) => option.entityId === value.entityId}
            onChange={(e, value) => {
              this.setState({ selectedTab: value });
            }}
            renderInput={(params) => <TextField required {...params} label="Tab" variant="standard" />}
          />
        </div>
      </div>
    );
  }
}

export default TabConfig;
