"""
Enhanced Timetable Optimizer - FSTM
Based on Hybrid Metaheuristic Research Paper
Preserves API/Database Integration
"""

import mysql.connector
from mysql.connector import Error
import random
import math
import copy
import time
from collections import defaultdict, deque
from typing import Dict, List, Tuple, Set, Optional
import sys
import io

# Force UTF-8 encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')


class Config:
    """Enhanced configuration with balanced penalties"""
    # Penalty weights - Balanced approach from research
    WEIGHT_ROOM_CONFLICT = 1000.0      # Critical
    WEIGHT_TEACHER_CONFLICT = 1000.0   # Critical
    WEIGHT_GROUP_CONFLICT = 1000.0     # Critical
    WEIGHT_CAPACITY = 500.0            # Very important
    WEIGHT_TYPE_MISMATCH = 50.0        # Important but flexible
    WEIGHT_BOUNDARY = 2000.0           # Critical
    WEIGHT_GAPS = 1.0                  # Soft constraint
    
    # Multi-stage optimization
    STAGE_1_ITERATIONS = 10000  # Simulated Annealing
    STAGE_2_ITERATIONS = 5000   # Tabu Search
    STAGE_3_ITERATIONS = 3000   # Intensification
    
    # SA Parameters
    INITIAL_TEMPERATURE = 5000.0
    COOLING_RATE = 0.9997
    MIN_TEMPERATURE = 1.0
    
    # Tabu Search Parameters
    TABU_TENURE = 20
    
    # Schedule structure
    DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    SLOTS_PER_DAY = 4  # Based on your timeslot structure


class TimeSlot:
    """Time slot representation"""
    def __init__(self, day: str, slot: int):
        self.day = day
        self.slot = slot
    
    def __hash__(self):
        return hash((self.day, self.slot))
    
    def __eq__(self, other):
        return self.day == other.day and self.slot == other.slot
    
    def __repr__(self):
        return f"{self.day[:3]}-S{self.slot}"
    
    def to_global_index(self) -> int:
        return Config.DAYS.index(self.day) * Config.SLOTS_PER_DAY + self.slot
    
    @staticmethod
    def from_global_index(idx: int) -> Optional['TimeSlot']:
        if idx < 0 or idx >= len(Config.DAYS) * Config.SLOTS_PER_DAY:
            return None
        day_idx = idx // Config.SLOTS_PER_DAY
        slot_idx = idx % Config.SLOTS_PER_DAY
        return TimeSlot(Config.DAYS[day_idx], slot_idx)


class Assignment:
    """Event assignment to time and room"""
    def __init__(self, event_id: int, timeslot_id: int, room_id: int,
                 duration: int, teacher_id: Optional[int] = None):
        self.event_id = event_id
        self.timeslot_id = timeslot_id  # Store actual DB timeslot_id
        self.room_id = room_id
        self.duration = duration
        self.teacher_id = teacher_id
    
    def copy(self) -> 'Assignment':
        return Assignment(
            self.event_id,
            self.timeslot_id,
            self.room_id,
            self.duration,
            self.teacher_id
        )


class Timetable:
    """Complete timetable solution"""
    def __init__(self, events: List[dict]):
        self.events = events
        self.assignments: List[Assignment] = []
    
    def copy(self) -> 'Timetable':
        new_tt = Timetable(self.events)
        new_tt.assignments = [a.copy() for a in self.assignments]
        return new_tt


