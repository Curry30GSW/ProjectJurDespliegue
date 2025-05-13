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


document.addEventListener('DOMContentLoaded', async function () {
    if (!token) {
        window.location.href = '../../../conciliacion/login/login.html';
        return;
    }
    async function obtenerClientes() {
        try {
            const token = sessionStorage.getItem('token');
            const url = 'http://localhost:3000/api/clientes';

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


    await obtenerClientes();


});



const mostrar = (clientes) => {

    let resultados = '';

    clientes.forEach((cliente) => {

        const estadoTexto = cliente.estado == 0 ? "Activo" : "Inactivo";
        const estadoClase = cliente.estado == 0 ? "bg-gradient-success" : "bg-gradient-danger";

        // Formatear la fecha para mostrar en el formato 13/May/2025
        const fecha = new Date(cliente.fecha_vinculo);

        // Definir los meses en formato corto
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const dia = fecha.getDate();
        const mes = meses[fecha.getMonth()];
        const año = fecha.getFullYear();

        // Formato final
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
        <td>
            <p class="text-xs font-weight-bold ">${cliente.cedula}</p>
        </td>
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
                <button class="btn btn-sm btn-warning text-white editar-cliente" data-cedula="${cliente.cedula}">
                    Editar
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

$(document).on('click', '.foto-cliente', function () {
    const src = $(this).data('src');
    $('#imagen-modal').attr('src', src);

    const modal = new bootstrap.Modal(document.getElementById('modalFoto'));
    modal.show();
});
