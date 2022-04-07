import { React, useState, useEffect } from "react";
import { getMe } from "../data/provider";
import { UserList } from "./UserList";
import { Backdrop, CircularProgress } from "@mui/material";

var showFunction = Boolean(process.env.REACT_APP_FUNC_NAME);

export default function Tab() {
  const [userInfo, setUserInfo] = useState({
    isAdmin: false,
    isNFP: false,
    isGuest: true,
    country: '',
    isLoaded: false
  }),
    [loading, setloading] = useState(false);
  useEffect(() => {
    (async () => {
      setloading(true);
      let me = await getMe();
      setUserInfo({
        isAdmin: me.isAdmin,
        isNFP: me.isNFP,
        isGuest: me.isGuest,
        country: me.country,
        isLoaded: true,
      });
      setloading(false);
    })();
  }, []);

  return (
    <div>
      <Backdrop
        sx={{ color: '#6b32a8', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      {userInfo.isLoaded && !userInfo.isGuest && <UserList showFunction={showFunction} userInfo={userInfo} />}
    </div>
  );
}
