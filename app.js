
document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.getElementById('taskForm');
  const inputName = document.getElementById('newTaskNameInput');
  const inputDescription = document.getElementById('newTaskDescription');
  const inputDueDate = document.getElementById('newTaskDueDate');
  const inputStatus = document.getElementById('newTaskStatus');

  const alertaError = document.getElementById('alertaError');
  const mensajeAlerta = document.getElementById('mensajeAlerta');
  const btnCerrarAlerta = document.getElementById('btnCerrarAlerta');

  const modalElement = document.getElementById('modalNuevaTarea');
  const contenedorTareas = document.querySelector('.contenedor-tareas');
  const tituloSeccion = document.querySelector('main h2');
  const navItems = document.querySelectorAll('.isla-nav-links li');

  const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const CLASES_ESTADO = {
    'Por Hacer': 'bg-secondary',
    'En Progreso': 'bg-warning text-dark',
    'Completada': 'bg-success'
  };

  let filtroActual = 'Todas';

  //DOM

  // 1. Mover la alerta dentro del modal para que sea visible al validar
  const modalBody = taskForm.parentElement;
  alertaError.classList.remove('mb-4');
  alertaError.classList.add('mb-3');
  modalBody.prepend(alertaError);

  // 2. Agregar el campo "Prioridad" al formulario
  const campoPrioridad = document.createElement('div');
  campoPrioridad.className = 'mb-3';
  campoPrioridad.innerHTML = `
    <label for="newTaskPriority" class="form-label">Prioridad *</label>
    <select class="form-select" id="newTaskPriority">
      <option value="" selected disabled>Seleccionar...</option>
      <option value="Alta">Alta</option>
      <option value="Media">Media</option>
      <option value="Baja">Baja</option>
    </select>
  `;
  taskForm.querySelector('.modal-footer').before(campoPrioridad);
  const inputPriority = document.getElementById('newTaskPriority');

  // 3. Marcar las tarjetas existentes con su estado
  contenedorTareas.querySelectorAll('.tarjeta-tarea').forEach((card) => {
    const badgeEstado = card.querySelector('.badge:not([class*="prioridad-"])');
    card.dataset.status = badgeEstado.textContent.trim();
  });

  // Alerta
  function mostrarError(mensaje) {
    mensajeAlerta.textContent = mensaje;
    alertaError.classList.remove('d-none');
  }

  function ocultarError() {
    alertaError.classList.add('d-none');
  }

  btnCerrarAlerta.addEventListener('click', ocultarError);

  // Limpiar el formulario y la alerta cada vez que se cierra el modal
  modalElement.addEventListener('hidden.bs.modal', () => {
    taskForm.reset();
    ocultarError();
  });

  // vALIDACION
  function validFormFieldInput(data) {
    let mensaje = '';

    if (!data.name) {
      mensaje = 'El nombre de la tarea no puede estar vacío.';
    } else if (!data.description) {
      mensaje = 'La descripción no puede estar vacía.';
    } else if (!data.dueDate) {
      mensaje = 'Debes seleccionar una fecha de entrega.';
    } else if (!data.status) {
      mensaje = 'Debes seleccionar un estado para la tarea.';
    } else if (!data.priority) {
      mensaje = 'Debes seleccionar una prioridad.';
    }

    if (mensaje) {
      mostrarError(mensaje);
      return false;
    }
    return true;
  }

  // Utilidades
  function formatearFecha(fechaISO) {
    // "2026-11-15" -> "15 Nov" (sin usar Date para evitar desfases de zona horaria)
    const [, mes, dia] = fechaISO.split('-');
    return `${parseInt(dia, 10)} ${MESES[parseInt(mes, 10) - 1]}`;
  }

  function actualizarEstado(card, estado) {
    card.dataset.status = estado;

    const badge = card.querySelector('.badge:not([class*="prioridad-"])');
    badge.className = `badge ${CLASES_ESTADO[estado]}`;
    badge.textContent = estado;

    const completada = estado === 'Completada';
    card.classList.toggle('completada', completada);
    card.querySelector('input[type="checkbox"]').checked = completada;
  }

  // Crear nueva tarjeta
  function crearTarjeta(data) {
    const col = document.createElement('div');
    col.className = 'col';

    col.innerHTML = `
      <article class="card tarjeta-tarea h-100 p-3">
        <div class="card-body p-0 d-flex flex-column gap-2">
          <div class="d-flex justify-content-between align-items-center">
            <span class="badge prioridad-${data.priority.toLowerCase()}"></span>
            <span class="badge"></span>
          </div>
          <h3 class="card-title titulo-tarea h5 mt-2"></h3>
          <p class="card-text descripcion-tarea"></p>
          <div class="pie-tarea mt-auto pt-2 d-flex justify-content-between align-items-center border-top">
            <span class="fecha-tarea small"></span>
            <input type="checkbox" class="form-check-input">
          </div>
        </div>
      </article>
    `;

    // textContent evita que el texto del usuario se interprete como HTML
    const card = col.querySelector('.tarjeta-tarea');
    col.querySelector('[class*="prioridad-"]').textContent = data.priority;
    col.querySelector('.titulo-tarea').textContent = data.name;
    col.querySelector('.descripcion-tarea').textContent = data.description;
    col.querySelector('.fecha-tarea').textContent = `Vence: ${formatearFecha(data.dueDate)}`;
    actualizarEstado(card, data.status);

    return col;
  }

  // Filtros
  function aplicarFiltro() {
    contenedorTareas.querySelectorAll('.col').forEach((col) => {
      const estado = col.querySelector('.tarjeta-tarea').dataset.status;
      let visible = true;

      if (filtroActual === 'Pendientes') visible = estado !== 'Completada';
      if (filtroActual === 'Completadas') visible = estado === 'Completada';

      col.classList.toggle('d-none', !visible);
    });
  }

  navItems.forEach((item) => {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      const filtro = item.textContent.trim();

      if (!['Todas', 'Pendientes', 'Completadas'].includes(filtro)) return; // "Proyectos" aún no hace nada

      filtroActual = filtro;
      navItems.forEach((li) => li.classList.remove('activo'));
      item.classList.add('activo');
      tituloSeccion.textContent = filtro === 'Todas' ? 'Todas las Tareas' : `Tareas ${filtro}`;
      aplicarFiltro();
    });
  });

  // Marcar y desmarcar
  contenedorTareas.addEventListener('change', (event) => {
    if (!event.target.matches('input[type="checkbox"]')) return;

    const card = event.target.closest('.tarjeta-tarea');
    actualizarEstado(card, event.target.checked ? 'Completada' : 'Por Hacer');
    aplicarFiltro();
  });

  // Envio del Formulario
  taskForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = {
      name: inputName.value.trim(),
      description: inputDescription.value.trim(),
      dueDate: inputDueDate.value,
      status: inputStatus.value,
      priority: inputPriority.value
    };

    if (!validFormFieldInput(data)) return;

    contenedorTareas.prepend(crearTarjeta(data));
    aplicarFiltro();

    bootstrap.Modal.getInstance(modalElement).hide(); // el reset se hace en 'hidden.bs.modal'
  });
});