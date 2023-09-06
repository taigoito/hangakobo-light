/**
 * Twins
 * Author: Taigo Ito (https://qwel.design/)
 * Location: Fukui, Japan
 */

export default class Twins {
  constructor(ruteDir, pages, preloader) {
    // 設定
    this.ruteDir = ruteDir;
    this.pages = pages;
    this.preloader = preloader;
    this.breakpoint = 1000;

    // 要素
    this._elem = document.getElementById('twins');
    if (!this._elem) return;

    // サブページの場合
    if (this._elem.classList.contains('--subpage')) {
      this.setupSubPage();
      return;
    }

    this._logo = this._elem.querySelector('.twins__logo');
    this._inner = this._elem.querySelector('.twins__inner');
    this._lead = this._elem.querySelector('.twins__lead');
    this._more = this._elem.querySelector('.twins__more');
    this._menu = this._elem.querySelector('.twins__menu');
    this._controller = this._elem.querySelector('.twins__controller');
    this._menuOpen = this._elem.querySelector('.twins__menuOpen');
    this._menuClose = this._elem.querySelector('.twins__menuClose');
    this._moreOpen = this._elem.querySelector('.twins__moreOpen');
    this._moreClose = this._elem.querySelector('.twins__moreClose');
    this._pageToggle = this._elem.querySelector('.twins__pageToggle');

    // Resize: BPを跨いだ時にリロード
    const currentWindowWidth = window.innerWidth;
    window.addEventListener('resize', () => {
      if (currentWindowWidth < this.breakpoint
         && window.innerWidth >= this.breakpoint 
         || currentWindowWidth >= this.breakpoint 
         && window.innerWidth < this.breakpoint) {
        location.reload();
      }
    });
  
    // Redirect: モバイル時にルートへリダイレクト
    if (window.innerWidth < this.breakpoint 
      && location.pathname !== this.ruteDir) {
      location.pathname = this.ruteDir;
    }

    // Mobile
    if (window.innerWidth < this.breakpoint) {
      this.setupMobilePage();
      return;
    }

    // 状態
    this.currentHash = location.hash;
    this.currentUrl = location.pathname;
    this.currentIndex = this._getPageIndex(this.currentUrl);
    this.pageClass = this._getPageAttr(this.currentIndex, 'pageClass');
    this.isMenuShown = false;

    this.init();

  }


  async setupMobilePage() {
    // ロゴを残して、主要要素を一旦削除
    this._inner.remove();

    // カバー画像の読み込みをカウント
    let loaded = 0;

    // ページごとの内容を取得し、挿入
    for (let i = 0; i < this.pages.length; i++) {
      // fetch
      const page = this.pages[i];
      let url = this.ruteDir.slice(0, -1);
      url += page.url;
      const html = await this._fetchHTML(url);

      // カバー要素
      const cover = html.querySelector('.twins__cover.--change');
      this._elem.appendChild(cover);

      // preloader
      if (this.preloader) {
        const img = new Image();
        img.src = `${this.ruteDir}assets/twins/twins_bg_${i + 1}-change.jpg`;
        img.onload = () => {
          loaded++;
          if (loaded == this.pages.length) {
            this.preloader.load();
          }
        }
      }

      // セクション要素
      const section = html.querySelector('.twins__more .twins__section');

      // パス書き換え
      section.querySelectorAll('img').forEach((elem) => {
        let src = elem.getAttribute('src');
        src = src.replace('../', './');
        elem.setAttribute('src', src);
      });
      section.querySelectorAll('a').forEach((elem) => {
        let href = elem.getAttribute('href');
        href = href.replace('../', './');
        elem.setAttribute('href', href);
      });

      this._elem.appendChild(section);

    }

  }


  setupSubPage() {
    // preloader
    const cover = document.querySelector('.twins__cover');
    const index = cover.dataset.index;
    if (this.preloader) {
      const img = new Image();
      img.src = `${this.ruteDir}assets/twins/series_${index}.jpg`;
      img.onload = () => this.preloader.load();
    }

  }


  init() {
    // Back Forward Cache の影響を排除
    window.onpageshow = (event) => {
      if (event.persisted) return;

      // ハッシュがあればmoreを表示
      if (this.currentHash) {
        this.isMoreShown = true;
        this.toggleMore();
      } else {
        this.isMoreShown = false;
      }

      // イベント監視
      this._handleEvents();

      // preloader
      const cover = this._menu.querySelector('.twins__cover');
      const index = cover.dataset.index;
      if (this.preloader) {
        const img = new Image();
        img.src = `${this.ruteDir}assets/twins/twins_bg_${index}.jpg`;
        img.onload = () => this.preloader.load();
      }
    }
  }


