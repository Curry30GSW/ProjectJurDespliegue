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

async function obtenerClientes() {
    try {
        const token = sessionStorage.getItem('token');
        const url = 'http://localhost:3000/api/clientes-insolvencias';


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

document.addEventListener('DOMContentLoaded', () => {
    if (!sessionStorage.getItem('token')) {
        window.location.href = '../pages/login.html';
        return;
    }
    obtenerClientes();
});


const mostrar = (clientes) => {
    let resultados = '';
    clientes.forEach((cliente) => {
        let estadoTexto = '';
        let estadoClase = '';

        if (cliente.terminacion === 'APTO') {
            estadoTexto = 'APTO';
            estadoClase = 'bg-gradient-success';
        } else if (cliente.terminacion === 'NO APTO') {
            estadoTexto = 'NO APTO';
            estadoClase = 'bg-gradient-danger';
        } else {
            estadoTexto = 'No definido';
            estadoClase = 'bg-gradient-warning';
        }

        const fecha = new Date(cliente.fecha_vinculo);
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const dia = fecha.getDate();
        const mes = meses[fecha.getMonth()];
        const año = fecha.getFullYear();
        const fechaFormateada = `${dia}/${mes}/${año}`;

        const procesoIniciado = cliente.tipo_proceso || cliente.desprendible;
        const botonCrear = `
        <button class="btn btn-sm btn-primary text-white crear-insolvencia"
            data-id="${cliente.id_cliente}"
            data-cedula="${cliente.cedula}"
            data-nombres="${cliente.nombres}"
            data-apellidos="${cliente.apellidos}"
            data-correo="${cliente.correo}"
            data-telefono="${cliente.telefono}"
            data-direccion="${cliente.direccion}"
            data-ciudad="${cliente.ciudad}"
            data-foto="${cliente.foto_perfil}"
            data-fecha="${fechaFormateada}"
            ${procesoIniciado ? 'disabled' : ''}>
            Crear Insolvencia
        </button>`;

        resultados += `
        <tr>
            <td>
                <div class="d-flex align-items-center px-2 py-1">
                    <div>
                        <img src="http://localhost:3000${cliente.foto_perfil}" 
                            class="avatar avatar-lg me-3 foto-cliente" 
                            alt="${cliente.nombres}"
                            data-src="http://localhost:3000${cliente.foto_perfil}">
                    </div>
                    <div class="d-flex flex-column justify-content-center">
                        <h6 class="mb-0 text-xs">${cliente.nombres} ${cliente.apellidos}</h6>
                        <p class="text-xs text-secondary mb-0">${cliente.correo}</p>
                    </div>
                </div>
            </td>
            <td><p class="text-xs font-weight-bold ">${cliente.cedula}</p></td>
            <td class="align-middle text-center text-sm">
                <p class="badge badge-sm ${estadoClase}">${estadoTexto}</p>
            </td>
          <td class="align-middle">
                <div class="d-flex justify-content-center gap-2">
                    ${botonCrear}
                    <button class="btn btn-sm btn-warning text-white editar-proceso" data-cedula="${cliente.cedula}">
                        Editar Proceso
                    </button>
                    <button class="btn btn-sm btn-info text-white ver-detalle" data-cedula="${cliente.cedula}">
                        Ver detalles
                    </button>
                </div>
            </td>
        </tr>
    `;
    });

    if ($.fn.DataTable.isDataTable('#tablaClientes')) {
        $('#tablaClientes').DataTable().clear().destroy();
    }

    $("#tablaClientes tbody").html(resultados);

};

// Agrega esto después de tu función mostrar()
document.addEventListener('DOMContentLoaded', () => {
    if (!sessionStorage.getItem('token')) {
        window.location.href = '../pages/login.html';
        return;
    }
    obtenerClientes();

    // Evento para el botón "Crear Insolvencia"
    $(document).on('click', '.crear-insolvencia', function () {
        limpiarModalInsolvencia();
        // Obtener datos del cliente
        const cliente = {
            id_cliente: $(this).data('id'),
            nombres: $(this).data('nombres'),
            apellidos: $(this).data('apellidos'),
            cedula: $(this).data('cedula'),
            correo: $(this).data('correo'),
            telefono: $(this).data('telefono'),
            direccion: $(this).data('direccion'),
            ciudad: $(this).data('ciudad'),
            foto: $(this).data('foto'),
            fecha: $(this).data('fecha'),
        };

        // Llenar el modal con los datos
        $('#idModal').text(String(cliente.id_cliente));
        $('#inputIdCliente').val(String(cliente.id_cliente));
        $('#detalleNombreCliente').text(`${cliente.nombres ?? ''} ${cliente.apellidos ?? ''}`);
        $('#detalleTipoDocumento').text(`Cédula: ${cliente.cedula ?? '---'}`);
        $('#telefonoModal').text(cliente.telefono ? String(cliente.telefono) : '---');
        $('#emailModal').text(cliente.correo ?? '---');
        $('#direccionModal').text(cliente.direccion ?? '---');
        $('#ciudadModal').text(cliente.ciudad ?? '---');
        $('#vinculacionModal').text(cliente.fecha ?? '---');


        // Actualizar foto de perfil
        if (cliente.foto) {
            $('#fotoperfilModal').attr('src', `http://localhost:3000${cliente.foto}`);
        } else {
            $('#fotoperfilModal').attr('src', '../assets/img/avatar.png');
        }

        // Mostrar el modal
        const modalInsolvencia = new bootstrap.Modal(document.getElementById('modalCrearInsolvencia'));
        modalInsolvencia.show();

    });
});


$(document).on('click', '.foto-cliente', function () {
    const src = $(this).data('src');
    $('#imagen-modal').attr('src', src);

    const modal = new bootstrap.Modal(document.getElementById('modalFoto'));
    modal.show();
});


function limpiarModalInsolvencia() {
    // Deseleccionar todos los radios
    document.querySelectorAll('#modalCrearInsolvencia input[type="radio"]').forEach(input => {
        input.checked = false;
    });

    // Limpiar inputs de texto
    document.querySelectorAll('#modalCrearInsolvencia input[type="text"], #modalCrearInsolvencia input[type="email"], #modalCrearInsolvencia input[type="number"]').forEach(input => {
        input.value = '';
    });

    // Limpiar textareas
    document.querySelectorAll('#modalCrearInsolvencia textarea').forEach(textarea => {
        textarea.value = '';
    });

    // Resetear selects
    document.querySelectorAll('#modalCrearInsolvencia select').forEach(select => {
        select.selectedIndex = 0;
    });


    // Ocultar campos condicionales
    const camposOcultar = [
        'campoDetalleCorrecciones',
        'contenedorAudiencias',
        'datos_liquidador',
        'motivo_no_apto'
    ];

    camposOcultar.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.style.display = 'none';
    });

    // Limpiar lista de audiencias
    const listaAudiencias = document.getElementById('listaAudiencias');
    if (listaAudiencias) listaAudiencias.innerHTML = '';

    // Resetear campo de archivo PDF y su UI
    const inputArchivo = document.getElementById('archivoPDF');
    if (inputArchivo) {
        inputArchivo.value = '';

        // Restablecer la UI del campo de archivo
        const uploadLabel = document.querySelector('.file-upload-label');
        if (uploadLabel) {
            uploadLabel.classList.remove('has-file');
            const uploadText = uploadLabel.querySelector('.file-upload-text');
            if (uploadText) uploadText.textContent = 'Seleccionar archivo';
        }

        const fileNameDisplay = document.getElementById('fileNameDisplay');
        if (fileNameDisplay) fileNameDisplay.textContent = 'Ningún archivo seleccionado';
    }

    // Resetear campo oculto del archivo
    const archivoUrl = document.getElementById('archivoPDFUrl');
    if (archivoUrl) archivoUrl.value = '';

    // Resetear campos específicos adicionales
    const camposEspecificos = {
        'juzgado': '',
        'nombre_liquidador': '',
        'telefono_liquidador': '',
        'correo_liquidador': '',
        'motivo': '',
        'detalleCorrecciones': ''
    };

    Object.entries(camposEspecificos).forEach(([id, value]) => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.value = value;
    });

    // Remover clases de validación si existen
    document.querySelectorAll('#modalCrearInsolvencia .is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
    });

    document.querySelectorAll('#modalCrearInsolvencia .is-valid').forEach(el => {
        el.classList.remove('is-valid');
    });

    const idsCalculadora = [
        'salario',
        'salud',
        'salario_total',
        'saldo_total',
        'deducciones',
        'saldo_libre',
        'porcentaje',
        'cuota_pagar'
    ];

    idsCalculadora.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) campo.value = '';
    });

    // Ocultar la calculadora parcial
    const calculadora = document.getElementById('calculadora-parcial');
    if (calculadora) calculadora.style.display = 'none';

    // Limpiar radios y fechas de Cuadernillo y Radicación
    const radiosExtras = ['cuadernillo', 'radicacion', 'correcciones'];
    radiosExtras.forEach(name => {
        const radios = document.querySelectorAll(`#modalCrearInsolvencia input[name="${name}"]`);
        radios.forEach(radio => radio.checked = false);
    });

    // Limpiar fechas y ocultar contenedores de fechas
    const fechasExtras = ['cuadernillo', 'radicacion'];
    fechasExtras.forEach(item => {
        const fechaInput = document.getElementById(`fecha_${item}`);
        const fechaContainer = document.getElementById(`fecha_${item}_container`);
        if (fechaInput) fechaInput.value = '';
        if (fechaContainer) fechaContainer.style.display = 'none';
    });

    // Ocultar campo y limpiar textarea de correcciones
    const campoCorrecciones = document.getElementById('campoDetalleCorrecciones');
    if (campoCorrecciones) campoCorrecciones.style.display = 'none';

    const detalleCorrecciones = document.getElementById('detalleCorrecciones');
    if (detalleCorrecciones) detalleCorrecciones.value = '';

}


