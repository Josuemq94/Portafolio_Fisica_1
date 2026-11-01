const canvas = document.getElementById('canvasRebote');
const context = canvas.getContext('2d');
const slider = document.getElementById('sliderE');
const restitutionOutput = document.getElementById('valE');
const bounceDescription = document.getElementById('estadoRebote');
const resetButton = document.getElementById('btnReset');
const status = document.getElementById('bounceStatus');

if (!context) {
    status.hidden = false;
    status.textContent = 'El navegador no pudo iniciar el lienzo de la simulación.';
    throw new Error('No se pudo crear el contexto Canvas 2D del Tema 7.');
}

const gravity = 9.81;
const radius = 0.28;
const ballMass = 1;
let width = 900;
let height = 420;
let scale = 50;
let ball;
let trail = [];
let impactEnergies = [];
let lastFrame = performance.now();

function describeRestitution(value) {
    if (value === 0) {
        bounceDescription.textContent = 'e = 0: choque perfectamente inelástico; no hay rebote.';
    } else if (value < 0.4) {
        bounceDescription.textContent = 'Rebote poco elástico: gran parte de la energía se disipa.';
    } else if (value < 0.85) {
        bounceDescription.textContent = 'Rebote intermedio: conserva una fracción e² de la energía cinética.';
    } else {
        bounceDescription.textContent = 'Rebote casi elástico: conserva la mayor parte de la energía.';
    }
}

function resizeCanvas() {
    const bounds = canvas.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio || 1;
    width = bounds.width;
    height = width * 420 / 900;
    scale = height / 8.4;
    canvas.style.height = `${height}px`;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    draw();
}

function resetBall() {
    ball = {
        x: 1.1,
        y: 0.9,
        vx: 2,
        vy: 0,
        rebounds: 0,
        trailTimer: 0,
        resting: false
    };
    trail = [];
    impactEnergies = [];
    lastFrame = performance.now();
}

function stepSimulation(deltaTime) {
    const floor = height / scale - 0.35;
    const wall = width / scale;
    const step = 1 / 120;
    let remaining = deltaTime;

    while (remaining > 0 && !ball.resting) {
        const interval = Math.min(step, remaining);
        ball.vy += gravity * interval;
        ball.x += ball.vx * interval;
        ball.y += ball.vy * interval;
        ball.trailTimer += interval;

        if (ball.x + radius > wall) {
            ball.x = wall - radius;
            ball.vx = -Math.abs(ball.vx);
        } else if (ball.x - radius < 0) {
            ball.x = radius;
            ball.vx = Math.abs(ball.vx);
        }

        if (ball.y + radius >= floor) {
            ball.y = floor - radius;
            const restitution = Number(slider.value);
            const impactSpeed = Math.abs(ball.vy);
            const preImpactEnergy = 0.5 * ballMass * impactSpeed ** 2;
            const isResting = impactSpeed < 0.28 || restitution === 0;
            const reboundSpeed = isResting ? 0 : impactSpeed * restitution;
            const postImpactEnergy = 0.5 * ballMass * reboundSpeed ** 2;

            impactEnergies.push({
                impact: ball.rebounds + 1,
                lost: preImpactEnergy - postImpactEnergy
            });
            if (impactEnergies.length > 8) impactEnergies.shift();

            if (isResting) {
                ball.vy = 0;
                ball.vx = 0;
                ball.resting = true;
            } else {
                ball.vy = -reboundSpeed;
                ball.rebounds += 1;
            }
        }

        if (ball.trailTimer > 0.04) {
            trail.push({ x: ball.x, y: ball.y });
            ball.trailTimer = 0;
            if (trail.length > 240) trail.shift();
        }
        remaining -= interval;
    }
}

function draw() {
    if (!ball) return;

    const floor = height - 0.35 * scale;
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#e2e8f0';
    context.fillRect(0, floor, width, height - floor);
    context.strokeStyle = '#334155';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, floor);
    context.lineTo(width, floor);
    context.stroke();

    if (trail.length > 1) {
        context.beginPath();
        context.setLineDash([5, 5]);
        context.strokeStyle = '#94a3b8';
        trail.forEach((point, index) => {
            const x = point.x * scale;
            const y = point.y * scale;
            if (index === 0) context.moveTo(x, y);
            else context.lineTo(x, y);
        });
        context.stroke();
        context.setLineDash([]);
    }

    context.beginPath();
    context.arc(ball.x * scale, ball.y * scale, radius * scale, 0, 2 * Math.PI);
    context.fillStyle = '#ea580c';
    context.fill();
    context.strokeStyle = '#9a3412';
    context.lineWidth = 2;
    context.stroke();

    const restitution = Number(slider.value);
    const retainedEnergy = restitution ** 2 * 100;
    context.fillStyle = '#0f172a';
    context.font = '14px Segoe UI, sans-serif';
    context.fillText(
        `Rebotes: ${ball.rebounds} · K conservada por impacto: ${retainedEnergy.toFixed(0)} % (= e²) · v_y: ${ball.vy.toFixed(2)} m/s`,
        14,
        24
    );

    const panelWidth = Math.min(300, width - 28);
    const panelHeight = Math.min(132, height * 0.48);
    const panelX = width - panelWidth - 14;
    const panelY = 42;
    context.fillStyle = 'rgba(255, 255, 255, 0.94)';
    context.fillRect(panelX, panelY, panelWidth, panelHeight);
    context.strokeStyle = '#cbd5e1';
    context.strokeRect(panelX, panelY, panelWidth, panelHeight);
    context.fillStyle = '#0f172a';
    context.font = '12px Segoe UI, sans-serif';
    context.fillText('K_y disipada en cada impacto (J)', panelX + 8, panelY + 16);

    if (impactEnergies.length > 0) {
        const chartTop = panelY + 25;
        const chartBottom = panelY + panelHeight - 22;
        const chartHeight = Math.max(12, chartBottom - chartTop);
        const maxEnergy = Math.max(...impactEnergies.map(entry => entry.lost), 0.01);
        const slotWidth = (panelWidth - 16) / impactEnergies.length;
        impactEnergies.forEach((entry, index) => {
            const barHeight = Math.max(2, entry.lost / maxEnergy * chartHeight);
            const barX = panelX + 8 + index * slotWidth;
            context.fillStyle = '#dc2626';
            context.fillRect(barX + slotWidth * 0.15, chartBottom - barHeight, slotWidth * 0.7, barHeight);
            context.fillStyle = '#334155';
            context.font = '10px Segoe UI, sans-serif';
            context.fillText(`${entry.lost.toFixed(1)}`, barX, panelY + panelHeight - 7);
        });
    } else {
        context.fillStyle = '#475569';
        context.fillText('El historial aparece tras el primer impacto.', panelX + 8, panelY + 52);
    }
}

function animate(now) {
    const deltaTime = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;
    stepSimulation(deltaTime);
    draw();
    window.requestAnimationFrame(animate);
}

slider.addEventListener('input', () => {
    restitutionOutput.value = Number(slider.value).toFixed(2).replace('.', ',');
    describeRestitution(Number(slider.value));
    resetBall();
});

resetButton.addEventListener('click', resetBall);
window.addEventListener('resize', resizeCanvas);
restitutionOutput.value = Number(slider.value).toFixed(2).replace('.', ',');
describeRestitution(Number(slider.value));
resizeCanvas();
resetBall();
window.requestAnimationFrame(animate);
