'use strict';

const cartButton = document.querySelector('#cart-button');
const modal = document.querySelector('.modal');
const close = document.querySelector('.close');
const buttonAuth = document.querySelector('.button-auth');
const modalAuth = document.querySelector('.modal-auth');
const closeAuth = document.querySelector('.close-auth');
const loginForm = document.querySelector('#logInForm');
const loginInput = document.querySelector('#login');
const userName = document.querySelector('.user-name');
const buttonOut = document.querySelector('.button-out');
const cardsRestaurants = document.querySelector('.cards-restaurants');
const containerPromo = document.querySelector('.container-promo');
const restaurants = document.querySelector('.restaurants');
const menu = document.querySelector('.menu');
const logo = document.querySelector('.logo');
const cardsMenu = document.querySelector('.cards-menu');
const restaurantTitle = document.querySelector('.restaurant-title');
const restaurantRating = document.querySelector('.rating');
const restaurantPrice = document.querySelector('.price');
const restaurantCategory = document.querySelector('.category');
const inputSearch = document.querySelector('.input-search');
const modalBody = document.querySelector('.modal-body');
const modalPriceTag = document.querySelector('.modal-pricetag');
const buttonClearCart = document.querySelector('.clear-cart');

let login = localStorage.getItem('Delivery');

const cart = [];

const getData = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Code error: ${response.status}, 
        error status: ${response.status}`);
  }

  return await response.json();
};

const toggleModal = () => {
  modal.classList.toggle('is-open');
};

const toggleModalAuth = () => {
  modalAuth.classList.toggle('is-open');
  if (modalAuth.classList.contains('is-open')) {
    disableScroll();
  } else {
    enableScroll();
  }
};

const clearForm = () => {
  loginInput.style.borderColor = '';
  logInForm.reset();
};

function autorized() {
  console.log('Авторизован');

  const logOut = () => {
    login = '';
    localStorage.removeItem('Delivery');
    buttonAuth.style.display = '';
    userName.style.display = '';
    buttonOut.style.display = '';
    cartButton.style.display = '';
    buttonOut.removeEventListener('click', logOut);
    checkOut();
  };

  userName.textContent = login;
  buttonAuth.style.display = 'none';
  userName.style.display = 'inline';
  buttonOut.style.display = 'flex';
  cartButton.style.display = 'flex';
  buttonOut.addEventListener('click', logOut);
}

function noAutorized() {
  console.log('Не авторизован');

  const logIn = (event) => {
    event.preventDefault();

    if (loginInput.value.trim().length > 3) {
      login = loginInput.value;
      localStorage.setItem('Delivery', login);
      toggleModalAuth();
      buttonAuth.removeEventListener('click', toggleModalAuth);
      closeAuth.removeEventListener('click', toggleModalAuth);
      loginForm.removeEventListener('submit', logIn);
      checkOut();
    } else {
      loginInput.style.borderColor = '#ff0000';
      loginInput.value = '';
    }
  };

  buttonAuth.addEventListener('click', toggleModalAuth);
  buttonAuth.addEventListener('click', clearForm);
  closeAuth.addEventListener('click', toggleModalAuth);
  loginForm.addEventListener('submit', logIn);

  modalAuth.addEventListener('click', (event) => {
    if (event.target.classList.contains('is-open')) {
      toggleModalAuth();
    }
  });
}

function checkOut() {
  if (login) {
    autorized();
  } else {
    noAutorized();
  }
}

const createCardRestaurant = (restaurant) => {
  const {
    image,
    kitchen,
    name,
    price,
    products,
    stars,
    time_of_delivery: timeOfDelivery,
  } = restaurant;

  const cardRestuarant = document.createElement('a');
  cardRestuarant.className = 'card card-restaurant';
  cardRestuarant.products = products;
  cardRestuarant.info = { kitchen, name, price, stars };

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

  cardRestuarant.insertAdjacentHTML('beforeend', card);
  cardsRestaurants.insertAdjacentElement('beforeend', cardRestuarant);
};

const createCardGood = (goods) => {
  const { name, description, price, image, id } = goods;

  const card = document.createElement('div');
  card.className = 'card';

  card.insertAdjacentHTML(
    'beforeend',
    `
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
      `,
  );
  cardsMenu.insertAdjacentElement('beforeend', card);
};

const openGoods = (event) => {
  const target = event.target;
  const restaurant = target.closest('.card-restaurant');

  if (login) {
    if (restaurant) {
      cardsMenu.textContent = '';
      containerPromo.classList.add('hide');
      restaurants.classList.add('hide');
      menu.classList.remove('hide');

      const { kitchen, name, price, stars } = restaurant.info;

      restaurantTitle.textContent = name;
      restaurantRating.textContent = stars;
      restaurantPrice.textContent = `От ${price} ₽`;
      restaurantCategory.textContent = kitchen;

      getData(`./db/${restaurant.products}`).then((data) => {
        data.map(createCardGood);
      });
    }
  } else {
    toggleModalAuth();
  }
};

const addToCart = (event) => {
  const target = event.target;
  const buttonAddToCart = target.closest('.button-add-cart');

  if (buttonAddToCart) {
    const card = target.closest('.card');

    const title = card.querySelector('.card-title-reg').textContent;
    const cost = card.querySelector('.card-price').textContent;
    const id = buttonAddToCart.id;
    console.log('id', buttonAddToCart.id);
    const food = cart.find((item) => {
      return item.id === id;
    });

    if (food) {
      food.count += 1;
    } else {
      cart.push({
        id,
        title,
        cost,
        count: 1,
      });
    }
  }
};

const renderCart = () => {
  modalBody.textContent = '';

  cart.forEach(({ id, title, cost, count }) => {
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
    `;
    modalBody.insertAdjacentHTML('afterbegin', itemCart);
  });

  const totalPrice = cart.reduce((result, item) => {
    return result + parseFloat(item.cost) * item.count;
  }, 0);

  modalPriceTag.textContent = `${totalPrice} ₽`;
};

