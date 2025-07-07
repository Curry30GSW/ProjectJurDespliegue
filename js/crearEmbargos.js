document.addEventListener('DOMContentLoaded', function () {
    // Inicializar el modal una sola vez
    const modalElement = document.getElementById('modalSeleccionCliente');
    const modal = new bootstrap.Modal(modalElement);

    // Mostrar el modal automáticamente al cargar
    modal.show();

    const inputCedula = document.getElementById('inputCedula');
    const btnBuscar = document.getElementById('btnBuscarCedula');
    const resultadoDiv = document.getElementById('resultadoCliente');
    const sinResultadosDiv = document.getElementById('sinResultados');
    const btnSeleccionar = document.getElementById('btnSeleccionarCliente');
    const btnCancelar = document.getElementById('btnCancelarBusqueda');
    const clienteFotoPerfil = document.getElementById('clienteFotoPerfil');

    let clienteSeleccionado = null;

    async function buscarCliente() {
        const cedula = inputCedula.value.trim();

        if (!cedula) {
            inputCedula.focus();
            return;
        }

        try {
            // Mostrar estado de carga
            resultadoDiv.classList.add('d-none');
            sinResultadosDiv.classList.add('d-none');
            btnBuscar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';
            btnBuscar.disabled = true;

            const response = await fetch(`http://localhost:3000/api/cliente-embargos/${cedula}`);

            if (!response.ok) {
                throw new Error('Cliente no encontrado');
            }

            const cliente = await response.json();

            // Unir nombres y apellidos
            const nombreCompleto = `${cliente.nombres || ''} ${cliente.apellidos || ''}`.trim();

            // Mostrar resultado
            document.getElementById('clienteNombre').textContent = nombreCompleto || 'Nombre no disponible';
            document.getElementById('clienteCedula').textContent = cliente.cedula || cedula;
            document.getElementById('clienteTelefono').textContent = cliente.telefono || 'No disponible';

            // Mostrar foto de perfil
            if (cliente.foto_perfil) {
                clienteFotoPerfil.src = `http://localhost:3000${cliente.foto_perfil}`;
                clienteFotoPerfil.alt = nombreCompleto;
            } else {
                clienteFotoPerfil.src = '../assets/img/avatar.png';
            }

            clienteSeleccionado = cliente;

            resultadoDiv.classList.remove('d-none');
            sinResultadosDiv.classList.add('d-none');

            btnSeleccionar.focus();
        } catch (error) {
            console.error('Error buscando cliente:', error);
            resultadoDiv.classList.add('d-none');
            sinResultadosDiv.classList.remove('d-none');
        } finally {
            btnBuscar.innerHTML = '<i class="fas fa-search"></i> Buscar';
            btnBuscar.disabled = false;
        }
    }

    // Event Listeners
    btnBuscar.addEventListener('click', buscarCliente);

    inputCedula.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            buscarCliente();
        }
    });

    // Seleccionar cliente con SweetAlert2 y cierre del modal
    btnSeleccionar.addEventListener('click', async function () {
        if (clienteSeleccionado) {
            // Cerrar el modal
            modal.hide();

            // Mostrar la alerta de selección
            await Swal.fire({
                title: 'Cliente seleccionado',
                text: `${clienteSeleccionado.nombres} ${clienteSeleccionado.apellidos}`,
                icon: 'success',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Aceptar',
                timer: 2000,
                timerProgressBar: true
            });

            // ⚠️ Limpiar backdrop de Bootstrap si quedó activo
            document.body.classList.remove('modal-open');
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();

            // ✅ Mostrar tus alertas centradas
            mostrarAlertasCentrales();

            // Actualizar detalles del cliente
            actualizarDetalleCliente(clienteSeleccionado);
        }
    });



    // Función para actualizar los detalles del cliente
    function actualizarDetalleCliente(cliente) {
        const fotoPerfil = document.getElementById('detalleFotoPerfil');
        if (cliente.foto_perfil) {
            fotoPerfil.src = `http://localhost:3000${cliente.foto_perfil}`;
        } else {
            fotoPerfil.src = '../assets/img/avatar.png';
        }
        const fechaRaw = cliente.fecha_vinculo;

        if (fechaRaw) {
            const fecha = new Date(fechaRaw);
            const dia = fecha.getDate().toString().padStart(2, '0');
            const mes = fecha.toLocaleString('es-CO', { month: 'short' }).replace('.', '');
            const anio = fecha.getFullYear();
            const fechaFormateada = `${dia}/${mes.charAt(0).toUpperCase() + mes.slice(1)}/${anio}`;
            document.getElementById('detalleVinculacion').textContent = fechaFormateada;
        } else {
            document.getElementById('detalleVinculacion').textContent = '---';
        }


        document.getElementById('detalleID').textContent = cliente.id_cliente || '---';
        document.getElementById('detalleDocumento').textContent = cliente.cedula || '---';
        document.getElementById('detalleNombreCliente').textContent = `${cliente.nombres || ''} ${cliente.apellidos || ''}`.trim();
        document.getElementById('detalleTelefono').textContent = cliente.telefono || '---';
        document.getElementById('detalleEmail').textContent = cliente.correo || '---';
        document.getElementById('detallePagaduria').textContent = cliente.pagadurias || '---';
        document.getElementById('detalleCiudad').textContent = cliente.ciudad || '---';
        document.getElementById('inputPagaduria').value = cliente.pagadurias || '';
    }

    // Cancelar búsqueda con SweetAlert2 y redirección
    btnCancelar.addEventListener('click', function () {
        Swal.fire({
            title: '¿Cancelar búsqueda?',
            text: "Serás redirigido a la página de embargos",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, cancelar',
            cancelButtonText: 'No, continuar'
        }).then((result) => {
            if (result.isConfirmed) {
                modal.hide();
                window.location.href = 'embargos.html';
            }
        });
    });

    // Limpiar al mostrar el modal
    modalElement.addEventListener('show.bs.modal', function () {
        inputCedula.value = '';
        resultadoDiv.classList.add('d-none');
        sinResultadosDiv.classList.add('d-none');
        clienteSeleccionado = null;
        clienteFotoPerfil.src = '../assets/img/avatar.png';
        inputCedula.focus();
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const fechaRadicacionInput = document.getElementById('fecha_radicacion');
    const fechaSolicitudInput = document.getElementById('fecha_expediente');

    // Establecer la fecha mínima como hoy
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const dia = hoy.getDate().toString().padStart(2, '0');
    const fechaHoy = `${anio}-${mes}-${dia}`;
    fechaRadicacionInput.min = fechaHoy;

    // Escuchar cambios para calcular +15 días
    fechaRadicacionInput.addEventListener('change', function () {
        const fechaRadicacion = new Date(this.value);

        if (!isNaN(fechaRadicacion.getTime())) {
            fechaRadicacion.setDate(fechaRadicacion.getDate() + 15);
            const anio = fechaRadicacion.getFullYear();
            const mes = (fechaRadicacion.getMonth() + 1).toString().padStart(2, '0');
            const dia = fechaRadicacion.getDate().toString().padStart(2, '0');
            fechaSolicitudInput.value = `${anio}-${mes}-${dia}`;
        } else {
            fechaSolicitudInput.value = '';
        }
    });
});