class EnhancedConstraintEvaluator:
    """Evaluates constraints with balanced penalties"""
    
    def __init__(self, events: List[dict], rooms: List[dict],
                 groups: List[dict], teachers: List[dict], 
                 timeslots: List[dict], timeslot_map: dict):
        self.events = {e['id']: e for e in events}
        self.rooms = {r['id']: r for r in rooms}
        self.groups = {g['id']: g for g in groups}
        self.teachers = {t['id']: t for t in teachers}
        self.timeslots = {ts['id']: ts for ts in timeslots}
        self.timeslot_map = timeslot_map  # Maps (day, slot_index) -> timeslot_id
        
        # Precompute event details
        self.event_details = {}
        for event in events:
            group = self.groups[event['group_id']]
            self.event_details[event['id']] = {
                'name': event['name'],
                'group_id': event['group_id'],
                'group_name': group['name'],
                'group_size': group['size'],
                'teacher_id': event.get('teacher_id'),
                'duration': event['duration_slots'],
                'min_capacity': event['min_capacity'],
                'preferred_type': event.get('preferred_room_type', 'Any')
            }
    
    def evaluate(self, timetable: Timetable) -> Tuple[float, Dict]:
        """Evaluate timetable with detailed violation tracking"""
        penalty = 0.0
        violations = {
            'room_conflicts': [],
            'teacher_conflicts': [],
            'group_conflicts': [],
            'capacity_violations': [],
            'type_mismatches': [],
            'boundary_violations': 0,
            'schedule_gaps': 0
        }
        
        # Track occupancy
        room_usage = defaultdict(set)      # timeslot_id -> set of room_ids
        teacher_usage = defaultdict(set)   # timeslot_id -> set of teacher_ids
        group_usage = defaultdict(set)     # timeslot_id -> set of group_ids
        
        for assignment in timetable.assignments:
            event_info = self.event_details[assignment.event_id]
            room = self.rooms[assignment.room_id]
            
            # Get timeslot info
            if assignment.timeslot_id not in self.timeslots:
                violations['boundary_violations'] += 1
                penalty += Config.WEIGHT_BOUNDARY
                continue
            
            timeslot = self.timeslots[assignment.timeslot_id]
            
            # H1: Room conflicts
            if assignment.room_id in room_usage[assignment.timeslot_id]:
                penalty += Config.WEIGHT_ROOM_CONFLICT
                violations['room_conflicts'].append({
                    'room': room['name'],
                    'time': f"{timeslot['day']} {timeslot['start']}",
                    'event': event_info['name']
                })
            room_usage[assignment.timeslot_id].add(assignment.room_id)
            
            # H2: Teacher conflicts
            if assignment.teacher_id is not None:
                if assignment.teacher_id in teacher_usage[assignment.timeslot_id]:
                    penalty += Config.WEIGHT_TEACHER_CONFLICT
                    teacher_name = self.teachers[assignment.teacher_id]['name']
                    violations['teacher_conflicts'].append({
                        'teacher': teacher_name,
                        'time': f"{timeslot['day']} {timeslot['start']}"
                    })
                teacher_usage[assignment.timeslot_id].add(assignment.teacher_id)
            
            # H3: Group conflicts
            group_id = event_info['group_id']
            if group_id in group_usage[assignment.timeslot_id]:
                penalty += Config.WEIGHT_GROUP_CONFLICT
                violations['group_conflicts'].append({
                    'group': event_info['group_name'],
                    'time': f"{timeslot['day']} {timeslot['start']}"
                })
            group_usage[assignment.timeslot_id].add(group_id)
            
            # H4: Capacity violations
            required = event_info['group_size']
            if room['capacity'] < required:
                shortage = required - room['capacity']
                penalty += shortage * Config.WEIGHT_CAPACITY / 10
                violations['capacity_violations'].append({
                    'event': event_info['name'],
                    'needed': required,
                    'available': room['capacity'],
                    'shortage': shortage
                })
            
            # S1: Type matching (soft)
            preferred_type = event_info['preferred_type']
            if preferred_type != 'Any' and room['type'] != preferred_type:
                penalty += Config.WEIGHT_TYPE_MISMATCH
                violations['type_mismatches'].append({
                    'event': event_info['name'],
                    'preferred': preferred_type,
                    'assigned': room['type']
                })
        
        # S2: Schedule gaps
        gap_penalty = self._calculate_gaps(timetable, violations)
        penalty += gap_penalty * Config.WEIGHT_GAPS
        
        return penalty, violations
    
    def _calculate_gaps(self, timetable: Timetable, violations: Dict) -> float:
        """Calculate schedule gaps for each group"""
        group_slots = defaultdict(list)
        
        for assignment in timetable.assignments:
            event_info = self.event_details[assignment.event_id]
            group_id = event_info['group_id']
            
            if assignment.timeslot_id in self.timeslots:
                timeslot = self.timeslots[assignment.timeslot_id]
                day_idx = Config.DAYS.index(timeslot['day'])
                # Estimate slot index from start time
                slot_idx = self._estimate_slot_index(timeslot['start'])
                global_idx = day_idx * Config.SLOTS_PER_DAY + slot_idx
                group_slots[group_id].append(global_idx)
        
        total_gaps = 0
        for slots in group_slots.values():
            if len(slots) > 1:
                sorted_slots = sorted(set(slots))
                # Count single-slot gaps
                for i in range(len(sorted_slots) - 1):
                    gap = sorted_slots[i+1] - sorted_slots[i] - 1
                    if gap == 1:  # Single slot gap
                        total_gaps += 1
        
        violations['schedule_gaps'] = total_gaps
        return total_gaps
    
    def _estimate_slot_index(self, start_time: str) -> int:
        """Estimate slot index from start time"""
        # Map time ranges to slots (based on PDF: 08:30-10:25, 10:30-12:25, 14:30-16:25, 16:35-18:30)
        hour = int(str(start_time).split(':')[0])
        if hour < 10:
            return 0
        elif hour < 13:
            return 1
        elif hour < 17:
            return 2
        else:
            return 3


