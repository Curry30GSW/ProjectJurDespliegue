// ==========================
// MOSTRAR / OCULTAR CAMPOS SEGÚN OPCIONES
// ==========================

// Campo según tipo de trabajo
function mostrarCamposTrabajo(valor) {
  const esActivo = valor === '1';

  document.getElementById('campoEmpresa').style.display = esActivo ? 'block' : 'none';
  document.getElementById('campoCargo').style.display = esActivo ? 'block' : 'none';
  document.getElementById('campoPagaduria').style.display = esActivo ? 'none' : 'block';

  // Hacer requeridos los campos según la selección
  document.getElementById('empresa').required = esActivo;
  document.getElementById('cargo').required = esActivo;
  document.getElementById('pagaduria').required = !esActivo;
}

// Campo de otro sexo
function toggleOtroSexo(valor) {
  document.getElementById('campoOtroSexo').style.display = (valor === 'Otro') ? 'block' : 'none';
}

// Función genérica para mostrar/ocultar campos
function toggleCampoPorValor(idSelect, idCampo, valorEsperado) {
  const valor = document.getElementById(idSelect).value;
  const campo = document.getElementById(idCampo);
  if (campo) {
    campo.style.display = (valor === valorEsperado) ? 'block' : 'none';
  }
}

// Campos específicos que usan la función genérica
function toggleBienesInmueblesInput() {
  toggleCampoPorValor('bienes_inmuebles', 'bienInmuebleInputs', 'si');
}

function toggleDataCreditoInput() {
  toggleCampoPorValor('data_credito', 'dataCreditoInput', 'si');
}

function mostrarVistaPrevia(event) {
  const input = event.target;
  const preview = document.getElementById('previewImagen');
  const previewRef = document.getElementById('previewImagenRef');

  if (input.files && input.files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      preview.src = e.target.result;
      if (previewRef) previewRef.src = e.target.result;
    }

    reader.readAsDataURL(input.files[0]);
  }
}

function obtenerReferenciasPersonales() {
  const personales = [];
  const container = document.querySelector('.card:has(.card-header.bg-success)');
  for (let i = 1; i <= 3; i++) {
    const nombre = container.querySelector(`input[name=referencia${i}]`)?.value.trim();
    const telefono = container.querySelector(`input[name=telefono_referencia${i}]`)?.value.trim();

    if (nombre && telefono) {
      personales.push({
        personal_nombre: nombre,
        personal_telefono: telefono
      });
    }
  }
  return personales;
}

function obtenerReferenciasFamiliares() {
  const familiares = [];
  const container = document.querySelector('.card:has(.card-header.bg-info)');
  for (let i = 1; i <= 3; i++) {
    const nombre = container.querySelector(`input[name=referencia${i}]`)?.value.trim();
    const telefono = container.querySelector(`input[name=telefono_referencia${i}]`)?.value.trim();
    const parentesco = container.querySelector(`select[name=parentesco${i}]`)?.value.trim();

    if (nombre && telefono && parentesco && parentesco !== 'Seleccione Parentesco') {
      familiares.push({
        familia_nombre: nombre,
        familia_telefono: telefono,
        parentesco: parentesco
      });
    }
  }
  return familiares;
}

// Calcular edad desde fecha de nacimiento
function calcularEdad() {
  const fechaInput = document.getElementById('fechaNacimiento');
  const edadInput = document.getElementById('edad');

  if (!fechaInput || !edadInput || !fechaInput.value) return;

  const hoy = new Date();
  const cumple = new Date(fechaInput.value);
  let edad = hoy.getFullYear() - cumple.getFullYear();

  const m = hoy.getMonth() - cumple.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) {
    edad--;
  }

  edadInput.value = edad;
}

// Formatear valores numéricos como moneda
function formatearMoneda(input) {
  if (!input) return;

  // Guardar posición del cursor
  const start = input.selectionStart;
  const end = input.selectionEnd;

  let valor = input.value.replace(/\D/g, '');
  input.dataset.rawValue = valor;

  if (valor) {
    input.value = '$ ' + new Intl.NumberFormat('es-CO').format(valor);
  } else {
    input.value = '';
  }

  // Restaurar posición del cursor
  input.setSelectionRange(start, end);
}
// Obtener el nombre del asesor desde sessionStorage
const nombreAsesor = sessionStorage.getItem('nombreUsuario');

// Si existe, actualizar el elemento en el DOM
if (nombreAsesor) {
  document.getElementById('asesorNombre').textContent = nombreAsesor;
} else {
  console.warn('No se encontró el nombre del asesor en sessionStorage');
}


