import random
from typing import List, Dict, Tuple
from sqlmodel import Session, select
from backend.models import Room, TimeSlot, Subject, CourseAllocation, Schedule, User

class TimetableGeneticAlgorithm:
    def __init__(self, session: Session, population_size=100, generations=200): # Increased params
        self.session = session
        self.population_size = population_size
        self.generations = generations
        
        # Load Data
        self.allocations = session.exec(select(CourseAllocation)).all()
        self.rooms = session.exec(select(Room)).all()
        self.slots = session.exec(select(TimeSlot)).all()
        
        # Mappings for quick access
        self.subjects = {s.id: s for s in session.exec(select(Subject)).all()}
        # Ensure we have data
        if not self.allocations or not self.rooms or not self.slots:
            raise ValueError("Insufficient data for generation")

    def generate(self) -> List[Schedule]:
        population = self.initialize_population()
        best_solution = None
        best_score = -float('inf')
        
        for generation in range(self.generations):
            scored_pop = []
            for chromosome in population:
                score = self.calculate_fitness(chromosome)
                scored_pop.append((score, chromosome))
            
            scored_pop.sort(key=lambda x: x[0], reverse=True)
            
            current_best_score = scored_pop[0][0]
            if current_best_score > best_score:
                best_score = current_best_score
                best_solution = scored_pop[0][1]
            
            if generation % 10 == 0:
                 print(f"Gen {generation}: Best Score {best_score}")

            if best_score >= 1000: # Perfect score
                 print("Optimal solution found.")
                 break
            
            # Elitism
            new_pop = [scored_pop[0][1], scored_pop[1][1]]
            
            while len(new_pop) < self.population_size:
                p1 = self.tournament_select(scored_pop)
                p2 = self.tournament_select(scored_pop)
                child = self.crossover(p1, p2)
                self.mutate(child)
                new_pop.append(child)
                
            population = new_pop
            
        return self.chromosome_to_schedule(best_solution)

    def initialize_population(self):
        """
        A Chromosome is a list of tuples: [(Allocation, Slot, Room), ...]
        """
        population = []
        for _ in range(self.population_size):
            chromosome = []
            for alloc in self.allocations:
                # Random assignment
                slot = random.choice(self.slots)
                room = random.choice(self.rooms)
                chromosome.append({'alloc': alloc, 'slot': slot, 'room': room})
            population.append(chromosome)
        return population

    def calculate_fitness(self, chromosome):
        score = 1000
        
        # Helper maps for conflict check
        teacher_busy = set() # (teacher_id, day, time)
        room_busy = set()    # (room_name, day, time)
        section_busy = set() # (section_id, day, time)
        
        for gene in chromosome:
            alloc = gene['alloc']
            slot = gene['slot']
            room = gene['room']
            
            # HARD CONSTRAINTS
            
            # 1. Teacher Conflict
            t_key = (alloc.teacher_id, slot.day_of_week, slot.start_time)
            if t_key in teacher_busy:
                score -= 5000 # Massive penalty
            else:
                teacher_busy.add(t_key)
                
            # 2. Room Conflict
            r_key = (room.name, slot.day_of_week, slot.start_time)
            if r_key in room_busy:
                score -= 5000
            else:
                room_busy.add(r_key)
                
            # 3. Section Conflict
            s_key = (alloc.section_id, slot.day_of_week, slot.start_time)
            if s_key in section_busy:
                score -= 5000
            else:
                section_busy.add(s_key)
            
            # SOFT CONSTRAINTS (+ points)
            # - Preferred rooms?
            # - Subject distribution?
            
        return score

    def tournament_select(self, scored_pop):
        # Pick 3 random, return best
        contestants = random.sample(scored_pop, 3)
        contestants.sort(key=lambda x: x[0], reverse=True)
        return contestants[0][1]

    def crossover(self, p1, p2):
        # Single point crossover
        point = random.randint(1, len(p1) - 1)
        child = p1[:point] + p2[point:]
        return child

    def mutate(self, chromosome):
        if random.random() < 0.2: # 20% mutation chance
            idx = random.randint(0, len(chromosome) - 1)
            chromosome[idx]['slot'] = random.choice(self.slots)
            chromosome[idx]['room'] = random.choice(self.rooms)

    def chromosome_to_schedule(self, chromosome):
        schedules = []
        for gene in chromosome:
            alloc = gene['alloc']
            slot = gene['slot']
            room = gene['room']
            subject = self.subjects[alloc.subject_id]
            
            schedules.append(Schedule(
                course_id=subject.code,
                section=alloc.section_id,
                course_name=subject.name,
                faculty_id=alloc.teacher_id,
                day_of_week=slot.day_of_week,
                start_time=slot.start_time,
                end_time=slot.end_time,
                room=room.name
            ))
        return schedules
