const wheelSpeed = document.getElementById('wheelSpeed');
const wheelSpeedValue = document.getElementById('wheelSpeedValue');
const satelliteResponse = document.getElementById('satelliteResponse');

const wheelInertia = 0.1;
const satelliteInertia = 100;

function updateAngularMomentum() {
    const speedRpm = Number(wheelSpeed.value);
    const wheelAngularSpeed = speedRpm * 2 * Math.PI / 60;
    const satelliteAngularSpeed = -(wheelInertia / satelliteInertia) * wheelAngularSpeed;

    wheelSpeedValue.value = speedRpm.toLocaleString('es');
    satelliteResponse.textContent =
        `Conservación de momento: ω_rueda = ${wheelAngularSpeed.toFixed(2)} rad/s; ` +
        `ω_sat = ${satelliteAngularSpeed.toFixed(3)} rad/s. El chasis gira en sentido opuesto.`;
}

wheelSpeed.addEventListener('input', updateAngularMomentum);
updateAngularMomentum();
