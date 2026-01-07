from flask import Blueprint, jsonify
from services.optimizer import OptimizationService
import os
from collections import defaultdict

verify_bp = Blueprint('verify', __name__)

@verify_bp.route('/api/verify', methods=['GET'])
def verify_schedule():
    """
    Verify the current schedule and report on constraint violations.
    This proves whether the optimization is working correctly.
    """
    try:
        # Get database configuration
        db_config = {
            "host": os.getenv("DB_HOST", "localhost"),
            "user": os.getenv("DB_USER", "root"),
            "password": os.getenv("DB_PASSWORD", ""),
            "database": os.getenv("DB_NAME", "time_management"),
            "port": int(os.getenv("DB_PORT", 3306))
        }
        
        # Initialize optimizer service to use its verification methods
        optimizer = OptimizationService(db_config)
        optimizer.connect_db()
        optimizer.load_instance()
        
        # Load current schedule from database
        optimizer.cursor.execute("""
            SELECT id, course_id, room_id, timeslot_id 
            FROM schedule
        """)
        schedule_items = optimizer.cursor.fetchall()
        
        if not schedule_items:
            optimizer.close_db()
            return jsonify({
                "success": False,
                "message": "No schedule found. Please run optimization first."
            }), 404
        
        # Convert to solution format
        solution = {}
        for item in schedule_items:
            solution[item['course_id']] = {
                't': item['timeslot_id'],
                'r': item['room_id']
            }
        
        # Analyze constraints
        violations = analyze_constraints(optimizer, solution)
        
        # Calculate fitness
        fitness_score = optimizer.fitness(solution)
        
        # Get statistics
        stats = calculate_statistics(optimizer, solution)
        
        optimizer.close_db()
        
        # Determine if schedule is valid
        total_hard_violations = sum(violations['hard'].values())
        is_valid = total_hard_violations == 0
        
        return jsonify({
            "success": True,
            "isValid": is_valid,
            "fitness": round(fitness_score, 2),
            "violations": violations,
            "statistics": stats,
            "message": "Schedule is valid! ✓" if is_valid else f"Schedule has {total_hard_violations} hard constraint violations"
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Verification failed: {str(e)}"
        }), 500