  _handleEvents() {
    // flip (URL操作)
    this._menu.addEventListener('click', (event) => {
      if (event.target.dataset.toggle == 'twins' && event.target.dataset.target) {
        event.preventDefault();
        let nextUrl, nextIndex = event.target.dataset.target;
        if (this.currentIndex) {
          nextUrl = `..${this._getPageUrl(nextIndex)}`;
        } else {
          nextUrl = `.${this._getPageUrl(nextIndex)}`;
        }
        history.pushState(null, null, nextUrl);
        this._urlChangeHandler();
      }
    });

    // menu開閉
    this._controller.querySelectorAll('[data-toggle="menu"]').forEach((elem) => {
      elem.addEventListener('click', () => {
        this.toggleMenu();
      })
    });

    // more開閉 (ハッシュ操作)
    this._controller.querySelectorAll('[data-toggle="more"]').forEach((elem) => {
      elem.addEventListener('click', () => {
        if (this.isMoreShown) location.hash = '';
        else location.hash = 'more';
      })
    });

    // pageToggle (URL操作)
    this._controller.querySelector('[data-toggle="twins"]').addEventListener('click', (event) => {
      if (event.currentTarget.dataset.toggle == 'twins' && event.currentTarget.dataset.target) {
        event.preventDefault();
        let nextUrl, nextIndex = event.currentTarget.dataset.target;
        if (this.currentIndex) {
          nextUrl = `..${this._getPageUrl(nextIndex)}`;
        } else {
          nextUrl = `.${this._getPageUrl(nextIndex)}`;
        }
        history.pushState(null, null, nextUrl);
        this._urlChangeHandler();
      }
    });
    
    // ハッシュ・URL操作を監視
    window.addEventListener('popstate', () => this._urlChangeHandler());

  };


  _urlChangeHandler() {
    const nextHash = location.hash;
    const nextUrl = location.pathname;
    const promise = new Promise((resolve, reject) => resolve());

    promise.then(() => {
      // ハッシュがあれば、moreを表示
      if (this.currentHash || nextHash) {
        this.currentHash = nextHash;
        return this.toggleMore();
      }
    }).then(() => {
      // flip前動作
      if (this.isMenuShown) {
        // メニューが表示されていれば、閉じる
        this.hideMenuClose();
        return this.hideMenu();
      } else if (this.currentUrl !== nextUrl) {
        // ボタンを隠す
        this.hideMenuOpen();
        this.hideMoreOpen();
        return this.hidePageToggle();
      }
    }).then(() => {
      // flip
      if (this.currentUrl !== nextUrl) {
        return this.flip(nextUrl);
      }
    }).then(() => {
      // 状態書き換え
      this.currentUrl = nextUrl;
      this.currentIndex = this._getPageIndex(nextUrl);
      if (!this.isMoreShown) {
        // ボタンを表示する
        this.showMenuOpen();
        this.showMoreOpen();
        return this.showPageToggle();
      }
    });

  }


  _getPageIndex(url) {
    url = url.slice(this.ruteDir.length - 1);
    let result;
    this.pages.forEach((page) => {
      if (url == page.url) result = page.index;
    });
    return result;

  }


  _getPageUrl(index) {
    let result;
    this.pages.forEach((page) => {
      if (index == page.index) result = page.url;
    });
    return result;
    
  }


  _getPageAttr(index, attr) {
    let result;
    this.pages.forEach((page) => {
      if (index == page.index) result = page[attr];
    });
    return result;

  }


  async flip(url) {
    // 現ページを取得
    const currentIndex = this._getPageIndex(this.currentUrl);
    const currentLead = this._lead.querySelector('.twins__leadContent');
    const currentMore = this._more.querySelector('.twins__moreContent');
    const currentCover = this._menu.querySelector('.twins__menuCover');
    const currentMenu = this._menu.querySelector('.twins__menuItems');

    // 状態
    const nextIndex = this._getPageIndex(url);
    const toggle = this._getPageAttr(nextIndex, 'toggle');
    const href = this._getPageAttr(nextIndex, 'href');
    const pageClass = this._getPageAttr(nextIndex, 'pageClass');
    const isReverse = (currentIndex < nextIndex 
      && !(currentIndex == 0 && nextIndex == this.pages.length - 1)) 
      || (currentIndex == this.pages.length - 1 && nextIndex == 0) 
      ? false : true;

    // 背景色遷移
    if (this.pageClass) {
      this._elem.classList.remove(this.pageClass);
    }
    if (pageClass) {
      this._elem.classList.add(pageClass);
    }
    this.pageClass = pageClass;

    // fetchで次ページを取得
    const html = await this._fetchHTML(url);
    const nextLead = html.querySelector('.twins__leadContent');
    const nextMore = html.querySelector('.twins__moreContent');
    const nextCover = html.querySelector('.twins__menuCover');
    const nextMenu = html.querySelector('.twins__menuItems');

    // 次ページにアニメーションクラスを付与(enter)
    nextLead.classList.add('--enter');
    if (isReverse) nextLead.classList.add('--reverse');
    nextCover.classList.add('--enter');
    if (isReverse) nextCover.classList.add('--reverse');

    // 挿入
    this._lead.insertBefore(nextLead, this._lead.firstChild);
    this._menu.insertBefore(nextCover, this._menu.firstChild);

    // アニメーション後、非同期処理を開始
    return this._animationEnd(currentLead, () => {
      // 現ページにアニメーションクラスを付与(leave)
      currentLead.classList.add('--leave');
      if (isReverse) currentLead.classList.add('--reverse');
      currentCover.classList.add('--leave');
      if (isReverse) currentCover.classList.add('--reverse');
    }).then(() => {
      // アニメーションクラスを除去
      nextLead.classList.remove('--enter');
      if (isReverse) nextLead.classList.remove('--reverse');
      nextCover.classList.remove('--enter');
      if (isReverse) nextCover.classList.remove('--reverse');
      
      // 前ページを削除
      currentLead.remove();
      currentMore.remove();
      currentCover.remove();
      currentMenu.remove();

      // menu差替え
      this._menu.querySelector('.twins__menuBar').appendChild(nextMenu);

      // more差替え
      this._more.appendChild(nextMore);

      // moreボタン設定差替え
      this._moreOpen.dataset.toggle = toggle;
      this._moreOpen.setAttribute('href', href);

      // pageToggleボタン設定差替え
      this._pageToggle.dataset.target = (nextIndex + 1) % this.pages.length;
    });

  }


