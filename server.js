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

const messages = [{ id: uuidv4(), type: 'text', text: 'Some text', time : getCurrentTime() }];

wsServer.on('connection', (ws) => {

  const errCallback = (e) => { console.log(e); };

  ws.on('message', (e) => {

    if (e === 'allData') {

      ws.send(JSON.stringify({ messages }), errCallback);
      return;
    }

    // if (JSON.parse(e).type === 'simple-text' || JSON.parse(e).type === 'a-link') {
     
        messages.push(JSON.parse(e));

        Array.from(wsServer.clients)
          .filter(client => client.readyState === WS.OPEN)
          .forEach(client => client.send(e));
    
      
    //   return;
    // }


    // Array.from(wsServer.clients)
    //   .filter(client => client.readyState === WS.OPEN)
    //   .forEach(client => client.send(JSON.stringify({ message : e }), errCallback));

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