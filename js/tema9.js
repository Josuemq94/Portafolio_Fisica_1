const canvas = document.getElementById('graficaVoyager');
const status = document.getElementById('voyagerChartStatus');

if (typeof Chart === 'undefined') {
    status.hidden = false;
    status.textContent = 'No se pudo cargar Chart.js. Revise su conexión para mostrar esta gráfica.';
    throw new Error('Chart.js no está disponible para el Tema 9.');
}

const solarGravitationalParameter = 1.32712440042e20;
const samples = [
    { date: '08 jul 1979', event: 'Júpiter', color: '#2563eb', r: [-5.858936348e8, 5.372353148e8, 1.103338952e7], v: [-11.477796904, 3.539159720, -0.906367365] },
    { date: '09 jul 1979', event: 'Júpiter', color: '#2563eb', r: [-5.869705895e8, 5.376225223e8, 1.095204935e7], v: [-14.048651883, 5.641850044, -0.960460012] },
    { date: '10 jul 1979', event: 'Júpiter', color: '#2563eb', r: [-5.886080312e8, 5.381203025e8, 1.089618637e7], v: [-25.687511773, 2.234807955, 0.154524126] },
    { date: '11 jul 1979', event: 'Júpiter', color: '#2563eb', r: [-5.908294523e8, 5.377271207e8, 1.096987928e7], v: [-23.965203933, -8.314019221, 1.126670984] },

    { date: '24 ago 1981', event: 'Saturno', color: '#16a34a', r: [-1.403069793e9, -2.893519118e8, 6.080325047e7], v: [-10.012979001, -13.065270133, 0.673692311] },
    { date: '25 ago 1981', event: 'Saturno', color: '#16a34a', r: [-1.403963388e9, -2.904949576e8, 6.086268836e7], v: [-10.811606396, -13.482061090, 0.707594170] },
    { date: '26 ago 1981', event: 'Saturno', color: '#16a34a', r: [-1.405023008e9, -2.917703630e8, 6.092764115e7], v: [-15.431721117, -19.773115507, 0.774451495] },
    { date: '27 ago 1981', event: 'Saturno', color: '#16a34a', r: [-1.405055682e9, -2.939777386e8, 6.090044767e7], v: [3.762285001, -22.742897982, -0.468630581] },
    { date: '28 ago 1981', event: 'Saturno', color: '#16a34a', r: [-1.404727779e9, -2.958736537e8, 6.086207942e7], v: [3.794145630, -21.431893914, -0.427041716] },

    { date: '22 ene 1986', event: 'Urano', color: '#d97706', r: [-5.505622786e8, -2.803592463e9, -3.200062481e6], v: [7.167370272, -16.446366552, -0.492132940] },
    { date: '23 ene 1986', event: 'Urano', color: '#d97706', r: [-5.499428339e8, -2.805015602e9, -3.242624480e6], v: [7.172546547, -16.505531503, -0.493219234] },
    { date: '24 ene 1986', event: 'Urano', color: '#d97706', r: [-5.493223589e8, -2.806448387e9, -3.285319711e6], v: [7.199927241, -16.717844369, -0.495141774] },
    { date: '25 ene 1986', event: 'Urano', color: '#d97706', r: [-5.485577644e8, -2.807944779e9, -3.301892844e6], v: [13.035485575, -16.024171413, 0.673581524] },
    { date: '26 ene 1986', event: 'Urano', color: '#d97706', r: [-5.474415330e8, -2.809277174e9, -3.243901535e6], v: [12.857674660, -15.208953799, 0.666248343] },

    { date: '23 ago 1989', event: 'Neptuno', color: '#7c3aed', r: [8.952348004e8, -4.426598856e9, 7.044483399e7], v: [12.805142679, -13.968604414, 0.653626854] },
    { date: '24 ago 1989', event: 'Neptuno', color: '#7c3aed', r: [8.963427376e8, -4.427808948e9, 7.050141777e7], v: [12.850515517, -14.061366408, 0.656591167] },
    { date: '25 ago 1989', event: 'Neptuno', color: '#7c3aed', r: [8.974627250e8, -4.429044616e9, 7.055801469e7], v: [13.335593201, -15.146025941, 0.609679194] },
    { date: '26 ago 1989', event: 'Neptuno', color: '#7c3aed', r: [8.980010440e8, -4.430144671e9, 6.964963982e7], v: [4.615935485, -11.070855132, -12.067337131] },
    { date: '27 ago 1989', event: 'Neptuno', color: '#7c3aed', r: [8.984000559e8, -4.431094546e9, 6.861320118e7], v: [4.619768325, -10.947825556, -11.952604156] }
];

const labels = [];
const voyagerSpeeds = [];
const solarEscapeSpeeds = [];
const sampleMetadata = [];
let previousEvent = null;

samples.forEach(sample => {
    if (previousEvent && sample.event !== previousEvent) {
        labels.push('');
        voyagerSpeeds.push(null);
        solarEscapeSpeeds.push(null);
        sampleMetadata.push(null);
    }

    const distanceFromSun = Math.hypot(...sample.r) * 1000;
    const heliocentricSpeed = Math.hypot(...sample.v) * 1000;
    labels.push(sample.date);
    voyagerSpeeds.push(Math.round(heliocentricSpeed));
    solarEscapeSpeeds.push(Math.round(Math.sqrt(2 * solarGravitationalParameter / distanceFromSun)));
    sampleMetadata.push(sample);
    previousEvent = sample.event;
});

new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
        labels,
        datasets: [
            {
                label: 'Voyager 2: rapidez heliocéntrica',
                data: voyagerSpeeds,
                borderColor: '#1d4ed8',
                backgroundColor: '#1d4ed8',
                pointBackgroundColor: context => sampleMetadata[context.dataIndex]?.color || '#1d4ed8',
                pointRadius: 4,
                spanGaps: false,
                tension: 0.12
            },
            {
                label: 'Escape solar local: v_esc',
                data: solarEscapeSpeeds,
                borderColor: '#dc2626',
                backgroundColor: '#dc2626',
                borderDash: [6, 5],
                pointRadius: 2,
                spanGaps: false,
                tension: 0
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            tooltip: {
                callbacks: {
                    title: items => {
                        const sample = sampleMetadata[items[0]?.dataIndex];
                        return sample ? `${sample.event} · ${sample.date}` : '';
                    },
                    label: item => `${item.dataset.label}: ${item.parsed.y.toLocaleString('es')} m/s`
                }
            },
            title: {
                display: true,
                text: 'Velocidades heliocéntricas y de escape (m/s)'
            }
        },
        scales: {
            x: {
                title: { display: true, text: 'Fecha de la efeméride (TDB)' },
                ticks: { maxRotation: 45, minRotation: 45 }
            },
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Rapidez heliocéntrica (m/s)' }
            }
        }
    }
});
