document.addEventListener('DOMContentLoaded', () => {
    if (!sessionStorage.getItem('token')) {
        window.location.href = '../pages/login.html';
        return;
    }
    mostrarAlertasCentrales();
});



function mostrarAlertasCentrales() {
    fetch("http://localhost:3000/api/clientes-embargos")
        .then(response => response.json())
        .then(data => {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            const clientesConAlerta = data.filter(cliente => {
                if (!cliente.fecha_expediente || cliente.notificar !== 0) return false;

                const fecha = new Date(cliente.fecha_expediente);
                fecha.setHours(0, 0, 0, 0);

                return fecha.getTime() === hoy.getTime();
            });

            if (clientesConAlerta.length > 0) {
                mostrarAlertasNotificaciones(clientesConAlerta);
            } else {
                const contenedor = document.getElementById("alerta-central-container");
                contenedor.innerHTML = `<div class="alerta-toast alerta-vacia">
                                        <h4>✅ No hay expedientes pendientes para hoy.</h4>
                                    </div>`;
                setTimeout(() => {
                    contenedor.innerHTML = '';
                }, 2500);
            }

        })
        .catch(err => console.error("Error al traer los datos:", err));
}



function mostrarAlertasNotificaciones(clientes) {
    const contenedor = document.getElementById("notificaciones-contenedor");
    contenedor.innerHTML = "";

    clientes.forEach((cliente, index) => {


        const fechaFormateada = formatearFechaPersonalizada(cliente.fecha_expediente);
        const id = `notificacion-${index}`;

        const notificacionHTML = `
    <div class="timeline-block mb-3 notificacion-timeline" id="${id}">
        <span class="timeline-step bg-danger shadow">
            <i class="fa fa-bell text-white"></i>
        </span>
        <div class="timeline-content">
            <div class="acciones">
                <button class="btn-leido" onclick="marcarComoLeido('${id}')" title="Marcar como leído">
                    <i class="fa fa-check"></i>
                </button>
                <button class="btn-eliminar" onclick="eliminarNotificacion('${id}', ${cliente.id_embargos})" title="Eliminar">
                    <i class="fa fa-times"></i>
                </button>
            </div>
            <h6 class="text-dark text-sm font-weight-bold mb-0">
                Expediente por Solicitar: ${cliente.nombres} ${cliente.apellidos}
            </h6>
            <p class="text-secondary font-weight-bold text-xs mt-1 mb-0">
                Cédula: ${cliente.cedula} | Fecha: ${fechaFormateada} | Radicación: ${cliente.radicado}
            </p>
        </div>
    </div>
    `;

        contenedor.insertAdjacentHTML("beforeend", notificacionHTML);
    });

}



function formatearFechaPersonalizada(fechaStr) {
    const mesesAbreviados = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

    const fecha = new Date(fechaStr);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = mesesAbreviados[fecha.getMonth()];
    const año = fecha.getFullYear();

    return `${dia}/${mes}/${año}`;
}


function eliminarNotificacion(htmlId, idEmbargo) {
    console.log('[FRONT 1] Inicio con:', { htmlId, idEmbargo });

    const el = document.getElementById(htmlId);
    if (!el) {
        console.error('[FRONT 2] Elemento no existe');
        return;
    }

    Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta notificación no volverá a aparecer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then(result => {
        if (!result.isConfirmed) return; // Si el usuario cancela, no hacer nada

        // Mostrar loader mientras se procesa
        Swal.fire({
            title: 'Procesando...',
            html: 'Actualizando estado de la notificación',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const controller = new AbortController();
        const timeout = setTimeout(() => {
            console.log('[FRONT 3] Timeout alcanzado, abortando');
            controller.abort();
        }, 15000);

        fetch(`http://localhost:3000/api/embargos/${idEmbargo}/notificar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ notificar: 1 }),
            signal: controller.signal
        })
            .then(async response => {
                clearTimeout(timeout);
                console.log('[FRONT 4] Status:', response.status);

                if (!response.ok) {
                    const error = await response.json().catch(() => ({}));
                    throw new Error(error.mensaje || `Error ${response.status}`);
                }

                return response.json();
            })
            .then(data => {
                console.log('[FRONT 5] Respuesta:', data);
                Swal.close();

                if (!data.success) {
                    throw new Error(data.mensaje || 'Operación fallida');
                }

                el.remove();

                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Notificación desactivada',
                    timer: 2000,
                    showConfirmButton: false
                });
            })
            .catch(error => {
                clearTimeout(timeout);
                console.error('[FRONT 6] Error:', error);
                Swal.close();

                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.name === 'AbortError'
                        ? 'La operación tardó demasiado. Intente nuevamente.'
                        : error.message || 'Error al procesar la solicitud',
                    confirmButtonText: 'Entendido'
                });
            });
    });
}


function marcarComoLeido(id) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('notificacion-leida');
}
