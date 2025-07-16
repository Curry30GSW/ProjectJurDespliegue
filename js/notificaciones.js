document.addEventListener('DOMContentLoaded', () => {
    if (!sessionStorage.getItem('token')) {
        window.location.href = 'login.html';
        return;
    }
    mostrarTodasLasAlertas();
});

// ------------------ FUNCIONES UTILITARIAS ------------------

function formatearFechaPersonalizada(fechaStr) {
    const mesesAbreviados = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const fecha = new Date(fechaStr);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = mesesAbreviados[fecha.getMonth()];
    const año = fecha.getFullYear();
    return `${dia}/${mes}/${año}`;
}

function formatDate(dateString) {
    if (!dateString) return null;
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

function marcarComoLeido(id) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('notificacion-leida');
}

// ------------------ ACCIONES DE USUARIO ------------------

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
        if (!result.isConfirmed) return;

        Swal.fire({
            title: 'Procesando.',
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

        fetch(`https://silent-mirrors-show.loca.lt/api/embargos/${idEmbargo}/notificar`, {
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
                if (!response.ok) {
                    const error = await response.json().catch(() => ({}));
                    throw new Error(error.mensaje || `Error ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
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

function posponerNotificacion(htmlId) {
    const el = document.getElementById(htmlId);
    if (el) {
        el.remove();
        Swal.fire({
            icon: 'info',
            title: 'Notificación pospuesta',
            text: 'La notificación ha sido ocultada temporalmente.',
            timer: 2000,
            showConfirmButton: false
        });
    }
}

// ------------------ MOSTRAR ALERTAS ------------------

function mostrarTodasLasAlertas() {
    const contenedor = document.getElementById("notificaciones-contenedor");
    contenedor.innerHTML = '<div class="text-center py-3"><i class="fas fa-spinner fa-spin"></i> Cargando notificaciones.</div>';
    contenedor.classList.remove('scroll-active');

    Promise.all([
        fetch("https://silent-mirrors-show.loca.lt/api/clientes-embargos").then(res => res.json()),
        fetch("https://silent-mirrors-show.loca.lt/api/notificaciones-embargo").then(res => res.json())
    ])
        .then(([clientesData, notificacionesData]) => {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            const expedientesHoy = clientesData.filter(cliente => {
                if (!cliente.fecha_expediente || cliente.notificar !== 0) return false;
                const fecha = new Date(cliente.fecha_expediente);
                fecha.setHours(0, 0, 0, 0);
                return fecha.getTime() === hoy.getTime();
            });

            const notificacionesHoy = (notificacionesData.data || []).filter(noti => {
                if (!noti.fecha_notificacion) return false;
                const fecha = new Date(noti.fecha_notificacion);
                fecha.setHours(0, 0, 0, 0);
                return fecha.getTime() === hoy.getTime();
            });

            contenedor.innerHTML = '';

            // Mostrar expedientes
            expedientesHoy.forEach((cliente, index) => {
                const id = `notificacion-${index}`;
                const fechaFormateada = formatearFechaPersonalizada(cliente.fecha_expediente);

                const notificacionHTML = `
                <div class="ios-toast shadow-sm p-2 mb-2 rounded position-relative d-flex gap-2 align-items-start" id="${id}" style="font-size: 0.85rem;">
                    <div class="flex-grow-1">
                        <h6 class="mb-1 fw-semibold text-dark" style="font-size: 0.95rem;">
                            Expediente por Solicitar – ${cliente.nombres} ${cliente.apellidos}
                        </h6>
                        <p class="mb-1 text-muted small">
                            C.C. <strong>${cliente.cedula || 'N/D'}</strong> – Radicado: <strong>${cliente.radicado || 'N/D'}</strong>
                        </p>
                        <div class="alert alert-light border rounded px-2 py-1 mb-2" style="font-size: 0.8rem;">
                            <i class="fas fa-folder-open text-danger me-1"></i>
                            Fecha de expediente: ${fechaFormateada || 'N/D'}
                        </div>
                        <div class="d-flex gap-2">
                            <button class="btn btn-outline-secondary rounded-pill btn-sm py-0 px-2" onclick="marcarComoLeido('${id}')">
                                <i class="fa fa-check me-1"></i> Leído
                            </button>
                            <button class="btn btn-outline-danger rounded-pill btn-sm py-0 px-2" onclick="eliminarNotificacion('${id}', ${cliente.id_embargos})">
                                <i class="fa fa-times me-1"></i> Eliminar
                            </button>
                        </div>
                    </div>
                    <span class="position-absolute end-0 bottom-0 me-2 mb-1 text-muted small">${formatDate(cliente.fecha_expediente)}</span>
                </div>`;
                contenedor.insertAdjacentHTML("beforeend", notificacionHTML);
            });

            // Mostrar notificaciones de embargo
            notificacionesHoy.forEach((noti, index) => {
                const id = `notificacion-embargo-${index}`;
                const notificacionHTML = `
                <div class="ios-toast d-flex align-items-start shadow-sm p-2 mb-2 rounded position-relative" id="${id}" style="font-size: 0.85rem;">
                    <div class="flex-grow-1">
                        <h6 class="mb-1 fw-semibold text-dark" style="font-size: 0.95rem;">Subsanación pendiente – ${noti.nombres} ${noti.apellidos}</h6>
                        <p class="mb-1 text-muted small">
                            C.C. <strong>${noti.cedula || 'N/D'}</strong> – Radicado: <strong>${noti.radicado || 'N/D'}</strong><br>
                            Asesor: ${noti.asesor_noticacion || 'N/D'}
                        </p>
                        <div class="alert alert-light border rounded px-2 py-1 mb-2" style="font-size: 0.8rem;">
                            <i class="fas fa-comment text-warning me-1"></i>
                            ${noti.observaciones || 'Sin observaciones'}
                        </div>
                        <div class="d-flex gap-2">
                            <button class="btn btn-outline-secondary rounded-pill btn-sm py-0 px-2" onclick="posponerNotificacion('${id}')">
                                <i class="fas fa-clock me-1"></i> Posponer
                            </button>
                            <button class="btn btn-outline-danger rounded-pill btn-sm py-0 px-2" onclick="eliminarNotificacion('${id}', ${noti.id_embargos})">
                                <i class="fas fa-times me-1"></i> Eliminar
                            </button>
                        </div>
                    </div>
                    <span class="position-absolute end-0 bottom-0 me-2 mb-1 text-muted small">${formatDate(noti.fecha_notificacion)}</span>
                </div>`;
                contenedor.insertAdjacentHTML("beforeend", notificacionHTML);
            });

            if (expedientesHoy.length === 0 && notificacionesHoy.length === 0) {
                contenedor.innerHTML = `<div class="alerta-toast alerta-vacia">
                    <h4>✅ No hay notificaciones para hoy.</h4>
                </div>`;
                setTimeout(() => contenedor.innerHTML = '', 2500);
            }

            if ((expedientesHoy.length + notificacionesHoy.length) > 3) {
                contenedor.classList.add('scroll-active');
            }
        })
        .catch(err => {
            console.error("Error al cargar notificaciones:", err);
            contenedor.innerHTML = `<div class="alert alert-danger">
                Error al cargar notificaciones. Recargue la página.
            </div>`;
        });
}
