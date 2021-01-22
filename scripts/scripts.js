//Получем данный из БД
class FetchData {
  getResource = async url => {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error('Произошла ошибка: ' + res.status);
    };

    return res.json();
  };

  getPost = async () => await this.getResource('db/dataBase.json');
};

class Twitter {
  constructor({
    user,
    listElem,
    modalElems,
    tweetElems,
  }) {
    const fetchData = new FetchData();
    this.user = user;
    this.tweets = new Posts();
    this.elements = {
      listElem: document.querySelector(listElem),
      modal: modalElems,
      tweetElems,
    };

    fetchData.getPost().then(data => {
      data.forEach(this.tweets.addPost);
      this.showAllPost();
    });

    this.elements.modal.forEach(this.handlerModal, this);
    this.elements.tweetElems.forEach(this.addTweet, this);
    //this.elements.tweetPageElems.forEach(this.addTweet, this);
  };

  //Выводим посты в вёрстку
  renderPosts(posts) {
    this.elements.listElem.textContent = '';
    posts.forEach(({
      id,
      userName,
      nickname,
      getDate,
      text,
      img,
      likes,
    }) => {
      this.elements.listElem.insertAdjacentHTML('beforeend', `
				<li>
          <article class="tweet">
            <div class="row">
              <img class="avatar" src="images/${nickname}.jpg" alt="Аватар пользователя ${userName}">
              <div class="tweet__wrapper">
                <header class="tweet__header">
                  <h3 class="tweet-author">${userName}
                    <span class="tweet-author__add tweet-author__nickname">@${nickname}</span>
                    <time class="tweet-author__add tweet__date">${getDate()}</time>
                  </h3>
                  <button class="tweet__delete-button chest-icon" data-id="${id}"></button>
                </header>
                <div class="tweet-post">
                  <p class="tweet-post__text">${text}</p>
                  ${img ? `
                    <figure class="tweet-post__image">
                      <img src="${img}"
                        alt="иллюстрация из поста ${nickname}">
                    </figure>` :
                  ''}
                </div>
              </div>
            </div>
            <footer>
              <button class="tweet__like">
                ${likes}
              </button>
            </footer>
          </article>
				</li>
      `);
    });
  };

  //Показываем посты пользователя
  showUserPost() {

  };

  //Показываем лайки пользователя
  showLikesPost() {

  };

  //Показываем все посты пользователя
  showAllPost() {
    this.renderPosts(this.tweets.posts)
  };

  //Открываем/закрываем модальное окно
  handlerModal({
    button,
    modal,
    text,
    overlay,
    submit,
    close,
  }) {
    const buttonElem = document.querySelector(button);
    const modalElem = document.querySelector(modal);
    const textElem = document.querySelector(text);
    const overlayElem = document.querySelector(overlay);
    const submitElem = document.querySelector(submit);
    const closeElem = document.querySelector(close);

    //Ставим временный тест при открытии формы, если ранее пользователь передумал писать.
    const tempString = textElem.innerHTML;
    const openModal = () => {
      modalElem.style.display = 'block';
      if (textElem.innerHTML !== tempString) {
        textElem.innerHTML = tempString;
        submitElem.style.opacity = 0.5;
      }
    }

    const closeModal = (elem, event) => {
      const target = event.target;
      if (target === elem) {
        modalElem.style.display = 'none';
      }
    }

    buttonElem.addEventListener('click', openModal);

    if (closeElem) {
      closeElem.addEventListener('click', closeModal.bind(null, closeElem));
    }

    if (overlayElem) {
      overlayElem.addEventListener('click', closeModal.bind(null, overlayElem));
    }

    //Если открыто модальное окно, то закрываем его.
    this.handlerModal.closeModal = () => {
      modalElem.style.display = 'none';
    };
  };

  addTweet({
    text,
    img,
    submit,
  }) {
    const textElem = document.querySelector(text);
    const imgElem = document.querySelector(img);
    const submitElem = document.querySelector(submit);

    let imgUrl = '';
    let tempString = textElem.innerHTML;

    submitElem.addEventListener('click', () => {
      //Запрет оправки пустого текста и временного текста
      if (textElem.innerHTML !== '' && textElem.innerHTML !== tempString) {
        this.tweets.addPost({
          userName: this.user.name,
          nickname: this.user.nick,
          text: textElem.innerHTML,
          img: imgUrl,
        })
        this.showAllPost();
        this.handlerModal.closeModal();
        textElem.innerHTML = tempString;
        submitElem.style.opacity = 0.5;
      }
    });

    textElem.addEventListener('click', () => {
      if (textElem.innerHTML === tempString) {
        textElem.innerHTML = '';
        submitElem.style.opacity = 1;
      }
    });

    imgElem.addEventListener('click', () => {
      imgUrl = prompt('Введите адрес картинки: ');
    });
  }
};

class Posts {
  constructor({
    posts = []
  } = {}) {
    this.posts = posts;
  };

  addPost = tweets => {
    this.posts.push(new Post(tweets));
  };

  //Удаляем пост
  deletePost(id) {

  };

  likePost(id) {

  };
};

class Post {
  constructor({
    id,
    userName,
    nickname,
    postDate,
    text,
    img,
    likes = 0,
  }) {
    this.id = id || this.generateID();
    this.userName = userName;
    this.nickname = nickname;
    this.postDate = postDate ? new Date(postDate) : new Date;
    this.text = text;
    this.img = img;
    this.likes = likes;
    this.liked = false;
  };

  //Удаляем/ставим лайк
  changeLike() {
    this.liked = !this.liked
    if (this.liked) this.likes++;
    else this.likes--;
  };

  //Генерируем ID
  generateID() {
    return Math.random().toString(32).substring(2, 9) + (+new Date).toString(32);
  };

  //Получем дату
  getDate = () => {
    const options = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    return this.postDate.toLocaleString('ru-RU', options);
  };
};

const twitter = new Twitter({
  listElem: '.tweet-list',
  user: {
    name: 'Владимир',
    nick: 'rootdiv',
  },
  modalElems: [{
    button: '.header__link_tweet',
    modal: '.modal',
    text: '.modal .tweet-form__text',
    overlay: '.overlay',
    submit: '.modal .tweet-form__btn',
    close: '.modal-close__btn',
  }],
  //Элементы твита
  tweetElems: [{
      text: '.modal .tweet-form__text',
      img: '.modal .tweet-img__btn',
      submit: '.modal .tweet-form__btn',
    },
    {
      text: '.wrapper .tweet-form__text',
      img: '.wrapper .tweet-img__btn',
      submit: '.wrapper .tweet-form__btn',
    }
  ],
});
