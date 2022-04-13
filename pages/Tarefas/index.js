const profileContainer = document.querySelector('.user-info')
const tasksContainer = document.querySelector('.tasks-container')
const tasksContainerPending = document.querySelector('.tasks-container-pending')

const createTaskForm = document.querySelector('button[type="submit"]')
const inputDescricaoTarefa = document.querySelector('#novaTarea')

const url = 'https://ctd-todo-api.herokuapp.com/v1'

const getUser = () => {

  console.log('to aqui')

  fetch(`${url}/users/getMe`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': JSON.parse(sessionStorage.getItem('token')),
    }
  })
    .then(response => {
      return response.json()
    })
    .then((data) => {
      renderUsername(data)
      console.log(data)
    })
    .catch(error => console.log(error))
}

const renderUsername = ({ firstName, lastName, email }) => {
  const imgUrl = email.split('@')[0]

  profileContainer.innerHTML = `
    <p>${firstName} ${lastName}</p>
    <div class="user-image">
      <img src="https://github.com/${imgUrl}.png" alt="">
    </div>
    <button id="closeApp">Finalizar sessão</button>
  `;

  initApp()
}

const getRemoveTask = () => {
  const tasksElement = document.querySelectorAll('.tarefa')

  tasksElement.forEach((task) => {
    const removeButton = task.querySelector('.ri-delete-bin-line')
    if (removeButton) {
      removeButton.addEventListener('click', () => {
        const id = task.getAttribute('data-id')
        deleteTask(id)
      })
    }
  })
}

const deleteTask = (id) => {
  fetch(`${url}/tasks/${id}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': JSON.parse(sessionStorage.getItem('token')),
    }
  })
    .then(response => response.json())
    .then(data => getTasks())
    .catch(error => console.log(error))
}

const updateTaskStatus = ({ id, description, completed }) => {

  const updateTaskObj = {
    description: description,
    completed: !completed
  }

  fetch(`${url}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': JSON.parse(sessionStorage.getItem('token')),
    },
    body: JSON.stringify(updateTaskObj)
  })
    .then(response => response.json())
    .then(data => getTasks())
    .catch(error => console.log(error))
}

const handleFormatDate = (createdAt) => {
  return (
    new Date(createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  )
}

const renderTasks = (tasks) => {
  const orderedTasks = tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  tasksContainer.innerHTML = '';
  tasksContainerPending.innerHTML = '';

  orderedTasks.forEach(({ description, createdAt, id, completed }) => {

    if (completed) {
      tasksContainerPending.innerHTML += `
        <li class="tarefa" data-id="${id}">
          <div class="done">
            <button class="toggle-complete">
              <i class="ri-check-line"></i>
            </button>
          </div>
          <div class="descricao">
            <p class="nome">${description}</p>
            <p class="timestamp">Criada em: ${handleFormatDate(createdAt)}
            <i class="ri-delete-bin-line" ></i >
            </p>
          </div>
        </li>
      `
    } else {
      tasksContainer.innerHTML += `
        <li class="tarefa" data-id="${id}">
          <div class="not-done">
            <button class="toggle-complete">
              <i class="ri-check-line"></i>
            </button>
          </div>
          <div class="descricao">
            <p class="nome">${description}</p>
            <p class="timestamp">Criada em: ${handleFormatDate(createdAt)}
            </p>
          </div>
        </li>
      `
    }

  })
  getRemoveTask()
  getUpdateTask()
}

const getUpdateTask = () => {
  const toggleComplete = document.querySelectorAll('.toggle-complete')

  toggleComplete.forEach((button) => {
    button.addEventListener('click', () => {
      const task = button.parentElement.parentElement
      const id = task.getAttribute('data-id')
      getTasks(id)
    })
  })

}

const getTasks = (id) => {

  const isGetById = id ? `/${id}` : '';

  fetch(`${url}/tasks${isGetById}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': JSON.parse(sessionStorage.getItem('token')),
    }
  })
    .then(response => {
      return response.json()
    })
    .then((data) => {
      if (isGetById) {
        updateTaskStatus(data)
      } else {
        renderTasks(data)
        setTimeout(() => {
          tasksContainer.removeAttribute('id')
          tasksContainerPending.removeAttribute('id')
        }, 1000)
      }
    })
    .catch(error => console.log(error))
}

const createTasks = (description) => {

  const newTask = {
    description: description,
    completed: false
  }

  fetch(`${url}/tasks`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': JSON.parse(sessionStorage.getItem('token')),
    },
    body: JSON.stringify(newTask)
  })
    .then(response => response.json())
    .then(() => {
      inputDescricaoTarefa.value = '';
      getTasks()
    })
    .catch(error => console.log(error))
}

const initApp = () => {
  const endSession = document.getElementById('closeApp')

  endSession.addEventListener('click', () => {
    sessionStorage.removeItem('token');
    location.href = '../../index.html';
  })

  getTasks();

}

createTaskForm.addEventListener('click', (e) => {
  e.preventDefault()
  createTasks(inputDescricaoTarefa.value)
})

inputDescricaoTarefa.addEventListener('keypress', (e) => {
  if (e.key == 'Enter') {
    e.preventDefault()
    createTasks(inputDescricaoTarefa.value)
  } 
})

window.onload = () => {
  if (sessionStorage.getItem('token')) {
    getUser();
  } else {
    location.href = '../../index.html';
  }

}