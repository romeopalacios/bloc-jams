var animatePoints = function() {
 var revealPoint = function() {
       $(this).css({
             opacity: 1,
             transform: 'scaleX(1) translateY(0)'
         });
     };       
   $.each($('.point'), revealPoint);
};
     
$(window).load(function() {
        if ($(window).height() > 950) {
         animatePoints();
      } 
<<<<<<< HEAD
=======
console.log($('.selling-points'))
>>>>>>> checkpoint-16-landingpage
var scrollDistance = $('.selling-points').offset().top - $(window).height() + 200;
    
     
$(window).scroll(function(event) {
 if ($(window).scrollTop() >= scrollDistance) {
      animatePoints();
<<<<<<< HEAD
  }
});
});
=======
    } 
  });
});
>>>>>>> checkpoint-16-landingpage