class IntelligentConstructor:
    """Builds initial solution with smart room selection"""
    
    def __init__(self, events: List[dict], rooms: List[dict],
                 groups: List[dict], timeslots: List[dict], 
                 timeslot_map: dict):
        self.events = events
        self.rooms = rooms
        self.groups = {g['id']: g for g in groups}
        self.timeslots = timeslots
        self.timeslot_map = timeslot_map
        
        # Build room compatibility matrix
        self._build_room_compatibility()
    
    def _build_room_compatibility(self):
        """Pre-compute compatible rooms for each event"""
        self.compatible_rooms = {}
        
        for event in self.events:
            group = self.groups[event['group_id']]
            required_capacity = group['size']
            preferred_type = event.get('preferred_room_type', 'Any')
            
            # Score each room
            room_scores = []
            for room in self.rooms:
                score = 0
                
                # Capacity match
                if room['capacity'] >= required_capacity:
                    score += 1000
                    # Prefer rooms that are not too large
                    waste = room['capacity'] - required_capacity
                    score -= waste * 0.5
                else:
                    score -= 10000  # Heavy penalty
                
                # Type match
                if preferred_type == 'Any' or room['type'] == preferred_type:
                    score += 500
                
                room_scores.append((score, room))
            
            # Sort by score
            room_scores.sort(reverse=True, key=lambda x: x[0])
            self.compatible_rooms[event['id']] = [
                r for _, r in room_scores if _ > -5000
            ]
    
    def construct(self) -> Timetable:
        """Build initial solution"""
        timetable = Timetable(self.events)
        
        # Sort events by difficulty (larger groups, longer duration first)
        sorted_events = sorted(
            self.events,
            key=lambda e: (
                -self.groups[e['group_id']]['size'],
                -e['duration_slots']
            )
        )
        
        # Track usage
        room_usage = defaultdict(set)
        teacher_usage = defaultdict(set)
        group_usage = defaultdict(set)
        
        # Assign each event
        for event in sorted_events:
            assigned = self._find_feasible_slot(
                event, timetable, room_usage, teacher_usage, group_usage
            )
            
            if not assigned:
                # Force assign to random slot
                self._force_assign(
                    event, timetable, room_usage, teacher_usage, group_usage
                )
        
        return timetable
    
    def _find_feasible_slot(self, event: dict, timetable: Timetable,
                           room_usage: dict, teacher_usage: dict,
                           group_usage: dict) -> bool:
        """Try to find a feasible slot for event"""
        compatible_rooms = self.compatible_rooms.get(event['id'], [])[:10]
        
        # Shuffle timeslots for randomization
        shuffled_timeslots = self.timeslots.copy()
        random.shuffle(shuffled_timeslots)
        
        for timeslot in shuffled_timeslots:
            for room in compatible_rooms:
                if self._is_slot_feasible(
                    event, timeslot['id'], room,
                    room_usage, teacher_usage, group_usage
                ):
                    # Assign it
                    assignment = Assignment(
                        event['id'],
                        timeslot['id'],
                        room['id'],
                        event['duration_slots'],
                        event.get('teacher_id')
                    )
                    timetable.assignments.append(assignment)
                    
                    # Update usage
                    room_usage[timeslot['id']].add(room['id'])
                    if assignment.teacher_id is not None:
                        teacher_usage[timeslot['id']].add(assignment.teacher_id)
                    group_usage[timeslot['id']].add(event['group_id'])
                    
                    return True
        
        return False
    
    def _is_slot_feasible(self, event: dict, timeslot_id: int, room: dict,
                         room_usage: dict, teacher_usage: dict,
                         group_usage: dict) -> bool:
        """Check if assignment is feasible"""
        # Check conflicts
        if room['id'] in room_usage[timeslot_id]:
            return False
        
        if event.get('teacher_id') is not None:
            if event['teacher_id'] in teacher_usage[timeslot_id]:
                return False
        
        if event['group_id'] in group_usage[timeslot_id]:
            return False
        
        return True
    
    def _force_assign(self, event: dict, timetable: Timetable,
                     room_usage: dict, teacher_usage: dict, 
                     group_usage: dict):
        """Force assignment when no feasible slot found"""
        compatible_rooms = self.compatible_rooms.get(
            event['id'], self.rooms
        )
        
        if not compatible_rooms:
            compatible_rooms = self.rooms
        
        # Random timeslot and room
        timeslot = random.choice(self.timeslots)
        room = compatible_rooms[0]
        
        assignment = Assignment(
            event['id'],
            timeslot['id'],
            room['id'],
            event['duration_slots'],
            event.get('teacher_id')
        )
        timetable.assignments.append(assignment)


