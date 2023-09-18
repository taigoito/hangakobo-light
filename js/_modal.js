/**
 * Modal
 * Author: Taigo Ito (https://qwel.design/)
 * Location: Fukui, Japan
 */

export default class Modal {
  constructor(elem, gallery) {
    // 設定
    this._elem = elem || document.querySelector('.modal');
    if (!this._elem) return;
    this._gallery = gallery || document.querySelector('.gallery');
    if (!this._gallery) return;
    this.breakpoint = 1000;

    // 要素
    this._container = this._elem.querySelector('.modal__container');
    this._content = this._elem.querySelector('.modal__content');
    this._prev = this._elem.querySelector('.modal__prev');
    this._next = this._elem.querySelector('.modal__next');
    this._close = this._elem.querySelector('.modal__close');

    // 状態
    this.currentIndex = 0;
    this.len = this._gallery.querySelectorAll('[data-index]').length;

    // イベント監視
    this._handleEvents();
  }


  _handleEvents() {
    // モーダル開閉
    document.querySelectorAll('[data-toggle="modal"]').forEach((elem) => {
      elem.addEventListener('click', (event) => {
        event.preventDefault();
        if (window.innerWidth >= 1000) {
          const toggleElem = event.currentTarget;
          const targetElem = document.querySelector(toggleElem.dataset.target);
          const src = toggleElem.getAttribute('href');
          // 状態更新
          if (src != '#') {
            this.currentIndex = toggleElem.querySelector('img').dataset.index - 0; // 数値型へパース
          }
          this.toggle(targetElem, src);
        }
      });
    });

    // 前へ
    this._prev.addEventListener('click', () => {
      this.slide(this._countChange(-1));
    });

    // 次へ
    this._next.addEventListener('click', () => {
      this.slide(this._countChange(1));
    });

  }


  toggle(targetElem, src) {
    if (src != '#') {
      // closeを押した場合、この処理は行わない
      // img要素生成
      const img = document.createElement('img');
      img.setAttribute('src', src);

      // 挿入
      this._content.appendChild(img);
      this._content.querySelector('img:first-child').remove();
      this._content.querySelector('img:last-child').classList.add('--show');
    }

    if (targetElem.classList.contains('--collapse')) {
      // 表示処理
      targetElem.classList.remove('--collapse');

      // 要素表示直後にCSS遷移を行うので、便宜上setTimeoutでラップする
      setTimeout(() => {
        // body要素をロック
        //const scrollbarWidth = this._getScrollbarWidth();
        //document.body.classList.add('scroll-lock');
        //document.body.style.paddingRight = `${Math.floor(scrollbarWidth)}px`;
        // 表示
        targetElem.classList.add('--show');
      }, 0);

    } else {
      // 非表示処理
      this._transitionEnd(targetElem, () => {
        targetElem.classList.remove('--show');
      }).then(() => {
        // body要素のロック解除
        //document.body.classList.remove('scroll-lock');
        //document.body.style.paddingRight = ``;
        // 非表示
        targetElem.classList.add('--collapse');
      });
    }

  }


  slide(index) {
    // imgソース取得
    const elem = this._gallery.querySelector(`[data-index="${index}"]`);
    const src = elem.getAttribute('src');

    // img要素生成
    const img = document.createElement('img');
    img.setAttribute('src', src);

    // 挿入
    this._content.appendChild(img);
    this._animationEnd(img, () => {
      img.classList.add('--enter');
    }).then(() => {
      this._content.querySelector('img:first-child').remove();
      this._content.querySelector('img:last-child').classList.remove('--enter');
    });

    // 状態更新
    this.currentIndex = index;

  }

  
  _countChange(num) {
    return (num + this.currentIndex + this.len) % this.len;
  }


  _getScrollbarWidth() {
    let scrollbarWidth = 0;
    if (document.body.clientWidth < window.innerWidth) {
      const div = document.createElement('div');
			div.id = 'scrollbar-measure';
			document.body.appendChild(div);
			scrollbarWidth = div.offsetWidth - div.clientWidth
			document.body.removeChild(div);
    }
    return scrollbarWidth;

  }


  _animationEnd(elem, func) {
    // CSSアニメの完了を監視
    let callback;
    const promise = new Promise((resolve, reject) => {
      callback = () => resolve(elem);
      elem.addEventListener('animationend', callback);
    });
    func();
    promise.then((elem) => {
      elem.removeEventListener('animationend', callback);
    });
    return promise;

  }


  _transitionEnd(elem, func) {
    // CSS遷移の完了を監視
    let callback;
    const promise = new Promise((resolve, reject) => {
      callback = () => resolve(elem);
      elem.addEventListener('transitionend', callback);
    });
    func();
    promise.then((elem) => {
      elem.removeEventListener('transitionend', callback);
    });
    return promise;

  }

}
