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
        const url = 'http://localhost:3000/api/embargo/aceptados';

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
            estadoEmbargoTexto = 'Rechazado';
            estadoEmbargoClase = 'blink bg-danger text-white px-2 rounded';
        } else if (cliente.estado_embargo === 0) {
            estadoEmbargoTexto = 'Aceptado';
            estadoEmbargoClase = 'blink bg-success text-white px-2 rounded';
        } else {
            estadoEmbargoTexto = 'Pendiente';
            estadoEmbargoClase = 'blink bg-warning text-dark px-2 rounded';
        }

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
                      <p class="text-xs text-secondary mb-0">${cliente.cedula}</p>
                  </div>
              </div>
          </td>
          <td><p class="text-xs font-weight-bold ">${cliente.radicado}</p></td>
          <td><p class="text-xs font-weight-bold ${estadoEmbargoClase}">${estadoEmbargoTexto}</p></td>
      </tr>
    `;
    });

    if ($.fn.DataTable.isDataTable('#tablaClientes')) {
        $('#tablaClientes').DataTable().clear().destroy();
    }

    $("#tablaClientes tbody").html(resultados);
};