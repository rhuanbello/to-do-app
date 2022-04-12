const inputName = document.querySelector('.name');
const inputLastname = document.querySelector('.lastname');
const inputEmail = document.querySelector('.email');
const inputPassword = Array.from(document.querySelectorAll('input[type="password"]'));
const button = document.querySelector('button');
const form = document.querySelector('form');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  console.log('validateName()', validateName(10))
  console.log('validateLastname()', validateName(15))
  console.log('validateEmail()', validateEmail())
  console.log('validatePassword()', validatePassword())
  
  if (validatePassword()) {
    postCreateUser()
  }
})

const postCreateUser = () => {
  const baseURL = 'https://ctd-todo-api.herokuapp.com/v1'
  const userObject = {
    firstName: inputName.value.toString(),
    lastName: inputLastname.value.toString(),
    email: inputEmail.value.toString(),
    password: inputPassword[0].value.toString()
  }

  console.log('usuario criado', userObject)

  fetch(baseURL + '/users', {
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
   .catch(error => {
     console.log(error)
   })

}

const validateName = (maxLenght) => {
  const nameValidateSpecialString = !/\W/g.test(inputLastname.value);
  const nameHasOnlyString = !/\d/g.test(inputName.value);

  const isNameValid = nameHasOnlyString && nameValidateSpecialString &&
    nameHasOnlyString.length < maxLenght

  return isNameValid
}

const validateEmail = () => {
  const minLength = 6;
  const maxLength = 24;
  const emailValue = inputEmail.value;
  const isEmailValid = emailValue.length >= minLength &&
    emailValue.length <= maxLength &&
    emailValue.slice(-4).includes('.com') && emailValue.includes('@');

  return isEmailValid;
}

const validatePassword = () => {
  const isBothPasswordsEqual = inputPassword[0].value === inputPassword[1].value;
  let isPasswordsMaxLength = false;

  inputPassword.forEach(input => {
    if (input.value.length >= 6 && input.value.length <= 12) {
      isPasswordsMaxLength = true;
    }
  })

  const isPasswordValid = isBothPasswordsEqual && isPasswordsMaxLength;
  return isPasswordValid;
}

const goToHomePage = () => {
  window.location.href = '../Tarefas/index.html';
}