const form = document.querySelector('form');
const inputEmail = document.querySelector('input[type="text"]');
const inputPassword = document.querySelector('input[type="password"]');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const minLength = 6;
  const maxLength = 24;
  const emailValue = inputEmail.value;

  const isEmailValid = emailValue.length >= minLength && 
    emailValue.length <= maxLength &&
    emailValue.slice(-4).includes('.com');

  if (isEmailValid) {
    postUserLogin()
  } else {
    alert(`E-mail ${emailValue} inválido!`);
  }

})

const postUserLogin = () => {
  const baseURL = 'https://ctd-todo-api.herokuapp.com/v1';

  const userObject = {
    email: inputEmail.value.toString(),
    password: inputPassword.value.toString()
  };

  fetch(`${baseURL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userObject)
  })
    .then(response => {
      return response.json()
    })
    .then(({ jwt }) => {
      if (jwt) {
        sessionStorage.setItem('token', JSON.stringify(jwt));
        goToHomePage();
      }
    })
    .catch((error) => console.log(error))
}

const goToHomePage = () => {
  location.href = 'pages/Tarefas/index.html';
}