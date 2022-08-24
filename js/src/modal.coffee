###
	Modal
	Last update: 2018/11/09
###

# 第一引数に設定オブジェクトを渡す
# $el: modalさせる要素を含む要素 初期値: $ document
# modalさせる要素に data-toggle="modal" data-target="#*" を付与
# modalする要素に class="modal collapse" を付与

class Modal
	constructor: (options = {}) ->
		@$el = options.$el ? $ document
		@handleEvents()
	
	handleEvents: ->
		@$el.on MyEvent.touch, '[data-toggle="modal"]', (el) =>
			if $(window).width() >= 1024
				$toggleEl = $ el.currentTarget
				$targetEl = $ $toggleEl.data 'target'
				@toggle $targetEl
			false
		return

	toggle: ($targetEl) ->
		if $targetEl.hasClass 'collapse'
			$targetEl.removeClass 'collapse'
			scrollbarWidth = @getScrollbarWidth()
			setTimeout ->
				$('body')
					.addClass 'scroll-lock'
					.css('padding-right', Math.floor(scrollbarWidth) + 'px')
				$targetEl.addClass 'show'
			, 0
		else
			Util.transitionEnd($targetEl.removeClass 'show').then ->
				$('body')
					.removeClass 'scroll-lock'
					.css 'padding-right', ''
				$targetEl.addClass 'collapse'
		return
	
	getScrollbarWidth: ->
		scrollbarWidth = 0
		if document.body.clientWidth < window.innerWidth
			scrollDiv = document.createElement 'div'
			scrollDiv.id = 'scrollbar-measure'
			document.body.appendChild scrollDiv
			scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
			document.body.removeChild scrollDiv
		return scrollbarWidth;