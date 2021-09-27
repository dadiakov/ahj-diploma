/* eslint-disable linebreak-style */
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

    this.messageForm.addEventListener('submit', this.sendMessage);
  }

  sendMessage(e) {
    e.preventDefault();
    const { value } = document.querySelector('.message-input');
    const time = getCurrentTime();
    const id = uuidv4();

    const data = {
      id, type: 'text', text: value, time,
    };

    if (value.match(/https?:\/\/[^\s]+/gm)) {
      data.type = 'link';
    }
    ws.send(JSON.stringify(data));
    document.querySelector('.message-input').value = '';
  }

  renderMessage(message) {
    const outerDiv = document.createElement('div');
    outerDiv.className = 'message-item my-message';
    const timeDiv = document.createElement('div');
    timeDiv.textContent = `${message.time}`;
    timeDiv.classList.add('time');
    outerDiv.appendChild(timeDiv);
    outerDiv.dataset.id = message.id;
    outerDiv.dataset.type = message.type;
    const textDiv = document.createElement('div');

    if (message.type === 'text') {
      textDiv.textContent = message.text;
      outerDiv.appendChild(textDiv);
    }

    if (message.type === 'link') {
      const text = message.text.replace(/https?:\/\/[^\s]+/gm, (str) => `<a href='${str}' target='_blank'>${str}</a>`);
      textDiv.innerHTML = text;
      outerDiv.appendChild(textDiv);
    }

    if (message.type === 'image') {
      const image = document.createElement('img');
      image.src = message.data;
      image.download = `${message.name}`;
      image.className = 'image';
      outerDiv.appendChild(image);
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
      outerDiv.appendChild(link);
      URL.revokeObjectURL(message.data);
    }

    document.querySelector('.messages-content').appendChild(outerDiv);
    outerDiv.scrollIntoView(false);
  }

  renderAllData() {
    ws.send('allData');
  }

  onClick(e) {
    e.preventDefault();
    this.fileInput.dispatchEvent(new MouseEvent('click'));
  }

  onUpload(e) {
    const { target } = e;
    const file = target.files && target.files[0];
    const reader = new FileReader();
    console.log(file);

    if (file.type.match(/image/)) {
      reader.readAsDataURL(file);
      reader.addEventListener('load', (e) => {
        const data = {
          id: uuidv4(), type: 'image', time: getCurrentTime(), data: e.target.result, name: file.name,
        };
        ws.send(JSON.stringify(data));
      });
    } else if (file.type.match(/video/)) {
      reader.readAsDataURL(file);
      reader.addEventListener('load', (e) => {
        const data = {
          id: uuidv4(), type: 'video', time: getCurrentTime(), data: e.target.result, name: file.name,
        };
        ws.send(JSON.stringify(data));
      });
    } else if (file.type.match(/audio/)) {
      reader.readAsDataURL(file);
      reader.addEventListener('load', (e) => {
        const data = {
          id: uuidv4(), type: 'audio', time: getCurrentTime(), data: e.target.result, name: file.name,
        };
        ws.send(JSON.stringify(data));
      });
    } else {
      reader.readAsDataURL(file);
      reader.addEventListener('load', (e) => {
        const data = {
          id: uuidv4(), type: 'file', time: getCurrentTime(), data: e.target.result, name: file.name,
        };
        ws.send(JSON.stringify(data));
      });
    }
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

const ws = new WebSocket('ws://localhost:7070//ws');

ws.addEventListener('open', () => {
  console.log('connected');
  chat.renderAllData();
});

ws.addEventListener('message', (evt) => {
  const { data } = evt;

  const cleanData = JSON.parse(data);

  if (Array.isArray(cleanData.messages)) {
    console.log(cleanData.messages);
    cleanData.messages.forEach((e) => chat.renderMessage(e));
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