class SmartNeighborhoodSearch:
    """Intelligent neighborhood operators with Tabu Search"""
    
    def __init__(self, events: List[dict], rooms: List[dict],
                 groups: List[dict], timeslots: List[dict],
                 constructor: IntelligentConstructor):
        self.events = {e['id']: e for e in events}
        self.rooms = {r['id']: r for r in rooms}
        self.groups = {g['id']: g for g in groups}
        self.timeslots = timeslots
        self.constructor = constructor
        self.tabu_list = deque(maxlen=Config.TABU_TENURE)
    
    def generate_neighbor(self, timetable: Timetable,
                         violations: Dict) -> Timetable:
        """Generate intelligent neighbor"""
        new_tt = timetable.copy()
        
        if len(new_tt.assignments) == 0:
            return new_tt
        
        # Choose operator based on violations
        if self._has_critical_violations(violations):
            self._repair_critical(new_tt, violations)
        else:
            # Use diverse operators
            operators = [
                (self._move_timeslot, 0.30),
                (self._swap_rooms, 0.25),
                (self._swap_times, 0.20),
                (self._relocate_event, 0.25)
            ]
            
            operator = random.choices(
                [op for op, _ in operators],
                weights=[w for _, w in operators]
            )[0]
            
            operator(new_tt, violations)
        
        return new_tt
    
    def _has_critical_violations(self, violations: Dict) -> bool:
        """Check for critical violations"""
        return (
            len(violations['room_conflicts']) > 0 or
            len(violations['teacher_conflicts']) > 0 or
            len(violations['group_conflicts']) > 0 or
            violations['boundary_violations'] > 0
        )
    
    def _repair_critical(self, timetable: Timetable, violations: Dict):
        """Repair critical violations"""
        if len(timetable.assignments) == 0:
            return
        
        # Move a random assignment
        idx = random.randint(0, len(timetable.assignments) - 1)
        self._move_timeslot(timetable, violations, idx)
    
    def _move_timeslot(self, timetable: Timetable, violations: Dict, 
                      idx: int = None):
        """Move event to different timeslot"""
        if idx is None:
            idx = random.randint(0, len(timetable.assignments) - 1)
        
        assignment = timetable.assignments[idx]
        
        # Try non-tabu move
        for _ in range(10):
            new_timeslot = random.choice(self.timeslots)
            move = (assignment.event_id, new_timeslot['id'])
            
            if move not in self.tabu_list:
                assignment.timeslot_id = new_timeslot['id']
                self.tabu_list.append(move)
                return
        
        # Force move if all tabu
        assignment.timeslot_id = random.choice(self.timeslots)['id']
    
    def _swap_rooms(self, timetable: Timetable, violations: Dict):
        """Swap rooms of two assignments"""
        if len(timetable.assignments) < 2:
            return
        
        idx1, idx2 = random.sample(range(len(timetable.assignments)), 2)
        ass1, ass2 = timetable.assignments[idx1], timetable.assignments[idx2]
        ass1.room_id, ass2.room_id = ass2.room_id, ass1.room_id
    
    def _swap_times(self, timetable: Timetable, violations: Dict):
        """Swap timeslots of two assignments"""
        if len(timetable.assignments) < 2:
            return
        
        idx1, idx2 = random.sample(range(len(timetable.assignments)), 2)
        ass1, ass2 = timetable.assignments[idx1], timetable.assignments[idx2]
        ass1.timeslot_id, ass2.timeslot_id = ass2.timeslot_id, ass1.timeslot_id
    
    def _relocate_event(self, timetable: Timetable, violations: Dict):
        """Relocate event to better slot and room"""
        if len(timetable.assignments) == 0:
            return
        
        idx = random.randint(0, len(timetable.assignments) - 1)
        assignment = timetable.assignments[idx]
        event = self.events[assignment.event_id]
        
        # New timeslot
        assignment.timeslot_id = random.choice(self.timeslots)['id']
        
        # Better room
        compatible = self.constructor.compatible_rooms.get(event['id'], [])
        if compatible:
            assignment.room_id = compatible[0]['id']