document.getElementById('formCrearCliente').addEventListener('submit', function (e) {
    e.preventDefault();
    // Validar radios obligatorios
    const radiosObligatorios = [
        'cuadernillo',
        'radicacion',
        'correcciones',
        'audiencias',
        'desprendible',
        'tipo_proceso',
        'liquidador',
        'estado'
    ];

    for (let nombre of radiosObligatorios) {
        const seleccionado = document.querySelector(`input[name="${nombre}"]:checked`);
        if (!seleccionado) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: `Debes seleccionar una opción para "${nombre}".`,
                confirmButtonColor: '#d33'
            });
            return; // detener envío
        }
    }


    const id_cliente = document.getElementById('inputIdCliente').value;
    const cuadernillo = document.querySelector('input[name="cuadernillo"]:checked')?.value === 'SI' ? 1 : 0;
    const fecha_cuadernillo = document.getElementById('fecha_cuadernillo')?.value || '';
    const radicacion = document.querySelector('input[name="radicacion"]:checked')?.value === 'SI' ? 1 : 0;
    const fecha_radicacion = document.getElementById('fecha_radicacion')?.value || '';

    const correccionesRadio = document.querySelector('input[name="correcciones"]:checked')?.value;
    const correcciones = correccionesRadio === 'SI'
        ? document.getElementById('detalleCorrecciones').value.trim()
        : '';

    const archivoPDF = document.getElementById('archivoPDF').files[0];
    const audienciasVisibles = document.querySelector('input[name="audiencias"]:checked')?.value === 'Sí';
    const tipo_proceso = document.querySelector('input[name="tipo_proceso"]:checked')?.value || '';
    const juzgado = document.getElementById('juzgado')?.value.trim() || '';
    const liquidador = document.querySelector('input[name="liquidador"]:checked')?.value === 'Sí' ? 1 : 0;
    const terminacion = document.querySelector('input[name="estado"]:checked')?.value || '';

    const desprendible_estado = document.querySelector('input[name="desprendible"]:checked')?.value || '';
    const desprendiblePDFUrl = document.getElementById('desprendiblePDF').files[0];
    const observaciones_desprendible = document.getElementById('observaciones_desprendible')?.value.trim() || '';

    let datosParcial = null;

    if (desprendible_estado === 'PARCIAL') {
        datosParcial = {
            cuota_pagar: document.getElementById('cuota_pagar')?.value || ''
        };
    }
    const desprendibleData = {
        estado: desprendible_estado,
        obs_desprendible: observaciones_desprendible,
        datos_parcial: datosParcial
    };

    const formData = new FormData();
    formData.append('id_cliente', id_cliente);
    formData.append('cuadernillo', cuadernillo);
    formData.append('fecha_cuadernillo', fecha_cuadernillo);
    formData.append('radicacion', radicacion);
    formData.append('fecha_radicacion', fecha_radicacion);
    formData.append('correcciones', correcciones);
    formData.append('tipo_proceso', tipo_proceso);
    formData.append('juzgado', juzgado);
    formData.append('liquidador', liquidador);
    formData.append('terminacion', terminacion);
    formData.append('datos_desprendible', JSON.stringify(desprendibleData));

    if (desprendiblePDFUrl) {
        formData.append('desprendiblePDF', desprendiblePDFUrl);
    }


    if (archivoPDF) {
        formData.append('archivoPDF', archivoPDF);
    }

    if (audienciasVisibles) {
        const audienciasItems = document.querySelectorAll('#listaAudiencias .audiencia-item');
        const audiencias = [];

        for (const item of audienciasItems) {
            const descripcion = item.querySelector('input[name^="audiencias"][name$="[descripcion]"]').value.trim();
            const fecha = item.querySelector('input[name^="audiencias"][name$="[fecha]"]').value.trim();

            if (!descripcion || !fecha) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Datos incompletos',
                    text: 'Cada audiencia debe tener descripción y fecha completas.',
                    confirmButtonColor: '#d33'
                });
                return;
            }

            audiencias.push({ descripcion, fecha });
        }

        formData.append('audiencias', JSON.stringify(audiencias));
    }

    if (liquidador) {
        const nombre_liquidador = document.getElementById('nombre_liquidador')?.value.trim() || '';
        const telefono_liquidador = document.getElementById('telefono_liquidador')?.value.trim() || '';
        const correo_liquidador = document.getElementById('correo_liquidador')?.value.trim() || '';
        const pago_liquidador = document.querySelector('input[name="pago_liquidador"]:checked')?.value || '';

        if (!nombre_liquidador || !telefono_liquidador || !correo_liquidador || !pago_liquidador) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Debes completar todos los datos del liquidador.',
                confirmButtonColor: '#d33'
            });
            return;
        }

        formData.append('nombre_liquidador', nombre_liquidador);
        formData.append('telefono_liquidador', telefono_liquidador);
        formData.append('correo_liquidador', correo_liquidador);
        formData.append('pago_liquidador', pago_liquidador);
    }


    if (terminacion === 'NO APTO') {
        const motivo = document.getElementById('motivo')?.value.trim() || '';
        if (!motivo) {
            Swal.fire({
                icon: 'warning',
                title: 'Motivo requerido',
                text: 'Debes escribir el motivo si el proceso no es apto.',
                confirmButtonColor: '#d33'
            });
            return;  // para que no continúe si falta el motivo
        }
        formData.append('motivo_insolvencia', motivo);
    }

    // Generar resumen de previsualización
    let resumen = `
        <strong>Cuadernillo:</strong> ${cuadernillo ? 'Sí' : 'No'}<br>
        <strong>Fecha Cuadernillo:</strong> ${fecha_cuadernillo || 'N/A'}<br>
        <strong>Radicación:</strong> ${radicacion ? 'Sí' : 'No'}<br>
        <strong>Fecha Radicación:</strong> ${fecha_radicacion || 'N/A'}<br>
        <strong>Correcciones:</strong> ${correcciones || 'No'}<br>
        <strong>Desprendible:</strong> ${desprendibleData}<br>
        <strong>Tipo de Proceso:</strong> ${tipo_proceso}<br>
        <strong>Juzgado:</strong> ${juzgado || 'N/A'}<br>
        <strong>Liquidador:</strong> ${liquidador ? 'Sí' : 'No'}<br>
        <strong>Estado / Terminación:</strong> ${terminacion}<br>
        `;

    if (terminacion === 'NO APTO') {
        resumen += `<strong>Motivo:</strong> ${document.getElementById('motivo').value.trim()}<br>`;
    }

    if (liquidador) {
        resumen += `
    <strong>Nombre Liquidador:</strong> ${document.getElementById('nombre_liquidador').value.trim()}<br>
    <strong>Teléfono Liquidador:</strong> ${document.getElementById('telefono_liquidador').value.trim()}<br>
    <strong>Correo Liquidador:</strong> ${document.getElementById('correo_liquidador').value.trim()}<br>
    <strong>Pago Liquidador:</strong> ${document.querySelector('input[name="pago_liquidador"]:checked')?.value}<br>
    `;
    }

    if (audienciasVisibles) {
        const audienciasItems = document.querySelectorAll('#listaAudiencias .audiencia-item');
        resumen += `<strong>Audiencias:</strong><br><ul>`;
        audienciasItems.forEach((item) => {
            const descripcion = item.querySelector('input[name^="audiencias"][name$="[descripcion]"]').value.trim();
            const fecha = item.querySelector('input[name^="audiencias"][name$="[fecha]"]').value.trim();
            resumen += `<li>${descripcion} - ${fecha}</li>`;
        });
        resumen += `</ul>`;
    }

    Swal.fire({
        title: '¿Confirmar envío?',
        html: `<p>Estás a punto de guardar esta información. <strong>¿Deseas realmente guardar?</strong></p>${resumen}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('http://localhost:3000/api/actualizar-insolvencias', {
                method: 'PUT',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Guardado!',
                            text: 'Los datos se guardaron correctamente.',
                            confirmButtonColor: '#3085d6'
                        });
                        const modal = bootstrap.Modal.getInstance(document.getElementById('modalCrearInsolvencia'));
                        modal.hide();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Hubo un problema al guardar los datos.',
                            confirmButtonColor: '#d33'
                        });
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error de red o del servidor.');
                });
        }
    });

});


document.addEventListener('click', async function (e) {
    if (e.target.classList.contains('editar-proceso')) {
        const cedula = e.target.dataset.cedula;

        try {
            const response = await fetch(`http://localhost:3000/api/insolvencia/cedula/${cedula}`);
            const data = await response.json();
            console.log("Respuesta completa de la API:", data);
            if (data.success && data.data) {
                cargarDatosEnFormulario(data.data);
                const modal = new bootstrap.Modal(document.getElementById('modalCrearInsolvencia'));
                modal.show();
            } else {
                Swal.fire('Error', 'No se encontraron datos para esta cédula', 'error');
            }

        } catch (error) {
            console.error('Error al obtener datos:', error);
            Swal.fire('Error', 'No se pudo obtener la información del cliente', 'error');
        }
    }
});

