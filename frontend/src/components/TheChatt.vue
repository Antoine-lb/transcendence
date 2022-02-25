<script lang="ts">
import { io } from "socket.io-client";
export default {
  name : "Chat",
  data() {
    return {
      title: 'Nestjs Websockets Chat',
      name: '',
      text: '',
      messages: [],
      socket: null
    };
  },
  methods: {
    sendMessage() {
      if(this.validateInput()) {
        const message = {
        name: this.name,
        text: this.text
      }
      console.log('send ' + message)
      this.socket.emit('msgToServer', message)
      this.text = ''
      }
    },
    receivedMessage(message) {
      console.log(message)
      this.messages.push('received ' + message)
    },
    validateInput() {
      return this.name.length > 0 && this.text.length > 0
    }
  },
  created() {
    console.log('create1')
    this.socket = io('http://localhost:3000')
    console.log(this.socket)
    this.socket.on('msgToClient', (message) => {
       console.log('create2 ' + message)
      this.receivedMessage(message)
      console.log('create3 ' + message)
    })
 }
};
</script>
<template>
    <div class="container">
            <div class="row">
                <div class="col-md-6 offset-md-3 col-sm-12">
                    <h1 class="text-center">{{ title }}</h1>
                    <br>
                    <div id="status"></div>
                    <div id="chat">
                        <input type="text" v-model="name" id="username" class="form-control" placeholder="Enter name...">
                        <br>
                        <div class="card">
                            <div id="messages" class="card-block">
                                <ul>
                                    <li v-for="message of messages">{{ message.name }}: {{ message.text }}</li>
                                </ul>
                            </div>
                        </div>
                        <br>
                        <textarea id="textarea" class="form-control" v-model="text" placeholder="Enter message..."></textarea>
                        <br>
                        <button id="send" class="btn" @click.prevent="sendMessage">Send</button>
                    </div>
                </div>
            </div>
    </div>
  
</template>

<style>
main {
  max-width: 500px;
  padding-top: 50px; /* Original 100px */
  margin: auto;
}
</style>