  async _fetchHTML(url) {
    try {
      const parser = new DOMParser();
      const resp = await fetch(url, {
        method: 'GET',
        mode: 'same-origin',
        headers: {
          'Content-Type': 'text/html',
        }
      });
      return parser.parseFromString(await resp.text(), 'text/html').body;
    } catch (error) {
      return null;
    }
  }


  // menu開閉動作を返す
  toggleMenu() {
    this.toggleMenuOpen();
    if (this.isMenuShown) {
      this.showMoreOpen();
      this.showPageToggle();
      return this.hideMenu();
    } else {
      this.hideMoreOpen();
      this.hidePageToggle();
      return this.showMenu();
    }

  }


  showMenu() {
    this.isMenuShown = true;
    return this._animationEnd(this._menu, () => {
      this._menu.classList.add('--showMenu');
      this._menu.classList.add('--enter');
    }).then(() => {
      this._menu.classList.remove('--enter');
    });

  }


  hideMenu() {
    this.isMenuShown = false;
    return this._animationEnd(this._menu, () => {
      this._menu.classList.add('--leave');
    }).then(() => {
      this._menu.classList.remove('--showMenu');
      this._menu.classList.remove('--leave');
    });

  }


  // more開閉動作を返す
  toggleMore() {
    if (!this.currentHash) {
      this.hideMoreClose();
      return this.hideMore().then(() => {
        this.showMoreOpen();
      });
    } else {
      this.hideMoreOpen();
      return this.showMore().then(() => {
        this.showMoreClose();
      });
    }

  }


  showMore() {
    this.isMoreShown = true;
    this.hideMenuOpen();
    this.hidePageToggle();
    return this._transitionEnd(this._inner, () => {
      this._inner.classList.add('--showMore');
    });

  }


  hideMore() {
    this.isMoreShown = false;
    return this._transitionEnd(this._inner, () => {
      this._inner.classList.remove('--showMore');
    }).then(() => {
      this.showMenuOpen();
      this.showPageToggle();
    });

  }


  // MenuOpen/Closeを表示/非表示
  toggleMenuOpen() {
    if (this.isMenuShown) {
      this.hideMenuClose().then(() => {
        this.showMenuOpen();
      });
    } else {
      this.hideMenuOpen().then(() => {
        this.showMenuClose();
      });
    }

  }


  showMenuOpen() {
    return this._showButton(this._menuOpen);

  }


  hideMenuOpen() {
    return this._hideButton(this._menuOpen);

  }


  showMenuClose() {
    return this._showButton(this._menuClose);

  }


  hideMenuClose() {
    return this._hideButton(this._menuClose);

  }


  showMoreOpen() {
    return this._showButton(this._moreOpen);

  }


  hideMoreOpen() {
    return this._hideButton(this._moreOpen);

  }


  showMoreClose() {
    return this._showButton(this._moreClose);

  }


  hideMoreClose() {
    return this._hideButton(this._moreClose);

  }


  showPageToggle() {
    return this._showButton(this._pageToggle);

  }


  hidePageToggle() {
    return this._hideButton(this._pageToggle);

  }


  _showButton(elem) {
    elem.classList.remove('--collapse');
    return this._animationEnd(elem, () => {
      elem.classList.add('--enter');
    }).then(() => {
      elem.classList.remove('--enter');
    });

  }


  _hideButton(elem) {
    return this._animationEnd(elem, () => {
      elem.classList.add('--leave');
    }).then(() => {
      elem.classList.add('--collapse');
      elem.classList.remove('--leave');
    });

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