function cargarDatosEnFormulario(cliente) {
    console.log("Datos del cliente recibidos CLIENTE:", cliente);

    // Datos básicos del cliente (ya funcionan)
    document.getElementById('idModal').textContent = cliente.id_cliente || '---';
    document.getElementById('inputIdCliente').value = cliente.id_cliente || '';
    const nombreCompleto = `${cliente.nombres || ''} ${cliente.apellidos || ''}`.trim();
    document.getElementById('detalleNombreCliente').textContent = nombreCompleto || '---';
    document.getElementById('detalleTipoDocumento').textContent = cliente.cedula ? `Cédula: ${cliente.cedula}` : '---';
    document.getElementById('telefonoModal').textContent = cliente.telefono || '---';
    document.getElementById('emailModal').textContent = cliente.correo || '---';
    document.getElementById('direccionModal').textContent = cliente.direccion || '---';
    document.getElementById('ciudadModal').textContent = cliente.ciudad || '---';
    const fechaVinculo = cliente.fecha_vinculo ? new Date(cliente.fecha_vinculo).toLocaleDateString() : '---';
    document.getElementById('vinculacionModal').textContent = fechaVinculo;

    // Foto de perfil
    const foto = document.getElementById('fotoperfilModal');
    if (foto) {
        foto.src = cliente.foto_perfil ? `http://localhost:3000${cliente.foto_perfil}` : '../assets/img/avatar.png';
        foto.onerror = function () {
            this.src = '../assets/img/avatar.png';
        };
    }

    // Cuadernillo y Radicación con fechas
    const cuadernilloValor = cliente.cuadernillo ? 'SI' : 'NO';
    document.querySelector(`input[name="cuadernillo"][value="${cuadernilloValor}"]`).checked = true;
    if (cliente.cuadernillo && cliente.fecha_cuadernillo) {
        document.getElementById('fecha_cuadernillo').value = cliente.fecha_cuadernillo.split('T')[0];
        document.getElementById('fecha_cuadernillo_container').style.display = 'block';
    }

    const radicacionValor = cliente.radicacion ? 'SI' : 'NO';
    document.querySelector(`input[name="radicacion"][value="${radicacionValor}"]`).checked = true;
    if (cliente.radicacion && cliente.fecha_radicacion) {
        document.getElementById('fecha_radicacion').value = cliente.fecha_radicacion.split('T')[0];
        document.getElementById('fecha_radicacion_container').style.display = 'block';
    }

    // Correcciones
    if (cliente.correcciones && cliente.correcciones.trim() !== '') {
        document.querySelector(`input[name="correcciones"][value="SI"]`).checked = true;
        document.getElementById('detalleCorrecciones').value = cliente.correcciones;
        document.getElementById('campoDetalleCorrecciones').style.display = 'block';
    } else {
        document.querySelector(`input[name="correcciones"][value="NO"]`).checked = true;
    }

    // Desprendible
    if (cliente.estado_desprendible) {
        document.querySelector(`input[name="desprendible"][value="${cliente.estado_desprendible}"]`).checked = true;

        // Mostrar calculadora parcial si es necesario
        if (cliente.estado_desprendible === 'PARCIAL') {
            document.getElementById('calculadora-parcial').style.display = 'block';
            // Aquí deberías cargar los datos de la calculadora si los tienes
        }
    }

    // Mostrar nombre del archivo de desprendible si existe
    if (cliente.ruta_desprendible) {
        const fileName = cliente.ruta_desprendible.split('/').pop();
        document.getElementById('desprendibleFileNameDisplay').textContent = fileName;
        document.getElementById('desprendiblePDFUrl').value = cliente.ruta_desprendible;
    }

    // Observaciones del desprendible
    if (cliente.obs_desprendible) {
        document.getElementById('observaciones_desprendible').value = cliente.obs_desprendible;
    }

    // Cuota a pagar
    if (cliente.cuota_pagar) {
        document.getElementById('cuota_pagar').value = cliente.cuota_pagar;
    }

    // Tipo de proceso
    if (cliente.tipo_proceso) {
        document.querySelector(`input[name="tipo_proceso"][value="${cliente.tipo_proceso}"]`).checked = true;
    }

    // Juzgado
    document.getElementById('juzgado').value = cliente.juzgado || '';

    // Estado del proceso
    if (cliente.terminacion) {
        document.querySelector(`input[name="estado"][value="${cliente.terminacion}"]`).checked = true;
        if (cliente.terminacion === 'NO APTO' && cliente.motivo_insolvencia) {
            document.getElementById('motivo').value = cliente.motivo_insolvencia;
            document.getElementById('motivo_no_apto').style.display = 'block';
        }
    }

    // Acta de aceptación
    if (cliente.acta_aceptacion) {
        const fileName = cliente.acta_aceptacion.split('/').pop();
        document.getElementById('fileNameDisplay').textContent = fileName;
        document.getElementById('archivoPDFUrl').value = cliente.acta_aceptacion;
    }

    // Cargar audiencias
    if (cliente.audiencias && cliente.audiencias.length > 0) {
        // Activar el botón de "Sí"
        document.getElementById('audiencias_si').checked = true;
        mostrarAudiencias();

        // Limpiar audiencias anteriores
        const listaAudiencias = document.getElementById('listaAudiencias');
        listaAudiencias.innerHTML = '';

        cliente.audiencias.forEach((audienciaObj, index) => {
            const div = document.createElement('div');
            div.classList.add('mb-2');

            const audiencia = audienciaObj.audiencia || '---';
            const fecha = audienciaObj.fecha_audiencias
                ? new Date(audienciaObj.fecha_audiencias).toLocaleDateString()
                : '---';

            div.innerHTML = `
            <div class="border rounded p-2 bg-light">
                <strong>Audiencia:</strong> ${audiencia}<br>
                <strong>Fecha:</strong> ${fecha}
            </div>
        `;

            listaAudiencias.appendChild(div);
        });
    } else {
        document.getElementById('audiencias_no').checked = true;
        ocultarAudiencias();
    }

}




