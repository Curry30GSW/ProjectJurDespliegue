// ==========================
// MOSTRAR / OCULTAR CAMPOS SEGÚN OPCIONES
// ==========================

// Campo según tipo de trabajo
function mostrarCamposTrabajo(valor) {
  const campoEmpresa = document.getElementById('campoEmpresa');
  const campoCargo = document.getElementById('campoCargo');
  const campoPagaduria = document.getElementById('campoPagaduria');

  campoEmpresa.style.display = (valor === 'ACTIVO') ? 'block' : 'none';
  campoCargo.style.display = (valor === 'ACTIVO') ? 'block' : 'none';
  campoPagaduria.style.display = (valor === 'PENSIONADO') ? 'block' : 'none';
}

// Campo de otro sexo
function toggleOtroSexo(valor) {
  document.getElementById('campoOtroSexo').style.display = (valor === 'Otro') ? 'block' : 'none';
}

// Función genérica para mostrar/ocultar campos
function toggleCampoPorValor(idSelect, idCampo, valorEsperado) {
  const valor = document.getElementById(idSelect).value;
  const campo = document.getElementById(idCampo);
  campo.style.display = (valor === valorEsperado) ? 'block' : 'none';
}

// Campos específicos que usan la función genérica
function toggleBienesInmueblesInput() {
  toggleCampoPorValor('bienes_inmuebles', 'bienInmuebleInputs', 'si');
}

function toggleDataCreditoInput() {
  toggleCampoPorValor('data_credito', 'dataCreditoInput', 'si');
}


// ==========================
// FUNCIONES VARIAS
// ==========================

// Vista previa de imagen
function mostrarVistaPrevia(event) {
  const reader = new FileReader();
  reader.onload = function () {
    document.getElementById('previewImagen').src = reader.result;
  };
  reader.readAsDataURL(event.target.files[0]);
}

// Calcular edad desde fecha de nacimiento
function calcularEdad() {
  const fecha = document.getElementById('fechaNacimiento').value;
  if (!fecha) return;

  const hoy = new Date();
  const cumple = new Date(fecha);
  let edad = hoy.getFullYear() - cumple.getFullYear();

  const m = hoy.getMonth() - cumple.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) edad--;

  document.getElementById('edad').value = edad;
}

// Formatear valores numéricos como moneda
function formatearMoneda(input) {
  // Eliminar caracteres no numéricos
  let valor = input.value.replace(/\D/g, '');

  // Formatear como moneda colombiana
  valor = new Intl.NumberFormat('es-CO').format(valor);

  // Mostrar con símbolo de pesos
  input.value = '$ ' + valor;
}


      document.getElementById('miFormulario').addEventListener('submit', function (e) {
        e.preventDefault(); // Evita el envío tradicional del formulario
      
        const form = e.target;
        const formData = new FormData(form);
      
        // Si el sexo es "Otro", agrega manualmente el campo otroSexo
        const sexo = formData.get('sexo');
        if (sexo === 'Otro') {
          formData.set('sexo', document.getElementById('otroSexo').value);
        }
      
        fetch('http://localhost:3000/api/insert-clientes', {
          method: 'POST',
          body: formData,
        })
          .then(response => response.json())
          .then(data => {
            console.log('Respuesta del servidor:', data);
            alert('Formulario enviado exitosamente');
          })
          .catch(error => {
            console.error('Error al enviar formulario:', error);
            alert('Error al enviar formulario');
          });
      });
      