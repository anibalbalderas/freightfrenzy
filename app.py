import os

from flask import Flask, render_template

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('front/index.html')


@app.route('/for-carriers')
def forcarriers():
    return render_template('front/for-carriers.html')


@app.route('/for-brokers')
def forbrokers():
    return render_template('front/for-brokers.html')


@app.route('/company')
def company():
    return render_template('front/company.html')


@app.route('/partners')
def partners():
    return render_template('front/partners.html')


@app.route('/get-a-demo')
def getademo():
    return render_template('front/get-a-demo.html')


# obtener puerto #
port = int(os.environ.get('PORT', 8080))
# iniciar servidor #
if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=port)
