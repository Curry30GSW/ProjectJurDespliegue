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
            window.location.href = 'login.html';
        }
    });

    setTimeout(() => {
        window.location.href = 'login.html';
    }, 5000);
}

document.addEventListener('DOMContentLoaded', () => {
    if (!sessionStorage.getItem('token')) {
        window.location.href = 'login.html';
        return;
    }
    obtenerClientes();
});





async function obtenerClientes() {
    try {
        const token = sessionStorage.getItem('token');
        const url = 'https://silent-mirrors-show.loca.lt/api/embargo/aceptados';

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',

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

    const formatearFecha = (fecha) => {
        if (!fecha) return 'NO APLICA';

        const dateObj = new Date(fecha);
        if (isNaN(dateObj)) return 'NO APLICA';

        const dia = dateObj.getDate();
        const meses = [
            'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
            'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'
        ];
        const mes = meses[dateObj.getMonth()];
        const anio = dateObj.getFullYear();

        return `${dia}/${mes}/${anio}`;
    };
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

        let botonPDF = '';
        if (cliente.ruta_desprendible && cliente.ruta_desprendible !== '') {
            botonPDF = `
            <a class="btn btn-md btn-info visualizar-pdf" href="https://silent-mirrors-show.loca.lt/uploads/${cliente.ruta_desprendible}" target="_blank">
                <i class="fas fa-eye"></i> Ver
            </a>
        `;
        } else {
            botonPDF = `
            <button class="btn btn-md btn-danger subir-pdf" data-id="${cliente.id_embargos}"
                data-cedula="${cliente.cedula}"
                data-nombre="${cliente.nombres} ${cliente.apellidos}">
                <i class="fas fa-file-upload"></i> PDF
            </button>
        `;
        }

        resultados += `
        <tr>
            <td class="align-middle">
                <div class="d-flex align-items-center px-2 py-1">
                    <div>
                        <img src="https://silent-mirrors-show.loca.lt${cliente.foto_perfil}" 
                            class="avatar avatar-lg me-3 foto-cliente" 
                            alt="${cliente.nombres}"
                            data-src="https://silent-mirrors-show.loca.lt${cliente.foto_perfil}">
                    </div>
                    <div class="d-flex flex-column justify-content-center">
                        <span class="text-xs font-weight-bold text-dark mb-1">${cliente.nombres} ${cliente.apellidos}</span>
                        <span class="text-xs text-secondary text-dark">${cliente.cedula}</span>
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
                ${botonPDF}
            </td>
            <td class="text-center align-middle">
                <span class="text-xs font-weight-bold">${formatearFecha(cliente.fecha_terminacion)}</span>
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


document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', function (e) {
        if (e.target.closest('.subir-pdf')) {
            const btn = e.target.closest('.subir-pdf');
            const nombre = btn.getAttribute('data-nombre');
            const cedula = btn.getAttribute('data-cedula');
            const id_embargos = btn.getAttribute('data-id');

            document.getElementById('nombreClienteModal').textContent = nombre;
            document.getElementById('cedulaClienteModal').textContent = cedula;
            document.getElementById('cedulaClienteSeleccionado').value = cedula;
            document.getElementById('idEmbargoSeleccionado').value = id_embargos;

            // Limpiar input file y vista previa
            const fileInput = document.getElementById('inputDesprendible');
            const fileNameDisplay = document.getElementById('inputDesprendibleFileNameDisplay');
            const previewFrame = document.getElementById('pdfPreview');
            const previewContainer = document.getElementById('pdfPreviewContainer');
            const uploadLabel = document.querySelector('label[for="inputDesprendible"]');

            fileInput.value = '';
            fileNameDisplay.textContent = 'Ningún archivo seleccionado';
            previewFrame.src = '';
            previewContainer.style.display = 'none';

            uploadLabel.classList.remove('has-file');
            uploadLabel.querySelector('.file-upload-text').textContent = 'Seleccionar archivo PDF';

            // Mostrar la modal
            const modal = new bootstrap.Modal(document.getElementById('modalDesprendible'));
            modal.show();
        }
    });

    // Escuchar cambios en el input de tipo file
    document.getElementById('inputDesprendible').addEventListener('change', function () {
        const file = this.files[0];
        const fileNameDisplay = document.getElementById('inputDesprendibleFileNameDisplay');
        const pdfPreview = document.getElementById('pdfPreview');
        const pdfContainer = document.getElementById('pdfPreviewContainer');
        const uploadLabel = document.querySelector('label[for="inputDesprendible"]');

        if (file) {
            fileNameDisplay.textContent = file.name;

            if (file.type === 'application/pdf') {
                const fileURL = URL.createObjectURL(file);
                pdfPreview.src = fileURL;
                pdfContainer.style.display = 'block';
            } else {
                pdfPreview.src = '';
                pdfContainer.style.display = 'none';
            }

            // Cambiar color del label y texto
            uploadLabel.classList.add('has-file');
            uploadLabel.querySelector('.file-upload-text').textContent = 'Archivo seleccionado';
        } else {
            fileNameDisplay.textContent = 'Ningún archivo seleccionado';
            pdfPreview.src = '';
            pdfContainer.style.display = 'none';

            uploadLabel.classList.remove('has-file');
            uploadLabel.querySelector('.file-upload-text').textContent = 'Seleccionar archivo PDF';
        }
    });
});


document.getElementById('btnConfirmarDesprendible').addEventListener('click', async () => {
    const fileInput = document.getElementById('inputDesprendible');
    const idEmbargos = document.getElementById('idEmbargoSeleccionado').value; // Debes tener este campo en el HTML
    const estadoEmbargo = 0; // Estado que deseas actualizar

    if (!fileInput.files[0]) {
        return Swal.fire({
            icon: 'warning',
            title: 'Archivo faltante',
            text: 'Por favor selecciona un archivo PDF.'
        });
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('id_embargos', idEmbargos);
    formData.append('estado_embargo', estadoEmbargo); // Esto actualiza el estado si lo necesitas

    try {
        const response = await fetch('https://silent-mirrors-show.loca.lt/api/subir-desprendible-embargos', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalDesprendible'));
            modal.hide();

            await Swal.fire({
                icon: 'success',
                title: 'Documento Cargado Exitosamente',
                confirmButtonColor: '#198754'
            });

            // Aquí llamas tu función para actualizar la tabla
            obtenerClientes();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result.message || 'Error al subir el archivo.'
            });
        }
    } catch (error) {
        console.error('Error en la solicitud:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error de red',
            text: 'Ocurrió un error al subir el documento.'
        });
    }
});