function renderizarAudiencias(audiencias) {
    const contenedor = document.getElementById('listaAudiencias');
    contenedor.innerHTML = '';

    audiencias.forEach((audiencia, index) => {
        const item = document.createElement('div');
        item.classList.add('audiencia-item');
        item.innerHTML = `
            <input type="text" name="audiencias[${index}][descripcion]" value="${audiencia.descripcion}" placeholder="Descripción" class="form-control mb-2">
            <input type="date" name="audiencias[${index}][fecha]" value="${audiencia.fecha}" class="form-control mb-3">
        `;
        contenedor.appendChild(item);
    });
}


// Función para toggle de tarjetas
function toggleCard(element) {
    const card = element.closest('.toggle-card');
    card.classList.toggle('active');
}

// Mostrar nombre de archivo seleccionado
document.getElementById('archivoPDF').addEventListener('change', function (e) {
    const fileName = e.target.files[0] ? e.target.files[0].name : 'Ningún archivo seleccionado';
    document.getElementById('fileNameDisplay').textContent = fileName;
});




// Funciones para audiencias (similar a las anteriores pero con estilos mejorados)
function agregarAudiencia() {
    const contadorAudiencias = document.getElementById('listaAudiencias').children.length + 1;
    const nuevoId = 'audiencia_' + contadorAudiencias;

    const nuevaAudiencia = document.createElement('div');
    nuevaAudiencia.className = 'audiencia-item';
    nuevaAudiencia.id = nuevoId;
    nuevaAudiencia.innerHTML = `
      <div class="row g-2">
        <div class="col-md-7">
          <input type="text" class="form-control form-control-sm" placeholder="Descripción" 
                 name="audiencias[${contadorAudiencias}][descripcion]" required>
        </div>
        <div class="col-md-4">
          <input type="date" class="form-control form-control-sm" 
                 name="audiencias[${contadorAudiencias}][fecha]" required>
        </div>
        <div class="col-md-1">
          <button type="button" class="btn btn-sm btn-outline-danger w-100" onclick="eliminarAudiencia('${nuevoId}')">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    `;

    document.getElementById('listaAudiencias').appendChild(nuevaAudiencia);
}

