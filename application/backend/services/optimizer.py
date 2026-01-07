import mysql.connector
from mysql.connector import Error
import random
import math
import copy
from collections import defaultdict

# Algorithm parameters (from research paper)
MAX_ITER = 10000  # Maximum iterations for SA
T_INIT = 100.0  # Initial temperature
ALPHA = 0.95  # Cooling rate
WH = 100  # Hard constraint weight (penalty for violations)
WS = 1  # Soft constraint weight

class OptimizationService:
    """
    Hybrid Simulated Annealing + Iterated Local Search optimizer.
    Solves university timetabling with hard and soft constraints.
    Based on metaheuristic optimization research.
    """
    
    def __init__(self, db_config):
        self.db_config = db_config
        self.connection = None
        self.cursor = None
        self.events = {}  # event_id -> event data
        self.timeslots = {}  # timeslot_id -> timeslot data
        self.rooms = {}  # room_id -> room data
        self.groups = {}  # group_name -> group data
        self.teachers = set()  # unique teacher set
    
    def connect_db(self):
        """Establish database connection"""
        try:
            self.connection = mysql.connector.connect(**self.db_config)
            self.cursor = self.connection.cursor(dictionary=True)
        except Error as e:
            raise Exception(f"Database connection failed: {str(e)}")
    
    def close_db(self):
        """Close database connection"""
        if self.connection and self.connection.is_connected():
            self.cursor.close()
            self.connection.close()
    
    def load_instance(self):
        """Load all data from database into memory for fast access"""
        try:
            # Load courses as events (use snake_case column names)
            self.cursor.execute("""
                SELECT id, name, teacher_id, group_id, min_capacity, 
                       preferred_room_type FROM courses
            """)
            courses = self.cursor.fetchall()
            for course in courses:
                self.events[course['id']] = {
                    'id': course['id'],
                    'name': course['name'],
                    'teacher': course.get('teacher_id'),
                    'group': course.get('group_id'),
                    'min_capacity': course.get('min_capacity', 0),
                    'preferred_room_type': course.get('preferred_room_type') or 'Any'
                }
                if course.get('teacher_id'):
                    self.teachers.add(course['teacher_id'])
            
            # Load timeslots
            self.cursor.execute("SELECT id, day, start_time, end_time FROM timeslots")
            for ts in self.cursor.fetchall():
                self.timeslots[ts['id']] = {
                    'id': ts['id'],
                    'day': ts['day'],
                    'start': str(ts.get('start_time')),
                    'end': str(ts.get('end_time'))
                }
            
            # Load rooms
            self.cursor.execute("SELECT id, name, capacity, type FROM rooms")
            for room in self.cursor.fetchall():
                self.rooms[room['id']] = {
                    'id': room['id'],
                    'name': room['name'],
                    'capacity': room.get('capacity', 0),
                    'type': room.get('type')
                }
            
            # Load groups
            self.cursor.execute("SELECT id, name FROM groups")
            for group in self.cursor.fetchall():
                self.groups[group['id']] = {
                    'name': group['name'],
                    'id': group['id']
                }
        
        except Error as e:
            raise Exception(f"Failed to load instance: {str(e)}")
    
    def initial_solution(self):
        """Create initial solution by random assignment"""
        solution = {}
        for event_id in self.events.keys():
            solution[event_id] = {
                't': random.choice(list(self.timeslots.keys())),
                'r': random.choice(list(self.rooms.keys()))
            }
        return solution
    
    def fitness(self, solution, debug=False):
        """
        Calculate fitness (lower is better).
        Hard constraints: prof overlaps, room overlaps, group overlaps, capacity, type
        Soft constraints: gaps between courses, variance in distribution
        """
        hard_violations = {
            'prof_overlap': 0,
            'room_overlap': 0,
            'group_overlap': 0,
            'capacity_viol': 0,
            'type_mismatch': 0
        }
        
        # Check hard constraints
        # 1. Professor overlap
        prof_t_room = defaultdict(list)
        for event_id, assign in solution.items():
            event = self.events[event_id]
            prof = event['teacher']
            if prof:
                key = (prof, assign['t'], assign['r'])
                prof_t_room[key].append(event_id)
        for key, events in prof_t_room.items():
            if len(events) > 1:
                hard_violations['prof_overlap'] += len(events) - 1
        
        # 2. Room overlap
        room_t = defaultdict(list)
        for event_id, assign in solution.items():
            key = (assign['r'], assign['t'])
            room_t[key].append(event_id)
        for key, events in room_t.items():
            if len(events) > 1:
                hard_violations['room_overlap'] += len(events) - 1
        
        # 3. Group overlap
        group_t = defaultdict(list)
        for event_id, assign in solution.items():
            event = self.events[event_id]
            key = (event['group'], assign['t'])
            group_t[key].append(event_id)
        for key, events in group_t.items():
            if len(events) > 1:
                hard_violations['group_overlap'] += len(events) - 1
        
        # 4. Capacity violations
        for event_id, assign in solution.items():
            event = self.events[event_id]
            room = self.rooms[assign['r']]
            if room['capacity'] < event['min_capacity']:
                hard_violations['capacity_viol'] += 1
        
        # 5. Room type mismatch
        for event_id, assign in solution.items():
            event = self.events[event_id]
            room = self.rooms[assign['r']]
            if (event['preferred_room_type'] != 'Any' and 
                room['type'] != event['preferred_room_type']):
                hard_violations['type_mismatch'] += 1
        
        # Soft constraints
        soft_violations = {'gaps': 0, 'variance': 0}
        
        # Calculate gaps (courses with long gaps between them)
        event_by_day = defaultdict(list)
        for event_id, assign in solution.items():
            day = self.timeslots[assign['t']]['day']
            event_by_day[day].append(assign['t'])
        
        gaps = 0
        for day, timeslots_in_day in event_by_day.items():
            if len(timeslots_in_day) > 1:
                sorted_ts = sorted(set(timeslots_in_day))
                for i in range(len(sorted_ts) - 1):
                    gaps += sorted_ts[i + 1] - sorted_ts[i] - 1
        soft_violations['gaps'] = gaps
        
        # Variance of courses per day
        day_counts = defaultdict(int)
        for event_id in self.events.keys():
            day = self.timeslots[solution[event_id]['t']]['day']
            day_counts[day] += 1
        
        if day_counts:
            counts = list(day_counts.values())
            avg = sum(counts) / len(counts)
            variance = sum((c - avg) ** 2 for c in counts) / len(counts)
            soft_violations['variance'] = variance
        
        # Total fitness
        hard_penalty = WH * sum(hard_violations.values())
        soft_penalty = WS * (soft_violations['gaps'] + soft_violations['variance'])
        total_fitness = hard_penalty + soft_penalty
        
        if debug:
            hard_satisfied = sum(hard_violations.values()) == 0
            print(f"Breakdown: Hard={'✓ 0' if hard_satisfied else f'✗ {sum(hard_violations.values())}'} {hard_violations}, Soft={soft_violations['gaps']:.0f} gaps + {soft_violations['variance']:.1f} var = {total_fitness:.1f}")
        
        return total_fitness
    
    def get_free_slots(self, solution, event_id, dimension):
        """Get free timeslots or rooms for an event (repair helper)"""
        event = self.events[event_id]
        free = []
        
        if dimension == 't':
            # Find timeslots where group has no conflict
            for ts_id in self.timeslots.keys():
                conflict = False
                for eid, assign in solution.items():
                    if eid != event_id:
                        if (self.events[eid]['group'] == event['group'] and 
                            assign['t'] == ts_id):
                            conflict = True
                            break
                if not conflict:
                    free.append(ts_id)
        elif dimension == 'r':
            # Find rooms suitable for event
            for room_id in self.rooms.keys():
                room = self.rooms[room_id]
                if (room['capacity'] >= event['min_capacity'] and 
                    (event['preferred_room_type'] == 'Any' or 
                     room['type'] == event['preferred_room_type'])):
                    free.append(room_id)
        
        return free
    
    def repair_hard(self, solution, group_only=False):
        """Repair hard constraint violations"""
        fixed = 0
        
        # Fix group conflicts
        group_t_count = defaultdict(list)
        for event_id, assign in solution.items():
            event = self.events[event_id]
            key = (event['group'], assign['t'])
            group_t_count[key].append(event_id)
        
        conflicts = []
        for key, event_ids in group_t_count.items():
            if len(event_ids) > 1:
                conflicts.extend(event_ids[1:])
        
        for event_id in set(conflicts):
            free_ts = self.get_free_slots(solution, event_id, 't')
            if free_ts:
                solution[event_id]['t'] = random.choice(free_ts)
                fixed += 1
        
        return solution, fixed > 0
    
    def generate_neighbor(self, solution):
        """Generate neighbor solution with controlled perturbations"""
        new_sol = copy.deepcopy(solution)
        
        rand = random.random()
        
        if rand < 0.5:
            # Swap move (timeslots or rooms)
            if len(new_sol) >= 2:
                eid1, eid2 = random.sample(list(new_sol.keys()), 2)
                
                if random.random() < 0.5:
                    # Swap timeslots
                    new_sol[eid1]['t'], new_sol[eid2]['t'] = new_sol[eid2]['t'], new_sol[eid1]['t']
                else:
                    # Swap rooms (if compatible)
                    event1, event2 = self.events[eid1], self.events[eid2]
                    r1, r2 = new_sol[eid1]['r'], new_sol[eid2]['r']
                    
                    if (self.rooms[r2]['capacity'] >= event1['min_capacity'] and 
                        (event1['preferred_room_type'] == 'Any' or 
                         self.rooms[r2]['type'] == event1['preferred_room_type']) and
                        self.rooms[r1]['capacity'] >= event2['min_capacity'] and 
                        (event2['preferred_room_type'] == 'Any' or 
                         self.rooms[r1]['type'] == event2['preferred_room_type'])):
                        new_sol[eid1]['r'], new_sol[eid2]['r'] = r2, r1
        
        elif rand < 0.75:
            # Single move (reassign timeslot)
            eid = random.choice(list(new_sol.keys()))
            new_sol[eid]['t'] = random.choice(list(self.timeslots.keys()))
        
        else:
            # Multi-move (reassign multiple timeslots)
            eids = random.sample(list(new_sol.keys()), min(3, len(new_sol)))
            for eid in eids:
                new_sol[eid]['t'] = random.choice(list(self.timeslots.keys()))
        
        # Repair group conflicts
        old_hard = self.fitness(new_sol) - WS * 30
        new_hard = self.fitness(new_sol) - WS * 30
        if new_hard > old_hard + 2:
            new_sol, _ = self.repair_hard(new_sol, group_only=True)
        
        return new_sol
    
    def local_search(self, solution, max_steps=100):
        """Local search to improve soft constraints"""
        current = copy.deepcopy(solution)
        current_f = self.fitness(current)
        
        if current_f > WH:
            return current, current_f
        
        improved = True
        steps = 0
        
        while improved and steps < max_steps:
            improved = False
            best_neighbor_f = current_f
            best_neighbor = None
            
            for _ in range(15):
                neighbor = self.generate_neighbor(current)
                neighbor_f = self.fitness(neighbor)
                
                # Only accept if hard constraints satisfied and soft improves
                if neighbor_f < best_neighbor_f and (self.fitness(neighbor) - WS * 30 == 0):
                    best_neighbor = neighbor
                    best_neighbor_f = neighbor_f
            
            if best_neighbor_f < current_f:
                current = copy.deepcopy(best_neighbor)
                current_f = best_neighbor_f
                improved = True
                steps += 1
        
        return current, current_f
    
    def simulated_annealing(self):
        """Main hybrid SA + ILS algorithm"""
        ILS_ITER = 3
        current_sol = self.initial_solution()
        current_f = self.fitness(current_sol)
        best_sol = copy.deepcopy(current_sol)
        best_f = current_f
        
        print(f"[SA] Starting with f={current_f:.1f}")
        
        T = T_INIT
        iteration = 0
        
        # Simulated Annealing phase
        while iteration < MAX_ITER and T >= 0.1:
            neighbor = self.generate_neighbor(current_sol)
            neighbor_f = self.fitness(neighbor)
            delta_f = neighbor_f - current_f
            
            # Metropolis acceptance criterion
            if delta_f < 0 or random.random() < math.exp(-delta_f / T):
                current_sol = copy.deepcopy(neighbor)
                current_f = neighbor_f
                
                if current_f < best_f:
                    best_sol = copy.deepcopy(neighbor)
                    best_f = current_f
            
            # Apply local search if hard constraints satisfied
            current_hard = self.fitness(current_sol) - WS * 30
            if current_hard == 0:
                current_sol, current_f = self.local_search(current_sol, max_steps=30)
            
            T *= ALPHA
            iteration += 1
            
            if iteration % 3000 == 0:
                print(f"[SA] Iter {iteration}: f={current_f:.1f}, Best={best_f:.1f}, T={T:.2f}")
        
        # ILS Post-SA phase
        print("[ILS] Post-SA improvement phase...")
        for ils in range(ILS_ITER):
            perturb_sol = self.generate_neighbor(best_sol)
            perturb_f = self.fitness(perturb_sol)
            if perturb_f < best_f:
                best_sol = copy.deepcopy(perturb_sol)
                best_f = perturb_f
            best_sol, best_f = self.local_search(best_sol, max_steps=50)
        
        print(f"[Final] SA+ILS optimization complete: f={best_f:.1f}")
        self.fitness(best_sol, debug=True)
        
        return best_sol, best_f
    
    def save_solution_to_db(self, solution):
        """Save optimized solution to database"""
        try:
            # Clear existing schedule (use actual table name and snake_case columns)
            self.cursor.execute("DELETE FROM schedule")
            self.connection.commit()
            
            # Insert new schedule
            for event_id, assign in solution.items():
                self.cursor.execute("""
                    INSERT INTO schedule (course_id, room_id, timeslot_id)
                    VALUES (%s, %s, %s)
                """, (event_id, assign['r'], assign['t']))
            
            self.connection.commit()
            return len(solution)
        
        except Error as e:
            raise Exception(f"Failed to save solution: {str(e)}")
    
    def optimize_schedule(self):
        """Main optimization entry point"""
        try:
            self.connect_db()
            self.load_instance()
            
            if not self.events or not self.timeslots or not self.rooms:
                return {
                    "success": False,
                    "message": "Insufficient data to optimize schedule"
                }
            
            # Run hybrid SA+ILS algorithm
            solution, fitness_value = self.simulated_annealing()
            
            # Save to database
            scheduled_count = self.save_solution_to_db(solution)
            
            self.close_db()
            
            return {
                "success": True,
                "message": f"Optimization complete with fitness={fitness_value:.1f}",
                "scheduleCount": scheduled_count,
                "fitness": fitness_value
            }
        
        except Exception as e:
            self.close_db()
            return {
                "success": False,
                "message": f"Optimization failed: {str(e)}"
            }
