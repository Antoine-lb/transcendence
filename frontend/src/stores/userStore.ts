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
  },
  actions: {
    async requestLogState() {
      this._isLoading = true;
      try {
        this._response = await fetch("/api/users/me");
        if (this._response.status == 200) {
          this._isLog = true;
          const userTmp = await this._response.json();
          this._user = userTmp
          console.log(this._user);
        }      
      } catch (error) {
        console.error(error);
      }
      this._isLoading = false
    },
  },

});
