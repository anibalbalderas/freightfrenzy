import os
import smtplib

from email.message import EmailMessage
from flask import Flask, render_template, request, redirect, url_for, session
from flask_socketio import SocketIO, emit
from flask_mysqldb import MySQL

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecretkey'

app.config['MYSQL_HOST'] = '4s5ze1.stackhero-network.com'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'LXUFVvi6It4xJvp4WDacPE9IauJROOkS'
app.config['MYSQL_DB'] = 'root'
app.config['MYSQL_PORT'] = 3306
app.config["MYSQL_CUSTOM_OPTIONS"] = {"ssl": "false"}

socketio = SocketIO(app)
mysql = MySQL(app)


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
        msg.set_content(
            'Nombre: ' + name + '\n' + 'Email: ' + email + '\n' + 'Teléfono: ' + phone + '\n' + 'Mensaje: ' + message)

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
        msg.set_content(
            'Nombre: ' + firstName + '\n' + 'Apellido: ' + lastName + '\n' + 'Email: ' + email + '\n' + 'Teléfono: ' + phone + '\n' + 'Compañía: ' + company + '\n' + 'Número de camiónes: ' + truckNumber)

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
        msg.set_content(
            'Nombre: ' + firstName + '\n' + 'Apellido: ' + lastName + '\n' + 'Email: ' + email + '\n' + 'Teléfono: ' + phone + '\n' + 'Número de MC: ' + mcNumber + '\n' + 'Número de cargas: ' + loadsNumber)

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


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # obtener datos del formulario #
        email = request.form['username']
        password = request.form['password']

        # verificar si el usuario existe #
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM users WHERE email=%s AND password=%s", (email, password))
        user = cur.fetchone()
        cur.close()
        if user:
            session['user'] = email
            return redirect(url_for('driver'))
        else:
            return render_template('front/login.html', error='username or password incorrect')
    return render_template('front/login.html')


@app.route('/driver', methods=['GET'])
def driver():
    # verificar si el usuario está logueado #
    if 'user' in session:
        return render_template('driver/index.html')
    else:
        return redirect(url_for('login'))


@socketio.on('location')
def handle_location(data):
    # obtener id del usuario de la base de datos #
    cur = mysql.connection.cursor()
    cur.execute("SELECT id FROM drivers WHERE email=%s", (session['user'],))
    user_id = cur.fetchone()
    cur.close()
    if user_id is None:
        return
    lat = data['lat']
    lng = data['lng']
    # guardar ubicación en la base de datos o actualizarla si ya existe #
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM locations WHERE user_id=%s", (user_id,))
    result = cur.fetchone()
    if result:
        cur.execute("UPDATE locations SET latitude=%s, longitude=%s WHERE user_id=%s", (lat, lng, user_id))
    else:
        cur.execute("INSERT INTO locations (user_id, latitude, longitude) VALUES (%s, %s, %s)", (user_id, lat, lng))
    mysql.connection.commit()
    cur.close()
    emit('location', data, broadcast=True)


@app.route('/driver/location/<int:driver_id>', methods=['GET'])
def driver_location(driver_id):
    cur = mysql.connection.cursor()
    cur.execute("SELECT latitude, longitude FROM locations WHERE user_id=%s", (driver_id,))
    result = cur.fetchone()
    cur.close()
    if result:
        return {'latitude': result[0], 'longitude': result[1]}
    else:
        return {'error': 'User not found'}


@app.route('/driver/destination/<int:driver_id>', methods=['GET'])
def driver_destination(driver_id):
    cur = mysql.connection.cursor()
    cur.execute("SELECT latitude, longitude FROM destinations WHERE user_id=%s", (driver_id,))
    result = cur.fetchone()
    cur.close()
    if result:
        return {'latitude': result[0], 'longitude': result[1]}
    else:
        return {'error': 'User not found'}


@app.route('/driver/starts/<int:driver_id>', methods=['GET'])
def driver_starts(driver_id):
    cur = mysql.connection.cursor()
    cur.execute("SELECT latitude, longitude FROM starts WHERE user_id=%s", (driver_id,))
    result = cur.fetchone()
    cur.close()
    if result:
        return {'latitude': result[0], 'longitude': result[1]}
    else:
        return {'error': 'User not found'}


@app.route('/driver/map', methods=['GET', 'POST'])
def drivermap():
    # verificar si el usuario está logueado #
    if 'user' in session:
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM users WHERE email=%s AND role='broker'", (session['user'],))
        user = cur.fetchone()
        cur.close()
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM users WHERE email=%s AND role='admin'", (session['user'],))
        user2 = cur.fetchone()
        cur.close()
        if user:
            # obtener drivers de el broker #
            cur = mysql.connection.cursor()
            cur.execute("SELECT id, name FROM drivers WHERE broker=%s", (session['user'],))
            drivers = cur.fetchall()
            cur.close()
            if drivers:
                return render_template('driver/map.html', drivers=drivers)
            else:
                return render_template('driver/index.html')
        if user2:
            cur = mysql.connection.cursor()
            cur.execute("SELECT id, name FROM drivers")
            drivers = cur.fetchall()
            cur.close()
            if drivers:
                return render_template('driver/map.html', drivers=drivers)
            else:
                return render_template('driver/index.html')
        else:
            return render_template('driver/index.html')
    else:
        return redirect(url_for('login'))


