import os

from flask import Flask, render_template

app = Flask(__name__)


@app.route('/', methods=['GET'])
def index():
    return render_template('front/index.html')


@app.route('/for-carriers', methods=['GET'])
def forcarriers():
    return render_template('front/for-carriers.html')


@app.route('/for-brokers', methods=['GET'])
def forbrokers():
    return render_template('front/for-brokers.html')


@app.route('/company', methods=['GET'])
def company():
    return render_template('front/company.html')


@app.route('/partners', methods=['GET'])
def partners():
    return render_template('front/partners.html')


@app.route('/get-a-demo', methods=['GET'])
def getademo():
    return render_template('front/get-a-demo.html')


# obtener puerto #
port = int(os.environ.get('PORT', 8080))
# iniciar servidor #
if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=port)
