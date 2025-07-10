const token = sessionStorage.getItem('token');
let resultados = '';
if (!token) {
    Swal.fire({
        title: 'Sesión expirada',
        text: 'Su sesión ha finalizado. Por favor ingrese nuevamente.',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#3085d6',
        allowOutsideClick: false,
        allowEscapeKey: false
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = '../pages/login.html';
        }
    });

    setTimeout(() => {
        window.location.href = '../pages/login.html';
    }, 5000);
}

document.addEventListener('DOMContentLoaded', () => {
    if (!sessionStorage.getItem('token')) {
        window.location.href = '../pages/login.html';
        return;
    }
    obtenerClientes();
});


async function obtenerClientes() {
    try {
        const token = sessionStorage.getItem('token');
        const url = 'http://localhost:3000/api/clientes-embargos';

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Error en la solicitud');

        clientes = await response.json();

        if (!Array.isArray(clientes) || clientes.length === 0) {
            Swal.fire({
                title: 'Sin registros',
                text: 'No se encontraron Clientes en la base de datos.',
                icon: 'info',
                confirmButtonText: 'Entendido',
                allowOutsideClick: false,
                allowEscapeKey: false
            });
            return;
        }

        mostrar(clientes);


    } catch (error) {
        console.error('❌ Error en clientes:', error);
        Swal.fire('Error', 'No se pudo obtener la información.', 'error');
    }
}


const mostrar = (clientes) => {
    let resultados = '';

    clientes.forEach((cliente) => {
        let estadoEmbargoTexto = '';
        let estadoEmbargoClase = '';

        if (cliente.estado_embargo === 1) {
            estadoEmbargoTexto = 'RECHAZADO';
            estadoEmbargoClase = 'blink bg-danger text-white px-2 rounded';
        } else if (cliente.estado_embargo === 0) {
            estadoEmbargoTexto = 'ACEPTADO';
            estadoEmbargoClase = 'blink bg-success text-white px-2 rounded';
        } else {
            estadoEmbargoTexto = 'PENDIENTE';
            estadoEmbargoClase = 'blink bg-warning text-dark px-2 rounded';
        }

        resultados += `
            <tr>
                <td class="align-middle">
                    <div class="d-flex align-items-center px-2 py-1">
                        <div>
                            <img src="http://localhost:3000${cliente.foto_perfil}" 
                                class="avatar avatar-lg me-3 foto-cliente" 
                                alt="${cliente.nombres}" 
                                data-src="http://localhost:3000${cliente.foto_perfil}">
                        </div>
                        <div class="d-flex flex-column justify-content-center">
                            <span class="text-xs font-weight-bold text-dark mb-1">${cliente.nombres} ${cliente.apellidos}</span>
                            <span class="text-xs text-dark ">${cliente.cedula}</span>
                        </div>
                    </div>
                </td>
                <td class="text-center align-middle">
                    <span class="text-xs font-weight-bold">${cliente.radicado}</span>
                </td>
                <td class="text-center align-middle">
                    <span class="text-xs font-weight-bold ${estadoEmbargoClase}">${estadoEmbargoTexto}</span>
                </td>
                <td class="text-center align-middle">
                    <button class="btn btn-info btn-md me-1" onclick="verCliente(${cliente.id_embargos})">
                        <i class="fas fa-eye"></i> Ver Proceso
                    </button>
                    <button class="btn btn-warning btn-md" onclick="editarCliente(${cliente.id_embargos})">
                        <i class="fas fa-edit"></i> Editar Proceso
                    </button>
                </td>
            </tr>
        `;
    });

    if ($.fn.DataTable.isDataTable('#tablaClientes')) {
        $('#tablaClientes').DataTable().clear().destroy();
    }

    $("#tablaClientes tbody").html(resultados);
};


$(document).on('click', '.foto-cliente', function () {
    const src = $(this).data('src');
    $('#imagen-modal').attr('src', src);

    const modal = new bootstrap.Modal(document.getElementById('modalFoto'));
    modal.show();
});



