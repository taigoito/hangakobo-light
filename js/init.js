(function () {
  'use strict';

  // Twins
  var pages = [{
    index: 0,
    url: '/',
    pageClass: 'bg-secondary',
    isInverse: false,
    events: null
  }, {
    index: 1,
    url: '/idea/',
    pageClass: 'bg-tertiary',
    isInverse: false,
    events: null
  }, {
    index: 2,
    url: '/feature/',
    pageClass: 'bg-dark',
    isInverse: false,
    events: null
  }, {
    index: 3,
    url: '/lineup/',
    pageClass: 'bg-secondary',
    isInverse: false,
    events: null
  }, {
    index: 4,
    url: '/partnership/',
    pageClass: 'bg-tertiary',
    isInverse: false,
    events: null
  }, {
    index: 5,
    url: '/orderinfo/',
    pageClass: 'bg-dark',
    isInverse: false,
    events: null
  }];

  var twins;

  function twins_init() {
    window.onpageshow = function (event) {
      if (event.persisted) {
        twins.bfcache = true;
      } else {
        twins = new Twins({
          ruteDir: '/feature/light/',
          pages: pages
        });
      }
    };

    var images = [],
      src = [
        'twins-bg-img-1.jpg',
        'twins-bg-img-2.jpg',
        'twins-bg-img-3.jpg',
        'twins-bg-img-4.jpg',
        'twins-bg-img-5.jpg',
        'twins-bg-img-6.jpg'
      ],
      loaded = 0,
      len = src.length,
      i = 0;

    for (i = 0; i < len; i++) {
      images[i] = new Image();
      images[i].src = 'https://' + location.hostname + '/feature/light/images/background/' + src[i];
      images[i].onload = function () {
        loaded++;
        if (loaded === len) {
          window.onload = preloader.load;
        }
      };
    }

  }

  if ($(window).width() < 1024) {
    var $logo = $('#logo')
      .find('img')
        .addClass('sw-9')
        .addClass('m-2'),
      $content = $('.twins-inner').detach();
    $('#logo').remove();
    $('[role="complementary"]').remove();
    var len = pages.length;
    for (var i = 0; i < len; i++) {
      var forCount = i,
        page = pages[i],
        $banner = $('<div>').addClass('sh-24'),
        $container = $('<div>').addClass('container'),
        $row = $('<div>').addClass('row'),
        $col = $('<div>').addClass('col-12');
      $banner
        .addClass('twins-bg-light')
        .addClass('twins-bg-img-' + (i + 1))
        .html($logo.clone());
      (function(i){
        $.ajax({
          async: false,
          url: 'https://' + location.hostname + '/feature/light' + page.url,
          dataType: 'html'
        }).done(function (data) {
          var $content = $(data);
          if (page.index !== 0) {
            $content.find('img').each(function(i, el){
              var src = $(el).attr('src');
              src = src.replace('../', './');
              $(el).attr('src', src);
            });
            $content.find('a').each(function(i, el){
              var href = $(el).attr('href');
              href = href.replace('../', './');
              $(el).attr('href', href);
            });
          }
          var $section = $content.find('#twins-more .twins-section');
          $col.append($section);
          $row.append($col);
          $container.append($row);
          $('main')
            .append($banner)
            .append($container);
        });
      })(forCount);
    }
    var now = new Date();
    var year = now.getFullYear();
    var $footer = $('<footer>')
      .html('<small>&copy; 2007-' + year + ' Naoko Osano</small>')
      .addClass('py-4 bg-dark text-center');
    $('body').append($footer);
    window.onload = preloader.load;
  } else {
    twins_init();
  }
  
  // Resize
  var currentWindowWidth = $(window).width();
  $(window).on('resize', function(){
    if (currentWindowWidth < 1024 && $(window).width() >= 1024 || currentWindowWidth >= 1024 && $(window).width() < 1024) {
      location.reload();
    }
  });
  
  // Redirect
  var url = 'https://hangakobo.com/feature/light/'
  if ($(window).width() < 1024 && location.href !== url) {
    location.href = url;
  }

})();
