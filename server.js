
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


var symbols =  ['AAPL'];
var dataPoint;
var valid;



function validOrNot(a){
  
  
  valid = a;
}

function addTicker(ticker){
  symbols.push(ticker);
}

function removeTicker(ticker){
  var index = symbols.indexOf(ticker);
  symbols.splice(index,1);
}


io.on('connection', function(client){
  
  console.log("Client connected");
  client.emit('loading');
  
  function delay(req,res,next){
    addData(symbols);
    next();
  }
  
  client.emit('make', {names:symbols, data: dataPoint});
    
  
  
  

  
  client.on('newTicker', function(data){
    
    
    data = data.toString();
    console.log('ticker received: ' + data);
    
    var index = symbols.indexOf(data);
    
    if (index !== -1){
      client.emit('exist');
    }
    
    else{
    checkTicker(data);
    setTimeout(function(){
       
       if (valid){
         addTicker(data);
         addData(symbols);
         client.emit('loading');
         console.log('new array: ' + symbols);
         
         setTimeout(function(){
         client.emit('make', {names:symbols, data: dataPoint});
         client.broadcast.emit('make', {names:symbols, data: dataPoint}); 
           
         },1500 + (300*symbols.length));
         
       }
       
       else if (!valid) {
         console.log('Invalid ticker');
         client.emit('tickerError');
       }
       
       
       
      
    },300);
   
    }
    
    
 

   
  });
  
  client.on('remove', function(data){
    console.log("Removing : " + data);
    removeTicker(data);
    if (symbols.length > 0){
    addData(symbols);
    }
    else if(symbols.length == 0){
      dataPoint = [];
    }
    client.emit('loading');
    console.log("New array:" + symbols);
    
    setTimeout(function(){
         client.emit('make', {names:symbols, data: dataPoint});
         client.broadcast.emit('make', {names:symbols, data: dataPoint}); 
           
         },1500  + (500*symbols.length));
    
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
   dataPoint = data;
 }
 

  
});


  
};