const nombreAsesor = sessionStorage.getItem('nombreUsuario');
document.getElementById('asesorNombre').textContent = nombreAsesor || '---';


document.addEventListener('DOMContentLoaded', () => {

});

async function seleccionarEstadoFinal(estado) {
    const form = document.getElementById('formCrearEmbargo');
    const estadoFinalInput = document.getElementById('estado_embargo');

    // Asignar valor numérico: 0 = aceptado, 1 = rechazado
    const estadoNumerico = (estado === 'aceptado') ? 0 : 1;
    estadoFinalInput.value = estadoNumerico;

    // Obtener valores a validar
    const valorEmbargo = document.getElementById('valor_embargo').value.trim();
    const pagaduria = document.getElementById('inputPagaduria').value.trim();
    const porcentaje = document.getElementById('porcentaje').value.trim();
    const juzgado = document.getElementById('juzgado').value.trim();
    const fechaRadicacion = document.getElementById('fecha_radicacion').value.trim();
    const redJudicial = document.querySelector('input[name="red_judicial"]:checked')?.value;
    const linkRedJudicial = document.querySelector('input[name="link_red_judicial"]')?.value.trim();

    // Validaciones
    if (!valorEmbargo) {
        return Swal.fire('Campo obligatorio', 'Por favor ingresa el valor del embargo.', 'warning');
    }

    if (!porcentaje || porcentaje < 1 || porcentaje > 100) {
        return Swal.fire('Campo obligatorio', 'Ingresa un porcentaje válido entre 1 y 100.', 'warning');
    }

    if (!juzgado) {
        return Swal.fire('Campo obligatorio', 'Por favor ingresa el juzgado.', 'warning');
    }

    if (!fechaRadicacion) {
        return Swal.fire('Campo obligatorio', 'Por favor selecciona la fecha de radicación.', 'warning');
    }

    if (!redJudicial) {
        return Swal.fire('Campo obligatorio', 'Por favor selecciona si aplica red judicial.', 'warning');
    }

    if (redJudicial === 'si' && !linkRedJudicial) {
        return Swal.fire('Campo obligatorio', 'Debes ingresar el link de la red judicial.', 'warning');
    }

    // Si pasa las validaciones, continúa
    const idEmbargo = obtenerIdEmbargo();
    const url = `http://localhost:3000/api/embargo/${idEmbargo}`;

    // Crear objeto plano desde los inputs del formulario
    const formData = new FormData(form);
    const plainData = Object.fromEntries(formData.entries());

    // Agregar valores manualmente
    plainData.nombreUsuario = sessionStorage.getItem('nombreUsuario') || '---';
    plainData.pagaduria_embargo = pagaduria;
    plainData.porcentaje_embargo = porcentaje;
    plainData.juzgado_embargo = juzgado;
    plainData.red_judicial = (redJudicial === 'si') ? linkRedJudicial : '';
    plainData.estado_embargo = estadoNumerico; // 👈 este es el valor que se enviará al backend

    // Enviar al backend
    try {
        console.log('Datos enviados al backend:', plainData);

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(plainData),
        });

        if (response.ok) {
            const resultado = await response.json();
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: `Embargo ${estado === 'aceptado' ? 'enviado' : 'rechazado'} correctamente.`,
            }).then(() => {
                if (estado === 'rechazado') {
                    document.getElementById('btnNuevoProceso').classList.remove('d-none');
                    document.getElementById('mensajeRechazo').textContent = 'Este embargo fue rechazado. Puedes crear un nuevo proceso si lo deseas.';
                } else {
                    location.reload();
                }
            });
        } else {
            const error = await response.text();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al enviar el embargo: ' + error,
            });
        }
    } catch (err) {
        console.error(err);
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'Hubo un error en la conexión con el servidor.',
        });
    }
}



