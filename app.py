import os
import smtplib

from email.message import EmailMessage
from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecretkey'


@app.route('/', methods=['GET'])
def index():
    return render_template('front/index.html')


@app.route('/company', methods=['GET'])
def company():
    return render_template('front/company.html')


@app.route('/contact', methods=['POST', 'GET'])
def contact():
    if request.method == 'POST':
        # obtener datos del formulario #
        name = request.form['name']
        email = request.form['email']
        phone = request.form['phone']
        message = request.form['message']

        # enviar correo con Gmail #
        msg = EmailMessage()
        msg['From'] = email
        msg['To'] = 'aniballeguizamobalderas@gmail.com'
        msg['Subject'] = 'Freight Frenzy'
        msg.set_content('Nombre: ' + name + '\n' + 'Email: ' + email + '\n' + 'Teléfono: ' + phone + '\n' + 'Mensaje: ' + message)

        # enviar correo electrónico #
        with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
            smtp.starttls()
            smtp.login('aniballeguizamobalderas@gmail.com', 'zfevqjjzczdpfxwj')
            smtp.send_message(msg)
            smtp.quit()
        return redirect(url_for('index'))
    return render_template('front/contact.html')


@app.route('/get-a-demo', methods=['GET', 'POST'])
def getademo():
    if request.method == 'POST':
        # obtener datos del formulario #
        firstName = request.form['name']
        lastName = request.form['lastName']
        email = request.form['email']
        phone = request.form['phone']
        company = request.form['company']
        truckNumber = request.form['truckNumber']

        # enviar correo con Gmail #
        msg = EmailMessage()
        msg['From'] = email
        msg['To'] = 'aniballeguizamobalderas@gmail.com'
        msg['Subject'] = 'Freight Frenzy'
        msg.set_content('Nombre: ' + firstName + '\n' + 'Apellido: ' + lastName + '\n' + 'Email: ' + email + '\n' + 'Teléfono: ' + phone + '\n' + 'Compañía: ' + company + '\n' + 'Número de camiónes: ' + truckNumber)

        # enviar correo electrónico #
        with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
            smtp.starttls()
            smtp.login('aniballeguizamobalderas@gmail.com', 'zfevqjjzczdpfxwj')
            smtp.send_message(msg)
            smtp.quit()
        return redirect(url_for('index'))
    return render_template('front/get-a-demo.html')


@app.route('/get-a-demo2', methods=['POST'])
def getademo2():
    if request.method == 'POST':
        # obtener datos del formulario #
        firstName = request.form['name']
        lastName = request.form['lastName']
        email = request.form['email']
        phone = request.form['phone']
        mcNumber = request.form['mcNumber']
        loadsNumber = request.form['loadsNumber']

        # enviar correo con Gmail #
        msg = EmailMessage()
        msg['From'] = email
        msg['To'] = 'aniballeguizamobalderas@gmail.com'
        msg['Subject'] = 'Freight Frenzy'
        msg.set_content('Nombre: ' + firstName + '\n' + 'Apellido: ' + lastName + '\n' + 'Email: ' + email + '\n' + 'Teléfono: ' + phone + '\n' + 'Número de MC: ' + mcNumber + '\n' + 'Número de cargas: ' + loadsNumber)

        # enviar correo electrónico #
        with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
            smtp.starttls()
            smtp.login('aniballeguizamobalderas@gmail.com', 'zfevqjjzczdpfxwj')
            smtp.send_message(msg)
            smtp.quit()
        return redirect(url_for('index'))


@app.route('/dispatch', methods=['GET'])
def dispatch():
    return render_template('front/dispatch.html')


@app.route('/command', methods=['GET'])
def command():
    return render_template('front/command.html')


# obtener puerto #
port = int(os.environ.get('PORT', 8080))
# iniciar servidor #
if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=port)
