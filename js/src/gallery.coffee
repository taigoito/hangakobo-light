###
	Gallery
	Last update: 2018/11/09
###

# 第一引数に設定オブジェクトを渡す
# $el: modalさせる要素を含む要素 初期値: $ document
# modalさせる要素に data-toggle="gallery" data-target="#*" を付与
# modalする要素に class="gallery collapse" を付与

class Gallery extends Modal
	constructor: (options = {}) ->
		@$content = $ '.gallery-content'
		@currentIndex = 0
		@len = $(document).find('[data-index]').length
		super options
	
	handleEvents: ->
		@$el.on MyEvent.touch, '[data-toggle="gallery"]', (el) =>
			if $(window).width() >= 1024
				$toggleEl = $ el.currentTarget
				$targetEl = $ $toggleEl.data 'target'
				@currentIndex = $toggleEl.find('img').data 'index'
				src = $toggleEl.attr 'href'
				@toggle $targetEl, src
			false
		
		@$el.on MyEvent.touch, '[data-toggle="prev"]', (el) =>
			@slide @countChange -1, @currentIndex, @len
			false

		@$el.on MyEvent.touch, '[data-toggle="next"]', (el) =>
			@slide @countChange 1, @currentIndex, @len
			false

		return

	toggle: ($targetEl, src) ->
		if src != '#'
			$img = $('<img>')
				.addClass 'img-fluid'
				.attr 'src', src
			@$content.append $img
			@$content.find('img:first').remove()
			@$content.find('img:last').addClass 'show'
		super $targetEl
		return

	countChange: (num, index, len) ->
		(num + index + len) % len

	slide: (index) ->
		@currentIndex = index
		src = $(document).find('[data-index="' + index + '"]').attr 'src'
		$img = $('<img>')
			.addClass 'img-fluid'
			.attr 'src', src
		@$content.append $img
		Util.animationEnd(
			$img.addClass 'enter'
		).done =>
			@$content.find('img:first').remove()
			@$content.find('img:last').removeClass 'enter'
