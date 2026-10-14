const status = document.getElementById('springChartStatus');

if (typeof Chart === 'undefined') {
    status.hidden = false;
    status.textContent = 'No se pudo cargar la gráfica. Revise su conexión e inténtelo de nuevo.';
    throw new Error('Chart.js no está disponible para mostrar la curva del resorte virtual.');
}

const spring = 8;
const displacements = Array.from({ length: 11 }, (_, index) => index * 0.005);

new Chart(document.getElementById('springChart').getContext('2d'), {
    type: 'line',
    data: {
        labels: displacements,
        datasets: [{
            label: 'Fuerza restauradora (N)',
            data: displacements.map(displacement => -spring * displacement),
            borderColor: '#0056b3',
            backgroundColor: 'rgba(0, 86, 179, 0.15)',
            fill: true,
            pointRadius: 3,
            tension: 0
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                title: { display: true, text: 'Desplazamiento x (m)' },
                ticks: {
                    callback: (value, index) => displacements[index].toFixed(3).replace('.', ',')
                }
            },
            y: { title: { display: true, text: 'Fuerza restauradora F (N)' } }
        }
    }
});
