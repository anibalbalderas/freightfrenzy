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

// cambiar imagen si se da click en el menu //
$(document).ready(function() {
    $('.command__s4mc').click(function() {
        var image = $(this).attr('data-image');
        $('#findloads').attr('src', image);
        // añadir clase active al elemento seleccionado //
        $('.command__s4mc').removeClass('command__s4mc-active');
        $(this).addClass('command__s4mc-active');
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

// slider de grid command__s5s //
$(document).ready(function() {
  $('.command__s5s').slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 2000,
      dots: false,
      arrows: false,
      infinite: true,
  });
});

// contact form //
$(document).ready(function() {
    $('.contactForm').submit(function (event) {
        event.preventDefault();
        var form = $(this);
        var url = form.attr('action');
        $.ajax({
            type: 'POST',
            url: url,
            data: form.serialize(),
            success: function (data) {
                $('#contactForm').html(data);
            }
        });
    });
});