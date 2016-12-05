var socket = io.connect();


   
 $(document).ready(function(){
     
     socket.on('make', function(data){
         $('#error').html('');
         $('#list').html('');
        makeChartHappen(data.names, data.data); 
        data.data.forEach(function(a){
            $('#list').append('<div class="ticker">' + a.name + '</div>')
        });
         
     });
     
     
     $('#enter').on('click',function(){
         
        var ticker = $('#input').val();
        ticker = ticker.toUpperCase();
        
        socket.emit('newTicker', ticker);
         
     });
     
     socket.on('tickerError', function(){
         $('#error').html('Invalid ticker!');
     });
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
var makeChartHappen = function(ticker,series){
$(function () {
    var seriesOptions = series,
        names = ticker;
        createChart();

   
    function createChart() {

        Highcharts.stockChart('chart', {
            
            credits: {
            enabled: false
        },

            rangeSelector: {
                selected: 4
            },


            plotOptions: {
                series: {
                    showInNavigator: false
                }
            },

            tooltip: {
                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> <br/>',
                valueDecimals: 2,
                split: true
            },
            navigator: {
                enabled: false
            },

            series: seriesOptions
        });
    }

   
});

};     
 });
    