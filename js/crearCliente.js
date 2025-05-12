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
  if (event.target.files && event.target.files[0]) {
    const reader = new FileReader();
    reader.onload = function () {
      const preview = document.getElementById('previewImagen');
      if (preview) {
        preview.src = reader.result;
      }
    };
    reader.readAsDataURL(event.target.files[0]);
  }
}

function obtenerReferenciasPersonales() {
  const personales = [];
  const container = document.querySelector('.card:has(.card-header.bg-success)');
  for (let i = 1; i <= 3; i++) {
    const nombre = container.querySelector(`input[name=referencia${i}]`)?.value.trim();
    const telefono = container.querySelector(`input[name=telefono_referencia${i}]`)?.value.trim();

    if (nombre && telefono) {
      personales.push({ nombre, telefono });
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
      familiares.push({ nombre, telefono, parentesco });
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

// ==========================
// MANEJO DEL FORMULARIO
// ==========================

// Extrae referencias familiares desde la tarjeta azul (bg-info)
// ==========================
// FUNCIONES DE UI (Mantener igual)
// ==========================
// [Todas las funciones de mostrar/ocultar campos, calcularEdad, formatearMoneda, etc. se mantienen igual]

// ==========================
// MANEJO DEL FORMULARIO - PARTE MODIFICADA
// ==========================

// Función optimizada para subir archivos
async function subirArchivo(file, tipo) {
  if (!file) return null;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('tipo', tipo);

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
    // 1. Subir archivos en paralelo
    const fileUploads = [];
    const fileFields = [
      { id: 'fotoPerfil', type: 'fotoPerfil', target: 'fotoPerfilUrl' },
      { id: 'archivoPDF', type: 'cedulaPdf', target: 'archivoPDFUrl' },
      { id: 'desprendible', type: 'desprendible', target: 'desprendibleUrl' },
      { id: 'data_credito_pdf', type: 'dataCredito', target: 'dataCreditoPdfUrl' }
    ];

    // Subir archivos individuales
    fileFields.forEach(field => {
      const fileInput = document.getElementById(field.id);
      if (fileInput?.files[0]) {
        fileUploads.push(
          subirArchivo(fileInput.files[0], field.type)
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

    // 2. Preparar datos del formulario
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
      asesor: document.getElementById('asesorNombre').textContent.trim(),
      referencias_personales: obtenerReferenciasPersonales(),
      referencias_familiares: obtenerReferenciasFamiliares()

    };

    // 3. Enviar datos del cliente
    const result = await enviarDatosCliente(formData);

    // 4. Mostrar resultado
    alert(`Cliente creado exitosamente con ID: ${result.id}`);
    form.reset();

  } catch (error) {
    console.error('Error en el proceso:', error);
    alert(`Error: ${error.message}`);
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