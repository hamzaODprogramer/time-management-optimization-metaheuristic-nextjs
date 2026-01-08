from flask import Blueprint, request, jsonify
from services.optimizer import OptimizationService
import os

optimize_bp = Blueprint('optimize', __name__)

@optimize_bp.route('/api/optimize', methods=['POST'])
def optimize():
    """
    Run the timetable optimization algorithm.
    Expects database connection details in request or environment.
    """
    try:
        # Get database configuration from environment or request
        db_config = {
            "host": os.getenv("DB_HOST", "localhost"),
            "user": os.getenv("DB_USER", "root"),
            "password": os.getenv("DB_PASSWORD", ""),
            "database": os.getenv("DB_NAME", "time_management"),
            "port": int(os.getenv("DB_PORT", 3306))
        }
        
        # Initialize optimizer service
        optimizer = OptimizationService(db_config)
        
        # Run optimization
        result = optimizer.optimize_schedule()
        
        return jsonify(result), 200 if result["success"] else 400
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Optimization failed: {str(e)}"
        }), 500
