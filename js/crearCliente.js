// ==========================
// MOSTRAR / OCULTAR CAMPOS SEGÚN OPCIONES
// ==========================

function mostrarCamposTrabajo(valor) {
  const esActivo = valor === '1';

  document.getElementById('campoEmpresa').style.display = esActivo ? 'block' : 'none';
  document.getElementById('campoCargo').style.display = esActivo ? 'block' : 'none';
  document.getElementById('campoPagaduria').style.display = esActivo ? 'none' : 'block';

  // Campos requeridos según selección
  document.getElementById('empresa').required = esActivo;
  document.getElementById('cargo').required = esActivo;
  document.getElementById('pagaduria1').required = !esActivo;
  document.getElementById('valor1').required = !esActivo;

  // Habilitar o deshabilitar el campo 'ingresos'
  document.getElementById('ingresos').disabled = !esActivo;

  // Reiniciar campos de pagadurías
for (let i = 2; i <= 4; i++) {
  document.getElementById(`grupoPagaduria${i}`).style.display = 'none';
  document.getElementById(`grupoValor${i}`).style.display = 'none';
  document.getElementById(`grupoDescuento${i}`).style.display = 'none'; // <- esta línea corregida
  document.getElementById(`pagaduria${i}`).value = '';
  document.getElementById(`valor${i}`).value = '';
}
}


function mostrarSiguientePagaduria(numero) {
  const pagaduria = document.getElementById(`pagaduria${numero}`);
  const valor = document.getElementById(`valor${numero}`);

  if (pagaduria.value.trim() !== '' && valor.value.trim() !== '') {
    const siguiente = numero + 1;
    if (siguiente <= 4) {
      document.getElementById(`grupoPagaduria${siguiente}`).style.display = 'block';
      document.getElementById(`grupoValor${siguiente}`).style.display = 'block';
      document.getElementById(`grupoDescuento${siguiente}`).style.display = 'block';
    }
  }
}


function calcularSalarioPensionado() {
  let salarioTotal = 0;

  for (let i = 1; i <= 4; i++) {
    const valorInput = document.getElementById(`valor${i}`);
    const descuentoSelect = document.getElementById(`descuento${i}`);

    if (valorInput && descuentoSelect && valorInput.value.trim() !== '') {
      // Elimina puntos del valor formateado
      const valorLimpio = valorInput.value.replace(/\./g, '').replace(/\s/g, '');
      const valor = parseFloat(valorLimpio);
      const descuento = parseFloat(descuentoSelect.value);
      const valorConDescuento = valor - (valor * descuento);
      salarioTotal += valorConDescuento;
    }
  }

  // Mostrar el salario total formateado como número colombiano
  document.getElementById('ingresos').value = Math.round(salarioTotal).toLocaleString('es-CO');
}

