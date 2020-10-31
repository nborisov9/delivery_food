'use strict'

// day 1
const cartButton = document.querySelector("#cart-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");
const buttonAuth = document.querySelector('.button-auth')
const modalAuth = document.querySelector('.modal-auth')
const closeAuth = document.querySelector('.close-auth')
const loginForm = document.querySelector('#logInForm')
const loginInput = document.querySelector('#login')
const userName = document.querySelector('.user-name')
const buttonOut = document.querySelector('.button-out')
const cardsRestaurants = document.querySelector('.cards-restaurants')
const containerPromo = document.querySelector('.container-promo')
const restaurants = document.querySelector('.restaurants')
const menu = document.querySelector('.menu')
const logo = document.querySelector('.logo')
const cardsMenu = document.querySelector('.cards-menu')
const restaurantTitle = document.querySelector('.restaurant-title')
const restaurantRating = document.querySelector('.rating')
const restaurantPrice = document.querySelector('.price')
const restaurantCategory = document.querySelector('.category')
const inputSearch = document.querySelector('.input-search')
const modalBody = document.querySelector('.modal-body')
const modalPriceTag = document.querySelector('.modal-pricetag')
const buttonClearCart = document.querySelector('.clear-cart')

let login = localStorage.getItem('Delivery')

const cart = [] // array for cart

