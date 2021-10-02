/* eslint-disable linebreak-style */
/* eslint-disable spaced-comment */
/* eslint-disable no-prototype-builtins */
/* eslint-disable max-len */
/* eslint-disable no-use-before-define */
/* eslint-disable consistent-return */
/* eslint-disable no-alert */
/* eslint-disable no-multi-assign */
/* eslint-disable no-shadow */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */

import { v4 as uuidv4 } from 'uuid';
import kitty from '../img/kitty.jpg';

class Chat {
  constructor(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    this.element = element;

    this.messageForm = this.element.querySelector('.message-form');
    this.inputTag = this.element.querySelector('.input-file-tag');
    this.inputTag.addEventListener('click', this.onClick.bind(this));
    this.fileInput = this.element.querySelector('.input-file');
    this.fileInput.addEventListener('input', this.onUpload.bind(this));
    this.element.addEventListener('dragover', this.onDragOver.bind(this));
    this.element.addEventListener('drop', this.onDragDrop.bind(this));
    this.messageForm.addEventListener('submit', this.sendMessage.bind(this));
    this.sendMessage = this.sendMessage.bind(this);
    this.renderData = this.renderData.bind(this);
    this.element.querySelector('.messages-content').addEventListener('scroll', this.watchElement.bind(this));
    this.successHandler = this.successHandler.bind(this);
    this.errorHandler = this.errorHandler.bind(this);
    this.addCoords = this.addCoords.bind(this);
    this.addNotificaition = this.addNotificaition.bind(this);
    this.sortInput = this.element.querySelector('.sort-input');
    this.sortInput.addEventListener('input', this.getSorted.bind(this));
    this.addCoords();
    this.addNotificaition();
  }

  sendMessage(e) {
    e.preventDefault();
    const { value } = this.element.querySelector('.message-input');
    const time = getCurrentTime();
    const id = uuidv4();

    const data = {
      id, type: 'text', text: value, time, coords: this.coords,
    };

    if (value.match(/https?:\/\/[^\s]+/gm)) {
      data.type = 'link';
    }
    ws.send(JSON.stringify(data));
    this.element.querySelector('.message-input').value = '';
  }

  renderMessage(message, type = 'none') {
    const outerDiv = document.createElement('div');
    outerDiv.className = 'message-item my-message';
    const timeDiv = document.createElement('div');
    timeDiv.textContent = `${message.time}`;
    timeDiv.classList.add('time');
    outerDiv.appendChild(timeDiv);

    const coordsDiv = document.createElement('div');
    coordsDiv.textContent = `Координаты - ${message.coords}`;
    coordsDiv.classList.add('time');
    outerDiv.appendChild(coordsDiv);

    outerDiv.dataset.id = message.id;
    outerDiv.dataset.type = message.type;
    const textDiv = document.createElement('div');

    if (message.type === 'text') {
      textDiv.textContent = message.text;
      outerDiv.classList.add('text-message-back');
      outerDiv.appendChild(textDiv);
    }

    if (message.type === 'link') {
      const text = message.text.replace(/https?:\/\/[^\s]+/gm, (str) => `<a href='${str}' target='_blank'>${str}</a>`);
      textDiv.innerHTML = text;
      outerDiv.classList.add('text-message-back');
      outerDiv.appendChild(textDiv);
    }

    if (message.type === 'image') {
      const image = document.createElement('img');
      image.src = message.data;
      image.download = `${message.name}`;
      image.className = 'image';
      outerDiv.appendChild(image);

      const link = document.createElement('a');
      link.href = message.data;
      link.textContent = 'скачать';
      link.download = `${message.name}`;
      link.target = '_blank';
      link.className = 'download-link hide';
      outerDiv.appendChild(link);
      URL.revokeObjectURL(message.data);
    }
    if (message.type === 'video') {
      const video = document.createElement('video');
      video.src = message.data;
      video.download = `${message.name}`;
      video.rel = 'noopener';
      video.className = 'video';
      video.controls = true;
      outerDiv.appendChild(video);

      const link = document.createElement('a');
      link.href = message.data;
      link.textContent = 'скачать';
      link.download = `${message.name}`;
      link.target = '_blank';
      link.className = 'download-link hide';
      outerDiv.appendChild(link);

      video.addEventListener('canplay', () => {
        URL.revokeObjectURL(message.data);
      });
    }
    if (message.type === 'audio') {
      const audio = document.createElement('audio');
      audio.src = message.data;
      audio.download = `${message.name}`;
      audio.className = 'audio';
      audio.controls = true;
      outerDiv.appendChild(audio);

      const link = document.createElement('a');
      link.href = message.data;
      link.textContent = 'скачать';
      link.download = `${message.name}`;
      link.target = '_blank';
      link.className = 'download-link hide';
      outerDiv.appendChild(link);

      audio.addEventListener('canplay', () => {
        URL.revokeObjectURL(message.data);
      });
    }
    if (message.type === 'file') {
      const link = document.createElement('a');
      link.href = message.data;
      link.textContent = message.name;
      link.download = `${message.name}`;
      link.target = '_blank';
      outerDiv.classList.add('file-message-back');
      outerDiv.appendChild(link);
      URL.revokeObjectURL(message.data);
    }

    if (type === 'lazy') {
      document.querySelector('.messages-content').insertBefore(outerDiv, document.querySelector('.messages-content').firstElementChild);
    } else {
      document.querySelector('.messages-content').appendChild(outerDiv);
      document.querySelector('.messages-content').lastElementChild.scrollIntoView(false);
    }
  }

