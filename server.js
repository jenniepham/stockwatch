
var http = require('http');

var socketio = require('socket.io');
var express = require('express');


var app = express();
var server = http.createServer(app);
var io = socketio(server);
app.use(express.static('client'));
var favicon  = require('serve-favicon');
app.use(favicon(__dirname + '/client/favicon.ico'));
var yahooFinance = require('yahoo-finance');

var symbols =  ['MSFT', 'AAPL'];
var dataPoint = [];
var valid;

function validOrNot(a){
  
  
  valid = a;
}

function addTicker(ticker){
  symbols.push(ticker);
}


io.on('connection', function(client){
  
  console.log("Client connected");
  var tickerData = addData(symbols);
  client.emit('make', {names:symbols, data: tickerData});
  console.log(tickerData);

  
  client.on('newTicker', function(data){
    
    
    data = data.toString();
    console.log('ticker received: ' + data);
    
    checkTicker(data);
    setTimeout(function(){
       
       if (valid){
         addTicker(data);
         console.log('new array: ' + symbols);
         client.emit('make', {names:symbols, data: addData(symbols)});
         client.broadcast.emit('make', {names:symbols, data: addData(symbols)});
       }
       
       else if (!valid) {
         console.log('Invalid ticker');
         client.emit('tickerError');
       }
       
       
       
      
    },100);
   
    
    
    
 

   
  });
  
  
  
});


app.get('/', function(request,response){
  
  response.sendFile(__dirname + "client/index.html");
  
});


server.listen(process.env.PORT, function(){
  console.log('Listening on port ' + process.env.PORT);
});

var checkTicker = function(tick){

var valid;

yahooFinance.historical({
  symbol: tick,
  from: '2012-01-01',
  to: '2012-03-03',
  period: 'd'
  // period: 'd'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only) 
}, function (err, quotes) {
  if (err){console.log(err);}
  
   valid = quotes.length;
  
  if (valid > 0){
    console.log('true');
    validOrNot(true);
  }

  else if (valid == 0){
console.log('false');
validOrNot(false);
  }
});

};



var addData = function(tick){
  
  var today = new Date().toISOString().slice(0,10);
  today = today.toString();
  
  yahooFinance.historical({
  symbols: tick,
  from: '2012-01-01',
  to: today,
  period: 'd'
  // period: 'd'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only) 
}, function (err, quotes) {
  if (err){console.log(err);}

 
 var data = [];
 
 for (var i = 0; i<tick.length; i++){
   
   var eachTicker = quotes[tick[i]];
   var daily = [];
   
   eachTicker.forEach(function(a){
     
     daily.push([Date.parse(a.date), a.close]);
     
   });
   
   data.push({name:tick[i], data:daily});
   return data;
 }
 

  
});


  
};