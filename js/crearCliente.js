function mostrarCamposTrabajo(valor) {
    const campoEmpresa = document.getElementById('campoEmpresa');
    const campoCargo = document.getElementById('campoCargo');
    const campoPagaduria = document.getElementById('campoPagaduria');

    if (valor === 'ACTIVO') {
      campoEmpresa.style.display = 'block';
      campoCargo.style.display = 'block';
      campoPagaduria.style.display = 'none';
    } else if (valor === 'PENSIONADO') {
      campoEmpresa.style.display = 'none';
      campoCargo.style.display = 'none';
      campoPagaduria.style.display = 'block';
    } else {
      campoEmpresa.style.display = 'none';
      campoCargo.style.display = 'none';
      campoPagaduria.style.display = 'none';
    }
  }

  function mostrarVistaPrevia(event) {
    const reader = new FileReader();
    reader.onload = function () {
      document.getElementById('previewImagen').src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
  }

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

  function toggleOtroSexo(valor) {
    document.getElementById('campoOtroSexo').style.display = valor === 'Otro' ? 'block' : 'none';
  }


  function toggleBienesInmueblesInput() {
    const bienesInmuebles = document.getElementById('bienes_inmuebles').value;
    const bienesInmuebleInputs = document.getElementById('bienInmuebleInputs');
    
    // Mostrar/ocultar el input de bienes inmuebles dependiendo de la respuesta
    if (bienesInmuebles === 'si') {
      bienesInmuebleInputs.style.display = 'block';
    } else {
      bienesInmuebleInputs.style.display = 'none';
    }
  }


    // Mostrar/Ocultar campos de bienes inmuebles
    function toggleBienesInmueblesInput() {
        const valor = document.getElementById('bienes_inmuebles').value;
        const campo = document.getElementById('bienInmuebleInputs');
        campo.style.display = (valor === 'si') ? 'block' : 'none';
      }
    
      // Mostrar/Ocultar campo de Data-Crédito
      function toggleDataCreditoInput() {
        const valor = document.getElementById('data_credito').value;
        const campo = document.getElementById('dataCreditoInput');
        campo.style.display = (valor === 'si') ? 'block' : 'none';
      }

      function formatearMoneda(input) {
        // Eliminar caracteres que no sean números
        let valor = input.value.replace(/\D/g, '');
        
        // Formatear como moneda colombiana
        valor = new Intl.NumberFormat('es-CO').format(valor);
    
        // Mostrar con símbolo de pesos
        input.value = '$ ' + valor;
      }