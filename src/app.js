let socket = io();

socket.on('fullData', function(data) {
    document.getElementById('fullData').parentNode.classList.add('show');
    document.getElementById('fromLast24h').parentNode.classList.remove('show');
    document.getElementById('fromLast6h').parentNode.classList.remove('show');
    drawChart(data, 'fullData');
});

socket.on('data24h', function(data) {
    document.getElementById('fullData').parentNode.classList.remove('show');
    document.getElementById('fromLast24h').parentNode.classList.add('show');
    document.getElementById('fromLast6h').parentNode.classList.remove('show');
    drawChart(data, 'fromLast24h');
});

socket.on('data6h', function(data) {
    document.getElementById('fullData').parentNode.classList.remove('show');
    document.getElementById('fromLast24h').parentNode.classList.remove('show');
    document.getElementById('fromLast6h').parentNode.classList.add('show');
    drawChart(data, 'fromLast6h');
});

function drawChart(data, elementId) {
    let y = data.map(function(item) {
        return item.y;
    });
    let t = data.map(function(item) {
        return item.t;
    });

    let ctx = document.getElementById(elementId).getContext('2d');
    let chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: t,
            datasets: [
                {
                    label: 'Bitcoiner100',
                    data: y
                }
            ]
        },
        options: {
            tooltips: {
                enabled: false
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        displayFormats: {
                            'millisecond': 'MMM DD HH:mm',
                            'second': 'MMM DD HH:mm',
                            'minute': 'MMM DD HH:mm',
                            'hour': 'MMM DD HH:mm',
                            'day': 'MMM DD HH:mm',
                            'week': 'MMM DD HH:mm',
                            'month': 'MMM DD HH:mm',
                            'quarter': 'MMM DD HH:mm',
                            'year': 'MMM DD HH:mm',
                        }
                      }
                }]
            },
            elements: { 
                point: { 
                  radius: 0
                }
            }
        },

    });
}