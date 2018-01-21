let socket = io();

socket.on('tbit-data', function(data) {
    let now = Date.now();

    let y = data.map(function(item) {
        return item.y;
    });
    let t = data.map(function(item) {
        return (now - item.t);
    });

    let ctx = document.getElementById('myChart').getContext('2d');
    let chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: t,
            datasets: [
                {
                    label: 'tbit',
                    data: y
                }
            ]
        },
        options: {}
    });
});