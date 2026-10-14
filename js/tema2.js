const canvas = document.getElementById('jumpCanvas');
const ctx = canvas.getContext('2d');
const inpV = document.getElementById('inpV');
const inpG = document.getElementById('inpG');
const inpVx = document.getElementById('inpVx');
const valV = document.getElementById('valV');
const valG = document.getElementById('valG');
const valVx = document.getElementById('valVx');
const maxHeight = document.getElementById('maxHeight');
const flightTime = document.getElementById('flightTime');
const range = document.getElementById('range');
const chartStatus = document.getElementById('jumpChartStatus');

if (typeof Chart === 'undefined') {
    chartStatus.hidden = false;
    chartStatus.textContent = 'No se pudo cargar la gráfica interactiva. Revise su conexión e inténtelo de nuevo.';
    throw new Error('Chart.js no está disponible para mostrar la trayectoria del salto.');
}

const chart = new Chart(ctx, {
    type: 'scatter',
    data: {
        datasets: [{
            label: 'Trayectoria del salto',
            data: [],
            showLine: true,
            borderColor: '#c62828',
            backgroundColor: '#c62828',
            borderWidth: 3,
            pointRadius: 0,
            pointHoverRadius: 5,
            tension: 0
        }]
    },
    options: {
        responsive: true,
        animation: { duration: 180 },
        interaction: { mode: 'nearest', intersect: false },
        scales: {
            x: {
                type: 'linear',
                min: 0,
                title: { display: true, text: 'Distancia horizontal (m)' }
            },
            y: {
                type: 'linear',
                min: 0,
                title: { display: true, text: 'Altura (m)' }
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: item => {
                        const point = item.raw;
                        return `t = ${decimal(point.t)} s, x = ${decimal(point.x)} m, y = ${decimal(point.y)} m`;
                    }
                }
            }
        }
    }
});

function decimal(value) {
    return value.toFixed(2).replace('.', ',');
}

function updateTrajectory() {
    const v0y = parseFloat(inpV.value);
    const g = parseFloat(inpG.value);
    const v0x = parseFloat(inpVx.value);
    const totalTime = (2 * v0y) / g;
    const height = (v0y ** 2) / (2 * g);
    const horizontalRange = v0x * totalTime;

    valV.value = decimal(v0y);
    valG.value = decimal(g);
    valVx.value = decimal(v0x);
    maxHeight.textContent = decimal(height);
    flightTime.textContent = decimal(totalTime);
    range.textContent = decimal(horizontalRange);

    chart.data.datasets[0].data = Array.from({ length: 101 }, (_, index) => {
        const time = totalTime * index / 100;
        return {
            x: v0x * time,
            y: Math.max(0, v0y * time - 0.5 * g * time ** 2),
            t: time
        };
    });
    chart.options.scales.x.max = horizontalRange * 1.05;
    chart.options.scales.y.max = height * 1.12;
    chart.update();
}

inpV.addEventListener('input', updateTrajectory);
inpG.addEventListener('input', updateTrajectory);
inpVx.addEventListener('input', updateTrajectory);
updateTrajectory();