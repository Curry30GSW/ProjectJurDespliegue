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
            <td class="align-middle text-center">
                <p class="text-secondary text-xs font-weight-normal">${fechaFormateada}</p>
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

    // Opcional: Cerrar toggles si los hay
    // document.querySelectorAll('#modalCrearInsolvencia .toggle-content').forEach(toggle => {
    //     toggle.style.display = 'none';
    // });
        // Limpiar campos de la calculadora parcial
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

}


document.getElementById('formCrearCliente').addEventListener('submit', function (e) {
    e.preventDefault();
    // Validar radios obligatorios
    const radiosObligatorios = [
        'cuadernillo',
        'radicacion',
        'correciones',
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
    const radicacion = document.querySelector('input[name="radicacion"]:checked')?.value === 'SI' ? 1 : 0;

    const correccionesRadio = document.querySelector('input[name="correciones"]:checked')?.value;
    const correcciones = correccionesRadio === 'SI'
        ? document.getElementById('detalleCorrecciones').value.trim()
        : '';

    const archivoPDF = document.getElementById('archivoPDF').files[0];
    const audienciasVisibles = document.querySelector('input[name="audiencias"]:checked')?.value === 'Sí';
    const desprendible = document.querySelector('input[name="desprendible"]:checked')?.value || '';
    const tipo_proceso = document.querySelector('input[name="tipo_proceso"]:checked')?.value || '';
    const juzgado = document.getElementById('juzgado')?.value.trim() || '';
    const liquidador = document.querySelector('input[name="liquidador"]:checked')?.value === 'Sí' ? 1 : 0;
    const terminacion = document.querySelector('input[name="estado"]:checked')?.value || '';



    const formData = new FormData();
    formData.append('id_cliente', id_cliente);
    formData.append('cuadernillo', cuadernillo);
    formData.append('radicacion', radicacion);
    formData.append('correcciones', correcciones);
    formData.append('desprendible', desprendible);
    formData.append('tipo_proceso', tipo_proceso);
    formData.append('juzgado', juzgado);
    formData.append('liquidador', liquidador);
    formData.append('terminacion', terminacion);

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
        <strong>Radicación:</strong> ${radicacion ? 'Sí' : 'No'}<br>
        <strong>Correcciones:</strong> ${correcciones || 'No'}<br>
        <strong>Desprendible:</strong> ${desprendible}<br>
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
            // Solo aquí se envía al backend
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
    document.getElementById('inputIdCliente').value = cliente.id_cliente;

    const cuadernilloValor = cliente.cuadernillo ? 'SI' : 'NO';
    const cuadernilloInput = document.querySelector(`input[name="cuadernillo"][value="${cuadernilloValor}"]`);
    if (cuadernilloInput) cuadernilloInput.checked = true;

    const radicacionValor = cliente.radicacion ? 'SI' : 'NO';
    const radicacionInput = document.querySelector(`input[name="radicacion"][value="${radicacionValor}"]`);
    if (radicacionInput) radicacionInput.checked = true;

    if (cliente.correcciones && cliente.correcciones.trim() !== '') {
        document.querySelector(`input[name="correciones"][value="SI"]`).checked = true;
        document.getElementById('detalleCorrecciones').value = cliente.correcciones;
    } else {
        document.querySelector(`input[name="correciones"][value="NO"]`).checked = true;
        document.getElementById('detalleCorrecciones').value = '';
    }

    if (cliente.audiencias && cliente.audiencias.length > 0) {
        document.querySelector(`input[name="audiencias"][value="Sí"]`).checked = true;
        renderizarAudiencias(cliente.audiencias);
    } else {
        document.querySelector(`input[name="audiencias"][value="No"]`).checked = true;
        document.getElementById('listaAudiencias').innerHTML = '';
    }

    const desprendibleValor = cliente.desprendible ? cliente.desprendible.toUpperCase() : '';
    const desprendibleInput = document.querySelector(`input[name="desprendible"][value="${desprendibleValor}"]`);
    if (desprendibleInput) desprendibleInput.checked = true;

    const inputTipoProceso = document.querySelector(`input[name="tipo_proceso"][value="${cliente.tipo_proceso}"]`);
    if (inputTipoProceso) inputTipoProceso.checked = true;

    document.getElementById('juzgado').value = cliente.juzgado || '';

    document.querySelector(`input[name="liquidador"][value="${cliente.liquidador ? 'Sí' : 'No'}"]`).checked = true;

    document.querySelector(`input[name="estado"][value="${cliente.terminacion}"]`).checked = true;

    if (cliente.terminacion === 'NO APTO') {
        document.getElementById('motivo').value = cliente.motivo_insolvencia || '';
    }

    if (cliente.liquidador) {
        document.getElementById('nombre_liquidador').value = cliente.nombre_liquidador || '';
        document.getElementById('telefono_liquidador').value = cliente.telefono_liquidador || '';
        document.getElementById('correo_liquidador').value = cliente.correo_liquidador || '';

        const inputPagoLiquidador = document.querySelector(`input[name="pago_liquidador"][value="${cliente.pago_liquidador}"]`);
        if (inputPagoLiquidador) inputPagoLiquidador.checked = true;
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