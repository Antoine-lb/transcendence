import { defineStore } from "pinia";
import { io } from "socket.io-client";

export const useUserStore = defineStore({
  id: "user",

  state: () => ({
    _user: {},
    // _isLog: false,
    _isFullyLogged: false,
    _isHalfLogged: false,
    _isLoading: false,
    _response: {},
    _socket: {},
  }),
  getters: {
    // isLogged: (state) => state._isLog,
    isFullyLogged: (state) => state._isFullyLogged,
    isHalfLogged: (state) => state._isHalfLogged,
    isLoading: (state) => state._isLoading,
    user: (state) => state._user,
    socket: (state) => state._socket,
    avatarUrl: (state) => `http://localhost:3000${state._user.avatar}`,
  },
  actions: {
    async requestLogState() {
      this._isLoading = true;
      try {
        let tmp = await fetch("http://127.0.0.1:3000/api/auth/islog", {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Cache: "no-cache",
          },
          credentials: "include",
        });
        const userLogged = await tmp.json();
        // ("userLogged : ", userLogged);
        
        this._response = await fetch("http://127.0.0.1:3000/api/users/me", {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Cache: "no-cache",
          },
          credentials: "include",
        });
        if (this._response.status == 200) {
          // this._isLog = true;
          const userTmp = await this._response.json();
          if (userLogged.logged && !userTmp.user.isTwoFA ||
              userLogged.logged && userLogged.logged_2fa && userTmp.user.isTwoFA)
          {
            this._isFullyLogged = true;
            this._isHalfLogged = false;
          }
          else if (userLogged.logged && !userLogged.logged_2fa && userTmp.user.isTwoFA)
          {
            this._isHalfLogged = true;
            this._isFullyLogged = false;
          }
          else
          {
            this._isHalfLogged = false;
            this._isFullyLogged = false;            
          }
          this._user = userTmp.user;
          this._user.access_token = userTmp.access_token;
          this._user.access_token_2fa = userTmp.access_token_2fa;
          if (!this._socket?.connected) {
            this._socket = await io("http://127.0.0.1:3000", {
              extraHeaders: {
                Authorization: userTmp.access_token,
              },
            });
            this.socket.on("already_playing", () => alert("Already playing or in queue"));
            this.socket.on("is_disconnected", () => alert("Player not online"));

          }
        }
      } catch (error) {
        console.error(error);
      }
      this._isLoading = false;
    },
  },
});
