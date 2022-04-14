const profileContainer = document.querySelector('.user-info')
const tasksContainer = document.querySelector('.tasks-container')
const tasksContainerPending = document.querySelector('.tasks-container-pending')

const createTaskForm = document.querySelector('button[type="submit"]')
const inputDescricaoTarefa = document.querySelector('#novaTarea')

const modal = document.querySelector('.modal')
const cancelButton = document.querySelector('.cancel-button')
const saveButton = document.querySelector('.save-button')
const inputNameText = document.querySelector('.input-task-name')

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

const putUpdateTask = ({ id, description, completed }, isComplete) => {

  const updateTaskObj = {
    description: description,
    completed: isComplete ? !completed : completed,
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
            <div class="name-container">
              <p class="nome">${description}</p>
              <i class="ri-edit-box-line"></i>
            </div>
            <p class="timestamp">Criada em: ${handleFormatDate(createdAt)}
            <i class="ri-delete-bin-line" ></i>
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
            <div class="name-container">
              <p class="nome">${description}</p>
              <i class="ri-edit-box-line"></i>
            </div>
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
  const editButton = document.querySelectorAll('.ri-edit-box-line')

  editButton.forEach(button => {
    button.addEventListener('click', () => {
      modal.classList.toggle('appear')
      const id = button.parentElement.parentElement.parentElement.getAttribute('data-id')
      getTasks(id)
    })
  })

  document.addEventListener('keydown', (e) => e.key === 'Escape' && modal.classList.remove('appear'))

  cancelButton.addEventListener('click', () => {
    modal.classList.remove('appear')
  })

  toggleComplete.forEach((button) => {
    button.addEventListener('click', () => {
      const task = button.parentElement.parentElement
      const id = task.getAttribute('data-id')
      getTasks(id, true)
    })
  })

}

const getTasks = (id, isComplete) => {

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
        if (isComplete) {
          putUpdateTask(data, true)
        } else {
          renderModal(data)
        }
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


const updateTask = (data, { value }) => {
  const newTaskObj = {
    ...data,
    description: value,
  }

  putUpdateTask(newTaskObj, false)
  modal.classList.remove('appear')

}

const renderModal = (data) => {
  inputNameText.focus()

  const { description } = data

  inputNameText.value = description;

  saveButton.addEventListener('click', () => {
    updateTask(data, inputNameText)
  })

  inputNameText.addEventListener('keypress', (e) => {
    e.key === 'Enter' && updateTask(data, inputNameText)
  })

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