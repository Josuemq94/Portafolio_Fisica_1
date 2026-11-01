const canvas = document.getElementById('graficaRegen');
const status = document.getElementById('regenChartStatus');

if (typeof Chart === 'undefined') {
    status.hidden = false;
    status.textContent = 'No se pudo cargar Chart.js. Revise su conexión para mostrar esta gráfica.';
    throw new Error('Chart.js no está disponible para el Tema 6.');
}

const mass = 1800;
const regenerationEfficiency = 0.70;
const mphToMetersPerSecond = 0.44704;
const driveCycle = [
    { time: 115, speedMph: 31.7 },
    { time: 116, speedMph: 28.6 },
    { time: 117, speedMph: 25.3 },
    { time: 118, speedMph: 22.0 },
    { time: 119, speedMph: 18.7 },
    { time: 120, speedMph: 15.4 },
    { time: 121, speedMph: 12.1 },
    { time: 122, speedMph: 8.8 },
    { time: 123, speedMph: 5.5 },
    { time: 124, speedMph: 2.2 },
    { time: 125, speedMph: 0 }
];
const times = driveCycle.map(sample => sample.time);
const initialSpeed = driveCycle[0].speedMph * mphToMetersPerSecond;
const initialEnergy = 0.5 * mass * initialSpeed ** 2 / 1000;
let recoveredEnergy = 0;
let dissipatedEnergy = 0;
let previousKineticEnergy = initialEnergy;

const kineticEnergy = [];
const recovered = [];
const dissipated = [];

times.forEach((time, index) => {
    const speed = driveCycle[index].speedMph * mphToMetersPerSecond;
    const currentKineticEnergy = 0.5 * mass * speed ** 2 / 1000;

    if (index > 0) {
        const removedEnergy = previousKineticEnergy - currentKineticEnergy;
        recoveredEnergy += removedEnergy * regenerationEfficiency;
        dissipatedEnergy += removedEnergy * (1 - regenerationEfficiency);
    }

    kineticEnergy.push(Number(currentKineticEnergy.toFixed(2)));
    recovered.push(Number(recoveredEnergy.toFixed(2)));
    dissipated.push(Number(dissipatedEnergy.toFixed(2)));
    previousKineticEnergy = currentKineticEnergy;
});

new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
        labels: times,
        datasets: [
            {
                label: 'Energía cinética K (kJ)',
                data: kineticEnergy,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.12)',
                fill: true,
                tension: 0.15
            },
            {
                label: 'Energía recuperada E_rec (kJ)',
                data: recovered,
                borderColor: '#16a34a',
                backgroundColor: 'rgba(22, 163, 74, 0.10)',
                fill: true,
                tension: 0.15
            },
            {
                label: 'Energía disipada E_dis (kJ)',
                data: dissipated,
                borderColor: '#dc2626',
                backgroundColor: 'rgba(220, 38, 38, 0.10)',
                fill: true,
                tension: 0.15
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            title: {
                display: true,
                text: `Balance de energía (kJ) · K inicial = ${initialEnergy.toFixed(1)} kJ`
            },
            tooltip: {
                callbacks: {
                    title: items => `EPA UDDS · t = ${items[0].label} s`,
                    label: item => `${item.dataset.label}: ${item.parsed.y.toFixed(2).replace('.', ',')} kJ`
                }
            }
        },
        scales: {
            x: {
                title: { display: true, text: 'Tiempo en el ciclo EPA UDDS (s)' }
            },
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Energía (kJ; 1 kJ = 1 000 J)' }
            }
        }
    }
});