@app.route('/driver/drivers', methods=['GET', 'POST'])
def driverdrivers():
    # verificar si el usuario está logueado #
    if 'user' in session:
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM users WHERE email=%s AND role='broker'", (session['user'],))
        broker = cur.fetchone()
        cur.close()
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM users WHERE email=%s AND role='admin'", (session['user'],))
        admin = cur.fetchone()
        cur.close()
        if broker or admin:
            # insertar datos del formulario #
            if request.method == 'POST':
                # obtener datos del formulario #
                name = request.form['name']
                surname = request.form['surname']
                email = request.form['email']
                password = request.form['password']
                phone = request.form['phone']
                address = request.form['address']
                city = request.form['city']
                state = request.form['state']
                zip = request.form['zip']
                country = request.form['country']
                license = request.form['license']
                licenceExp = request.form['licenseExp']
                dob = request.form['dob']
                ssn = request.form['ssn']
                driverType = request.form['driverType']
                # guardar datos en la base de datos #
                # verificar si el usuario existe #
                cur = mysql.connection.cursor()
                cur.execute("SELECT * FROM drivers WHERE email=%s", (email,))
                user = cur.fetchone()
                cur.close()
                if user:
                    return render_template('driver/drivers.html', error='User already exists')
                else:
                    cur = mysql.connection.cursor()
                    cur.execute("INSERT INTO users (username, email, password, role) VALUES (%s, %s, %s, %s)",
                                (name, email, password, 'driver'))
                    mysql.connection.commit()
                    cur.close()
                    # obtener id del usuario #
                    cur = mysql.connection.cursor()
                    cur.execute("SELECT id FROM users WHERE email=%s", (email,))
                    user_id = cur.fetchone()
                    cur.close()
                    # guardar datos del usuario en la tabla drivers #
                    cur = mysql.connection.cursor()
                    cur.execute(
                        "INSERT INTO drivers (id, name, surname, email, password, phone, address, city, state, zip, country, license, exp, birth, ssn, drivertype, broker) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                        (user_id, name, surname, email, password, phone, address, city, state, zip, country, license,
                         licenceExp, dob, ssn, driverType, session['user']))
                    mysql.connection.commit()
                    cur.close()
                    return render_template('driver/drivers.html', success='User created successfully')
            else:
                cur = mysql.connection.cursor()
                cur.execute("SELECT * FROM users WHERE email=%s AND role='broker'", (session['user'],))
                user = cur.fetchone()
                cur.close()
                cur = mysql.connection.cursor()
                cur.execute("SELECT * FROM users WHERE email=%s AND role='admin'", (session['user'],))
                user2 = cur.fetchone()
                cur.close()
                if user:
                    # obtener drivers de el broker #
                    cur = mysql.connection.cursor()
                    cur.execute("SELECT * FROM drivers WHERE broker=%s", (session['user'],))
                    drivers = cur.fetchall()
                    cur.close()
                    if drivers:
                        return render_template('driver/drivers.html', drivers=drivers)
                    else:
                        return render_template('driver/index.html')
                if user2:
                    cur = mysql.connection.cursor()
                    cur.execute("SELECT * FROM drivers")
                    drivers = cur.fetchall()
                    cur.close()
                    if drivers:
                        return render_template('driver/drivers.html', drivers=drivers)
                    else:
                        return render_template('driver/index.html')
        else:
            return render_template('driver/index.html')
    else:
        return redirect(url_for('login'))


@app.route('/driver/edit/<int:driver_id>', methods=['POST', 'GET'])
def driveredit(driver_id):
    if 'user' in session:
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM drivers WHERE id=%s", (driver_id,))
        driver = cur.fetchone()
        cur.close()
        if request.method == 'POST':
            # obtener datos del formulario #
            name = request.form['name']
            surname = request.form['surname']
            email = request.form['email']
            phone = request.form['phone']
            address = request.form['address']
            city = request.form['city']
            state = request.form['state']
            zip = request.form['zip']
            country = request.form['country']
            license = request.form['license']
            licenceExp = request.form['licenseExp']
            dob = request.form['dob']
            ssn = request.form['ssn']
            driverType = request.form['driverType']
            # actualizar datos en la base de datos #
            cur = mysql.connection.cursor()
            cur.execute("UPDATE drivers SET name=%s, surname=%s, email=%s, phone=%s, address=%s, city=%s, state=%s, zip=%s, country=%s, license=%s, exp=%s, birth=%s, ssn=%s, drivertype=%s WHERE id=%s", (name, surname, email, phone, address, city, state, zip, country, license, licenceExp, dob, ssn, driverType, driver_id))
            mysql.connection.commit()
            cur.close()
            return render_template('driver/drivers.html', success='User updated successfully')
        return render_template('driver/edit.html', driver_id=driver_id, driver=driver)


@app.route('/driver/delete/<int:driver_id>', methods=['GET'])
def driverdelete(driver_id):
    print(driver_id)
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM drivers WHERE id=%s", (driver_id,))
    mysql.connection.commit()
    cur.close()
    return render_template('driver/drivers.html', success='User deleted successfully')


@app.route('/driver/loads', methods=['GET'])
def driverloads():
    if 'user' in session:
        return render_template('driver/loads.html')


@app.route('/driver/loads/add', methods=['POST', 'GET'])
def driverloadsadd():
    if 'user' in session:
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM users WHERE email=%s AND role='broker'", (session['user'],))
        broker = cur.fetchone()
        cur.close()
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM users WHERE email=%s AND role='admin'", (session['user'],))
        admin = cur.fetchone()
        cur.close()
        if broker or admin:
            return render_template('driver/loadsadd.html')
        else:
            return render_template('driver/index.html')


@app.route('/driver/settings', methods=['GET'])
def settings():
    if 'user' in session:
        return render_template('driver/settings.html')


@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('login'))


# obtener puerto #
port = int(os.environ.get('PORT', 8080))
# iniciar servidor #
if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=port)