for (let i = 1; i <= 4; i++) {
  document.getElementById(`valor${i}`).addEventListener('input', calcularSalarioPensionado);
  document.getElementById(`descuento${i}`).addEventListener('change', calcularSalarioPensionado);
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
  const bienesInmueblesSelect = document.getElementById('bienesInmuebles');
  const bienInmuebleInputs = document.getElementById('bienInmuebleInputs');

  bienInmuebleInputs.style.display = bienesInmueblesSelect.value === 'si' ? 'block' : 'none';

  // Resetear el campo si vuelven a "No"
  if (bienesInmueblesSelect.value === 'no') {
    document.getElementById('bienes_inmuebles_pdf').value = '';
    document.getElementById('bienesInmueblesUrls').value = '';
  }
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

function obtenerReferenciasFamiliares() {
  const familiares = [];
  // Cambiar a un selector más confiable
  const container = document.querySelector('#referencias-familiares'); // Agrega este ID al HTML

  if (!container) {
    console.error('No se encontró el contenedor de referencias familiares');
    return familiares;
  }

  for (let i = 1; i <= 3; i++) {
    const nombre = container.querySelector(`input[name="referencia${i}"]`)?.value.trim();
    const telefono = container.querySelector(`input[name="telefono_referencia${i}"]`)?.value.trim();
    const parentesco = container.querySelector(`select[name="parentesco${i}"]`)?.value;

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

// Versión equivalente para referencias personales
function obtenerReferenciasPersonales() {
  const personales = [];
  const container = document.querySelector('#referencias-personales'); // Agrega este ID al HTML

  if (!container) {
    console.error('No se encontró el contenedor de referencias personales');
    return personales;
  }

  for (let i = 1; i <= 3; i++) {
    const nombre = container.querySelector(`input[name="referencia${i}"]`)?.value.trim();
    const telefono = container.querySelector(`input[name="telefono_referencia${i}"]`)?.value.trim();

    if (nombre && telefono) {
      personales.push({
        personal_nombre: nombre,
        personal_telefono: telefono
      });
    }
  }
  return personales;
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

function formatearMoneda(input) {
  // Obtener solo los números
  let valor = input.value.replace(/\D/g, '');

  // Guardar valor sin formato para enviar si se quiere
  input.dataset.rawValue = valor;

  if (valor) {
    // Formatear como moneda sin incluir el símbolo $
    input.value = new Intl.NumberFormat('es-CO').format(valor);
  } else {
    input.value = '';
  }
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
  const refFamiliares = obtenerReferenciasFamiliares();
  if (refFamiliares.length < 2) {
    camposFaltantes.push('Referencias familiares (mínimo 2 completas)');
  }

  // Validar referencias personales (mínimo 2)
  const refPersonales = obtenerReferenciasPersonales();
  if (refPersonales.length < 2) {
    camposFaltantes.push('Referencias personales (mínimo 2 completas)');
  }
  return camposFaltantes;
}

// ==========================
// MANEJO DEL FORMULARIO 
// ==========================

// Función optimizada para subir archivos
async function verificarCedula(cedula) {
  try {
    const response = await fetch(`http://localhost:3000/api/clientes/${cedula}`);

    if (response.ok) {
      const data = await response.json();
      return data.existe || true; // cliente existe
    }

    // Si es 404, significa que no existe: OK para crear
    if (response.status === 404) {
      return false;
    }

    // Otros errores sí son críticos
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status} al verificar cédula`);
  } catch (error) {
    console.error('Error al verificar cédula:', error);
    throw error;
  }
}



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
  e.preventDefault();
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
      Swal.fire({
        title: 'Campos incompletos',
        html: `<div class="text-start">Los siguientes campos son obligatorios:<ul class="mt-2">${camposFaltantes.map(campo => `<li>${campo}</li>`).join('')}</ul></div>`,
        icon: 'error',
        confirmButtonText: 'Entendido'
      });

      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      return;
    }

    const cedula = form.cedula.value;

    // Verificar si la cédula ya está registrada
    const cedulaExiste = await verificarCedula(cedula);
    if (cedulaExiste) {
      Swal.fire({
        title: 'Error',
        text: 'Ya existe un cliente con esa cédula. No se puede subir el archivo.',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });

      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      return; // Detener la ejecución si la cédula ya existe
    }

    // 2. Subir archivos en paralelo
    const fileUploads = [];
    const fileFields = [
      { id: 'fotoPerfil', type: 'fotoPerfil', target: 'fotoPerfilUrl' },
      { id: 'archivoPDF', type: 'cedulaPdf', target: 'archivoPDFUrl' },
      { id: 'desprendible', type: 'desprendible', target: 'desprendibleUrl' },
      { id: 'bienes_inmuebles_pdf', type: 'bienesInmuebles', target: 'bienesInmueblesUrls' }
    ];

    // Subir archivos solo si no hay cédula duplicada
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
      bienes: form.bienesInmuebles.value,
      bienes_inmuebles: form.bienesInmueblesUrls.value,
      valor_cuota: form.Cuota.value.replace(/\D/g, ''),
      porcentaje: form.porcentaje.value.replace(',', '.').replace(/[^\d.]/g, ''),
      valor_insolvencia: form.vinsolvencia.value.replace(/\D/g, ''),
      numero_cuotas: form.ncuota.value,
      asesor: sessionStorage.getItem('nombreUsuario') || 'Nombre por defecto',
      referencias_personales: obtenerReferenciasPersonales(),
      referencias_familiares: obtenerReferenciasFamiliares()
    };

    console.log('Datos que se enviarán al backend:', formData);
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
      form.reset();
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

  document.getElementById('bienesInmuebles')?.addEventListener('change', toggleBienesInmueblesInput);
  document.getElementById('fechaNacimiento')?.addEventListener('change', calcularEdad);
  document.getElementById('ingresos')?.addEventListener('input', function () {
    formatearMoneda(this);
  });
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarFormulario);

document.addEventListener('DOMContentLoaded', function () {
  // Función genérica para manejar la visualización de archivos
  function setupFileInput(inputId, displayId, labelSelector, defaultText = 'Seleccionar archivo', selectedText = 'Archivo seleccionado', previewContainerId = null, previewFrameId = null) {
    const fileInput = document.getElementById(inputId);
    const fileNameDisplay = document.getElementById(displayId);
    const uploadLabel = document.querySelector(labelSelector);
    const previewContainer = previewContainerId ? document.getElementById(previewContainerId) : null;
    const previewFrame = previewFrameId ? document.getElementById(previewFrameId) : null;

    if (fileInput && fileNameDisplay && uploadLabel) {
      fileInput.addEventListener('change', function (e) {
        if (this.files.length > 0) {
          const fileName = this.files[0].name;
          const fileURL = URL.createObjectURL(this.files[0]);

          fileNameDisplay.textContent = fileName;
          uploadLabel.classList.add('has-file');
          uploadLabel.querySelector('.file-upload-text').textContent = selectedText;

          if (previewFrame && previewContainer) {
            previewFrame.src = fileURL;
            previewContainer.style.display = 'block';
          }

        } else {
          fileNameDisplay.textContent = inputId === 'fotoPerfil' ? 'Ninguna foto seleccionada' : 'Ningún archivo seleccionado';
          uploadLabel.classList.remove('has-file');
          uploadLabel.querySelector('.file-upload-text').textContent = defaultText;

          if (previewFrame && previewContainer) {
            previewFrame.src = '';
            previewContainer.style.display = 'none';
          }
        }
      });
    }
  }


  setupFileInput(
    'archivoPDF',
    'cedulaFileNameDisplay',
    '.file-upload-container label[for="archivoPDF"]',
    'Subir Cédula PDF',
    'Cédula seleccionada',
    'cedulaPreviewContainer',
    'cedulaPreview'
  );

  setupFileInput(
    'desprendible',
    'desprendibleFileNameDisplay',
    '.file-upload-container label[for="desprendible"]',
    'Seleccionar desprendible',
    'Desprendible seleccionado',
    'desprendiblePreviewContainer',
    'desprendiblePreview'
  );

  setupFileInput(
    'bienes_inmuebles_pdf',
    'bienesInmueblesFileNameDisplay',
    '.file-upload-container label[for="bienes_inmuebles_pdf"]',
    'Subir Bienes Inmuebles',
    'Documento seleccionado',
    'bienesInmueblesPreviewContainer',
    'bienesInmueblesPreview'
  );


  setupFileInput(
    'fotoPerfil',
    'fotoPerfilFileNameDisplay',
    '.file-upload-container label[for="fotoPerfil"]',
    'Seleccionar foto',
    'Foto seleccionada'
  );
});