const changeCount = (event) => {
  const target = event.target;

  if (target.classList.contains('counter-button')) {
    const food = cart.find(({ id }) => {
      return id === target.dataset.id;
    });
    if (target.classList.contains('counter-minus')) {
      food.count--;
      food.count === 0 ? cart.splice(cart.indexOf(food), 1) : '';
    }
    if (target.classList.contains('counter-plus')) {
      food.count++;
    }
  }

  renderCart();
};

function init() {
  getData('./db/partners.json').then((data) => {
    data.map(createCardRestaurant);
  });

  buttonClearCart.addEventListener('click', () => {
    cart.length = 0;
    renderCart();
  });

  modalBody.addEventListener('click', changeCount);

  cartButton.addEventListener('click', () => {
    renderCart();
    toggleModal();
  });

  cardsMenu.addEventListener('click', addToCart);
  close.addEventListener('click', toggleModal);
  cardsRestaurants.addEventListener('click', openGoods);

  logo.addEventListener('click', () => {
    containerPromo.classList.remove('hide');
    restaurants.classList.remove('hide');
    menu.classList.add('hide');
  });

  checkOut();

  inputSearch.addEventListener('keypress', (event) => {
    if (event.charCode === 13) {
      const value = event.target.value.trim();

      if (!value) {
        event.target.style.backgroundColor = 'rgba(255, 110, 110, 0.2)';
        event.target.value = '';

        setTimeout(() => {
          event.target.style.backgroundColor = '';
        }, 1500);
        return;
      }

      getData('./db/partners.json')
        .then((data) => {
          return data.map((partner) => {
            return partner.products;
          });
        })
        .then((linksProduct) => {
          cardsMenu.textContent = '';

          linksProduct.forEach((link) => {
            getData(`./db/${link}`).then((data) => {
              const resultSearch = data.filter(({ name }) => {
                return name.toLowerCase().includes(value.toLowerCase());
              });

              containerPromo.classList.add('hide');
              restaurants.classList.add('hide');
              menu.classList.remove('hide');

              restaurantTitle.textContent = 'Результаты поиска';
              restaurantRating.textContent = '';
              restaurantPrice.textContent = '';
              restaurantCategory.textContent = 'разная кухня';

              resultSearch.forEach(createCardGood);
            });
          });
        });
    }
  });
}

init();
