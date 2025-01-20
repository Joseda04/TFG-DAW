/*********************************************************
 *  CONFIGURACIÓN MQTT
 *  Se utiliza un cliente MQTT que se conecta a través de WebSocket
 *********************************************************/
const client = mqtt.connect({
    host: 'mqtt.aviot.es',
    port: 9001,   // Puerto estándar para MQTT sobre WebSocket
    protocol: 'wss'
  });
  
  // Evento que indica conexión exitosa al broker
  client.on('connect', () => {
    console.log('Conectado exitosamente al broker MQTT');
  });
  
  // Evento que captura errores de conexión al broker
  client.on('error', (error) => {
    console.error('Error en la conexión MQTT:', error);
  });
  
  
  /*********************************************************
   *  VARIABLES GLOBALES PARA BLUETOOTH Y DATOS A CONFIGURAR
   *********************************************************/
  let device;         // Referencia al dispositivo Bluetooth
  let server;         // GATT Server del dispositivo seleccionado
  let service;        // Servicio GATT principal del dispositivo
  
  // Datos para Wifi y MQTT
  let ssid = '';
  let wifiPassword = '';
  let cliente = '';
  let localizacion = '';
  
  // Dirección MAC recibida (si se necesita)
  let MacAddressWIfi = '';
  let DirecciónMAC = '';
  
  // Constantes y UUIDs de servicio y características
  const serviceUUID          = '0000aa00-0000-1000-8000-00805f9b34fb';
  const wifiCharacteristicUUID  = '0000aa02-0000-1000-8000-00805f9b34fb';
  const mqttCharacteristicUUID  = '0000aa03-0000-1000-8000-00805f9b34fb';
  
  // Constantes para el Bluetooth y MQTT
  const passwdBluetooth = 'Moko4321';
  const mqttHost = 'mqtt.aviot.es';
  const mqttPort = 1883;
  
  // Topics MQTT
  const publishTopic  = 'home/ubiot/risk';
  const suscribeTopic = '/MK107/Jose/receive';
  
  
  /*********************************************************
   *  OBTENCIÓN DE ELEMENTOS DEL DOM
   *********************************************************/
  // Botones principales
  const setBluetoothBtn  = document.getElementById("set-password-btn");
  const despleganbleWifi = document.getElementById("set-wifi-btn");
  const saveBtn          = document.getElementById("save-btn");
  const setWifiBtn       = document.getElementById("set-wifi");
  const setLightBtn      = document.getElementById("set-light");
  const pasosMessage   = document.getElementById('pasos-message');
  const gifInfo        = document.getElementById('gif-info');
  const statusMessage  = document.getElementById('status-message');
  
  // Texto inicial de instrucciones en pantalla (Paso 1)
  pasosMessage.textContent = 
    'Paso 1 de 5: Asegúrese de que el dispositivo esté encendido y en modo configuración (indicador luminoso azul intermitente). Si es así, haga clic en el botón "Seleccionar Dispositivo Bluetooth".';
  gifInfo.src = 'img/azulBlink.gif';
  
  // Estado inicial de algunos botones (deshabilitados)
  despleganbleWifi.disabled = true;
  if (despleganbleWifi.disabled) {
    despleganbleWifi.style.backgroundColor = "#232227";
  }
  
  setWifiBtn.disabled = true;
  if (setWifiBtn.disabled) {
    setWifiBtn.style.backgroundColor = "#232227";
  }

  setLightBtn.disabled = true;
  if (setLightBtn.disabled) {
    setLightBtn.style.backgroundColor = "#232227";
  }
  
  
  /*********************************************************
   *  FUNCIONES DE APOYO PARA CONSTRUCCIÓN DE PAYLOAD
   *********************************************************/
  
  /**
   * buildPayload
   * Construye un payload para envío de datos tipo string.
   * @param {number} cmdID  - ID de comando.
   * @param {string} value  - Cadena a enviar al dispositivo.
   * @returns {Uint8Array}  - Array de bytes formateado.
   */
  function buildPayload(cmdID, value) {
    const header = [0xED];
    const flag   = [0x01];
    const cmd    = [cmdID];
    const length = [value.length];
    // Convierte 'value' a bytes (UTF-8)
    const data   = Array.from(new TextEncoder().encode(value));
    return new Uint8Array([...header, ...flag, ...cmd, ...length, ...data]);
  }
  
  /**
   * buildNumericPayload
   * Construye un payload para el envío de datos numéricos 
   * (por ejemplo, para configurar puertos).
   * @param {number} cmdID     - ID de comando.
   * @param {number} value     - Número a enviar.
   * @param {number} byteLength - Tamaño en bytes (2 o 4 típicamente).
   * @returns {Uint8Array}     - Array de bytes formateado.
   */
  function buildNumericPayload(cmdID, value, byteLength) {
    const header = [0xED];
    const flag   = [0x01];
    const cmd    = [cmdID];
    const length = [byteLength];
    const data   = new Uint8Array(byteLength);
    const view   = new DataView(data.buffer);
  
    if (byteLength === 2) {
      view.setUint16(0, value, false); // Big-endian
    } else if (byteLength === 4) {
      view.setUint32(0, value, false); // Big-endian
    } else {
      throw new Error('Unsupported byte length.');
    }
    return new Uint8Array([...header, ...flag, ...cmd, ...length, ...data]);
  }
  

  /*********************************************************
   *  EVENTO: SELECCIONAR DISPOSITIVO BLUETOOTH (PASO 1 → 2)
   *  Y CONFIGURAR LA CONTRASEÑA BLUETOOTH EN EL DISPOSITIVO
   *********************************************************/
  setBluetoothBtn.addEventListener('click', async () => {
    // Se intenta la conexión hasta 2 veces
    for (let i = 0; i < 2; i++) {
      try {
        // Si no hay un dispositivo seleccionado, se solicita al navegador
        if (!device) {
          device = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: 'MK107' }],   // Filtra dispositivos que inicien con 'MK107'
            optionalServices: [serviceUUID]       // Agrega el UUID del servicio requerido
          });
        }
  
        // Si el dispositivo está desconectado, nos conectamos
        if (!device.gatt.connected) {
          server  = await device.gatt.connect();
          service = await server.getPrimaryService(serviceUUID);
  
          // Mensajes de éxito
          const mensaje = "Conexión Bluetooth exitosa";
          console.log(mensaje);
          document.getElementById('status-message').textContent = mensaje;
  
          // Activar el botón de configuración Wi-Fi
          setBluetoothBtn.style.backgroundColor  = "#23ff71"; 
          despleganbleWifi.disabled              = false;
          despleganbleWifi.style.backgroundColor = "#007bff";
  
          // Actualizar instrucciones y GIF
          pasosMessage.textContent = 
            'Paso 2 de 5: Una vez que haga clic, el botón "Seleccionar Dispositivo Bluetooth" cambiará a color verde ' +
            'y el dispositivo mostrará un indicador azul fijo. En este momento, haga clic en el botón "Desplegable Configuración Wifi".';
          gifInfo.src = 'img/azulFijo.gif';
  
        } else {
          console.log("Ya estás conectado al dispositivo Bluetooth");
        }
  
        // Obtener la característica para enviar la contraseña Bluetooth (CMD ID: 0x01)
        const bluetoothCharacteristic = await service.getCharacteristic(serviceUUID);
        const bluetoothPayload        = buildPayload(0x01, passwdBluetooth);
        await bluetoothCharacteristic.writeValue(bluetoothPayload);
  
        // Si no hubo error, salimos del bucle
        break;
  
      } catch (error) {
        console.error('Error durante la configuración:', error);
        console.error(error.message);
        document.getElementById('status-message').textContent = `Error: ${error.message}`;
  
        // Verificar si la API de Bluetooth no está disponible
        if (error.message.includes("Bluetooth") || error.message.includes("bluetooth")) {
          alert("Bluetooth no disponible en este navegador. Cambia al navegador Google Chrome.");
          document.getElementById('status-message').textContent = 
            "Error: Este navegador no soporta Bluetooth.";
        } else {
          // Otros errores durante la conexión/configuración Bluetooth
          document.getElementById('status-message').textContent = 
            "Error en la Conexión Bluetooth";
        }
      }
    }
  });
  
    /*********************************************************
   *  EVENTO: MOSTRAR/OCULTAR FORMULARIO Wi-Fi (PASO 2 → 3)
   *********************************************************/
    despleganbleWifi.addEventListener('click', () => {
        pasosMessage.textContent = 
          'Paso 3 de 5: Introduzca los datos de su red Wi-Fi: el nombre de la red (SSID) y la contraseña. ' +
          'También, ingrese su nombre y la ubicación del dispositivo. Cuando haya completado estos campos, ' +
          'haga clic en el botón "Guardar Configuración".';
      
        const form = document.getElementById('wifiForm');
        form.style.display = (form.style.display === '' || form.style.display === 'none') 
          ? 'block' 
          : 'none';
      });

  /*********************************************************
   *  EVENTO: GUARDAR DATOS DE CONFIGURACIÓN (PASO 3 → 4)
   *  Toma los datos ingresados (SSID, password, etc.) y
   *  los prepara para el siguiente paso.
   *********************************************************/
  saveBtn.addEventListener("click", () => {
    // Recuperar valores de los inputs
    ssid          = document.getElementById("ssid").value;
    wifiPassword  = document.getElementById("wifi-password").value;
    cliente       = document.getElementById("cliente").value;
    localizacion  = document.getElementById("localizacion").value;
  
    // Actualizar instrucciones en pantalla
    pasosMessage.textContent = 
      'Paso 4 de 5: Para finalizar, haga clic en el botón "Configurar Datos de la Wifi" para completar el proceso de configuración.';
  
    // Validar que SSID y password no estén vacíos
    if (ssid && wifiPassword) {
      console.log("SSID:", ssid);
      console.log("Contraseña:", wifiPassword);
      console.log("Cliente:", cliente);
      console.log("Localización:", localizacion);
  
      alert(`Red ${ssid} Guardada con éxito. Pulse en "Configurar Datos de la Wifi" para enviar la configuración al dispositivo`);
      
      // Habilitar botón "Configurar Datos de la Wifi"
      despleganbleWifi.style.backgroundColor = "#23ff71";
      setWifiBtn.disabled = false;
      setWifiBtn.style.backgroundColor = "#007bff";
  
    } else {
      alert("Por favor, introduzca una red Wi-Fi y su contraseña.");
    }
  
    // Ocultar formulario
    document.getElementById("wifiForm").style.display = "none";
  });


  /*********************************************************
   *  EVENTO: CONFIGURAR RED WIFI Y PARÁMETROS MQTT (PASO 4 → 5)
   *********************************************************/
  setWifiBtn.addEventListener('click', async () => {
    try {
      /*****************************************
       * 1. Configurar SSID (CMD ID: 0x41)
       *****************************************/
      const ssidCharacteristic = await service.getCharacteristic(wifiCharacteristicUUID);
      const ssidPayload        = buildPayload(0x41, ssid);
      await ssidCharacteristic.writeValue(ssidPayload);
  
      /*****************************************
       * 2. Configurar Contraseña Wi-Fi (CMD ID: 0x42)
       *****************************************/
      const passwordCharacteristic = await service.getCharacteristic(wifiCharacteristicUUID);
      const passwordPayload        = buildPayload(0x42, wifiPassword);
      await passwordCharacteristic.writeValue(passwordPayload);
  
      /*****************************************
       * 3. Configurar Host MQTT (CMD ID: 0x20)
       *****************************************/
      const hostCharacteristic = await service.getCharacteristic(mqttCharacteristicUUID);
      const hostPayload        = buildPayload(0x20, mqttHost);
      await hostCharacteristic.writeValue(hostPayload);
  
      /*****************************************
       * 4. Configurar Puerto MQTT (CMD ID: 0x21)
       *****************************************/
      const portCharacteristic = await service.getCharacteristic(mqttCharacteristicUUID);
      const portPayload        = buildNumericPayload(0x21, mqttPort, 2);
      await portCharacteristic.writeValue(portPayload);
  
      /*****************************************
       * 5. Configurar Suscribe Topic (CMD ID: 0x28)
       *****************************************/
      const suscribeCharacteristic = await service.getCharacteristic(mqttCharacteristicUUID);
      const suscribePayload        = buildPayload(0x28, suscribeTopic);
      await suscribeCharacteristic.writeValue(suscribePayload);
  
      /*****************************************
       * 6. Configurar Publish Topic (CMD ID: 0x29)
       *****************************************/
      const publishCharacteristic = await service.getCharacteristic(mqttCharacteristicUUID);
      const publishPayload        = buildPayload(0x29, publishTopic);
      await publishCharacteristic.writeValue(publishPayload);
  
      /*****************************************
       * 7. Enviar Comando Final (CMD ID: 0x02)
       *****************************************/
      const connectNetworkCharacteristic = await service.getCharacteristic(mqttCharacteristicUUID);
      const connectNetworkPayload        = new Uint8Array([0xED, 0x01, 0x02, 0x00]);
      await connectNetworkCharacteristic.writeValue(connectNetworkPayload);
  
      // Mensajes de éxito
      statusMessage.textContent = 
        "Respuesta Recibida: Configuración Completada Correctamente, Compruebe que el dispositivo esté de Color Verde";
      setWifiBtn.style.backgroundColor = "#25d366";
      pasosMessage.textContent = 
        'Paso 5 de 5: Verifique que el dispositivo cambie su indicador luminoso a Verde fijo, lo que indica que la configuración se ha realizado con éxito.';
      gifInfo.src = 'img/azulVerde.gif';

      // Habilitar botón "Apagar Luz Led"
      setWifiBtn.style.backgroundColor = "#23ff71";
      setLightBtn.disabled = false;
      setLightBtn.style.backgroundColor = "#007bff";
  
    } catch (error) {
      console.error('Error durante la configuración:', error);
      statusMessage.textContent = "Error en la Conexión Bluetooth";
    }
  });
  
  
  /*********************************************************
   *  EVENTO: APAGAR LUZ (setLightBtn)
   *  Publica un JSON al topic MQTT para apagar la luz.
   *********************************************************/
  setLightBtn.addEventListener('click', async () => {
    try {
      // Mensaje JSON que se publicará en el topic
      const message = {
        msg_id: 1011,
        device_info: { mac: "409151b9c3cc" },
        data: {
          ble_adv_led: 0,
          ble_connected_led: 0,
          server_connecting_led: 0,
          server_connected_led: 0
        }
      };
      const jsonMessage = JSON.stringify(message);
  
      // Publicar en el topic de suscripción
      client.publish(suscribeTopic, jsonMessage, (error) => {
        if (error) {
          console.error('Error al publicar el mensaje:', error);
        } else {
          console.log('Mensaje publicado exitosamente al topic:', suscribeTopic);
        }
      });

      setLightBtn.style.backgroundColor = "#23ff71";
      statusMessage.textContent = "Luz Apagada Exitosamente";
  
    } catch (error) {
      console.error('Error durante el apagado de Luz:', error);
      statusMessage.textContent = "Error al Apagar la Luz";
    }
  });
  
  
  /*********************************************************
   *  NOTA FINAL
   *  - Se ha mantenido parte del código comentado (que lee
   *    la MAC del dispositivo) por si es necesario en el 
   *    futuro. 
   *  - Puedes eliminarlo o habilitarlo según tus requerimientos.
   *********************************************************/
  /*
  Ejemplo (comentado) para solicitar MAC del dispositivo (CMD ID: 0x0A):
  
  const macCharacteristic = await service.getCharacteristic(wifiCharacteristicUUID);
  const macPayload = new Uint8Array([0xED, 0x00, 0x0A, 0x00]);
  await macCharacteristic.writeValue(macPayload);
  console.log(Array.from(macPayload).map(b => b.toString(16).padStart(2, '0')).join(''));
  
  function formatMacAddress(respuestaText) {
    const bytes = respuestaText.split(' ').slice(4); 
    if (bytes.length >= 6) {
      return bytes.slice(0, 6).map(byte => byte.toLowerCase()).join('');
    } else {
      console.error('Respuesta no válida para dirección MAC:', respuestaText);
      return null;
    }
  }
  
  // Lectura de notificaciones:
  await macCharacteristic.startNotifications();
  macCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
    const value = event.target.value;
    const responseArray = new Uint8Array(value.buffer);
    const respuestaText = Array.from(responseArray).map(b => b.toString(16).padStart(2, '0')).join(' ');
    console.log("Respuesta recibida:", respuestaText);
  
    const macAddress = formatMacAddress(respuestaText);
    if (macAddress) {
      MacAddressWIfi = macAddress;
      DirecciónMAC   = macAddress;
      console.log("Dirección MAC almacenada:", MacAddressWIfi);
    } else {
      console.error("No se pudo obtener una dirección MAC válida.");
    }
  });
  */
  