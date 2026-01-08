import mysql.connector
from mysql.connector import Error
import random
import math
import copy
from collections import defaultdict
import sys
import io

# Force UTF-8 encoding for stdout/stderr
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Enhanced Algorithm parameters (from improved notebook)
MAX_ITER = 30000  # Increased for better solutions
T_INIT = 5000.0  # Higher initial temperature
ALPHA = 0.995 # Slower cooling
W_H = 1000.0  # Hard constraint weight
W_S = 1.0  # Soft constraint weight
T_MIN = 1.0  # Minimum temperature
MAX_NO_IMPROVE = 300  # Restart after this many iterations without improvement

class OptimizationService:
    """
    Enhanced Simulated Annealing + Local Search optimizer.
    Based on the improved timetabling algorithm from research.
    Handles hard and soft constraints with better exploration.
    """
    
    def __init__(self, db_config):
        self.db_config = db_config
        self.connection = None
        self.cursor = None
        self.events = {}  # event_id -> event data
        self.timeslots = {}  # timeslot_id -> timeslot data
        self.rooms = {}  # room_id -> room data
        self.groups = {}  # group_id -> group data
        self.teachers = {}  # teacher_id -> teacher name
        self.group_sizes = {}  # group_name -> size
    
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
            # Load groups first
            self.cursor.execute("SELECT id, name, size FROM groups")
            for group in self.cursor.fetchall():
                self.groups[group['id']] = {
                    'name': group['name'],
                    'id': group['id'],
                    'size': group.get('size', 48)
                }
                self.group_sizes[group['name']] = group.get('size', 48)
            
            # Load teachers
            self.cursor.execute("SELECT id, name FROM teachers")
            for teacher in self.cursor.fetchall():
                self.teachers[teacher['id']] = teacher['name']
            
            # Load courses as events
            self.cursor.execute("""
                SELECT id, name, teacher_id, group_id, duration_slots, min_capacity,
                       preferred_room_type FROM courses
            """)
            courses = self.cursor.fetchall()
            for course in courses:
                group_name = self.groups.get(course['group_id'], {}).get('name', '')
                self.events[course['id']] = {
                    'id': course['id'],
                    'name': course['name'],
                    'teacher': self.teachers.get(course.get('teacher_id')),
                    'teacher_id': course.get('teacher_id'),
                    'group': group_name,
                    'group_id': course.get('group_id'),
                    'duration_slots': course.get('duration_slots', 1),
                    'min_capacity': course.get('min_capacity', 0),
                    'preferred_room_type': course.get('preferred_room_type') or 'Any'
                }
            
            # Load timeslots - group by day/slot
            self.cursor.execute("SELECT id, day, start_time, end_time FROM timeslots ORDER BY day, start_time")
            timeslots_list = self.cursor.fetchall()
            
            # Group timeslots by unique (day, start_time) 
            unique_slots = {}
            for ts in timeslots_list:
                key = (ts['day'], str(ts.get('start_time')))
                if key not in unique_slots:
                    unique_slots[key] = ts['id']
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
                    'type': room.get('type', 'Small')
                }
            
            # Calculate max capacities by type
            self.max_amphi = max([r['capacity'] for r in self.rooms.values() if r['type'] == 'Amphi'], default=400)
            self.max_large = max([r['capacity'] for r in self.rooms.values() if r['type'] == 'Large'], default=90)
            self.max_small = max([r['capacity'] for r in self.rooms.values() if r['type'] == 'Small'], default=48)
            
            print(f"[Loaded] {len(self.events)} events, {len(self.rooms)} rooms, {len(self.groups)} groups, {len(self.timeslots)} timeslots")
        
        except Error as e:
            raise Exception(f"Failed to load instance: {str(e)}")
    
    def generate_initial_solution(self):
        """Generate initial solution with feasible room assignments"""
        solution = {}
        days = list(set([ts['day'] for ts in self.timeslots.values()]))
        
        for event_id, event in self.events.items():
            # Random day and slot
            day = random.choice(days)
            # Get timeslots for this day
            day_slots = [ts_id for ts_id, ts in self.timeslots.items() if ts['day'] == day]
            if not day_slots:
                day_slots = list(self.timeslots.keys())
            
            timeslot_id = random.choice(day_slots)
            
            # Find feasible rooms
            group_size = self.group_sizes.get(event['group'], 48)
            preferred_type = event.get('preferred_room_type', 'Any')
            
            feasible_rooms = [
                r_id for r_id, r in self.rooms.items()
                if r['capacity'] >= group_size and
                (preferred_type == 'Any' or r['type'] == preferred_type)
            ]
            
            # Fallback: if no feasible room, pick largest of preferred type
            if not feasible_rooms:
                feasible_rooms = [
                    r_id for r_id, r in self.rooms.items()
                    if (preferred_type == 'Any' or r['type'] == preferred_type)
                ]
                feasible_rooms.sort(key=lambda rid: self.rooms[rid]['capacity'], reverse=True)
                feasible_rooms = feasible_rooms[:3] if feasible_rooms else list(self.rooms.keys())
            
            room_id = random.choice(feasible_rooms) if feasible_rooms else random.choice(list(self.rooms.keys()))
            
            solution[event_id] = {
                't': timeslot_id,
                'r': room_id
            }
        
        return solution
    
    def evaluate_fitness(self, solution):
        """
        Enhanced fitness function with improved penalties.
        Lower is better.
        """
        hard_penalty = 0
        soft_penalty = 0
        
        # Penalty for unassigned events
        unassigned = len(self.events) - len(solution)
        hard_penalty += unassigned * 1000
        
        # Hard: Overlaps (room, teacher, group)
        slot_occupancy = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))
        for event_id, assign in solution.items():
            event = self.events[event_id]
            slot = (assign['t'],)
            room = assign['r']
            teacher = event.get('teacher') or 'none'
            group = event.get('group', '')
            
            for cat, key in [('room', room), ('teacher', teacher), ('group', group)]:
                if slot_occupancy[slot][cat][key] > 0:
                    hard_penalty += 1
                slot_occupancy[slot][cat][key] += 1
        
        # Hard: Capacity + Overcapacity flag
        for event_id, assign in solution.items():
            event = self.events[event_id]
            group_size = self.group_sizes.get(event['group'], 48)
            room = self.rooms[assign['r']]
            room_cap = room['capacity']
            room_type = room['type']
            
            max_type = self.max_amphi if room_type == 'Amphi' else (self.max_large if room_type == 'Large' else self.max_small)
            
            if room_cap < group_size:
                diff = group_size - room_cap
                hard_penalty += diff * 20  # Increased penalty
            
            if group_size > max_type:
                hard_penalty += 500  # Impossible overcapacity
        
        # Hard: Room type mismatch
        for event_id, assign in solution.items():
            event = self.events[event_id]
            room = self.rooms[assign['r']]
            preferred = event.get('preferred_room_type', 'Any')
            if room['type'] != preferred and preferred != 'Any':
                hard_penalty += 1
        
        # Soft: Gaps + Contiguity (reinforced weight *0.6)
        group_slots = defaultdict(list)
        for event_id, assign in solution.items():
            event = self.events[event_id]
            group = event.get('group', '')
            if group:
                group_slots[group].append(assign['t'])
        
        for group, slots in group_slots.items():
            # Convert to sorted global slots
            sorted_slots = sorted(set(slots))
            if len(sorted_slots) > 1:
                # Count gaps
                contig_viol = sum(1 for i in range(len(sorted_slots)-1) if sorted_slots[i+1] - sorted_slots[i] > 1)
                soft_penalty += contig_viol * 0.6
            
            # Penalize too many empty slots for this group
            total_possible = len(self.timeslots)
            gaps = total_possible - len(slots)
            soft_penalty += gaps * 0.6
        
        # Soft: Balance load across days (*3)
        day_load = defaultdict(int)
        for event_id, assign in solution.items():
            day = self.timeslots[assign['t']]['day']
            day_load[day] += 1
        
        if day_load:
            max_load = max(day_load.values())
            min_load = min(day_load.values())
            imbalance = (max_load - min_load) * 3
            soft_penalty += imbalance
        
        total_fitness = W_H * hard_penalty + W_S * soft_penalty
        return total_fitness
    
    def generate_enhanced_neighbor(self, solution, exploration_prob=0.7):
        """Generate neighbor with controlled exploration"""
        new_sol = copy.deepcopy(solution)
        
        if random.random() < exploration_prob:
            # Single event reassignment
            event_id = random.choice(list(new_sol.keys()))
            event = self.events[event_id]
            
            # Random timeslot
            new_sol[event_id]['t'] = random.choice(list(self.timeslots.keys()))
            
            # Feasible room
            group_size = self.group_sizes.get(event['group'], 48)
            preferred_type = event.get('preferred_room_type', 'Any')
            
            feasible_rooms = [
                r_id for r_id, r in self.rooms.items()
                if r['capacity'] >= group_size and
                (preferred_type == 'Any' or r['type'] == preferred_type)
            ]
            
            if not feasible_rooms:
                feasible_rooms = [r_id for r_id, r in self.rooms.items() if (preferred_type == 'Any' or r['type'] == preferred_type)]
                feasible_rooms.sort(key=lambda rid: self.rooms[rid]['capacity'], reverse=True)
                feasible_rooms = feasible_rooms[:3] if feasible_rooms else list(self.rooms.keys())
            
            new_sol[event_id]['r'] = random.choice(feasible_rooms) if feasible_rooms else new_sol[event_id]['r']
        else:
            # Swap timeslots between two events
            if len(new_sol) >= 2:
                event_ids = random.sample(list(new_sol.keys()), 2)
                eid1, eid2 = event_ids[0], event_ids[1]
                
                # Swap timeslots
                new_sol[eid1]['t'], new_sol[eid2]['t'] = new_sol[eid2]['t'], new_sol[eid1]['t']
                
                # Swap rooms if compatible
                event1 = self.events[eid1]
                event2 = self.events[eid2]
                group_size1 = self.group_sizes.get(event1['group'], 48)
                group_size2 = self.group_sizes.get(event2['group'], 48)
                preferred_type1 = event1.get('preferred_room_type', 'Any')
                preferred_type2 = event2.get('preferred_room_type', 'Any')
                
                room1 = self.rooms[new_sol[eid2]['r']]
                room2 = self.rooms[new_sol[eid1]['r']]
                
                # Check compatibility
                if (room1['capacity'] >= group_size1 and (preferred_type1 == 'Any' or room1['type'] == preferred_type1) and
                    room2['capacity'] >= group_size2 and (preferred_type2 == 'Any' or room2['type'] == preferred_type2)):
                    new_sol[eid1]['r'], new_sol[eid2]['r'] = new_sol[eid2]['r'], new_sol[eid1]['r']
        
        return new_sol
    
    def local_search_improvement(self, solution, max_local=150):
        """Local search to improve solution"""
        current = copy.deepcopy(solution)
        
        for _ in range(max_local):
            best_neighbor = None
            best_delta = 0
            
            for _ in range(5):
                neigh = self.generate_enhanced_neighbor(current, exploration_prob=0.1)
                delta = self.evaluate_fitness(neigh) - self.evaluate_fitness(current)
                if delta < best_delta:
                    best_delta = delta
                    best_neighbor = neigh
            
            if best_delta >= 0:
                break
            
            current = best_neighbor
        
        return current
    
    def simulated_annealing_enhanced(self):
        """Enhanced Simulated Annealing algorithm"""
        current_sol = self.generate_initial_solution()
        current_fitness = self.evaluate_fitness(current_sol)
        
        best_sol = copy.deepcopy(current_sol)
        best_fitness = current_fitness
        
        T = T_INIT
        no_improve = 0
        
        print(f"[SA] Starting optimization: initial fitness={current_fitness:.1f}")
        
        for iteration in range(MAX_ITER):
            # Generate multiple neighbors and pick best
            neighbors = [self.generate_enhanced_neighbor(current_sol, exploration_prob=0.6 + 0.3 * (T / T_INIT)) for _ in range(3)]
            best_neighbor = min(neighbors, key=lambda n: self.evaluate_fitness(n))
            neighbor_fitness = self.evaluate_fitness(best_neighbor)
            
            delta = neighbor_fitness - current_fitness
            
            # Metropolis criterion
            if delta < 0 or random.random() < math.exp(-delta / T):
                current_sol = best_neighbor
                current_fitness = neighbor_fitness
            
            # Apply local search periodically
            if iteration % 25 == 0:
                current_sol = self.local_search_improvement(current_sol)
                current_fitness = self.evaluate_fitness(current_sol)
            
            # Update best
            if current_fitness < best_fitness:
                best_sol = copy.deepcopy(current_sol)
                best_fitness = current_fitness
                no_improve = 0
            else:
                no_improve += 1
            
            # Restart if stuck
            if no_improve > MAX_NO_IMPROVE:
                current_sol = self.generate_initial_solution()
                current_fitness = self.evaluate_fitness(current_sol)
                no_improve = 0
                print(f"[SA] Restarting at iteration {iteration}")
            
            # Cool down
            T *= ALPHA
            if T < T_MIN:
                break
            
            # Progress report
            if iteration % 5000 == 0:
                print(f"[SA] Iter {iteration}: current={current_fitness:.1f}, best={best_fitness:.1f}, T={T:.2f}")
        
        print(f"[SA] Optimization complete: Best fitness={best_fitness:.1f}")
        return best_sol, best_fitness
    
    def save_solution_to_db(self, solution):
        """Save optimized solution to database"""
        try:
            # Clear existing schedule
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
            
            # Run enhanced SA algorithm
            solution, fitness_value = self.simulated_annealing_enhanced()
            
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
