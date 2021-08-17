import Chat from './Chat';
import ChatMarkups from './ChatMarkups';

const container = document.querySelector('.container');
const chat = new Chat(new ChatMarkups(container));

chat.init();