function validarCamposObligatorios(form) {
  const camposObligatorios = [
    { id: 'nombre', nombre: 'Nombres' },
    { id: 'apellidos', nombre: 'Apellidos' },
    { id: 'cedula', nombre: 'Cédula' },
    { id: 'sexo', nombre: 'Sexo' },
    { id: 'fechaNacimiento', nombre: 'Fecha de nacimiento' },
    { id: 'estadoCivil', nombre: 'Estado civil' },
    { id: 'telefono', nombre: 'Teléfono' },
    { id: 'trabaja', nombre: 'Situación laboral' },
    { id: 'direccion', nombre: 'Dirección' },
    { id: 'ciudad', nombre: 'Ciudad' },
    { id: 'correo', nombre: 'Correo Electronico' },
    { id: 'barrio', nombre: 'Barrio' },
    { id: 'ingresos', nombre: 'Salario' }
  ];

  const archivosObligatorios = [
    { id: 'archivoPDF', nombre: 'Cédula (PDF)', campoUrl: 'archivoPDFUrl' },
    { id: 'desprendible', nombre: 'Desprendible de pago', campoUrl: 'desprendibleUrl' }
  ];

  const camposFaltantes = [];
  const camposInvalidos = [];

  // Validar campos obligatorios de texto
  camposObligatorios.forEach(campo => {
    const elemento = document.getElementById(campo.id);
    if (!elemento || !elemento.value) {
      camposFaltantes.push(campo.nombre);
      if (elemento) {
        elemento.classList.add('is-invalid');
      }
    } else {
      if (elemento) elemento.classList.remove('is-invalid');
    }
  });

  // Validar archivos obligatorios
  archivosObligatorios.forEach(archivo => {
    const fileInput = document.getElementById(archivo.id);
    const urlInput = document.getElementById(archivo.campoUrl);

    // Verificar si no hay archivo seleccionado ni URL previa
    if ((!fileInput || !fileInput.files[0]) && (!urlInput || !urlInput.value)) {
      camposFaltantes.push(archivo.nombre);
      if (fileInput) {
        fileInput.classList.add('is-invalid');
      }
    } else {
      if (fileInput) fileInput.classList.remove('is-invalid');
    }
  });

  // Validar data crédito si está marcado como "Sí"
  const dataCredito = document.getElementById('data_credito');
  const dataCreditoPdf = document.getElementById('data_credito_pdf');
  const dataCreditoUrl = document.getElementById('dataCreditoPdfUrl');

  if (dataCredito && dataCredito.value === 'si') {
    if ((!dataCreditoPdf || !dataCreditoPdf.files[0]) && (!dataCreditoUrl || !dataCreditoUrl.value)) {
      camposFaltantes.push('Data crédito (PDF)');
      if (dataCreditoPdf) {
        dataCreditoPdf.classList.add('is-invalid');
      }
    } else {
      if (dataCreditoPdf) dataCreditoPdf.classList.remove('is-invalid');
    }
  }

  // Validar bienes inmuebles si está marcado como "Sí"
  const bienesInmuebles = document.getElementById('bienes_inmuebles');
  const bienesInmueblesInput = document.getElementById('bienesInmuebles');
  const bienesInmueblesUrls = document.getElementById('bienesInmueblesUrls');

  if (bienesInmuebles && bienesInmuebles.value === 'si') {
    if ((!bienesInmueblesInput || !bienesInmueblesInput.files[0]) && (!bienesInmueblesUrls || !bienesInmueblesUrls.value)) {
      camposFaltantes.push('Documentos de bienes inmuebles');
      if (bienesInmueblesInput) {
        bienesInmueblesInput.classList.add('is-invalid');
      }
    } else {
      if (bienesInmueblesInput) bienesInmueblesInput.classList.remove('is-invalid');
    }
  }

  // Validar referencias familiares (mínimo 2)
  const refFamiliaresCompletas = obtenerReferenciasFamiliares();
  if (!refFamiliaresCompletas) {
    camposFaltantes.push('Referencias familiares (mínimo 2 completas)');
  }

  // Validar referencias personales (mínimo 2)
  const refPersonalesCompletas = obtenerReferenciasPersonales();
  if (!refPersonalesCompletas) {
    camposFaltantes.push('Referencias personales (mínimo 2 completas)');
  }

  return camposFaltantes;
}

// ==========================
// MANEJO DEL FORMULARIO 
// ==========================

// Función optimizada para subir archivos
async function subirArchivo(file, tipo, cedula) {
  if (!file) return null;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('tipo', tipo);
  formData.append('cedula', cedula);


  try {
    const response = await fetch('http://localhost:3000/api/upload', {  // Cambiado a ruta relativa
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status} al subir archivo`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error subiendo ${tipo}:`, error);
    throw new Error(`No se pudo subir el archivo: ${error.message}`);
  }
}