function verCliente(id_embargos) {
    fetch(`http://localhost:3000/api/embargos/${id_embargos}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarDetallesEmbargo(data);
            } else {
                Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire('Error', 'Error al cargar los datos', 'error');
        });
}



function mostrarDetallesEmbargo(datos) {
    const modal = new bootstrap.Modal(document.getElementById('embargoModal'));
    const modalContent = document.getElementById('embargoModalContent');

    // Formatear fechas
    const formatDate = (fechaOriginal) => {
        if (!fechaOriginal || isNaN(new Date(fechaOriginal))) {
            return "No especificado";
        }

        const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
        const fecha = new Date(fechaOriginal);
        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = meses[fecha.getMonth()];
        const anio = fecha.getFullYear();
        return `${dia}/${mes}/${anio}`;
    };




    // Determinar estado
    const estado = datos.embargo.estado_embargo === 0 ? 'Aceptado' : 'Rechazado';

    // Crear el contenido HTML
    modalContent.innerHTML = `
    <div class="card border-0 shadow-sm mb-4" style="border-radius: 10px; overflow: hidden;">
        <div class="card-header" style="background: linear-gradient(135deg,rgb(0, 0, 0) 0%, #157347 100%); color: white; padding: 15px 20px;">
            <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0 text-white fw-bold" style="font-weight: 600; color: #000;">
                    <i class="fas fa-gavel me-2"></i> Detalles del Embargo
                </h5>
                <span style="font-weight: 500; font-size: 1.1rem; text-white;">Fecha Proceso: ${formatDate(datos.embargo.updated_at)}</span>
            </div>
        </div>

        <div class="card-body" style="padding: 20px;">
            <!-- Sección de información básica -->
            <div class="row mb-4">
                <!-- Información del cliente -->
                <div class="col-md-4 mb-3 mb-md-0" style="padding-right: 15px;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; height: 100%;">
                        <div class="d-flex align-items-center mb-3" style="border-bottom: 1px solid #e9ecef; padding-bottom: 10px;">
                            <i class="fas fa-user-tie me-3" style="color: #198754; font-size: 1.2rem;"></i>
                            <h4 class="mb-0" style="font-weight: 600; color: #212529;">Información del Cliente</h4>
                        </div>
                        <div class="text-center mb-3">
                            <img src="${datos.embargo.foto_perfil ? `http://localhost:3000${datos.embargo.foto_perfil}` : '../assets/img/avatar.png'}" 
                                class="rounded-circle me-3" 
                                alt="${datos.embargo.nombres}" 
                                style="width: 120px; height: 120px; object-fit: cover; border: 3px solid #dee2e6;"
                                data-src="${datos.embargo.foto_perfil ? `http://localhost:3000${datos.embargo.foto_perfil}` : '../assets/img/avatar.png'}">
                        </div>
                        <div class="row text-center">
                            <div class="col-12 mb-2">
                                <h5 class="mb-1">${datos.embargo.nombres} ${datos.embargo.apellidos}</h5>
                                <p class="text-muted mb-2">ID Proceso: ${datos.embargo.id_embargos}</p>
                            </div>
                            <div class="col-6 mb-2">
                                <p style="color: rgba(25, 135, 84, 0.9); font-size: 1rem; margin-bottom: 5px; font-weight: 500;">Cédula</p>
                                <p style="color: #000; font-weight: 525; margin-bottom: 0;">${datos.embargo.cedula}</p>
                            </div>
                            <div class="col-6 mb-2">
                                <p style="color: rgba(25, 135, 84, 0.9); font-size: 1rem; margin-bottom: 5px; font-weight: 500;">Vinculación</p>
                                <p style="color: #000; font-weight: 525; margin-bottom: 0;">${formatDate(datos.embargo.fecha_vinculo)}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Datos de contacto -->
                <div class="col-md-4 mb-3 mb-md-0" style="padding: 0 7.5px;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; height: 100%;">
                        <div class="d-flex align-items-center mb-3" style="border-bottom: 1px solid #e9ecef; padding-bottom: 10px;">
                            <i class="fas fa-address-card me-3" style="color: #198754; font-size: 1.2rem;"></i>
                            <h4 class="mb-0" style="font-weight: 600; color: #212529;">Contacto</h4>
                        </div>
                        <div class="row">
                            <div class="col-12 mb-3">
                                <p style="color: rgba(25, 135, 84, 0.9); font-size: 1rem; margin-bottom: 5px; font-weight: 500;">
                                    <i class="fas fa-phone me-2"></i> Teléfono
                                </p>
                                <p style="color: #000; font-weight: 525; margin-bottom: 0;">${datos.embargo.telefono || 'No registrado'}</p>
                            </div>
                            <div class="col-12 mb-3">
                                <p style="color: rgba(25, 135, 84, 0.9); font-size: 1rem; margin-bottom: 5px; font-weight: 500;">
                                    <i class="fas fa-envelope me-2"></i> Correo
                                </p>
                                <p style="color: #000; font-weight: 525; margin-bottom: 0;">${datos.embargo.correo || 'No registrado'}</p>
                            </div>
                            <div class="col-12 mb-3">
                                <p style="color: rgba(25, 135, 84, 0.9); font-size: 1rem; margin-bottom: 5px; font-weight: 500;">
                                    <i class="fas fa-city me-2"></i> Ciudad
                                </p>
                                <p style="color: #000; font-weight: 525; margin-bottom: 0;">${datos.embargo.ciudad || 'No registrada'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Datos del embargo -->
                <div class="col-md-4" style="padding-left: 15px;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; height: 100%;">
                        <div class="d-flex align-items-center mb-3" style="border-bottom: 1px solid #e9ecef; padding-bottom: 10px;">
                            <i class="fas fa-gavel me-3" style="color: #198754; font-size: 1.2rem;"></i>
                            <h4 class="mb-0" style="font-weight: 600; color: #212529;">Detalles del Embargo</h4>
                        </div>
                        <div class="row">
                            <div class="col-6 mb-3">
                                <p style="color: rgba(25, 135, 84, 0.9); font-size: 1rem; margin-bottom: 5px; font-weight: 500;">Valor</p>
                                <p style="color: #000; font-weight: 525; margin-bottom: 0;">$${datos.embargo.valor_embargo || 'No especificado'}</p>
                            </div>
                            <div class="col-6 mb-3">
                                <p style="color: rgba(25, 135, 84, 0.9); font-size: 1rem; margin-bottom: 5px; font-weight: 500;">Porcentaje</p>
                                <p style="color: #000; font-weight: 525; margin-bottom: 0;">${datos.embargo.porcentaje_embargo || '0'}%</p>
                            </div>
                            <div class="col-6 mb-3">
                                <p style="color: rgba(25, 135, 84, 0.9); font-size: 1rem; margin-bottom: 5px; font-weight: 500;">Pagaduría</p>
                                <p style="color: #000; font-weight: 525; margin-bottom: 0;">${datos.embargo.pagaduria_embargo || 'No especificada'}</p>
                            </div>
                            <div class="col-6 mb-3">
                                <p style="color: rgba(25, 135, 84, 0.9); font-size: 1rem; margin-bottom: 5px; font-weight: 500;">Juzgado</p>
                                <p style="color: #000; font-weight: 525; margin-bottom: 0;">${datos.embargo.juzgado_embargo || 'No especificado'}</p>
                            </div>
                            <div class="col-6 mb-3">
                                <p style="color: rgba(25, 135, 84, 0.9); font-size: 1rem; margin-bottom: 5px; font-weight: 500;">Radicado</p>
                                <p style="color: #000; font-weight: 525; margin-bottom: 0;">${datos.embargo.radicado || 'No especificado'}</p>
                            </div>
                            <div class="col-6 mb-3">
                                <p style="color: rgba(25, 135, 84, 0.9); font-size: 1rem; margin-bottom: 5px; font-weight: 500;">Estado</p>
                                <p style="color: #000; font-weight: 525; margin-bottom: 0;">
                                    <span class="badge ${datos.embargo.estado_embargo === 0 ? 'bg-success' : 'bg-danger'}">
                                        ${estado}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Sección de fechas importantes -->
            <div class="d-flex align-items-center mb-3" style="border-bottom: 1px solid #e9ecef; padding-bottom: 10px;">
                <i class="fas fa-calendar-alt me-3" style="color: #198754; font-size: 1.2rem;"></i>
                <h4 class="mb-0" style="font-weight: 600; color: #212529;">Fechas Importantes</h4>
            </div>
            
            <div class="row" style="margin-left: -5px; margin-right: -5px; margin-bottom: 20px;">
                <div class="col-md-4 mb-3" style="padding: 5px;">
                    <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; height: 100%; border: 1px solid #e9ecef;">
                        <p style="color: rgba(25, 135, 84, 0.9); font-size: 1rem; margin-bottom: 10px; font-weight: 500;">Radicación</p>
                        <h5 style="color: #000; font-weight: 600; margin-bottom: 0;">${formatDate(datos.embargo.fecha_radicacion)}</h5>
                    </div>
                </div>
                <div class="col-md-4 mb-3" style="padding: 5px;">
                    <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; height: 100%; border: 1px solid #e9ecef;">
                        <p style="color: rgba(25, 135, 84, 0.9); font-size: 1rem; margin-bottom: 10px; font-weight: 500;">Solicitud Expediente</p>
                        <h5 style="color: #000; font-weight: 600; margin-bottom: 0;">${formatDate(datos.embargo.fecha_expediente)}</h5>
                    </div>
                </div>
                <div class="col-md-4 mb-3" style="padding: 5px;">
                    <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; height: 100%; border: 1px solid #e9ecef;">
                        <p style="color: rgba(25, 135, 84, 0.9); font-size: 1rem; margin-bottom: 10px; font-weight: 500;">Revisión Expediente</p>
                        <h5 style="color: #000; font-weight: 600; margin-bottom: 0;">${formatDate(datos.embargo.fecha_revision_exp)}</h5>
                    </div>
                </div>
            </div>
            
            <!-- Sección de información adicional -->
            <div class="row" style="margin-left: -5px; margin-right: -5px;">
                <div class="col-md-6 mb-3" style="padding: 5px;">
                    <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; height: 100%; border: 1px solid #e9ecef;">
                        <div class="d-flex align-items-center mb-3" style="border-bottom: 1px solid #e9ecef; padding-bottom: 10px;">
                            <i class="fas fa-balance-scale me-3" style="color: #198754; font-size: 1.2rem;"></i>
                            <h4 class="mb-0" style="font-weight: 600; color: #212529;">Red Judicial</h4>
                        </div>
                        <p style="color: #000; font-weight: 525; margin-bottom: 0;">
                            ${datos.embargo.red_judicial ?
            `<span class="badge bg-success me-2">SI</span> ${datos.embargo.red_judicial}` :
            '<span class="badge bg-danger">NO</span>'}
                        </p>
                    </div>
                </div>
                
                <div class="col-md-6 mb-3" style="padding: 5px;">
                    <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; height: 100%; border: 1px solid #e9ecef;">
                        <div class="d-flex align-items-center mb-3" style="border-bottom: 1px solid #e9ecef; padding-bottom: 10px;">
                            <i class="fas fa-file-alt me-3" style="color: #198754; font-size: 1.2rem;"></i>
                            <h4 class="mb-0" style="font-weight: 600; color: #212529;">Subsanaciones</h4>
                        </div>
                        <p style="color: #000; font-weight: 525; margin-bottom: 0;">
                            ${datos.embargo.subsanaciones === 'si' ?
            '<span class="badge bg-warning text-dark">SI</span>' :
            '<span class="badge bg-secondary">NO</span>'}
                        </p>
                        ${datos.embargo.detalle_subsanaciones ?
            `<p class="mt-2"><small>${datos.embargo.detalle_subsanaciones}</small></p>` : ''}
                    </div>
                </div>
            </div>
            
            <!-- Asesor responsable -->
            <div class="mt-4 text-end">
                <p class="text-muted small mb-0">Asesor a cargo: <span class="fw-bold text-dark">${datos.embargo.asesor_embargo}</span></p>
            </div>
        </div>
    </div>
`;

    modal.show();
}



