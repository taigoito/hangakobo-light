/**
 * Init
 * Author: Taigo Ito (https://qwel.design/)
 * Location: Fukui, Japan
 */

// Preloader
import Preloader from './_preloader.js';
const main = document.querySelector('main');
const preloader = main.classList.contains('twins') 
  ? new Preloader(false, true)
  : new Preloader();

// Modal
import Modal from './_modal.js';
new Modal(
  document.querySelector('.modal'),
  document.querySelector('.lineup__gallery')
);

// Twins
import Twins from './_twins.js';
new Twins(
  '/feature/light/', 
  [
    {
      index: 0,
      url: '/',
      pageClass: '--secondary'
    },
    {
      index: 1,
      url: '/idea/',
      pageClass: '--tertiary'
    },
    {
      index: 2,
      url: '/feature/',
      pageClass: '--dark'
    },
    {
      index: 3,
      url: '/lineup/',
      pageClass: '--secondary'
    },
    {
      index: 4,
      url: '/partnership/',
      pageClass: '--tertiary'
    },
    {
      index: 5,
      url: '/orderinfo/',
      pageClass: '--dark'
    }
  ], 
  preloader
);
