new Splide( '.splide', {
    perPage: 3,
    perMove: 1,
    type   : 'loop',
    focus  : 'center',
    breakpoints: {
        767: {
        perPage: 1,
        }
    }
} ).mount();
$('.next-splide').click(function() {
    $('.splide__arrow.splide__arrow--next').click();
});
$('.prev-splide').click(function() {
    $('.splide__arrow.splide__arrow--prev').click();
});