###
	Custom
	Last update: 2018/04/30

	Author:	Taigo Ito
	Site: https://tgco.jp
	Twitter: @taigoito
	Location: Tokyo
###

# History APIをサポートしないブラウザをブロック
if !(typeof history.pushState == "function")
	$('body').append '<p class="no-support">このWebページは現在ご利用のブラウザをサポートしていません。<br>最新のブラウザをインストールして再度ご来訪ください。</p>'

# touchイベントのサポートよりMyEventを定義
if 'ontouchend' of document && $(window).width() < 1024
	MyEvent = {
		isSupportTouch: true
		touch: 'touchend'
		start: 'touchstart'
		move: 'touchmove'
		end: 'touchend'
		points: {x: 0, y: 0}
		isDragging: false
	}
else
	MyEvent = {
		isSupportTouch: false
		touch: 'click'
		start: 'mousedown'
		move: 'mousemove'
		end: 'mouseup mouseout'
		points: {x: 0, y: 0}
		isDragging: false
	}

# wheelイベントのサポートよりMyEventを定義
if 'onwheel' of document
	MyEvent.wheel = 'wheel'
else
	MyEvent.wheel = 'mousewheel'

# 凡庸関数群を定義
Util = {
	transitionEnd: ($el) ->
		dfd = new $.Deferred
		callback = ->
			dfd.resolve $el
			return
		if $el? && $el.length && $el.css('transition')?
			$el.on 'transitionend', callback
			dfd.done ->
				$el.off 'transitionend', callback
				return
		else
			dfd.resolve()
		dfd
	
	animationEnd: ($el) ->
		dfd = new $.Deferred
		callback = ->
			dfd.resolve $el
			return
		if $el? && $el.length && $el.css('animation')?
			$el.on 'animationend', callback
			dfd.done ->
				$el.off 'animationend', callback
				return
		else
			dfd.resolve()
		dfd
}

# 戻るボタン([data-history="back"])のイベント定義
$(document).on MyEvent.touch, '[data-history="back"]', ->
	history.back()
	false