(function($) {
    
    var action = {};

    $.fn.ayaSlider = function(customOptions) {
        
	var options = $.extend({},$.fn.ayaSlider.defaultOptions, customOptions);
	
	action.inout = 'in';
	action.items = undefined;
	action.currentSlide = undefined;
	
	
	
	action.clearTimeOuts = function(){
	    for (var i = 0; i < action.timeOuts.length; i++){
		clearTimeout(action.timeOuts[i]);
	    }
	};
	
	action.timer = function(delay){
	    
	    var container = action.appendTimerTo;
	    
	    if (!container){
		return;
	    }
	    
	    var thisTop = (container.position().top + container.outerHeight()) - 5,
	    thisWidth = container.outerWidth(),
	    thisLeft = container.offset().left,
	    curWidth = 0;
	    
	    if (!delay){
		delay = 0;
	    }
	    
	    $('._ayaSlider_timer').stop().css({
		top : thisTop,
		left : thisLeft
	    }).animate({
		width : thisWidth
	    },{
		duration : delay
	    });
	    
	    action.lastDelay = delay;
	    
	};
	
	action.move = function(pack){
	    
	    action.timeOuts = [];
	    action.currentSlide = pack;
	    
	    if (!pack){
		return false;
	    }
	    
	    
	    var items = pack.find('._ayaSlider_move').andSelf();
	    action.items = items;
	    items.stop();
	    
	    var length = items.length;
	    
	    pack.css({
		display: 'block',
		opacity: 1
	    });
	    
	    $('._ayaSlider_timer').stop().css({
		width : 0
		//top: pack.height() - 15
	    });
	    
	    
	    if (options.list){
		var $index = pack.data('slideIndex');
		var $list = $(options.list);
		$list.find('li').removeClass('current');
		$list.find('li:eq('+$index+')').addClass('current');
	    }
	    
	    items.each(function(i){
		
		var ele = $(this);
		var opt = ele.data("_options");
		if (!opt){
		    return true;
		}
		
		var durationIn = parseFloat(opt.in.duration) || 1000+(i*300),
		delayIn = parseFloat(opt.in.delay) || 0,
		easeIn = opt.in.ease || options.easeIn || 'easeOutBack',
		easeOut = opt.out.ease || options.easeOut || easeIn,
		durationOut = parseFloat(opt.out.duration) || durationIn,
		delayOut = parseFloat(opt.out.delay) || options.delay;
		
		var defaultIn = {
		    //left : pack.parent().outerWidth() || 500,
		    //opacity: 0
		};
		
		if (typeof options.defaultIn === 'object'){
		    defaultIn = options.defaultIn;
		}
		
		if ( opt.in.top || opt.in.left || opt.in.opacity ){
		    defaultIn = {
		        top: parseFloat(opt.in.top) || 0,
		        left : parseFloat(opt.in.left) || 0
		    };
		    
		    if (opt.in.opacity){
			defaultIn.opacity = parseFloat(opt.in.opacity);
		    }
		    
		}
		
		ele.css(defaultIn);
		
		var posType = ele.css('position');
		if (posType == 'static'){
		    ele.css({
			position : 'relative'
		    });
		}
		
		action.timeOuts.push(setTimeout(function(){
		    
		    ele.stop().animate({
			opacity : opt.opacity,
			left: opt.left+'px',
			top: opt.top+'px'
			},{
			queue: false,
			duration: durationIn,
			complete: function(){
			    
			    var css = {};
			    
			    if (ele[0] !== pack[0]){
				css = defaultIn;
			    }
			    
			    if (opt.out.top || opt.out.left || opt.out.opacity){
				css = {
				    top: parseFloat(opt.out.top) || 0,
				    left : parseFloat(opt.out.left) || 0,
				    opacity : parseFloat(opt.out.opacity) || ele.css('opacity') || 1
				};
			    }
			    
			    //out animation
			    if (ele[0] === pack[0]){
				
				if (action.previousSlide){
				    action.previousSlide.hide();
				}
				
				//play timer
				action.timer(delayOut);
			    }
			    
			    if (opt.out.opacity){
				css.opacity = parseFloat(opt.out.opacity);
			    }
			    
			    action.timeOuts.push(setTimeout(function(){
				clearInterval(action.interval);
				var inter = setInterval(function(){
				    if (action.pause == true){
					
				    } else {
					clearInterval(inter);
					if (ele[0] === pack[0]){
					    action.move(pack.loopSiblings());
					    items.stop();
					}
					
					ele.stop().animate(css,{
					    duration: durationOut,
					    queue: false,
					    complete: function(){
						
						
						
					    },
					    easing : easeOut
					});
				    }
				},60);
				
			    },delayOut));
			},
			easing : easeIn
		    });
		},delayIn));
		
	    });
	    
	    return false;
	    
	};
	
	
	action.add = function(text){
	    var data = {};
	    var options = text.split(';');
	    for (var x = 0; x < options.length; x++){
		var values = options[x].split(':');
		if (values && values.length == 2){
		    var key = values[0].replace(/\s+/,'');
		    var value = values[1].replace(/\s+/,'');
		    data[key] = value;
		}
	    }
	    
	    return data;
	};
	
	return this.each(function() {
	    
	    var $this = $(this),
	    next,
	    previous;
	    
	    $this.mouseenter(function(){
		action.pause = true;
	    }).mouseleave(function(){
		action.pause = false;
	    });
	    
	    //set required style
	    $this.css({
		'position' : 'relative',
		'overflow' : 'hidden'
	    });
	    
	    
	    if (options.next){
		next = options.next;
	    } if (options.previous){
		previous = options.previous;
	    }
	    
	    $(previous).click(function(event){
		event.stopPropagation();
		//stop all previous animations
		if (action.items){
		    action.items.stop();
		}
		action.clearTimeOuts();
		action.currentSlide.fadeOut('slow');
		action.move(action.currentSlide.loopSiblings('previous'));
		return false;
	    });
	    
	    $(next).click(function(event){
		event.stopPropagation();
		//stop all previous animations
		if (action.items){
		    action.items.stop();
		}
		action.clearTimeOuts();
		action.currentSlide.fadeOut('fast');
		action.move(action.currentSlide.loopSiblings());
		return false;
	    });
	    
	    
	    if (options.list){
		var $list = $(options.list);
		
		$list.find('li').each(function(i){
		    var $li = $(this);
		    $li.click(function(){
			
			if ($li.hasClass('current')){
			    return false;
			}
			
			if (action.items){
			    action.items.stop();
			}
			action.clearTimeOuts();
			action.currentSlide.fadeOut('fast');
			action.move(action.currentSlide.loopSiblings(i));
			return false;
			
		    });
		});
		
	    }
	    
	    var _first;
	    var _height = $this.height();
	    
	    $this.children().each(function(i){
		var ele = $(this);
		ele.addClass('_ayaSlider_slide').data('slideIndex',i);
		ele.css({
		    position: 'absolute',
		    overflow:'hidden',
		    display: 'none',
		    width : '100%',
		    height : _height
		});
		
		if (i == 0){
		    _first = ele;
		}
	    });
	    
	    $this.find('*').each(function(){
		var ele = $(this);
		
		var data = {
		    in : {},
		    out : {}
		};
		
		if(!ele.data("_in")){
		    var options = ele.data('in');
		    if (options){
			data.in = action.add(options);
		    }
		}
		
		if(!ele.data("_out")){
		    var options = ele.data('out');
		    if (options){
			data.out = action.add(options);
		    }
		}
		
		data.left = 0;
		data.top = 0;
		
		data.opacity = ele.css('opacity');
		ele.data("_options",data);
		ele.addClass('_ayaSlider_move');
		
	    });
	    
	    
	    if (options.timer){
		//var appendTimerTo;
		if (options.timer == true){
		    action.appendTimerTo = $this;
		} else {
		    action.appendTimerTo = $(options.timer);
		}
		
		$('<div class="_ayaSlider_timer" style="position:absolute;z-index:4;width:0;height:5px;background:#000;left:0;margin:0;padding:0"></div>')
		.css({
		    opacity:0.5
		    //top : timerTop
		}).appendTo(action.appendTimerTo);
		
		$(window).resize(function(){
		action.timer();
		});
		
	    }
	    
	    action.move(_first);
	    
        });
	return false;
    };
    
    $.fn.ayaSlider.defaultOptions = {
	delay : 5000,
	easeIn : "linear",
	easeOut : "linear"
    };
    
    $.fn.loopSiblings = function(type){
	var $this = this;
	
	$this.css('zIndex','2');
	
	action.previousSlide = $this;
	var item;
	if (parseInt(type) >= 0 ){
	    item = $('._ayaSlider_slide:eq('+type+')');
	}else if (type === 'previous'){
	    item = $this.prev('._ayaSlider_slide');
	    var len = item.length;
	    if (item.length == 0) {
		item = $this.nextAll('._ayaSlider_slide').eq(len-1);
	    }
	} else {
	    item = $this.next('._ayaSlider_slide');
	    var len = item.length;
	    if (item.length == 0) {
		item = $this.prevAll('._ayaSlider_slide').eq(len-1);
	    }
	}
	
	item.css('zIndex','3');
	return item;
    };
    
    
})(jQuery);

