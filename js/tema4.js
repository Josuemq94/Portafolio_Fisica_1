const status = document.getElementById('tireChartStatus');

if (typeof Chart === 'undefined') {
    status.hidden = false;
    status.textContent = 'No se pudo cargar la gráfica. Revise su conexión e inténtelo de nuevo.';
    throw new Error('Chart.js no está disponible para mostrar el perfil de agarre.');
}

const ctx4 = document.getElementById('tireChart').getContext('2d');
const temps = [];
const grips = [];
for (let t = 40; t <= 140; t += 5) {
    temps.push(t);
    const grip = Math.max(0.4, 1.2 - 0.0003 * (t - 90) ** 2);
    grips.push(grip);
}
new Chart(ctx4, {
    type: 'line',
    data: { labels: temps, datasets: [{
        label: 'Coeficiente estático simplificado (μₛ)',
        data: grips, borderColor: 'orange', tension: 0.2, fill: true, backgroundColor: 'rgba(255, 165, 0, 0.2)'
    }]},
    options: {
    responsive: true,
    scales: {
        x: { title: { display: true, text: 'Temperatura (°C)' } },
        y: { title: { display: true, text: 'Coeficiente de fricción (sin unidades)' }, min: 0, max: 1.4 }
    }
    }
});