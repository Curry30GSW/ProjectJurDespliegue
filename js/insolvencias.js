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
        console.log(cliente);

        const estadoTexto = !cliente.nombreData ? "FALTA DATACREDITO" : "Cargado";
        const estadoClase = !cliente.nombreData ? "bg-gradient-danger" : "bg-gradient-success";
        const moverAreaDisabled = !cliente.nombreData ? 'disabled' : '';

        const fecha = new Date(cliente.fecha_vinculo);
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const dia = fecha.getDate();
        const mes = meses[fecha.getMonth()];
        const año = fecha.getFullYear();
        const fechaFormateada = `${dia}/${mes}/${año}`;

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
                    <button class="btn btn-sm btn-info text-white ver-detalle" data-cedula="${cliente.cedula}">
                        Ver detalle
                    </button>
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
                        data-fecha="${fechaFormateada}">
                        Crear Insolvencia
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

    // Limpiar todos los inputs de tipo texto, email, etc.
    document.querySelectorAll('#modalCrearInsolvencia input[type="text"], #modalCrearInsolvencia input[type="email"]').forEach(input => {
        input.value = '';
    });

    // Limpiar textareas
    document.querySelectorAll('#modalCrearInsolvencia textarea').forEach(textarea => {
        textarea.value = '';
    });

    // Ocultar campos condicionales
    document.getElementById('campoDetalleCorrecciones')?.style?.setProperty('display', 'none');
    document.getElementById('contenedorAudiencias')?.style?.setProperty('display', 'none');
    document.getElementById('datos_liquidador')?.style?.setProperty('display', 'none');
    document.getElementById('motivo_no_apto')?.style?.setProperty('display', 'none');

    // Limpiar lista de audiencias
    const listaAudiencias = document.getElementById('listaAudiencias');
    if (listaAudiencias) {
        listaAudiencias.innerHTML = '';
    }

    // Resetear campo de archivo PDF
    const inputArchivo = document.getElementById('archivoPDF');
    if (inputArchivo) {
        inputArchivo.value = '';
    }

    const fileNameDisplay = document.getElementById('fileNameDisplay');
    if (fileNameDisplay) {
        fileNameDisplay.textContent = 'Ningún archivo seleccionado';
    }

    // Resetear campo oculto del archivo
    const archivoUrl = document.getElementById('archivoPDFUrl');
    if (archivoUrl) {
        archivoUrl.value = '';
    }

    // Resetear selects si los hubiera
    document.querySelectorAll('#modalCrearInsolvencia select').forEach(select => {
        select.selectedIndex = 0;
    });

    // Cerrar todos los toggles que estén abiertos
    document.querySelectorAll('#modalCrearInsolvencia .toggle-content').forEach(toggle => {
        toggle.style.display = 'none';
    });

    // Resetear campos específicos adicionales
    const juzgado = document.getElementById('juzgado');
    if (juzgado) juzgado.value = '';

    const nombreLiquidador = document.getElementById('nombre_liquidador');
    if (nombreLiquidador) nombreLiquidador.value = '';

    const telefonoLiquidador = document.getElementById('telefono_liquidador');
    if (telefonoLiquidador) telefonoLiquidador.value = '';

    const correoLiquidador = document.getElementById('correo_liquidador');
    if (correoLiquidador) correoLiquidador.value = '';

    const motivo = document.getElementById('motivo');
    if (motivo) motivo.value = '';

    const detalleCorrecciones = document.getElementById('detalleCorrecciones');
    if (detalleCorrecciones) detalleCorrecciones.value = '';
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