###
	Twins
	Last update: 2018/04/30
###

# 第一引数に設定オブジェクトを渡す
# isPHP: html: false, php: true 初期値: false
# ruteDir: ルートディレクトリ 初期値: '/'
# events: コールバックするイベントをハッシュごとに登録しておくオブジェクト 初期値: '{}'

class Twins
	constructor: (options = {}) ->
    @isPHP = options.isPHP ? false
    @ruteDir = options.ruteDir ? '/'
    @pages = options.pages
    @hasTitle = options.hasTitle ? false
    @bfcache = options.bfcache ? false
    if @hasTitle
      @$pageEnter = $ '#twins-title'
    @$inner = $ '#twins-inner'
    @$view = $ '#twins-view'
    @$more = $ '#twins-more'
    @$controller = $ '#twins-controller'
    @$menuOpen = $ '#twins-controller-open'
    @$menuClose = $ '#twins-controller-close'
    @$moreOpen = $ '#twins-more-open'
    @$moreClose = $ '#twins-more-close'
    @$pageToggle = $ '#twins-page-toggle'
    @currentHash = location.hash
    @currentUrl = location.pathname
    @currentIndex = @getPageIndex @currentUrl
    @pageClass = @getPageAttr @currentIndex, 'pageClass'
    @events = @getPageAttr @currentIndex, 'events'
    @isMenuShown = false
    if @hasTitle && @currentIndex == 0
      location.hash = ''
      @currentHash = location.hash
    else if @currentHash
      @isMoreShown = true
      @toggleMore()
    else
      @isMoreShown = false
    @handleEvents()

  handleEvents: ->
    $(document)
      .on MyEvent.touch, '[data-location="flip"]', (el) =>
        el.preventDefault()
        nextIndex = $(el.currentTarget).data 'target'
        if @currentIndex != nextIndex
          if @currentIndex
            nextUrl = '..' + @getPageUrl nextIndex
          else
            nextUrl = '.' + @getPageUrl nextIndex
          history.pushState null, null, nextUrl
          @urlChangeHandler()
        false

      .on MyEvent.touch, '[data-toggle="menu"]', =>
        @toggleMenu()
        false
      
      .on MyEvent.touch, '[data-toggle="more"]', =>
        if @isMoreShown
          location.hash = ''
        else
          location.hash = 'more'
        false

    $(window)
      .on 'popstate', @urlChangeHandler
    return
  
  urlChangeHandler: =>
    if @bfcache
      @bfcache = false
    else
      nextHash = location.hash
      nextUrl = location.pathname
      nextIndex = @getPageIndex nextUrl
      @events = @getPageAttr nextIndex, 'events'
      dfd = new $.Deferred().resolve()
      dfd
        .then =>
          if @currentHash || nextHash
            @currentHash = nextHash
            @toggleMore()
        .then =>
          if @isMenuShown
            @hideMenuClose()
            @hideMenu()
          else if @currentUrl != nextUrl
            @hideMenuOpen()
            @hideMoreOpen()
            @hidePageToggle()
        .then =>
          if @currentUrl != nextUrl
            @flip nextUrl
        .then =>
          @currentUrl = nextUrl
          @currentIndex = @getPageIndex nextUrl
          if !@isMoreShown
            @showMenuOpen()
            @showMoreOpen()
            @showPageToggle()
    return
  
  getPageIndex: (url) ->
    url = url.slice(@ruteDir.length - 1)
    for page, i in @pages
      if url == page.url
        result = page.index
        break
    result
  
  getPageUrl: (index) ->
    for page, i in @pages
      if index == page.index
        result = page.url
        break
    result
  
  getPageAttr: (index, attr) ->
    for page, i in @pages
      if index == page.index
        result = page[attr]
        break
    result

  parseUrl: (url) ->
    if @isPHP
      url + 'index.php'
    else
      url + 'index.html'
  
  flip: (nextUrl) ->
    currentIndex = @getPageIndex @currentUrl
    nextIndex = @getPageIndex nextUrl
    nextUrl = @parseUrl nextUrl
    toggle = @getPageAttr nextIndex, 'toggle'
    href = @getPageAttr nextIndex, 'href'
    pageClass =  @getPageAttr nextIndex, 'pageClass'
    isInverse = @getPageAttr nextIndex, 'isInverse'
    if (currentIndex < nextIndex && !(currentIndex == 0 && nextIndex == @pages.length - 1)) || (currentIndex == @pages.length - 1 && nextIndex == 0)
      reverse = false
    else
      reverse = true
    dfd = new $.Deferred()
    $.ajax {
      url: nextUrl,
      dataType: 'html'
    }
      .done (data) =>
        if @pageClass
          $('body').removeClass @pageClass
        if pageClass
          $('body').addClass pageClass
        @pageClass = pageClass
        if isInverse
          $('body').addClass 'twins-inverse'
        else
          $('body').removeClass 'twins-inverse'
        $content = $(data).find '.twins-view-item'
        $more = $(data).find '.twins-more-item'
        $cover = $(data).find '.twins-controller-cover'
        $menu = $(data).find '.twins-controller-menu'
        $content.addClass 'enter'
        $content.addClass('reverse') if reverse
        $cover.addClass 'enter'
        $cover.addClass('reverse') if reverse
        @$view.prepend $content
        @$controller.prepend $cover
        @$controller.find('.twins-controller-cover[data-index="' + currentIndex + '"]').addClass 'leave'
        @$controller.find('.twins-controller-cover[data-index="' + currentIndex + '"]').addClass('reverse') if reverse
        @$view.find('.twins-view-item[data-index="' + currentIndex + '"]').addClass('reverse') if reverse
        Util.animationEnd(
          @$view.find('.twins-view-item[data-index="' + currentIndex + '"]').addClass 'leave'
        ).done =>
          $content.removeClass 'enter'
          $content.removeClass('reverse') if reverse
          $cover.removeClass 'enter'
          $cover.removeClass('reverse') if reverse
          @$view.find('.twins-view-item[data-index="' + currentIndex + '"]').remove()
          @$more.html $more
          @$controller.find('.twins-controller-cover[data-index="' + currentIndex + '"]').remove()
          @$controller.find('.twins-controller-bar').html $menu
          @$moreOpen
            .attr 'data-toggle', toggle
            .attr 'href', href
          @$pageToggle.data 'target', ((nextIndex + 1) % @pages.length)
          dfd.resolve()
    dfd
  
  toggleMenuOpen: ->
    if @isMenuShown
      dfd = @hideMenuClose()
      dfd.done =>
        @showMenuOpen()
    else
      dfd = @hideMenuOpen()
      dfd.done =>
        @showMenuClose()
  
  showMenuOpen: ->
    if !@hasTitle || @currentIndex
      $menuOpen = @$menuOpen
    else
      $menuOpen = @$pageEnter
    $menuOpen.removeClass 'collapse'
    Util.animationEnd(
      $menuOpen.addClass 'enter'
    ).done ->
      $menuOpen.removeClass 'enter'
  
  hideMenuOpen: ->
    if !@hasTitle || @currentIndex
      $menuOpen = @$menuOpen
    else
      $menuOpen = @$pageEnter
    Util.animationEnd(
      $menuOpen.addClass 'leave'
    ).done =>
      $menuOpen.removeClass 'leave'
      $menuOpen.addClass 'collapse'
  
  showMenuClose: ->
    @$menuClose.removeClass 'collapse'
    Util.animationEnd(
      @$menuClose.addClass 'enter'
    ).done =>
      @$menuClose.removeClass 'enter'
  
  hideMenuClose: ->
    Util.animationEnd(
      @$menuClose.addClass 'leave'
    ).done =>
      @$menuClose.removeClass 'leave'
      @$menuClose.addClass 'collapse'
  
  toggleMenu: ->
    if @isMenuShown
      @toggleMenuOpen().done =>
        @showMoreOpen()
        @showPageToggle()
      @hideMenu()
    else
      @toggleMenuOpen()
      @showMenu()
      @hideMoreOpen()
      @hidePageToggle()
  
  showMenu: ->
    @isMenuShown = true
    Util.animationEnd(
      @$controller
        .addClass 'show-menu'
        .addClass 'enter'
    ).done =>
      @$controller.removeClass 'enter'
  
  hideMenu: ->
    @isMenuShown = false
    Util.animationEnd(
      @$controller.addClass 'leave'
    ).done =>
      @$controller
        .removeClass 'leave'
        .removeClass 'show-menu'
  
  toggleMore: ->
    dfd = new $.Deferred()
    if !@currentHash
      @hideMoreClose()
      dfd = @hideMore()
      dfd.done =>
        if @events? then @events.destruct()
        @showMoreOpen()
    else
      @hideMoreOpen()
      dfd = @showMore()
      dfd.done =>
        if @events? then @events.construct()
        @showMoreClose()

  showMoreOpen: ->
    if !@hasTitle || @currentIndex
      @$moreOpen.removeClass 'collapse'
      Util.animationEnd(
        @$moreOpen.addClass 'enter'
      ).done =>
        @$moreOpen.removeClass 'enter'
  
  hideMoreOpen: ->
    if !@hasTitle || @currentIndex
      Util.animationEnd(
        @$moreOpen.addClass 'leave'
      ).done =>
        @$moreOpen.removeClass 'leave'
        @$moreOpen.addClass 'collapse'
  
  showMoreClose: ->
    @$moreClose.removeClass 'collapse'
    Util.animationEnd(
      @$moreClose.addClass 'enter'
    ).done =>
      @$moreClose.removeClass 'enter'
  
  hideMoreClose: ->
    Util.animationEnd(
      @$moreClose.addClass 'leave'
    ).done =>
      @$moreClose.removeClass 'leave'
      @$moreClose.addClass 'collapse'

  showMore: ->
    @isMoreShown = true
    @hideMenuOpen()
    @hidePageToggle()
    Util.transitionEnd(
      @$inner.addClass 'show-more'
    )
  
  hideMore: ->
    @isMoreShown = false
    Util.transitionEnd(
      @$inner.removeClass 'show-more'
    ).done =>
      @showMenuOpen()
      @showPageToggle()

  showPageToggle: ->
    if !@hasTitle || @currentIndex
      @$pageToggle.removeClass 'collapse'
      Util.animationEnd(
        @$pageToggle.addClass 'enter'
      ).done =>
        @$pageToggle.removeClass 'enter'
  
  hidePageToggle: ->
    if !@hasTitle || @currentIndex
      Util.animationEnd(
        @$pageToggle.addClass 'leave'
      ).done =>
        @$pageToggle.removeClass 'leave'
        @$pageToggle.addClass 'collapse'