// Función para enviar los datos del cliente
async function enviarDatosCliente(formValues) {
  try {
    const response = await fetch('http://localhost:3000/api/insert-clientes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formValues)
    });

    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch {
      throw new Error(`Respuesta inválida del servidor: ${responseText}`);
    }

    if (!response.ok) {
      throw new Error(responseData.message || `Error ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error('Error enviando datos:', error);
    throw error;
  }
}

// Función principal para manejar el envío del formulario
async function handleFormSubmit(e) {
  e.preventDefault(); // Esto debe ir AL INICIO de la función
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');

  // Configurar estado de carga
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';

  try {
    // 1. Validar campos obligatorios (incluyendo archivos)
    const camposFaltantes = validarCamposObligatorios(form);

    if (camposFaltantes.length > 0) {
      // Mostrar alerta con campos faltantes
      Swal.fire({
        title: 'Campos incompletos',
        html: `<div class="text-start">Los siguientes campos son obligatorios:<ul class="mt-2">${camposFaltantes.map(campo => `<li>${campo}</li>`).join('')
          }</ul></div>`,
        icon: 'error',
        confirmButtonText: 'Entendido'
      });

      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      return; // Detener la ejecución si hay campos faltantes
    }

    // 2. Subir archivos en paralelo
    const fileUploads = [];
    const fileFields = [
      { id: 'fotoPerfil', type: 'fotoPerfil', target: 'fotoPerfilUrl' },
      { id: 'archivoPDF', type: 'cedulaPdf', target: 'archivoPDFUrl' },
      { id: 'desprendible', type: 'desprendible', target: 'desprendibleUrl' },
      { id: 'data_credito_pdf', type: 'dataCredito', target: 'dataCreditoPdfUrl' }
    ];
    const cedula = form.cedula.value;

    // Subir archivos individuales
    fileFields.forEach(field => {
      const fileInput = document.getElementById(field.id);
      if (fileInput?.files[0]) {
        fileUploads.push(
          subirArchivo(fileInput.files[0], field.type, cedula)
            .then(data => {
              document.getElementById(field.target).value = data.url;
              return data;
            })
        );
      }
    });

    // Subir múltiples archivos de bienes inmuebles
    const bienesInmueblesInput = document.getElementById('bienesInmuebles');
    if (bienesInmueblesInput?.files.length > 0) {
      const bienesUploads = Array.from(bienesInmueblesInput.files).map(file =>
        subirArchivo(file, 'bienesInmuebles')
      );
      fileUploads.push(
        Promise.all(bienesUploads)
          .then(results => {
            const urls = results.map(r => r.url).filter(Boolean);
            document.getElementById('bienesInmueblesUrls').value = JSON.stringify(urls);
          })
      );
    }

    await Promise.all(fileUploads);

    // 3. Preparar datos del formulario
    const formData = {
      nombres: form.nombre.value,
      apellidos: form.apellidos.value,
      cedula: form.cedula.value,
      direccion: form.direccion.value,
      telefono: form.telefono.value,
      sexo: form.sexo.value,
      otroSexo: form.otroSexo?.value || '',
      fechaNacimiento: form.fechaNacimiento.value,
      edad: form.edad.value,
      ciudad: form.ciudad.value,
      correo: form.correo.value,
      barrio: form.barrio.value,
      estadoCivil: form.estadoCivil.value,
      trabaja: form.trabaja.value,
      empresa: form.empresa?.value || '',
      cargo: form.cargo?.value || '',
      pagaduria: form.pagaduria?.value || '',
      ingresos: parseInt(form.ingresos.value.replace(/\D/g, '')) || 0,
      fotoPerfilUrl: form.fotoPerfilUrl.value,
      archivoPDFUrl: form.archivoPDFUrl.value,
      desprendibleUrl: form.desprendibleUrl.value,
      dataCreditoPdfUrl: form.dataCreditoPdfUrl.value,
      bienesInmueblesUrls: form.bienesInmueblesUrls.value,
      asesor: sessionStorage.getItem('nombreUsuario') || 'Nombre por defecto',
      referencias_personales: obtenerReferenciasPersonales(),
      referencias_familiares: obtenerReferenciasFamiliares()
    };

    // 4. Enviar datos al servidor
    const result = await enviarDatosCliente(formData);

    // 5. Mostrar mensaje de éxito
    Swal.fire({
      title: '¡Éxito!',
      text: `Cliente creado exitosamente con ID: ${result.id}`,
      icon: 'success',
      confirmButtonText: 'Aceptar',
      timer: 3000,
    }).then(() => {
      form.reset(); // Limpiar el formulario después de cerrar la alerta
    });
  } catch (error) {
    console.error('Error en el proceso:', error);
    Swal.fire({
      title: 'Error',
      text: error.message || 'Ocurrió un error al guardar el cliente',
      icon: 'error',
      confirmButtonText: 'Entendido'
    });
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

// Inicialización del formulario
function inicializarFormulario() {
  const form = document.getElementById('formCrearCliente');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  // Inicializar eventos para campos condicionales
  document.getElementById('sexo')?.addEventListener('change', function () {
    toggleOtroSexo(this.value);
  });

  document.getElementById('trabaja')?.addEventListener('change', function () {
    mostrarCamposTrabajo(this.value);
  });

  document.getElementById('bienes_inmuebles')?.addEventListener('change', toggleBienesInmueblesInput);
  document.getElementById('data_credito')?.addEventListener('change', toggleDataCreditoInput);
  document.getElementById('fechaNacimiento')?.addEventListener('change', calcularEdad);
  document.getElementById('ingresos')?.addEventListener('input', function () {
    formatearMoneda(this);
  });
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarFormulario);