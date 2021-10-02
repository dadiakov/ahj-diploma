/* eslint-disable linebreak-style */
const http = require('http');
const Koa = require('koa');
const cors = require('@koa/cors');
const koaBody = require('koa-body');
const WS = require('ws');
const { v4: uuidv4 } = require('uuid');

const app = new Koa();
app.use(cors());

app.use(koaBody({
  urlencoded: true,
  multipart: true,
  json: true,
}));

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback());
const wsServer = new WS.Server({ server });

const messages = [
{ id: uuidv4(), type: 'text', text: 'Some text1', time : getCurrentTime(), coords: '[50.85182, 60.56103]' },
{ id: uuidv4(), type: 'text', text: 'Som text2', time : getCurrentTime(), coords: '[50.85182, 60.56103]'  },
{ id: uuidv4(), type: 'text', text: 'So text3', time : getCurrentTime(), coords: '[50.85182, 60.56103]'  },
{ id: uuidv4(), type: 'text', text: 'S text4', time : getCurrentTime(), coords: '[50.85182, 60.56103]'  },
{ id: uuidv4(), type: 'text', text: 'Some tex5', time : getCurrentTime(), coords: '[50.85182, 60.56103]'  },
{ id: uuidv4(), type: 'text', text: 'Some te6', time : getCurrentTime(), coords: '[50.85182, 60.56103]'  },
{ id: uuidv4(), type: 'text', text: 'Some t7', time : getCurrentTime(), coords: '[50.85182, 60.56103]'  },
{ id: uuidv4(), type: 'text', text: 'Some 8', time : getCurrentTime(), coords: '[50.85182, 60.56103]'  },
{ id: uuidv4(), type: 'text', text: 'Some9', time : getCurrentTime(), coords: '[50.85182, 60.56103]'  },
{ id: uuidv4(), type: 'text', text: 'Some text10', time : getCurrentTime(), coords: '[50.85182, 60.56103]'  },
{ id: uuidv4(), type: 'text', text: 'Some text11', time : getCurrentTime(), coords: '[50.85182, 60.56103]'  },
{ id: uuidv4(), type: 'text', text: 'Some text12', time : getCurrentTime(), coords: '[50.85182, 60.56103]'  },
{ id: uuidv4(), type: 'text', text: 'Some text13', time : getCurrentTime(), coords: '[50.85182, 60.56103]'  },
{ id: uuidv4(), type: 'text', text: 'Some text14', time : getCurrentTime(), coords: '[50.85182, 60.56103]'  },
{ id: uuidv4(), type: 'text', text: 'Some text15', time : getCurrentTime(), coords: '[50.85182, 60.56103]'  },
{ id: uuidv4(), type: 'text', text: 'Some text16', time : getCurrentTime(), coords: '[50.85182, 60.56103]'  },
{ id: uuidv4(), type: 'text', text: 'Some text17', time : getCurrentTime(), coords: '[50.85182, 60.56103]'  },
{ id: uuidv4(), type: 'text', text: 'Some text18', time : getCurrentTime(), coords: '[50.85182, 60.56103]'  },
{ id: uuidv4(), type: 'text', text: 'Some text19', time : getCurrentTime(), coords: '[50.85182, 60.56103]'  },
{ id: uuidv4(), type: 'text', text: 'Some text20', time : getCurrentTime(), coords: '[50.85182, 60.56103]'  },
{ id: uuidv4(), type: 'text', text: 'Some text21', time : getCurrentTime(), coords: '[50.85182, 60.56103]'  },
{ id: uuidv4(), type: 'text', text: 'Some text22', time : getCurrentTime(), coords: '[50.85182, 60.56103]'  },
{ id: uuidv4(), type: 'text', text: 'Some text23', time : getCurrentTime(), coords: '[50.85182, 60.56103]'  },
{ id: uuidv4(), type: 'text', text: 'Some text24', time : getCurrentTime(), coords: '[50.85182, 60.56103]'  }
];

wsServer.on('connection', (ws) => {
console.log('server start')
  const errCallback = (e) => { console.log(e); };

  ws.on('message', (e) => {

    const incomeObj = JSON.parse(e);

    if (incomeObj.message && incomeObj.message === 'getData' && incomeObj.sortValue !== undefined) {
      const arrayOfMessages = getData(incomeObj.length, incomeObj.sortValue);
      ws.send(JSON.stringify({ array: arrayOfMessages, type: 'lazy' }), errCallback);
      return;
    }

    if (incomeObj.message && incomeObj.message === 'getData') {
      
      const arrayOfMessages = getData(incomeObj.length);
      ws.send(JSON.stringify({ array: arrayOfMessages, type: 'lazy' }), errCallback);
      return;
    }
     
        messages.push(incomeObj);

        Array.from(wsServer.clients)
          .filter(client => client.readyState === WS.OPEN)
          .forEach(client => client.send(e));
  });  
});

server.listen(port);

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

function getData(currentLength, sortValue) {
  let array = [];
  if (sortValue) {
    const re = new RegExp(sortValue, 'i');
    let sortedArray = messages.filter(e => re.exec(e.text));
    for (let i = sortedArray.length - currentLength - 1; i > sortedArray.length - currentLength - 11; i--) {
      array.push(sortedArray[i]); 
    }
    let cleanArray = array.filter(Boolean);
    return cleanArray;
  }
  for (let i = messages.length - currentLength - 1; i > messages.length - currentLength - 11; i--) {
    array.push(messages[i]); 
  }
  let cleanArray = array.filter(Boolean);
  return cleanArray;
}