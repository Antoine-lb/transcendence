import { defineStore } from "pinia";

export const useCounterStore = defineStore({
  id: "counter",
  state: () => ({
    counter: 1,
    user : {},
    isLog: false,
    id: undefined,
    name: undefined,
    isLoading: false,
    response: {},
  }),
  getters: {
    doubleCount: (state) => state.counter * 2,
  },
  actions: {
    increment() {
      this.counter++;
    },
    async isLogged() {
      // await const response = 
      this.isLoading = true;
      this.response = await fetch("/api/users/me");
      console.log(this.response);
      if (this.response.status == 200) {
        this.isLog = true;
        const userTmp = await this.response.json();
        // this.user = this.user.target;
        this.user = userTmp
        // console.log(this.user);
      }
      this.isLoading = false
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