function eliminarAudiencia(id) {
    Swal.fire({
        title: '¿Eliminar audiencia?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            document.getElementById(id).remove();
        }
    });
}

// Otras funciones existentes
function mostrarCampoCorrecciones() {
    document.getElementById('campoDetalleCorrecciones').style.display = 'block';
}

function ocultarCampoCorrecciones() {
    document.getElementById('campoDetalleCorrecciones').style.display = 'none';
    document.getElementById('detalleCorrecciones').value = '';
}

function mostrarAudiencias() {
    document.getElementById('contenedorAudiencias').style.display = 'block';
    if (document.getElementById('listaAudiencias').children.length === 0) {
        agregarAudiencia();
    }
}

function ocultarAudiencias() {
    document.getElementById('contenedorAudiencias').style.display = 'none';
    document.getElementById('listaAudiencias').innerHTML = '';
}

function mostrarDatosLiquidador(mostrar) {
    document.getElementById('datos_liquidador').style.display = mostrar ? 'block' : 'none';
}

function mostrarMotivo(mostrar) {
    document.getElementById('motivo_no_apto').style.display = mostrar ? 'block' : 'none';
}


document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('archivoPDF');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const uploadLabel = document.querySelector('.file-upload-label');

    if (fileInput) {
        fileInput.addEventListener('change', function (e) {
            if (this.files.length > 0) {
                // Hay archivo seleccionado
                const fileName = this.files[0].name;
                fileNameDisplay.textContent = fileName;
                uploadLabel.classList.add('has-file');
                uploadLabel.querySelector('.file-upload-text').textContent = 'Archivo seleccionado';
            } else {
                // No hay archivo seleccionado
                fileNameDisplay.textContent = 'Ningún archivo seleccionado';
                uploadLabel.classList.remove('has-file');
                uploadLabel.querySelector('.file-upload-text').textContent = 'Seleccionar archivo';
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('desprendiblePDF');
    const fileNameDisplay = document.getElementById('desprendibleFileNameDisplay');
    const uploadLabel = document.querySelector('.file-upload-container label[for="desprendiblePDF"]');

    if (fileInput && fileNameDisplay && uploadLabel) {
        fileInput.addEventListener('change', function (e) {
            if (this.files.length > 0) {
                // Archivo seleccionado
                const fileName = this.files[0].name;
                fileNameDisplay.textContent = fileName;
                uploadLabel.classList.add('has-file');
                uploadLabel.querySelector('.file-upload-text').textContent = 'Archivo seleccionado';
            } else {
                // Sin archivo
                fileNameDisplay.textContent = 'Ningún archivo seleccionado';
                uploadLabel.classList.remove('has-file');
                uploadLabel.querySelector('.file-upload-text').textContent = 'Seleccionar desprendible';
            }
        });
    } else {
        console.error("Elementos no encontrados. Verifica los IDs en el HTML.");
    }
});

function formatearPeso(valor) {
    return valor.toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    });
}