class HybridOptimizer:
    """Three-stage optimization with DB integration"""
    
    def __init__(self, db_config):
        self.db_config = db_config
        self.connection = None
        self.cursor = None
        
        # Data structures
        self.events = []
        self.rooms = []
        self.groups = []
        self.teachers = []
        self.timeslots = []
        self.timeslot_map = {}
    
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
        """Load all data from database"""
        print("\n[Loading] Reading data from database...")
        
        try:
            # Load groups
            self.cursor.execute("SELECT id, name, size FROM `groups`")
            self.groups = list(self.cursor.fetchall())
            
            # Load teachers
            self.cursor.execute("SELECT id, name FROM teachers")
            self.teachers = list(self.cursor.fetchall())
            
            # Load rooms
            self.cursor.execute("SELECT id, name, capacity, type FROM rooms")
            self.rooms = list(self.cursor.fetchall())
            
            # Load timeslots
            self.cursor.execute("""
                SELECT id, day, start_time, end_time 
                FROM timeslots 
                ORDER BY day, start_time
            """)
            self.timeslots = list(self.cursor.fetchall())
            
            # Build timeslot map
            for ts in self.timeslots:
                ts['start'] = str(ts['start_time'])
                ts['end'] = str(ts['end_time'])
            
            # Load courses (events)
            self.cursor.execute("""
                SELECT id, name, teacher_id, group_id, duration_slots, 
                       min_capacity, preferred_room_type 
                FROM courses
            """)
            self.events = list(self.cursor.fetchall())
            
            print(f"✓ Loaded: {len(self.events)} events, {len(self.rooms)} rooms, "
                  f"{len(self.groups)} groups, {len(self.timeslots)} timeslots")
        
        except Error as e:
            raise Exception(f"Failed to load instance: {str(e)}")
    
    def optimize(self, verbose: bool = True) -> Tuple[Timetable, float]:
        """Run three-stage optimization"""
        
        if verbose:
            print("\n" + "="*70)
            print("  ENHANCED TIMETABLE OPTIMIZER")
            print("  Faculty of Sciences and Techniques of Marrakech")
            print("="*70)
        
        # Initialize components
        evaluator = EnhancedConstraintEvaluator(
            self.events, self.rooms, self.groups, 
            self.teachers, self.timeslots, self.timeslot_map
        )
        
        constructor = IntelligentConstructor(
            self.events, self.rooms, self.groups, 
            self.timeslots, self.timeslot_map
        )
        
        search = SmartNeighborhoodSearch(
            self.events, self.rooms, self.groups, 
            self.timeslots, constructor
        )
        
        # Build initial solution
        if verbose:
            print("\n[Constructing] Building initial solution...")
        
        current = constructor.construct()
        current_fitness, _ = evaluator.evaluate(current)
        best = current.copy()
        best_fitness = current_fitness
        
        if verbose:
            print(f"✓ Initial fitness: {current_fitness:,.2f}")
        
        # STAGE 1: Simulated Annealing
        if verbose:
            print(f"\n[STAGE 1] Simulated Annealing ({Config.STAGE_1_ITERATIONS:,} iterations)")
        
        temperature = Config.INITIAL_TEMPERATURE
        start_time = time.time()
        
        for iteration in range(Config.STAGE_1_ITERATIONS):
            _, violations = evaluator.evaluate(current)
            neighbor = search.generate_neighbor(current, violations)
            neighbor_fitness, _ = evaluator.evaluate(neighbor)
            
            delta = neighbor_fitness - current_fitness
            
            if delta < 0 or random.random() < math.exp(-delta / temperature):
                current = neighbor
                current_fitness = neighbor_fitness
            
            if current_fitness < best_fitness:
                best = current.copy()
                best_fitness = current_fitness
            
            temperature *= Config.COOLING_RATE
            
            if verbose and iteration % 2000 == 0 and iteration > 0:
                elapsed = time.time() - start_time
                print(f"  Iter {iteration:5d} | T={temperature:8.1f} | "
                      f"Best={best_fitness:12,.0f} | Time={elapsed:.1f}s")
        
        # STAGE 2: Tabu Search
        if verbose:
            print(f"\n[STAGE 2] Tabu Search ({Config.STAGE_2_ITERATIONS:,} iterations)")
        
        start_time = time.time()
        
        for iteration in range(Config.STAGE_2_ITERATIONS):
            _, violations = evaluator.evaluate(current)
            neighbor = search.generate_neighbor(current, violations)
            neighbor_fitness, _ = evaluator.evaluate(neighbor)
            
            if neighbor_fitness < best_fitness:
                current = neighbor
                best = current.copy()
                best_fitness = neighbor_fitness
            elif neighbor_fitness < current_fitness * 1.05:
                current = neighbor
            
            if verbose and iteration % 1000 == 0 and iteration > 0:
                elapsed = time.time() - start_time
                print(f"  Iter {iteration:5d} | Best={best_fitness:12,.0f} | "
                      f"Time={elapsed:.1f}s")
        
        # STAGE 3: Local Intensification
        if verbose:
            print(f"\n[STAGE 3] Local Intensification ({Config.STAGE_3_ITERATIONS:,} iterations)")
        
        start_time = time.time()
        no_improve = 0
        
        for iteration in range(Config.STAGE_3_ITERATIONS):
            _, violations = evaluator.evaluate(current)
            neighbor = search.generate_neighbor(current, violations)
            neighbor_fitness, _ = evaluator.evaluate(neighbor)
            
            if neighbor_fitness < best_fitness:
                current = neighbor
                best = current.copy()
                best_fitness = neighbor_fitness
                no_improve = 0
            else:
                no_improve += 1
            
            if no_improve > 300:
                current = best.copy()
                no_improve = 0
            
            if verbose and iteration % 500 == 0 and iteration > 0:
                elapsed = time.time() - start_time
                print(f"  Iter {iteration:5d} | Best={best_fitness:12,.0f} | "
                      f"Time={elapsed:.1f}s")
        
        return best, best_fitness, evaluator
    
    def save_solution_to_db(self, solution: Timetable):
        """Save optimized solution to database"""
        try:
            # Clear existing schedule
            self.cursor.execute("DELETE FROM schedule")
            self.connection.commit()
            
            # Insert new schedule
            for assignment in solution.assignments:
                self.cursor.execute("""
                    INSERT INTO schedule (course_id, room_id, timeslot_id)
                    VALUES (%s, %s, %s)
                """, (assignment.event_id, assignment.room_id, assignment.timeslot_id))
            
            self.connection.commit()
            return len(solution.assignments)
        
        except Error as e:
            raise Exception(f"Failed to save solution: {str(e)}")
    
    def print_report(self, timetable: Timetable, evaluator):
        """Print detailed analysis"""
        fitness, violations = evaluator.evaluate(timetable)
        
        print("\n" + "="*70)
        print("📊 FINAL SOLUTION ANALYSIS")
        print("="*70)
        
        total_hard = (
            len(violations['room_conflicts']) +
            len(violations['teacher_conflicts']) +
            len(violations['group_conflicts']) +
            len(violations['capacity_violations']) +
            violations['boundary_violations']
        )
        
        print(f"\n{'Constraint Type':<40} {'Count':>10} {'Type':>10}")
        print("-" * 70)
        print(f"{'TOTAL HARD VIOLATIONS':<40} {total_hard:>10} {'📊 HARD':>10}")
        print(f"{'  Room conflicts':<40} {len(violations['room_conflicts']):>10} {'HARD':>10}")
        print(f"{'  Teacher conflicts':<40} {len(violations['teacher_conflicts']):>10} {'HARD':>10}")
        print(f"{'  Group conflicts':<40} {len(violations['group_conflicts']):>10} {'HARD':>10}")
        print(f"{'  Capacity violations':<40} {len(violations['capacity_violations']):>10} {'HARD':>10}")
        print(f"{'  Boundary violations':<40} {violations['boundary_violations']:>10} {'HARD':>10}")
        print("-" * 70)
        print(f"{'SOFT VIOLATIONS':<40}")
        print(f"{'  Room type mismatches':<40} {len(violations['type_mismatches']):>10} {'📊 SOFT':>10}")
        print(f"{'  Schedule gaps':<40} {violations['schedule_gaps']:>10} {'SOFT':>10}")
        print("=" * 70)
        
        if total_hard == 0:
            print("\n✓ SOLUTION IS FEASIBLE! All hard constraints satisfied.")
        else:
            print(f"\n⚠️  {total_hard} hard violations remaining")
        
        print(f"\n  Overall Fitness: {fitness:,.2f}")
        print(f"  Events Assigned: {len(timetable.assignments)}/{len(self.events)}")
        
        if violations['capacity_violations']:
            print("\n  Sample capacity violations:")
            for v in violations['capacity_violations'][:3]:
                print(f"    • {v['event']}: needs {v['needed']}, has {v['available']} (shortage: {v['shortage']})")
        
        if violations['room_conflicts']:
            print(f"\n  Room conflicts: {len(violations['room_conflicts'])} total")
        if violations['teacher_conflicts']:
            print(f"  Teacher conflicts: {len(violations['teacher_conflicts'])} total")
        if violations['group_conflicts']:
            print(f"  Group conflicts: {len(violations['group_conflicts'])} total")
    
    def optimize_schedule(self):
        """Main optimization entry point for API"""
        try:
            start_time = time.time()
            
            self.connect_db()
            self.load_instance()
            
            if not self.events or not self.timeslots or not self.rooms:
                return {
                    "success": False,
                    "message": "Insufficient data to optimize schedule"
                }
            
            # Run optimization
            solution, fitness_value, evaluator = self.optimize(verbose=True)
            
            # Print detailed report
            self.print_report(solution, evaluator)
            
            # Save to database
            scheduled_count = self.save_solution_to_db(solution)
            
            total_time = time.time() - start_time
            
            # Get final violations for response
            _, violations = evaluator.evaluate(solution)
            total_hard = (
                len(violations['room_conflicts']) +
                len(violations['teacher_conflicts']) +
                len(violations['group_conflicts']) +
                len(violations['capacity_violations']) +
                violations['boundary_violations']
            )
            
            self.close_db()
            
            print(f"\n📊 Total optimization time: {total_time:.2f}s")
            print("\n" + "="*70)
            print("  OPTIMIZATION COMPLETE")
            print("="*70)
            print(f"\n  FINAL RESULTS:")
            print(f"    • Final Fitness: {fitness_value:,.2f}")
            print(f"    • Hard Violations: {total_hard}")
            print(f"    • Soft Violations: {violations['schedule_gaps'] + len(violations['type_mismatches'])}")
            print(f"    • Feasible: {'✓ YES' if total_hard == 0 else '⚠️ NO'}")
            print(f"    • Runtime: {total_time:.2f}s")
            
            if total_hard == 0:
                print("\n✓ SUCCESS! Found a feasible timetable!")
            
            print("\n" + "="*70 + "\n")
            
            return {
                "success": True,
                "message": f"Optimization complete with fitness={fitness_value:.1f}",
                "scheduleCount": scheduled_count,
                "fitness": fitness_value,
                "hardViolations": total_hard,
                "softViolations": violations['schedule_gaps'] + len(violations['type_mismatches']),
                "runtime": round(total_time, 2),
                "feasible": total_hard == 0
            }
        
        except Exception as e:
            self.close_db()
            print(f"\n❌ Error: {str(e)}")
            return {
                "success": False,
                "message": f"Optimization failed: {str(e)}"
            }


# For backwards compatibility with existing API
class OptimizationService(HybridOptimizer):
    """Wrapper class for backwards compatibility"""
    pass