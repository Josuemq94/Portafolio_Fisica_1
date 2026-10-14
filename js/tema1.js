const status = document.getElementById('dronChartStatus');

if (typeof Chart === 'undefined') {
    status.hidden = false;
    status.textContent = 'No se pudieron cargar las gráficas. Revise su conexión e inténtelo de nuevo.';
    throw new Error('Chart.js no está disponible para mostrar los perfiles del dron.');
}

const route = [
    { duration: 2, ax: 2, ay: 1 },
    { duration: 2, ax: 0, ay: -1 },
    { duration: 2, ax: -2, ay: 0 }
];

function stateAt(time) {
    let x = 0;
    let y = 0;
    let vx = 0;
    let vy = 0;
    let elapsed = 0;
    let ax = 0;
    let ay = 0;

    for (const segment of route) {
        const duration = Math.max(0, Math.min(time - elapsed, segment.duration));
        x += vx * duration + 0.5 * segment.ax * duration ** 2;
        y += vy * duration + 0.5 * segment.ay * duration ** 2;
        vx += segment.ax * duration;
        vy += segment.ay * duration;

        if (time < elapsed + segment.duration) {
            ax = segment.ax;
            ay = segment.ay;
            break;
        }
        elapsed += segment.duration;
    }

    return { x, y, vx, vy, ax, ay };
}

const times = Array.from({ length: 25 }, (_, index) => index * 0.25);
const states = times.map(stateAt);
const timeAxis = { title: { display: true, text: 'Tiempo (s)' } };

function makeProfile(canvasId, yTitle, series) {
    return new Chart(document.getElementById(canvasId).getContext('2d'), {
        type: 'line',
        data: {
            labels: times,
            datasets: series.map(item => ({
                label: item.label,
                data: states.map(state => state[item.key]),
                borderColor: item.color,
                backgroundColor: item.color,
                pointRadius: 0,
                borderWidth: 2,
                stepped: item.stepped || false,
                tension: 0
            }))
        },
        options: {
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: timeAxis,
                y: { title: { display: true, text: yTitle } }
            }
        }
    });
}

makeProfile('dronChart', 'Posición (m)', [
    { label: 'x', key: 'x', color: '#0056b3' },
    { label: 'y', key: 'y', color: '#7b2cbf' }
]);
makeProfile('dronVelocityChart', 'Velocidad (m/s)', [
    { label: 'vₓ', key: 'vx', color: '#087f23' },
    { label: 'vᵧ', key: 'vy', color: '#008c95' }
]);
makeProfile('dronAccelerationChart', 'Aceleración (m/s²)', [
    { label: 'aₓ', key: 'ax', color: '#c62828', stepped: true },
    { label: 'aᵧ', key: 'ay', color: '#ef6c00', stepped: true }
]);