/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 * 
 * Open source under the BSD License. 
 * 
 * Copyright � 2008 George McGinley Smith
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
*/

// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend( jQuery.easing,
{
	def: 'easeOutQuad',
	swing: function (x, t, b, c, d) {
		//alert(jQuery.easing.default);
		return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
	},
	easeInQuad: function (x, t, b, c, d) {
		return c*(t/=d)*t + b;
	},
	easeOutQuad: function (x, t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	easeInOutQuad: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInCubic: function (x, t, b, c, d) {
		return c*(t/=d)*t*t + b;
	},
	easeOutCubic: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	},
	easeInOutCubic: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	},
	easeInQuart: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	},
	easeOutQuart: function (x, t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeInOutQuart: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	easeInQuint: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	},
	easeOutQuint: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	easeInOutQuint: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	},
	easeInSine: function (x, t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},
	easeOutSine: function (x, t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	},
	easeInOutSine: function (x, t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	},
	easeInExpo: function (x, t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},
	easeOutExpo: function (x, t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
	easeInOutExpo: function (x, t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	easeInCirc: function (x, t, b, c, d) {
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	},
	easeOutCirc: function (x, t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},
	easeInOutCirc: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	},
	easeInElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	easeOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	easeInOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	},
	easeInBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	easeOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	easeInOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158; 
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	easeInBounce: function (x, t, b, c, d) {
		return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
	},
	easeOutBounce: function (x, t, b, c, d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	},
	easeInOutBounce: function (x, t, b, c, d) {
		if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
		return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
	}
});