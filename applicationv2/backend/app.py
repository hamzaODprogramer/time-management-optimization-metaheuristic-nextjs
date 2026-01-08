from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from routes.optimize import optimize_bp
from routes.health import health_bp
from routes.verify import verify_bp

load_dotenv()

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(health_bp)
app.register_blueprint(optimize_bp)
app.register_blueprint(verify_bp)

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5000))
    app.run(debug=os.getenv("FLASK_ENV") == "development", port=port)