def analyze_constraints(optimizer, solution):
    """Analyze all constraints and return detailed violation counts"""
    hard_violations = {
        'professor_conflicts': 0,
        'room_conflicts': 0,
        'group_conflicts': 0,
        'capacity_violations': 0,
        'room_type_mismatches': 0
    }
    
    soft_violations = {
        'gaps_in_schedule': 0,
        'uneven_distribution': 0
    }
    
    # Detailed conflict tracking
    conflicts_detail = {
        'professor_conflicts': [],
        'room_conflicts': [],
        'group_conflicts': []
    }
    
    # 1. Professor conflicts (same professor, same timeslot)
    prof_timeslot = defaultdict(list)
    for event_id, assign in solution.items():
        event = optimizer.events[event_id]
        prof = event['teacher']
        if prof:
            key = (prof, assign['t'])
            prof_timeslot[key].append(event['name'])
    
    for (prof, ts), courses in prof_timeslot.items():
        if len(courses) > 1:
            hard_violations['professor_conflicts'] += len(courses) - 1
            conflicts_detail['professor_conflicts'].append({
                'professor_id': prof,
                'timeslot_id': ts,
                'courses': courses,
                'count': len(courses)
            })
    
    # 2. Room conflicts (same room, same timeslot)
    room_timeslot = defaultdict(list)
    for event_id, assign in solution.items():
        event = optimizer.events[event_id]
        key = (assign['r'], assign['t'])
        room_timeslot[key].append(event['name'])
    
    for (room, ts), courses in room_timeslot.items():
        if len(courses) > 1:
            hard_violations['room_conflicts'] += len(courses) - 1
            conflicts_detail['room_conflicts'].append({
                'room_id': room,
                'room_name': optimizer.rooms[room]['name'],
                'timeslot_id': ts,
                'courses': courses,
                'count': len(courses)
            })
    
    # 3. Group conflicts (same group, same timeslot)
    group_timeslot = defaultdict(list)
    for event_id, assign in solution.items():
        event = optimizer.events[event_id]
        key = (event['group'], assign['t'])
        group_timeslot[key].append(event['name'])
    
    for (group, ts), courses in group_timeslot.items():
        if len(courses) > 1:
            hard_violations['group_conflicts'] += len(courses) - 1
            conflicts_detail['group_conflicts'].append({
                'group_id': group,
                'timeslot_id': ts,
                'courses': courses,
                'count': len(courses)
            })
    
    # 4. Capacity violations
    capacity_issues = []
    for event_id, assign in solution.items():
        event = optimizer.events[event_id]
        room = optimizer.rooms[assign['r']]
        if room['capacity'] < event['min_capacity']:
            hard_violations['capacity_violations'] += 1
            capacity_issues.append({
                'course': event['name'],
                'room': room['name'],
                'room_capacity': room['capacity'],
                'required_capacity': event['min_capacity']
            })
    
    # 5. Room type mismatches
    type_issues = []
    for event_id, assign in solution.items():
        event = optimizer.events[event_id]
        room = optimizer.rooms[assign['r']]
        if (event['preferred_room_type'] != 'Any' and 
            room['type'] != event['preferred_room_type']):
            hard_violations['room_type_mismatches'] += 1
            type_issues.append({
                'course': event['name'],
                'room': room['name'],
                'required_type': event['preferred_room_type'],
                'actual_type': room['type']
            })
    
    # 6. Calculate gaps
    day_schedules = defaultdict(list)
    for event_id, assign in solution.items():
        day = optimizer.timeslots[assign['t']]['day']
        day_schedules[day].append(assign['t'])
    
    total_gaps = 0
    for day, timeslots in day_schedules.items():
        if len(timeslots) > 1:
            sorted_ts = sorted(set(timeslots))
            for i in range(len(sorted_ts) - 1):
                gap = sorted_ts[i + 1] - sorted_ts[i] - 1
                total_gaps += gap
    
    soft_violations['gaps_in_schedule'] = total_gaps
    
    # 7. Distribution variance
    day_counts = defaultdict(int)
    for event_id, assign in solution.items():
        day = optimizer.timeslots[assign['t']]['day']
        day_counts[day] += 1
    
    if day_counts:
        counts = list(day_counts.values())
        avg = sum(counts) / len(counts)
        variance = sum((c - avg) ** 2 for c in counts) / len(counts)
        soft_violations['uneven_distribution'] = round(variance, 2)
    
    return {
        'hard': hard_violations,
        'soft': soft_violations,
        'details': {
            'professor_conflicts': conflicts_detail['professor_conflicts'],
            'room_conflicts': conflicts_detail['room_conflicts'],
            'group_conflicts': conflicts_detail['group_conflicts'],
            'capacity_issues': capacity_issues,
            'type_issues': type_issues
        }
    }


def calculate_statistics(optimizer, solution):
    """Calculate general statistics about the schedule"""
    stats = {
        'total_courses': len(solution),
        'total_timeslots': len(optimizer.timeslots),
        'total_rooms': len(optimizer.rooms),
        'total_teachers': len(optimizer.teachers),
        'utilization': {}
    }
    
    # Room utilization
    room_usage = defaultdict(int)
    for event_id, assign in solution.items():
        room_usage[assign['r']] += 1
    
    total_slots = len(optimizer.timeslots)
    room_util = {}
    for room_id, usage_count in room_usage.items():
        room_name = optimizer.rooms[room_id]['name']
        utilization_pct = round((usage_count / total_slots) * 100, 1)
        room_util[room_name] = {
            'count': usage_count,
            'percentage': utilization_pct
        }
    
    stats['utilization']['rooms'] = room_util
    
    # Day distribution
    day_distribution = defaultdict(int)
    for event_id, assign in solution.items():
        day = optimizer.timeslots[assign['t']]['day']
        day_distribution[day] += 1
    
    stats['day_distribution'] = dict(day_distribution)
    
    return stats
