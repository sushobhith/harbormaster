from flask import Flask, jsonify

app = Flask(__name__)


@app.route('/version')
@app.route('/version/')
def version():
    return {
        "version": "1.0.0",
        "service": "myservice"
    }, 200


if __name__ == '__main__':
    app.run(debug=True)