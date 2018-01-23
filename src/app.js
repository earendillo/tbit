let socket = io();

socket.on('fullData', function(data) {
    drawChart(data);
});

socket.on('data24h', function(data) {
    drawChart(data);
});

socket.on('data6h', function(data) {
    drawChart(data);
});

let buttonLast24h = document.getElementById('last24h');
// buttonLast6h.addEventListener('click', socket.emit('data-from-last-6h'), false);

function drawChart(data) {
    let y = data.map(function(item) {
        return item.y;
    });
    let t = data.map(function(item) {
        return item.t;
    });

    let ctx = document.getElementById('myChart').getContext('2d');
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
            }
        }
    });
}