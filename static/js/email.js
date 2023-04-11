$(document).ready(function() {
    $('.contactForm').submit(function (event) {
        event.preventDefault();
        var form = $(this);
        var url = form.attr('action');
        $.ajax({
            type: 'POST',
            url: url,
            data: form.serialize(),
        });
    });
}