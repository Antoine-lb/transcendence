import { defineStore } from "pinia";

export const useCounterStore = defineStore({
  id: "counter",
  state: () => ({
    _user : {},
    _isLog: false,
    _twoFA: false,
    _id: undefined,
    _name: undefined,
    _isLoading: false,
    _response: {},
  }),
  getters: {
    twoFA: (state) => state._twoFA,
    isLogged: (state) => state._isLog,
  },
  actions: {
    async rqstLogState() {
      // await const response = 
      this._isLoading = true;
      this._response = await fetch("/api/users/me");
      console.log(this._response);
      if (this._response.status == 200) {
        this._isLog = true;
        const userTmp = await this._response.json();
        // this.user = this.user.target;
        this._user = userTmp
        // console.log(this.user);
      }
      this._isLoading = false
      // .then(function (response) {
        // console.log(response);
        // if (response.status == 200) {
          // response.json().then((data) => console.log(data));
          // useCounterStore().$state.isLog = true;
          // 
        // }
      // });
    }
  },
});
