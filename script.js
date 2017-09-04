;(function($){
  console.log("DOM ready");
  $('#kyoko').ifsSlider({ 
    auto: true,
    beforeInit: function(instance){
      console.log("before init hook called ",instance);
    } 
  });

  $('#takahaya').ifsSlider({ 
    auto: true,
    ltr: true,
    rtl: false
  });
}(jQuery))