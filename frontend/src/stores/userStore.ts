import { defineStore } from "pinia";

function get_cookie(name){
  return document.cookie.split(';').some(c => {
      return c.trim().startsWith(name + '=');
  });
}

function delete_cookie( name, path, domain ) {
  if( get_cookie( name ) ) {
    document.cookie = name + "=" +
      ((path) ? ";path="+path:"")+
      ((domain)?";domain="+domain:"") +
      ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
  }
}

function delete_cookie1(name) {
  document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

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
      this._response = await fetch("/api/users/me");
      if (this._response.status == 200) {
        this._isLog = true;
        const userTmp = await this._response.json();
        this._user = userTmp
        console.log(this._user);
      }
      this._isLoading = false
    },

    async logout() {
      // this._isLog = false;
      // this._user = {};
      // delete_cookie1( "access_token" )
      document.cookie = 'COOKIE_NAME=access_token; Max-Age=0; path=/; domain=' + location.host;
      console.log("CALLED")
    }
  },

});