function obtenerIdEmbargo() {
    // Puedes obtener el ID desde la URL, un input oculto, una variable global, etc.
    return document.getElementById('detalleID').textContent.trim(); // ejemplo
}

function formatearMoneda(input) {
    let valor = input.value.replace(/\D/g, '');
    valor = new Intl.NumberFormat('es-CO').format(valor);
    input.value = valor;
}



function mostrarAlertasCentrales() {
    fetch("http://localhost:3000/api/clientes-embargos")
        .then(response => response.json())
        .then(data => {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            const clientesConAlerta = data.filter(cliente => {
                if (!cliente.fecha_expediente) return false;
                const fecha = new Date(cliente.fecha_expediente);
                fecha.setHours(0, 0, 0, 0);
                return fecha.getTime() === hoy.getTime();
            });

            if (clientesConAlerta.length > 0) {
                mostrarAlertasToast(clientesConAlerta);
            } else {
                console.log("No hay alertas hoy.");
            }
        })
        .catch(err => console.error("Error al traer los datos:", err));
}


function formatearFechaPersonalizada(fechaStr) {
    const mesesAbreviados = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

    const fecha = new Date(fechaStr);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = mesesAbreviados[fecha.getMonth()];
    const año = fecha.getFullYear();

    return `${dia}/${mes}/${año}`;
}


function mostrarAlertasToast(clientes) {
    const contenedor = document.getElementById("alerta-central-container");
    contenedor.innerHTML = ""; // Limpiar alertas anteriores

    clientes.forEach((cliente, index) => {
        const fechaFormateada = formatearFechaPersonalizada(cliente.fecha_expediente);

        const alertaHTML = `
            <div class="alerta-toast" id="toast-${index}">
                <button class="cerrar-alerta" onclick="document.getElementById('toast-${index}').remove()">×</button>
                <h4>🚨 ¡Expediente por revisar!</h4>
                <p><strong>${cliente.nombres} ${cliente.apellidos}</strong></p>
                <p><strong>Cédula:</strong> ${cliente.cedula}</p>
                <p><strong>Radicado:</strong> ${cliente.radicado || 'N/A'}</p>
                <p><strong>Fecha:</strong> ${fechaFormateada}</p>
            </div>
        `;
        contenedor.insertAdjacentHTML('beforeend', alertaHTML);
    });
}