const getData = async (url) => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Code error: ${response.status}, 
        error status: ${response.status}`)
  }

  return await response.json()
}


const toggleModal = () => {
  modal.classList.toggle("is-open");
}

const toggleModalAuth = () => {
  modalAuth.classList.toggle('is-open')
  if (modalAuth.classList.contains('is-open')) {
    disableScroll()
  } else {
    enableScroll()
  }
}

const clearForm = () => {
    loginInput.style.borderColor = ''
    logInForm.reset() // очищает форму
}


function autorized() {
  console.log('Авторизован');

  const logOut = () => {
    login = ''
    localStorage.removeItem('Delivery')
    buttonAuth.style.display = ''
    userName.style.display = ''
    buttonOut.style.display = ''
    cartButton.style.display = ''
    buttonOut.removeEventListener('click', logOut)
    checkOut()
  }

  userName.textContent = login // *
  buttonAuth.style.display = 'none'
  userName.style.display = 'inline'
  buttonOut.style.display = 'flex'
  cartButton.style.display = 'flex'
  buttonOut.addEventListener('click', logOut)
}


function noAutorized() {
  console.log('Не авторизован');

  const logIn = event => {
    event.preventDefault()

    if (loginInput.value.trim().length > 3) {
      login = loginInput.value
      localStorage.setItem('Delivery', login)
      toggleModalAuth()
      buttonAuth.removeEventListener('click', toggleModalAuth)
      closeAuth.removeEventListener('click', toggleModalAuth)
      loginForm.removeEventListener('submit', logIn)
      checkOut()
    } else {
      loginInput.style.borderColor = '#ff0000'
      loginInput.value = ''
    }
  }

  buttonAuth.addEventListener('click', toggleModalAuth)
  buttonAuth.addEventListener('click', clearForm)
  closeAuth.addEventListener('click', toggleModalAuth)
  loginForm.addEventListener('submit', logIn)
 
  // закрытие модального окна, кликом на пустую область
  modalAuth.addEventListener('click', event => {
    if (event.target.classList.contains('is-open')) {
      toggleModalAuth()
    }
  })
}


function checkOut() {
  if (login) {
    autorized()
  } else {
    noAutorized()
  }
}

// блок с использованием createElement / insertAdjacentElement *
const createCardRestaurant = restaurant => {
  const { image, kitchen, name, price, products, stars, time_of_delivery: timeOfDelivery } = restaurant
     
  const cardRestuarant = document.createElement('a')
  cardRestuarant.className = 'card card-restaurant'
  // в объект cardRestuarant добавляем ключ products со значением из db products
  cardRestuarant.products = products
  cardRestuarant.info = { kitchen, name, price, stars }

  const card = `
        <img src="${image}"/>
        <div class="card-text">
          <div class="card-heading">
            <h3 class="card-title">${name}</h3>
            <span class="card-tag tag">${timeOfDelivery}</span>
          </div>
          <div class="card-info">
            <div class="rating">
              ${stars}
            </div>
            <div class="price">От ${price} ₽</div>
            <div class="category">${kitchen}</div>
          </div>
        </div>
        `;

// целый html element, потому что cardRestuarant создавали через createElement
  cardRestuarant.insertAdjacentHTML('beforeend', card)
  cardsRestaurants.insertAdjacentElement('beforeend', cardRestuarant)
}

const createCardGood = goods => {

  const {name, description, price, image, id} = goods

  const card = document.createElement('div')
  card.className = 'card'

  card.insertAdjacentHTML('beforeend', `
        <img src="${image}"/>
        <div class="card-text">
          <div class="card-heading">
            <h3 class="card-title card-title-reg">${name}</h3>
          </div>
          <div class="card-info">
            <div class="ingredients">
              ${description}
            </div>
          </div>
          <div class="card-buttons">
            <button class="button button-primary button-add-cart" id="${id}">
              <span class="button-card-text">В корзину</span>
              <span class="button-cart-svg"></span>
            </button>
            <strong class="card-price card-price-bold">${price} ₽</strong>
          </div>
        </div>
      `)
  cardsMenu.insertAdjacentElement('beforeend', card) // вставляем уже готовый элемент card
}

const openGoods = event => {
  const target = event.target
  // получаем родителям кликнутого элемента
  const restaurant = target.closest('.card-restaurant')

  if (login) {
    if (restaurant) {        
      // сначаала блок очищается
      cardsMenu.textContent = ''
      containerPromo.classList.add('hide')
      restaurants.classList.add('hide')
      menu.classList.remove('hide')
      
      const {kitchen, name, price, stars} = restaurant.info

      restaurantTitle.textContent = name
      restaurantRating.textContent = stars
      restaurantPrice.textContent = `От ${price} ₽`
      restaurantCategory.textContent = kitchen

      getData(`./db/${restaurant.products}`).then(data => {
        data.map(createCardGood)
      })
    }
  } else {
    toggleModalAuth()
  }
}


// реализация корзины
const addToCart = event => {
  const target = event.target
  const buttonAddToCart = target.closest('.button-add-cart')

  if (buttonAddToCart) {
    // если кликнули на нужный нам элемент кнопки с классом .button-add-cart,
    // то получаем основной класс товара cart и берем нужное из него
    const card = target.closest('.card')
    
    // через класс родителя cart, ищем его детей
    const title = card.querySelector('.card-title-reg').textContent
    const cost = card.querySelector('.card-price').textContent
    const id = buttonAddToCart.id

    const food = cart.find(item => {
      return item.id === id // вернет массив с совпадениями или undefiend, если их
    })
   
    if (food) {
      food.count += 1
    } else {
      cart.push({
        id,
        title,
        cost,
        count: 1
      })
    }

    console.log(cart);
  }
}

// список в корзине
const renderCart = () => {
  // при заходе в корзину сначала очищаем ее, а после уже что либо добавляем
  modalBody.textContent = ''

  cart.forEach(({id, title, cost, count}) => {
    const itemCart = `
      <div class="food-row">
        <span class="food-name">${title}</span>
        <strong class="food-price">${cost} </strong>
        <div class="food-counter">
          <button class="counter-button counter-minus" data-id=${id}>-</button>
          <span class="counter">${count}</span>
          <button class="counter-button counter-plus" data-id=${id}>+</button>
        </div>
      </div>
    `
    modalBody.insertAdjacentHTML('afterbegin', itemCart)
  })

  const totalPrice = cart.reduce((result, item) => {
    // parseFloat приведет строку к числу (удалит буквы)
    return result + (parseFloat(item.cost)) * item.count
  }, 0)
  
  modalPriceTag.textContent = `${totalPrice} ₽`
}

const changeCount = event => {
  const target = event.target

  if (target.classList.contains('counter-button')) {
    const food = cart.find(({id}) => {
      return id === target.dataset.id
    })
    if (target.classList.contains('counter-minus')) {
      food.count--
      food.count === 0 ? cart.splice(cart.indexOf(food), 1) : ''
    }
    if (target.classList.contains('counter-plus')) {
      food.count++
    }
  }
  // если коунтер изменился, то обновляем список товаров в корзине, соответсвенно обновляем counter
  renderCart()
}


function init() {
  getData('./db/partners.json').then(data => {
    data.map(createCardRestaurant)
  })

  // когда в корзине нажимаем кнопку 'отмена' - очищаем массив со списком товаров
  // + вызываем ф-цию renderCart(), соответсвенно пустой массив + вызов renderCart() === пустая корзина
  buttonClearCart.addEventListener('click', () => {
    cart.length = 0
    renderCart()
  })

  modalBody.addEventListener('click', changeCount)

  cartButton.addEventListener("click", () => {
    renderCart()
    toggleModal()
  });
  
  cardsMenu.addEventListener('click', addToCart)

  close.addEventListener("click", toggleModal);
  
  cardsRestaurants.addEventListener('click', openGoods)
  
  logo.addEventListener('click', () => {
    containerPromo.classList.remove('hide')
    restaurants.classList.remove('hide')
    menu.classList.add('hide')
  })

  checkOut()

  // работа с базами данных (fetch)
  // поиск по товарам
  inputSearch.addEventListener('keypress', event => {
    
    // если нажали Enter, то:
   if (event.charCode === 13) {  
    const value = event.target.value.trim()

    // если нет введенного значения, или введены пробелы,
    // то не будет и fetch запроса + очищаем сам value
    if (!value) {
      event.target.style.backgroundColor = 'rgba(255, 110, 110, 0.2)'
      event.target.value = ''

      setTimeout(() => {
        event.target.style.backgroundColor = ''
      }, 1500)
      return
    }

     getData('./db/partners.json').then(data => {
       return data.map(partner => {
         return partner.products
       })
     })
     .then(linksProduct => {
        // перед тем как внести в этот контейнер данные, предварительно очищаем его
        cardsMenu.textContent = ''

        linksProduct.forEach(link => {
          getData(`./db/${link}`).then(data => {

            const resultSearch = data.filter(({ name }) => {
              // содержит ли название товара, введенное название
              return name.toLowerCase().includes(value.toLowerCase())
            })

            // при поиске, скрываем ненжуные блоки
            containerPromo.classList.add('hide')
            restaurants.classList.add('hide')
            // при поиске, показываем товары
            menu.classList.remove('hide')

            restaurantTitle.textContent = 'Результаты поиска'
            restaurantRating.textContent = ''
            restaurantPrice.textContent = ''
            restaurantCategory.textContent = 'разная кухня'

            resultSearch.forEach(createCardGood)
          })
        })
     })
   }
  })
}

init()