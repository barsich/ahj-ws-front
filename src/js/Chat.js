/* eslint-disable class-methods-use-this */
import ChatMarkups from './ChatMarkups';

export default class Chat {
  constructor(markups) {
    this.markups = markups;
    // // localhost
    // this.host = 'ws://localhost:7070/ws';
    // heroku
    this.host = 'wss://ahj-ws-back.herokuapp.com/wss';

    this.user = null;

    this.usersBlock = null;
    this.chatBlock = null;
    this.messageInput = null;

    this.connect = this.connect.bind(this);
    this.loginRequest = this.loginRequest.bind(this);
    this.messageRequest = this.messageRequest.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.parseResponse = this.parseResponse.bind(this);
  }

  init() {
    this.markups.render();
    this.usersBlock = document.querySelector('.chat-users');
    this.chatBlock = document.querySelector('.chat-messages');
    this.messageInput = document.querySelector('.chat-messages__input');

    this.markups.welcome();
    this.usersBlock.style.filter = 'blur(5px)';
    this.chatBlock.style.filter = 'blur(5px)';
    this.messageInput.style.filter = 'blur(5px)';

    document.addEventListener('submit', this.loginRequest);
    this.messageInput.addEventListener('keyup', this.messageRequest);

    this.connect();

    // устанавливаем интервал на проверку наличия соединения
    setInterval(() => {
      if (this.ws.readyState === WebSocket.CLOSING || this.ws.readyState === WebSocket.CLOSED) {
        this.reconnect();
      }
    }, 5000);
  }

  connect() {
    this.ws = new WebSocket(this.host);
    this.ws.addEventListener('open', () => {
      console.log('connected');
    });

    this.ws.addEventListener('message', (event) => {
      const response = this.parseResponse(event);
      if (response.action === 'connection') {
        const { users, messages } = response;
        if (response.users.length !== 0) {
          this.renderUsers(users);
        }
        if (response.messages.length !== 0) {
          this.renderMessages(messages);
        }
      } else if (response.action === 'login') {
        if (response.status) {
          this.login(response.user);
        } else if (!document.querySelector('.name-taken')) {
          document
            .querySelector('.login-form')
            .insertAdjacentHTML('afterbegin', ChatMarkups.nameTaken());
        }
      } else if (response.action === 'message') {
        if (response.status) {
          this.sendMessage(response);
        }
      } else if (response.action === 'close') {
        console.log(response);
      }
    });

    this.ws.addEventListener('close', (event) => {
      console.log('connection closed', event);
    });

    this.ws.addEventListener('error', () => {
      console.error('error');
    });
  }

  loginRequest(event) {
    event.preventDefault();
    const modal = event.target.closest('.modal');
    const input = modal.querySelector('.login-form__input');
    const { value } = input;
    if (!value) {
      return;
    }
    this.sendRequest({ action: 'login', data: value });
  }

  messageRequest(event) {
    if (event.key !== 'Enter') {
      return;
    }
    const { value } = this.messageInput;
    if (!value) {
      return;
    }
    const data = { user: this.user, text: value };
    this.sendRequest({ action: 'message', data });
  }

  sendRequest(requestBody) {
    if (this.ws.readyState === WebSocket.CLOSING || this.ws.readyState === WebSocket.CLOSED) {
      this.reconnect();
    }
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(requestBody));
    }
  }

  parseResponse(event) {
    return JSON.parse(event.data);
  }

  login(user) {
    this.user = user;
    document.querySelector('.modal').remove();
    this.usersBlock.style.filter = '';
    this.chatBlock.style.filter = '';
    this.messageInput.style.filter = '';
    this.messageInput.disabled = false;
  }

  sendMessage(data) {
    const { user, text, date } = data.message;
    let messageBlock;
    // eslint-disable-next-line no-unused-expressions
    this.user === user
      ? (messageBlock = ChatMarkups.messageMarkup(text, 'Вы', date))
      : (messageBlock = ChatMarkups.messageMarkup(text, user, date));
    this.chatBlock.insertAdjacentHTML('beforeend', messageBlock);
    this.chatBlock.scrollTop = this.chatBlock.scrollHeight;
    this.messageInput.value = '';
  }

  reconnect() {
    if (document.querySelector('.lost-connection')) {
      return;
    }
    this.markups.lostConnection();
    this.usersBlock.style.filter = 'blur(5px)';
    this.chatBlock.style.filter = 'blur(5px)';
    this.messageInput.style.filter = 'blur(5px)';
    this.messageInput.disabled = true;
    document.querySelector('.lost-connection__button').addEventListener('click', () => {
      this.connect();
      document.querySelector('.lost-connection').remove();
      if (!document.querySelector('.modal')) {
        this.usersBlock.style.filter = '';
        this.chatBlock.style.filter = '';
        this.messageInput.style.filter = '';
        this.messageInput.disabled = false;
      }
    });
  }

  renderUsers(users) {
    if (users.length === 0) {
      return;
    }
    [...document.querySelectorAll('.chat-users__user')].forEach((item) => item.remove());

    users
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((user) => {
        let username = user.name;
        if (this.user === user.name) {
          username = 'Вы';
        }
        this.usersBlock.insertAdjacentHTML('beforeend', ChatMarkups.userMarkup(username));
      });
  }

  renderMessages(messages) {
    if (messages.length === 0 || this.chatBlock.children.length !== 0) {
      return;
    }
    messages.forEach((message) => {
      const { user, text, date } = message;
      this.chatBlock.insertAdjacentHTML('beforeend', ChatMarkups.messageMarkup(text, user, date));
      this.chatBlock.scrollTop = this.chatBlock.scrollHeight;
    });
  }
}
