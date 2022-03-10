import React from "react";
import { UserList } from "./UserList";

var showFunction = Boolean(process.env.REACT_APP_FUNC_NAME);

export default function EditTab() {
  return (
    <div>
      <UserList showFunction={showFunction} />
    </div>
  );
}
