import { defineStore } from "pinia";

export const useUserStore = defineStore({
  id: "user",
  
  state: () => ({
    _user : {},
    _isLog: false,
    _isLoading: false,
    _response: {},
  }),
  getters: {
    isLogged: (state) => state._isLog,
    isLoading: (state) => state._isLoading,
    user: (state) => state._user,
    avatarUrl: (state) => `http://localhost:3000${state._user.avatar}`,
  },
  actions: {
    async requestLogState() {
      this._isLoading = true;
      try {
        let tmp = await fetch("http://127.0.0.1:3000/api/auth/islog", {
          method: "GET",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache': 'no-cache'
          },
          credentials: 'include'
        })
        const userTmp = await tmp.json();
        console.log(userTmp)




        this._response = await fetch("http://127.0.0.1:3000/api/users/me", {
          method: "GET",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache': 'no-cache'
          },
          credentials: 'include'
        })
        if (this._response.status == 200) {
          this._isLog = true;
          const userTmp = await this._response.json();
          this._user = userTmp.user
          this._user.access_token = userTmp.access_token
          this._user.access_token_2fa = userTmp.access_token_2fa
        }      
      } catch (error) {
        console.error(error);
      }
      this._isLoading = false
    },
  },
});