const radioParcial = document.getElementById("desprendible_parcial");
const radioOtros = document.querySelectorAll('input[name="desprendible"]:not(#desprendible_parcial)');
const seccionParcial = document.getElementById("calculadora-parcial");

const salario = document.getElementById("salario");
const salud = document.getElementById("salud");
const salario_total = document.getElementById("salario_total");
const saldo_total = document.getElementById("saldo_total");
const deducciones = document.getElementById("deducciones");
const saldo_libre = document.getElementById("saldo_libre");
const porcentaje = document.getElementById("porcentaje");
const cuota_pagar = document.getElementById("cuota_pagar");

function formatCurrency(value) {
    const number = parseFloat(value);
    if (isNaN(number)) return "";
    return '$' + number.toLocaleString('en-US', { maximumFractionDigits: 0 });

}

function unformatCurrency(value) {
    return parseFloat(value.replace(/[^0-9.-]+/g, "")) || 0;
}

function calcular() {
    const sal = unformatCurrency(salario.value);
    const salu = unformatCurrency(salud.value);
    const ded = unformatCurrency(deducciones.value);
    const porc = parseFloat(porcentaje.value) || 0;

    const sal_total = sal - salu;
    salario_total.value = formatCurrency(sal_total);
    salario_total.style.color = sal_total < 0 ? 'red' : 'inherit';

    const saldo = sal_total / 2;
    saldo_total.value = formatCurrency(saldo);
    saldo_total.style.color = saldo < 0 ? 'red' : 'inherit';

    const libre = saldo - ded;
    saldo_libre.value = formatCurrency(libre);
    saldo_libre.style.color = libre < 0 ? 'red' : 'inherit';

    const cuota = (libre * porc) / 100;
    cuota_pagar.value = formatCurrency(cuota);
    cuota_pagar.style.color = cuota < 0 ? 'red' : 'inherit';
}

function applyCurrencyFormatting(input) {
    input.addEventListener("input", () => {
        calcular(); // Calcula mientras escribe, pero sin formatear
    });

    input.addEventListener("blur", () => {
        const value = unformatCurrency(input.value);
        input.value = formatCurrency(value); // Formatea solo cuando termina de escribir
    });

    // Formatear al inicio si hay un valor cargado
    input.value = formatCurrency(unformatCurrency(input.value));
}


[salario, salud, deducciones].forEach(applyCurrencyFormatting);
porcentaje.addEventListener("input", calcular);

radioParcial.addEventListener("change", () => {
    if (radioParcial.checked) {
        seccionParcial.style.display = "block";
    }
});

radioOtros.forEach(radio => {
    radio.addEventListener("change", () => {
        seccionParcial.style.display = "none";
    });
});

function mostrarFecha(tipo, mostrar) {
    const container = document.getElementById(`fecha_${tipo}_container`);
    if (container) {
        container.style.display = mostrar ? 'block' : 'none';
    }
}

function mostrarCampoCorrecciones() {
    document.getElementById("campoDetalleCorrecciones").style.display = "block";
}

function ocultarCampoCorrecciones() {
    document.getElementById("campoDetalleCorrecciones").style.display = "none";
}