// Modificación del código para ordenar los dispositivos Bluetooth por la intensidad de señal (dBm)
let device;
const UUIDs = {
    service: "a3c87500-8ed3-4bdf-8a39-a01bebede295",
    lectura: "a3c87506-8ed3-4bdf-8a39-a01bebede295",
    escritura: "a3c87507-8ed3-4bdf-8a39-a01bebede295",
    turnOffService: "e62a0001-1362-4f28-9327-f5b74e970801",
    turnOffReadWrite: "e62a0002-1362-4f28-9327-f5b74e970801",
    batteryService: "0000180f-0000-1000-8000-00805f9b34fb",
    batteryLevel: "00002a19-0000-1000-8000-00805f9b34fb"
};

async function connectToDevice() {
    document.getElementById('status-message').textContent = 'Buscando dispositivos...';
    try {
        const devices = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: 'BeaconX' }],
            optionalServices: [UUIDs.service, UUIDs.turnOffService, UUIDs.batteryService]
        });

        if (!devices) {
            document.getElementById('status-message').textContent = 'No se encontraron dispositivos.';
            return;
        }

        device = devices;
        console.log("Dispositivo encontrado:", device);

        const server = await device.gatt.connect();
        console.log("Conexión con GATT server exitosa.");

        document.getElementById('device-name').textContent = device.name;
        document.getElementById('device-info').style.display = 'block';

        const service = await server.getPrimaryService(UUIDs.service);
        console.log("Servicio principal obtenido:", UUIDs.service);

        document.getElementById('status-message').textContent = "Conexión Bluetooth exitosa";

        await procesarEstadoDispositivo(service);
        await obtenerNivelBateria(server);

        console.log("Conexión y configuración completadas");
        document.getElementById("disabledButton").disabled = false;

        device.addEventListener('gattserverdisconnected', reconnectDevice);
    } catch (error) {
        console.error('Error durante la configuración:', error);
        document.getElementById('status-message').textContent = 'Ocurrió un error durante la conexión. Por favor, inténtalo nuevamente.';

        if (error.message.includes("Bluetooth") || error.message.includes("bluetooth")) {
            alert("Bluetooth no disponible en este navegador. Cambia al navegador Google Chrome.");
            document.getElementById('status-message').textContent = "Error: Este navegador no soporta Bluetooth.";
        } else {
            document.getElementById('status-message').textContent = "Error en la Conexión Bluetooth";
        }
    }
}

async function procesarEstadoDispositivo(service) {
    try {
        const lecturaChar = await service.getCharacteristic(UUIDs.lectura);
        const estado = await lecturaChar.readValue();

        if (estado.byteLength === 0) {
            throw new RangeError("Lectura vacía: el dispositivo no devolvió datos válidos");
        }
        const estadoValor = estado.getUint8(0);

        console.log("Estado del dispositivo leído (HEX):", estadoValor.toString(16).padStart(2, '0'));

        switch (estadoValor) {
            case 0:
            case 1:
                document.getElementById('status-message').textContent = "Dispositivo Conectado.";
                break;
            case 2:
                document.getElementById('status-message').textContent = "Contraseña deshabilitada.";
                break;
            default:
                document.getElementById('status-message').textContent = "Estado desconocido.";
        }
    } catch (error) {
        console.error('Error al procesar el estado del dispositivo:', error);
        document.getElementById('status-message').textContent = 'Ocurrió un error al procesar el estado del dispositivo.';
    }
}

async function obtenerNivelBateria(server) {
    try {
        const batteryService = await server.getPrimaryService(UUIDs.batteryService);
        const batteryLevelChar = await batteryService.getCharacteristic(UUIDs.batteryLevel);
        const batteryLevel = await batteryLevelChar.readValue();
        const batteryPercentage = batteryLevel.getUint8(0);
        document.getElementById('battery-level').textContent = `${batteryPercentage}%`;
        console.log(`Nivel de batería: ${batteryPercentage}%`);
    } catch (error) {
        console.error('Error al leer el nivel de batería:', error);
        document.getElementById('battery-level').textContent = 'No disponible.';
    }
}

async function reconnectDevice() {
    try {
        console.log("Intentando reconectar al dispositivo...");
        if (device && device.gatt.connected === false) {
            await device.gatt.connect();
            console.log("Reconexión exitosa.");
            document.getElementById('status-message').textContent = "Reconexión Bluetooth exitosa.";
        }
    } catch (error) {
        console.error('Error al reconectar el dispositivo:', error);
        document.getElementById('status-message').textContent = 'Error al reconectar el dispositivo. Inténtalo nuevamente.';
    }
}

async function toggleApagadoReinicio() {
    try {
        const service = await device.gatt.getPrimaryService(UUIDs.turnOffService);
        const readWriteChar = await service.getCharacteristic(UUIDs.turnOffReadWrite);

        const apagadoCommand = new Uint8Array([0xea, 0x38, 0x00, 0x01, 0x00]);
        const reinicioCommand = new Uint8Array([0xea, 0x58, 0x00, 0x01, 0x00]);

        console.log("Enviando comando para desactivar apagado (HEX):", bufferToHex(apagadoCommand.buffer));
        await readWriteChar.writeValue(apagadoCommand);

        console.log("Enviando comando para desactivar reinicio (HEX):", bufferToHex(reinicioCommand.buffer));
        await readWriteChar.writeValue(reinicioCommand);

        document.getElementById('status-message').textContent = `Apagado y reinicio desactivados.`;

        setTimeout(() => {
            location.reload();
        }, 4000);

    } catch (error) {
        console.error('Error al enviar los comandos de apagado y reinicio:', error);
        document.getElementById('status-message').textContent = 'Ocurrió un error al intentar enviar los comandos de apagado y reinicio.';
    }
}

function bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

document.getElementById("connectButton").addEventListener("click", connectToDevice);
document.getElementById("disabledButton").addEventListener("click", toggleApagadoReinicio);
