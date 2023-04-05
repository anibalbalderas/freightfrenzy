$(document).ready(function() {
  // Manejar eventos de clic en enlaces y botones
  $('a, button').click(function(event) {
    // Evitar que se siga el enlace o se envíe el formulario
    event.preventDefault();
    // Obtener la URL del recurso correspondiente
    var url = $(this).attr('href') || $(this).attr('formaction');
    // Realizar una solicitud AJAX para obtener el contenido dinámico
    $.get(url, function(data) {
      // Actualizar el contenido del contenedor dinámico
      $('#content').html(data);
    });
  });
});

// cambiar imagen si pasa el mouse por encima de una seccion //
$(document).ready(function() {
    $('.section5__c1').hover(function() {
        var image = $(this).attr('data-image');
        $('#truckloads').attr('src', image);
    });
});

// cambiar imagen si pasa el mouse por encima de una seccion //
$(document).ready(function() {
    $('.section5__c2').hover(function() {
        var image = $(this).attr('data-image');
        $('#truckloads').attr('src', image);
    });
});

// slider de grid section6__grid //
$(document).ready(function() {
  $('.section6__content').slick({
      slidesToShow: 3,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 2000,
      dots: false,
      arrows: false,
      infinite: true,
      responsive: [
          {
              breakpoint: 992,
              settings: {
              slidesToShow: 2,
              slidesToScroll: 1
              }
              },
          {
              breakpoint: 768,
              settings: {
                  slidesToShow: 1,
                  slidesToScroll: 1
              }
          }
          ]
  });
});