  renderData(length, sortValue = undefined) {
    ws.send(JSON.stringify({ message: 'getData', length, sortValue }));
  }

  onClick(e) {
    e.preventDefault();
    this.fileInput.dispatchEvent(new MouseEvent('click'));
  }

  onUpload(e) {
    const { target } = e;
    const file = target.files && target.files[0];
    const reader = new FileReader();
    let type = 'file';

    if (file.type.match(/image/)) {
      type = 'image';
    } else if (file.type.match(/video/)) {
      type = 'video';
    } else if (file.type.match(/audio/)) {
      type = 'audio';
    }
    reader.readAsDataURL(file);
    reader.addEventListener('load', (e) => {
      const data = {
        id: uuidv4(), type, time: getCurrentTime(), data: e.target.result, name: file.name, coords: this.coords,
      };
      ws.send(JSON.stringify(data));
    });
  }

  onDragOver(e) {
    e.preventDefault();
  }

  onDragDrop(e) {
    e.preventDefault();
    this.onUpload({ target: e.dataTransfer });
  }

  watchElement(e) {
    if (this.element.querySelectorAll('.message-item').length < 10) return;
    if (!this.element.querySelector('.messages-content').firstElementChild) return;
    if (this.element.querySelector('.messages-content').firstElementChild.getBoundingClientRect().top - this.element.querySelector('.messages-content').getBoundingClientRect().top > 21.3) {
      this.renderData(document.querySelectorAll('.message-item').length, this.sortInput.value);
    }
  }

  addCoords() {
    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.successHandler, this.errorHandler, geoOptions);
    }
  }

  successHandler(position) {
    const { latitude, longitude } = position.coords;
    this.coords = `[${latitude.toFixed(5)}, ${longitude.toFixed(5)}]`;
  }

  errorHandler(e) {
    if (e.code === 1) {
      console.log('Не удалось получить информацию о геолокации, поскольку у страницы не было разрешения на это.');
    } else if (e.code === 2) {
      console.log('Не удалось получить геолокацию, поскольку по крайней мере один внутренний источник позиции вернул внутреннюю ошибку.');
    } else if (e.code === 3) {
      console.log('Слижком долго получаем информацию...');
    }
  }

  addNotificaition() {
    (async () => {
      if (!window.Notification) {
        return;
      }
      if (Notification.permission === 'granted') {
        const notification = new Notification('Мысли котика', {
          body: 'Съесть бы сейчас большую сосиску',
          icon: kitty,
          requireInteractions: true,
        });
      }
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const notification = new Notification('Мысли котика', {
            body: 'Съесть бы сейчас большую сосиску',
            icon: kitty,
            requireInteractions: true,
          });
        }
      }
    })();
  }

  getSorted(e) {
    this.element.querySelector('.messages-content').innerHTML = '';
    if (this.sortInput.value === '') {
      this.element.querySelector('.messages-content').innerHTML = '';
      this.renderData(0);
      return;
    }
    this.renderData(document.querySelectorAll('.message-item').length, this.sortInput.value);
  }
}

function getCurrentTime() {
  const now = new Date();
  const year = now.getFullYear();
  let month = now.getMonth() + 1;
  if (month < 10) month = `${0}${month}`;
  const day = now.getDate();
  let hour = now.getHours();
  if (hour < 10) hour = `${0}${hour}`;
  let minutes = now.getMinutes();
  if (minutes < 10) minutes = `${0}${minutes}`;
  return `${day}.${month}.${year} ${hour}:${minutes}`;
}

const chat = new Chat('.container');

//const ws = new WebSocket('ws://localhost:7070//ws');
const ws = new WebSocket('wss://dadiakov-ahj-diploma.herokuapp.com//wss');

ws.addEventListener('open', () => {
  console.log('connected');
  chat.renderData(document.querySelectorAll('.message-item').length);
});

ws.addEventListener('message', (evt) => {
  const { data } = evt;

  const cleanData = JSON.parse(data);

  if (Array.isArray(cleanData.array)) {
    cleanData.array.forEach((e) => chat.renderMessage(e, 'lazy'));

    if (!document.querySelector('.messages-content').lastElementChild) return;

    if (document.querySelectorAll('.message-item').length <= 10) {
      document.querySelector('.messages-content').lastElementChild.scrollIntoView(false);
    }
    return;
  }

  chat.renderMessage(cleanData);
});

ws.addEventListener('close', (evt) => {
  console.log('connection closed', evt);
});

ws.addEventListener('error', () => {
  console.log('error');
});
