import React from "react";
import { UserInvite } from "./UserInvite";

var showFunction = Boolean(process.env.REACT_APP_FUNC_NAME);

export default function Tab() {
  return (
    <div>
      <UserInvite showFunction={showFunction} />
    </div>
  );
}
