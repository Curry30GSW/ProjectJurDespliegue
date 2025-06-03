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
}


document.getElementById('formCrearCliente').addEventListener('submit', function (e) {
    e.preventDefault();

    const id_cliente = document.getElementById('inputIdCliente').value;
    const cuadernillo = document.querySelector('input[name="cuadernillo"]:checked')?.value === 'SI' ? 1 : 0;
    const radicacion = document.querySelector('input[name="radicacion"]:checked')?.value === 'SI' ? 1 : 0;

    const correccionesRadio = document.querySelector('input[name="correciones"]:checked')?.value;
    const correcciones = correccionesRadio === 'SI'
        ? document.getElementById('detalleCorrecciones').value.trim()
        : '';

    const archivoPDF = document.getElementById('archivoPDF').files[0];
    const audienciasVisibles = document.querySelector('input[name="audiencias"]:checked')?.value === 'Sí';

    const formData = new FormData();
    formData.append('id_cliente', id_cliente);
    formData.append('cuadernillo', cuadernillo);
    formData.append('radicacion', radicacion);
    formData.append('correcciones', correcciones);

    if (archivoPDF) {
        formData.append('archivoPDF', archivoPDF);
    }

    if (audienciasVisibles) {
        const audienciasItems = document.querySelectorAll('#listaAudiencias .audiencia-item');
        audienciasItems.forEach((item, index) => {
            const descripcion = item.querySelector('input[name^="audiencias"][name$="[descripcion]"]').value;
            const fecha = item.querySelector('input[name^="audiencias"][name$="[fecha]"]').value;

            formData.append(`audiencias[${index}][descripcion]`, descripcion);
            formData.append(`audiencias[${index}][fecha]`, fecha);
        });
    }

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
});





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