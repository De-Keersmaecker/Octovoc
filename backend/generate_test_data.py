#!/usr/bin/env python3
"""
Script to generate test data for Octovoc application.
Creates schools, teachers, students, and progress data.
"""

import sys
import random
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash

# Add the app directory to the path
sys.path.insert(0, '/home/jelledekeersmaecker/dev/projects/octovoc/backend')

from app import create_app, db
from app.models.user import User
from app.models.school import School
from app.models.classroom import Classroom
from app.models.code import ClassCode, TeacherCode
from app.models.module import Module, Word, Battery
from app.models.progress import StudentProgress, BatteryProgress, QuestionProgress

def generate_test_data():
    """Generate comprehensive test data"""
    app = create_app()

    with app.app_context():
        print("🚀 Starting test data generation...")

        # 1. Create test school
        print("\n📚 Creating test school...")
        school = School.query.filter_by(school_code='TEST').first()
        if not school:
            school = School(
                school_code='TEST',
                school_name='Test Middelbare School'
            )
            db.session.add(school)
            db.session.commit()
            print(f"   ✓ Created school: {school.school_name} ({school.school_code})")
        else:
            print(f"   ℹ School already exists: {school.school_name}")

        # 2. Create teacher codes
        print("\n👨‍🏫 Creating teacher codes...")
        teacher_codes = []
        for i in range(2):
            tc = TeacherCode.query.filter_by(code=f'TCHR-{i:04d}').first()
            if not tc:
                tc = TeacherCode(
                    code=f'TCHR-{i:04d}',
                    school_id=school.id,
                    is_active=True
                )
                db.session.add(tc)
                db.session.commit()
                print(f"   ✓ Created teacher code: {tc.code}")
            else:
                print(f"   ℹ Teacher code already exists: {tc.code}")
            teacher_codes.append(tc)

        # 3. Create teachers
        print("\n👩‍🏫 Creating teachers...")
        teachers = []
        teacher_data = [
            {'email': 'leerkracht1@test.be', 'code': teacher_codes[0].code},
            {'email': 'leerkracht2@test.be', 'code': teacher_codes[1].code}
        ]

        for data in teacher_data:
            teacher = User.query.filter_by(email=data['email']).first()
            if not teacher:
                teacher = User(
                    email=data['email'],
                    password_hash=generate_password_hash('test123'),
                    role='teacher'
                )
                db.session.add(teacher)
                db.session.commit()
                print(f"   ✓ Created teacher: {teacher.email} (password: test123)")
            else:
                print(f"   ℹ Teacher already exists: {teacher.email}")
            teachers.append(teacher)

        # 4. Create classrooms (now that we have teachers)
        print("\n🏫 Creating classrooms...")
        classrooms = []
        classroom_data = [
            {'name': '3A', 'teacher': teachers[0]},
            {'name': '3B', 'teacher': teachers[1]}
        ]

        for data in classroom_data:
            classroom = Classroom.query.filter_by(
                school_id=school.id,
                name=data['name']
            ).first()

            if not classroom:
                classroom = Classroom(
                    school_id=school.id,
                    name=data['name'],
                    teacher_id=data['teacher'].id
                )
                db.session.add(classroom)
                db.session.commit()

                # Create class code
                code = ClassCode(
                    code=f'TEST-{data["name"]}00',
                    classroom_id=classroom.id,
                    school_id=school.id,
                    is_active=True
                )
                db.session.add(code)
                db.session.commit()
                print(f"   ✓ Created classroom: {data['name']} with code {code.code} (teacher: {data['teacher'].email})")
            else:
                print(f"   ℹ Classroom already exists: {data['name']}")

            classrooms.append(classroom)

        # Link teacher codes to classrooms
        if teacher_codes[0] not in classrooms[0].teacher_codes:
            classrooms[0].teacher_codes.append(teacher_codes[0])
        if teacher_codes[1] not in classrooms[1].teacher_codes:
            classrooms[1].teacher_codes.append(teacher_codes[1])
        db.session.commit()

        # 5. Create students
        print("\n👨‍🎓 Creating students...")
        students = []
        student_data = [
            {'email': 'student1@test.be', 'classroom': classrooms[0]},
            {'email': 'student2@test.be', 'classroom': classrooms[0]},
            {'email': 'student3@test.be', 'classroom': classrooms[0]},
            {'email': 'student4@test.be', 'classroom': classrooms[1]},
            {'email': 'student5@test.be', 'classroom': classrooms[1]},
        ]

        for data in student_data:
            student = User.query.filter_by(email=data['email']).first()
            if not student:
                # Get class code for this classroom
                class_code = ClassCode.query.filter_by(
                    classroom_id=data['classroom'].id
                ).first()

                student = User(
                    email=data['email'],
                    password_hash=generate_password_hash('test123'),
                    role='student',
                    classroom_id=data['classroom'].id,
                    class_code=class_code.code if class_code else None
                )
                db.session.add(student)
                db.session.commit()
                print(f"   ✓ Created student: {student.email} in {data['classroom'].name} (password: test123)")
            else:
                print(f"   ℹ Student already exists: {student.email}")
            students.append(student)

        # 6. Get or create modules
        print("\n📖 Checking modules...")
        modules = Module.query.filter_by(is_active=True).all()

        if not modules:
            print("   ⚠ No modules found. Creating test module...")
            module = Module(
                name='Test Module - Basiswoordenschat',
                difficulty='Beginner',
                is_free=False,
                is_active=True,
                order_index=0
            )
            db.session.add(module)
            db.session.commit()

            # Add some test words
            test_words = [
                {'word': 'ambivalent', 'meaning': 'dubbelzinnig', 'example': 'Ik ben *ambivalent* over deze keuze.'},
                {'word': 'coherent', 'meaning': 'samenhangend', 'example': 'Het verhaal is zeer *coherent*.'},
                {'word': 'divers', 'meaning': 'verschillend', 'example': 'Een *diverse* groep mensen.'},
                {'word': 'empathisch', 'meaning': 'inlevend', 'example': 'Ze is zeer *empathisch*.'},
                {'word': 'fluctueren', 'meaning': 'schommelen', 'example': 'De prijzen *fluctueren* sterk.'},
            ]

            for i, word_data in enumerate(test_words):
                word = Word(
                    module_id=module.id,
                    word=word_data['word'],
                    meaning=word_data['meaning'],
                    example_sentence=word_data['example'],
                    order_index=i
                )
                db.session.add(word)

            db.session.commit()
            modules = [module]
            print(f"   ✓ Created test module with {len(test_words)} words")
        else:
            print(f"   ✓ Found {len(modules)} existing modules")

        # 7. Generate progress data
        print("\n📊 Generating progress data...")

        # Progress patterns: different completion levels for variety
        progress_patterns = [
            {'completion': 0.9, 'accuracy': 0.85},  # High achiever
            {'completion': 0.7, 'accuracy': 0.75},  # Good student
            {'completion': 0.5, 'accuracy': 0.65},  # Average student
            {'completion': 0.3, 'accuracy': 0.55},  # Struggling student
            {'completion': 0.1, 'accuracy': 0.45},  # Just started
        ]

        for idx, student in enumerate(students):
            pattern = progress_patterns[idx % len(progress_patterns)]

            # Create progress for 1-3 modules per student (or all available if less than 3)
            max_modules = min(3, len(modules))
            num_modules = random.randint(1, max(1, max_modules))
            selected_modules = random.sample(modules, min(num_modules, len(modules)))

            for module in selected_modules:
                # Check if progress already exists
                existing = StudentProgress.query.filter_by(
                    user_id=student.id,
                    module_id=module.id
                ).first()

                if existing:
                    print(f"   ℹ Progress already exists for {student.email} on {module.name}")
                    continue

                # Get all words and batteries in module
                words = Word.query.filter_by(module_id=module.id).all()
                batteries = db.session.query(Battery).filter_by(module_id=module.id).all()

                if not words:
                    continue

                # If no batteries exist, create them
                if not batteries:
                    from app.models.module import Battery as BatteryModel
                    word_ids = [w.id for w in words]
                    batteries = BatteryModel.create_batteries_for_module(module.id, word_ids)
                    for battery in batteries:
                        db.session.add(battery)
                    db.session.commit()

                # Calculate how many words to mark as completed
                words_to_complete = int(len(words) * pattern['completion'])

                # Create student progress
                progress = StudentProgress(
                    user_id=student.id,
                    module_id=module.id,
                    is_completed=(pattern['completion'] >= 0.99),
                    completion_date=datetime.utcnow() if pattern['completion'] >= 0.99 else None,
                    total_time_spent=random.randint(1800, 7200)  # 30-120 minutes
                )
                db.session.add(progress)
                db.session.commit()

                # Create battery progress and questions
                for battery in batteries:
                    battery_progress = BatteryProgress(
                        student_progress_id=progress.id,
                        battery_id=battery.id,
                        current_phase=random.randint(1, 3),
                        is_completed=False
                    )
                    db.session.add(battery_progress)
                    db.session.commit()

                    # For each word in this battery, create question attempts
                    for word_id in battery.word_ids[:min(len(battery.word_ids), words_to_complete)]:
                        word = Word.query.get(word_id)
                        if not word:
                            continue

                        # Create 2-5 question attempts for this word
                        num_attempts = random.randint(2, 5)
                        for attempt in range(num_attempts):
                            is_correct = random.random() < pattern['accuracy']

                            question = QuestionProgress(
                                battery_progress_id=battery_progress.id,
                                word_id=word.id,
                                phase=random.randint(1, 3),
                                is_correct=is_correct,
                                user_answer=word.meaning if is_correct else 'fout antwoord',
                                answered_at=datetime.utcnow() - timedelta(days=random.randint(0, 30))
                            )
                            db.session.add(question)

                        db.session.commit()

                completion_pct = int(pattern['completion'] * 100)
                accuracy_pct = int(pattern['accuracy'] * 100)
                print(f"   ✓ {student.email}: {module.name} - {completion_pct}% complete, {accuracy_pct}% accurate")

        db.session.commit()

        print("\n" + "="*60)
        print("✅ Test data generation complete!")
        print("="*60)
        print("\n📋 Summary:")
        print(f"   School: {school.school_name} ({school.school_code})")
        print(f"   Classrooms: {len(classrooms)}")
        print(f"   Teachers: {len(teachers)}")
        print(f"   Students: {len(students)}")
        print(f"   Modules: {len(modules)}")

        print("\n🔐 Login credentials:")
        print("\nTeachers:")
        for teacher in teachers:
            print(f"   Email: {teacher.email}")
            print(f"   Password: test123")

        print("\nStudents:")
        for student in students:
            classroom = Classroom.query.get(student.classroom_id)
            print(f"   Email: {student.email}")
            print(f"   Password: test123")
            print(f"   Class: {classroom.name if classroom else 'N/A'}")

        print("\nClass Codes:")
        for classroom in classrooms:
            codes = ClassCode.query.filter_by(classroom_id=classroom.id).all()
            for code in codes:
                print(f"   {classroom.name}: {code.code}")

        print("\n" + "="*60)

if __name__ == '__main__':
    try:
        generate_test_data()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
