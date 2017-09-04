/**
 *      Author: Kailash K Yogeshwar 
 *      Year:   August 2017
 *      LICENSE: MIT
 */

;(function($){
    'use strict';

    $.fn.ifsSlider = function(options){
      options = options || {};
      var defaults = {
        items: 4, 
        speed: 400, 
        loop: true,
        interval: 2000,
        autoWidth: false, 
        className: '',
        rtl: true, 
        ltr: false,
        margin: 10,
        auto: false,
        beforeInit: function(){}   
      }
      
      if (!this.length){
        console.warn("Didn't find any element with given selector :-(");
        return this;
      }

      // multiple instances if class name
      if(this.length > 1){
        this.each(function(){
          return $(this).ifsSlider();
        })
      }

      var plugin = { },
          settings = $.extend(true, {}, defaults, options),
          $element = this;
      var $childrens = $element.children(),
          windowW = $(window).width(),
          $slideWrapper = '',
          $pager     = null,
          slideWidth = 0, // one frame width f1 f2 f3
          scene      = 0, // frame number
          elSize     = 0, // width of ul
          timer      = null,
          length     = 0; // length of the slides excluding cloned slides

      this.setInitialStyle = function(){
        // hooks
        if(settings.beforeInit && typeof settings.beforeInit === 'function'){
          settings.beforeInit.call(null, this);
        }
        // will create a wrap around slider and calculate all other stuff
        $element.addClass('ifs-slider').wrap('<div class="IFSOuter ' + settings.className + '"><div class="IFSSliderWrapper"></div></div>');

        if(settings.loop){
          settings.slideMove = 1;
        }
        $slideWrapper = $element.parent('.IFSSliderWrapper');
        // $slideWrapper.addClass('ifsTransit');

        elSize = $element.outerWidth(); // initial width will be manipulated after cloning
        this.calcSlideWidth();
        $childrens.addClass('ifsc-slide');
        //this.active(); // should it be here ?
        this.clone();  // clone the frames on left and right hand side
        $childrens.css({ width: slideWidth + 'px', 'margin-right': settings.margin });
        this.setTrackHeight();
        this.calcTrackWidth();
        this.setInitialScene();
        var tP = this.getSlidePosition();
        this.move($element, tP);
        this.active();
        setTimeout(function(){
          $element.addClass('ifscSlider');
          $element.addClass('ifsTransit')
        },100)        

        if(settings.auto){
          // automate next slide
          var self = this;
          timer = setInterval(function(){
            if(settings.ltr){
              self.prevSlide(scene--);
            } else {
              self.nextSlide(scene++);
            }
          }, settings.interval)
        }
      }

      this.setInitialScene = function(){
        scene = $element.find('.clone-left').length        
      }

      this.clone = function(){
        // cleanup if prev element is present

        // making clone of the slides and appending and prepending to the original slides
        for (var i = $element.find('.clone-right').length; i < settings.items; i++){
          // start to clone first slide at the end 
          $element.find('.ifsc-slide').eq(i).clone().removeClass('ifsc-slide').addClass('clone-right').appendTo($element);
        }

        for (var n = $element.find('ifsc-slide').length - $element.find('.clone-left').length; n > $element.find('ifsc-slide').length - settings.items; n--){
          $element.find('.ifsc-slide').eq(n - 1).clone().removeClass('ifsc-slide').addClass('clone-left').prependTo($element); 
        }
        $childrens = $element.children();
        length = $childrens.length;
      }

      this.calcTrackWidth = function(){
        // will get the frames container width considering the cloned items
        var length = $childrens.length;
        if (settings.autoWidth === false){
          $childrens.css('width', slideWidth + 'px');
        }
        // $childrens.css('margin-left', settings.margin + 'px');
        // calculate whole track width
        var w = this.calculateWidth(true);
        $element.css({width: w + 'px' })
      }

      this.calcSlideWidth = function(){
        // it will calculate each slideWidth and save it to plugin globals i.e slideWidth
        if(!settings.autoWidth){
          // slideWidth of each frame whole ul width subtract the margin right of each item div items
          slideWidth = (elSize - ( (settings.items * settings.margin) - settings.margin)) / settings.items;
          console.log("slide width calculated is ",slideWidth);
        }
      }

      this.getCurrentSlide = function(){
        return scene;
      }

      this.nextSlide = function(s){
        var sV = this.getSlidePosition(s);
        this.move($element, sV);
        this.checkSlideBreakpoint();
      }

      this.prevSlide = function(s){
        var sV = this.getSlidePosition(s);
        this.move($element, sV);
        this.checkSlideBreakpoint();
      }

      this.slide = function(){
        // this function will move the slides either in right or left direction
        // animate using the translate will be done here
      }

      this.controls = function(){
        // it will add next and previous button for demo purposes
        // practically can be dots and arrow on corners
        var self = this;
        var pagers = '';
        var _class = settings.auto ? 'hidden' : '';
        pagers += '<li style="margin-right:20px"><button class="btn btn-default">Prev</button></li><li><button class="btn btn-default">Next</button></li>';
        $slideWrapper.append("<ul class=ifsc-pager " + _class + "></ul>");
        $slideWrapper.find('.ifsc-pager').html(pagers);
        $pager = $slideWrapper.find('.ifsc-pager').find('li');
        $pager.on('click', function(e){
          $pager.index(this) ? scene++ : scene--;
          var sV = self.getSlidePosition();     

          self.move($element, sV);
          self.checkSlideBreakpoint();          
          $childrens.removeClass('active');
          $childrens.eq(scene).addClass('active');
        })

      }

      this.checkSlideBreakpoint = function(){
        var self = this;
        if(scene >= length - $element.find('.clone-left').length / settings.slideMove){
            scene = $element.find('.clone-left').length;            
            self.resetSlide($element.find('.clone-left').length)
        }
        if(scene === 0){
            scene = $('ifsc-slide').length;
            self.resetSlide($element.find('.ifsc-slide').length);
        }
      }
      this.move = function(el, value){
        // translate the ul to specified value negative
        el.css({
          'transform': 'translate3d(' + (-value) + 'px, 0, 0)',
          '-webkit-transform': 'translate3d(' + (-value) + 'px, 0px, 0px)'
        }) 
        // cal call active function for making dot active when slide changed
      }

      this.resetSlide = function(s){
        // will reset the slider to original frames first slide by temporarily 
        // disabling the pager and making transition-duration 0ms to depict fast
        var self = this;
        console.log("resetting");
        $slideWrapper.find('.ifsc-pager button').addClass('disabled');
        setTimeout(function(){
          scene = s;
          console.log("removing class");
          $element.removeClass('ifsTransit');            
          $slideWrapper.css({ 'transition-timing-function': 'ease','transition-duration': '0ms'});

          var slideValue = self.getSlidePosition();
          self.move($element, slideValue);
          setTimeout(function(){
            $slideWrapper.css('transition-duration', settings.speed + 'ms');
            $element.addClass('ifsTransit');
            console.log("adding class");
            $slideWrapper.find('.ifsc-pager button').removeClass('disabled');
          },50)
        }, settings.speed + 100)
      }

      this.getSlidePosition = function(){
        // it will calculate the slide's value based on the current scene value
        // which will be used for translate
        var sV = 0, i = 0;

        if( settings.autoWidth == false){
          // eg: 4 * (233 + 10 ) * 1 =  -976px approx
          sV = scene * ((slideWidth + settings.margin) * settings.slideMove)
        } else {
          sV = 0;
          while(i < scene){
            sV = (parseInt($childrens.eq(i).width()) + settings.margin);
          }
        }
        return sV;
      }

      this.buildComponent = function(){
        // building the slider 
        // creating tasks as initialStyle & cloning and configuring the cbs
        this.setInitialStyle();
        this.controls()
      }

      this.setTrackHeight = function(){
        // for calculating the track height init phase
        var tH = $childrens.first().outerHeight();
        this.css({ height: tH + 'px' });
      }

      this.calculateWidth = function(includeCloned){
        var ln = includeCloned == true ? $childrens.length : $slideWrapper.find('.ifsc-slide').length; 
        var w = 0;
        if (settings.autoWidth == false){
          w = ln * (slideWidth + settings.margin)
        } else {
          w = 0;
          for(var i = 0; i< ln ; i++){
            w += (parseInt($children.eq(i).width()) + settings.margin);            
          }
        }
        return w;
      }

      this.active = function(){
        // pagination dots logic comes here
        $childrens.removeClass('active');
        $childrens.eq(scene).addClass('active');
      }

      console.debug("building component");
      this.buildComponent();
    }
})(jQuery)