/* eslint-disable no-param-reassign */
export default class ChatMarkups {
  constructor(container) {
    this.container = container;
  }

  static chatMarkup() {
    return `
      <ul class="chat-users"></ul>
      <div class="chat-messages"></div>
      <input class="chat-messages__input" disabled>
    `;
  }

  static messageMarkup(text, autor, timestamp) {
    let yourMessage;
    // eslint-disable-next-line no-unused-expressions
    autor === 'Вы'
      ? yourMessage = 'your-message'
      : yourMessage = '';
    return `
    <div class="chat-message ${yourMessage}">
      <p class="chat-message_header">${autor}, ${new Date(timestamp).toLocaleString()}</p>
      <p class="chat-message_body">${text}</p>
    </div>
    `;
  }

  static userMarkup(name) {
    return `
    <li class="chat-users__user">${name}</li>
    `;
  }

  static welcomeMarkup() {
    return `
    <form class="login-form modal">
      <input class="login-form__input">
      <button class="login-form__button button">Представиться</button>
    </form>
    `;
  }

  static nameTaken() {
    return `
    <p class="name-taken">Имя занято, используйте другое</p>
    `;
  }

  static lostConnectionMarkup() {
    return `
    <div class="lost-connection modal">
      <p class="lost-connection__info">Соединение потеряно</p>
      <button class="lost-connection__button button">Переподключиться</button>
    </div>
    `;
  }

  render() {
    this.container.insertAdjacentHTML('beforeend', this.constructor.chatMarkup());
  }

  welcome() {
    this.container.insertAdjacentHTML('beforeend', this.constructor.welcomeMarkup());
  }

  lostConnection() {
    this.container.insertAdjacentHTML('beforeend', this.constructor.lostConnectionMarkup());
  }
}
