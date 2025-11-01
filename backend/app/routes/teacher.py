from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.classroom import Classroom
from app.models.module import Module, Word
from app.models.progress import StudentProgress, QuestionProgress, BatteryProgress
from app.services.export_service import ExportService
from datetime import datetime
from sqlalchemy import func
from sqlalchemy.orm import joinedload

bp = Blueprint('teacher', __name__, url_prefix='/api/teacher')


@bp.route('/classrooms', methods=['GET'])
@jwt_required()
def get_classrooms():
    """Get all classrooms for the teacher"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or user.role != 'teacher':
        return jsonify({'error': 'Access denied'}), 403

    # Get classrooms where user is directly assigned as teacher
    classrooms = Classroom.query.filter_by(teacher_id=user_id).all()

    # If teacher has a teacher code, get ALL classrooms from that school
    if user.teacher_code:
        from app.models.code import TeacherCode
        teacher_code = TeacherCode.query.filter_by(code=user.teacher_code, is_active=True).first()
        if teacher_code and teacher_code.school_id:
            # Get ALL classrooms from this school
            school_classrooms = Classroom.query.filter_by(school_id=teacher_code.school_id).all()
            # Add them to the list (avoid duplicates)
            classroom_ids = {c.id for c in classrooms}
            for classroom in school_classrooms:
                if classroom.id not in classroom_ids:
                    classrooms.append(classroom)

    # Add student count to classroom dict
    result = []
    for classroom in classrooms:
        classroom_dict = classroom.to_dict()
        student_count = User.query.filter_by(classroom_id=classroom.id).count()
        classroom_dict['student_count'] = student_count
        result.append(classroom_dict)

    return jsonify(result), 200


@bp.route('/classroom/<int:classroom_id>/progress', methods=['GET'])
@jwt_required()
def get_classroom_progress(classroom_id):
    """Get progress for all students in a classroom in matrix format"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or user.role != 'teacher':
        return jsonify({'error': 'Access denied'}), 403

    classroom = Classroom.query.get(classroom_id)
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404

    # Check if teacher has access (either directly or via school through teacher code)
    has_access = classroom.teacher_id == user_id
    if not has_access and user.teacher_code:
        from app.models.code import TeacherCode
        teacher_code = TeacherCode.query.filter_by(code=user.teacher_code, is_active=True).first()
        if teacher_code and teacher_code.school_id:
            # Check if classroom belongs to the same school
            has_access = classroom.school_id == teacher_code.school_id

    if not has_access:
        return jsonify({'error': 'Access denied to this classroom'}), 403

    # Get all students in classroom (sorted alphabetically by email)
    students = User.query.filter_by(classroom_id=classroom_id).order_by(User.email).all()

    # Get all active modules (sorted by display_order)
    modules = Module.query.filter_by(is_active=True).order_by(Module.display_order).all()

    # Pre-fetch word counts for all modules (single query)
    module_word_counts = {}
    for module in modules:
        count = Word.query.filter_by(module_id=module.id).count()
        module_word_counts[module.id] = count

    # Get all student IDs
    student_ids = [s.id for s in students]

    # Pre-fetch all progress records with eager loading (single query with joins)
    all_progress = StudentProgress.query.options(
        joinedload(StudentProgress.battery_progress).joinedload(BatteryProgress.question_progress)
    ).filter(
        StudentProgress.user_id.in_(student_ids)
    ).all()

    # Organize progress by student_id and module_id
    progress_lookup = {}
    for progress in all_progress:
        if progress.user_id not in progress_lookup:
            progress_lookup[progress.user_id] = {}
        progress_lookup[progress.user_id][progress.module_id] = progress

    # Build matrix data structure
    matrix = []
    for student in students:
        student_row = {
            'student_id': student.id,
            'student_email': student.email,
            'student_first_name': student.first_name,
            'student_last_name': student.last_name,
            'modules': {}
        }

        # Get progress records for this student from pre-fetched data
        student_progress = progress_lookup.get(student.id, {})

        # For each module, add progress data
        for module in modules:
            if module.id in student_progress:
                progress = student_progress[module.id]
                total_words = module_word_counts[module.id]

                # Count unique words answered (data already loaded via eager loading)
                answered_word_ids = set()
                for bp in progress.battery_progress:
                    for q in bp.question_progress:
                        if q.word_id:
                            answered_word_ids.add(q.word_id)

                answered_words = len(answered_word_ids)

                # Calculate completion percentage
                completion_percentage = (answered_words / total_words * 100) if total_words > 0 else 0

                student_row['modules'][module.id] = {
                    'completion_percentage': round(completion_percentage, 1),
                    'answered_words': answered_words,
                    'total_words': total_words
                }
            # If module not started, modules[module.id] will not exist (empty cell)

        matrix.append(student_row)

    # Return matrix with module info
    return jsonify({
        'students': matrix,
        'modules': [{'id': m.id, 'name': m.name} for m in modules]
    }), 200


@bp.route('/student/<int:student_id>/module/<int:module_id>/detail', methods=['GET'])
@jwt_required()
def get_student_module_detail(student_id, module_id):
    """Get detailed progress for a specific student and module combination"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or user.role != 'teacher':
        return jsonify({'error': 'Access denied'}), 403

    student = User.query.get(student_id)
    if not student or not student.classroom_id:
        return jsonify({'error': 'Student not found'}), 404

    # Verify teacher has access to this student
    classroom = Classroom.query.get(student.classroom_id)
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404

    # Check if teacher has access (either directly or via school through teacher code)
    has_access = classroom.teacher_id == user_id
    if not has_access and user.teacher_code:
        from app.models.code import TeacherCode
        teacher_code = TeacherCode.query.filter_by(code=user.teacher_code, is_active=True).first()
        if teacher_code and teacher_code.school_id:
            # Check if classroom belongs to the same school
            has_access = classroom.school_id == teacher_code.school_id

    if not has_access:
        return jsonify({'error': 'Access denied'}), 403

    # Get module
    module = Module.query.get(module_id)
    if not module:
        return jsonify({'error': 'Module not found'}), 404

    # Get progress for this specific student and module
    progress = StudentProgress.query.filter_by(user_id=student_id, module_id=module_id).first()

    if not progress:
        return jsonify({'error': 'No progress found for this student and module'}), 404

    # Get total words in module
    from app.models.module import Word
    total_words = Word.query.filter_by(module_id=module_id).count()

    # Get all question attempts for this progress
    question_progress = []
    answered_word_ids = set()
    for bp in progress.battery_progress:
        questions = QuestionProgress.query.filter_by(battery_progress_id=bp.id).all()
        for q in questions:
            question_progress.append(q.to_dict())
            if q.word_id:
                answered_word_ids.add(q.word_id)

    answered_words = len(answered_word_ids)

    # Calculate statistics
    total_questions = len(question_progress)
    correct_questions = sum(1 for q in question_progress if q['is_correct'])
    score = (correct_questions / total_questions * 100) if total_questions > 0 else 0
    completion_percentage = (answered_words / total_words * 100) if total_words > 0 else 0

    return jsonify({
        'student': student.to_dict(),
        'module': module.to_dict(),
        'progress': {
            'completion_percentage': round(completion_percentage, 1),
            'answered_words': answered_words,
            'total_words': total_words,
            'score': round(score, 2),
            'correct_questions': correct_questions,
            'total_questions': total_questions,
            'is_completed': progress.is_completed,
            'completion_date': progress.completion_date.isoformat() if progress.completion_date else None,
            'time_spent': progress.total_time_spent
        },
        'question_progress': question_progress
    }), 200


@bp.route('/student/<int:student_id>/detail', methods=['GET'])
@jwt_required()
def get_student_detail(student_id):
    """Get detailed progress for a specific student"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or user.role != 'teacher':
        return jsonify({'error': 'Access denied'}), 403

    student = User.query.get(student_id)
    if not student or not student.classroom_id:
        return jsonify({'error': 'Student not found'}), 404

    # Verify teacher has access to this student
    classroom = Classroom.query.get(student.classroom_id)
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404

    # Check if teacher has access (either directly or via school through teacher code)
    has_access = classroom.teacher_id == user_id
    if not has_access and user.teacher_code:
        from app.models.code import TeacherCode
        teacher_code = TeacherCode.query.filter_by(code=user.teacher_code, is_active=True).first()
        if teacher_code and teacher_code.school_id:
            # Check if classroom belongs to the same school
            has_access = classroom.school_id == teacher_code.school_id

    if not has_access:
        return jsonify({'error': 'Access denied'}), 403

    # Get all progress
    progress_records = StudentProgress.query.filter_by(user_id=student_id).all()

    result = {
        'student': student.to_dict(),
        'modules': []
    }

    for progress in progress_records:
        module = Module.query.get(progress.module_id)

        # Get all question attempts
        question_progress = []
        for bp in progress.battery_progress:
            questions = QuestionProgress.query.filter_by(battery_progress_id=bp.id).all()
            question_progress.extend([q.to_dict() for q in questions])

        result['modules'].append({
            'module': module.to_dict(),
            'progress': progress.to_dict(),
            'question_progress': question_progress
        })

    return jsonify(result), 200


@bp.route('/analytics/difficult-words', methods=['GET'])
@jwt_required()
def get_difficult_words_analytics():
    """Get most frequently incorrect words for teacher's classrooms"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or user.role != 'teacher':
        return jsonify({'error': 'Access denied'}), 403

    # Get parameters
    classroom_id = request.args.get('classroom_id', type=int)
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    # Build query
    query = db.session.query(
        Word.id,
        Word.word,
        Word.meaning,
        func.count(QuestionProgress.id).label('incorrect_count')
    ).join(
        QuestionProgress, QuestionProgress.word_id == Word.id
    ).filter(
        QuestionProgress.is_correct == False
    )

    # Get accessible classrooms
    accessible_classrooms = Classroom.query.filter_by(teacher_id=user_id).all()

    # If teacher has a teacher code, get ALL classrooms from that school
    if user.teacher_code:
        from app.models.code import TeacherCode
        teacher_code = TeacherCode.query.filter_by(code=user.teacher_code, is_active=True).first()
        if teacher_code and teacher_code.school_id:
            # Get ALL classrooms from this school
            school_classrooms = Classroom.query.filter_by(school_id=teacher_code.school_id).all()
            classroom_ids = {c.id for c in accessible_classrooms}
            for classroom in school_classrooms:
                if classroom.id not in classroom_ids:
                    accessible_classrooms.append(classroom)

    # Filter by classroom if specified
    if classroom_id:
        classroom = Classroom.query.get(classroom_id)
        if not classroom or classroom not in accessible_classrooms:
            return jsonify({'error': 'Access denied'}), 403

        students = User.query.filter_by(classroom_id=classroom_id).all()
        student_ids = [s.id for s in students]

        query = query.join(
            BatteryProgress, BatteryProgress.id == QuestionProgress.battery_progress_id
        ).join(
            StudentProgress, StudentProgress.id == BatteryProgress.student_progress_id
        ).filter(
            StudentProgress.user_id.in_(student_ids)
        )
    else:
        # All accessible classrooms for this teacher
        classroom_ids = [c.id for c in accessible_classrooms]
        students = User.query.filter(User.classroom_id.in_(classroom_ids)).all()
        student_ids = [s.id for s in students]

        query = query.join(
            BatteryProgress, BatteryProgress.id == QuestionProgress.battery_progress_id
        ).join(
            StudentProgress, StudentProgress.id == BatteryProgress.student_progress_id
        ).filter(
            StudentProgress.user_id.in_(student_ids)
        )

    # Filter by date range
    if start_date:
        query = query.filter(QuestionProgress.answered_at >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(QuestionProgress.answered_at <= datetime.fromisoformat(end_date))

    # Group and order
    results = query.group_by(Word.id, Word.word, Word.meaning).order_by(
        func.count(QuestionProgress.id).desc()
    ).limit(50).all()

    return jsonify([{
        'word_id': r[0],
        'word': r[1],
        'meaning': r[2],
        'incorrect_count': r[3]
    } for r in results]), 200


@bp.route('/student/<int:student_id>/remove', methods=['DELETE'])
@jwt_required()
def remove_student(student_id):
    """Remove student from classroom"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or user.role != 'teacher':
        return jsonify({'error': 'Access denied'}), 403

    student = User.query.get(student_id)
    if not student or not student.classroom_id:
        return jsonify({'error': 'Student not found'}), 404

    classroom = Classroom.query.get(student.classroom_id)
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404

    # Check if teacher has access (either directly or via school through teacher code)
    has_access = classroom.teacher_id == user_id
    if not has_access and user.teacher_code:
        from app.models.code import TeacherCode
        teacher_code = TeacherCode.query.filter_by(code=user.teacher_code, is_active=True).first()
        if teacher_code and teacher_code.school_id:
            # Check if classroom belongs to the same school
            has_access = classroom.school_id == teacher_code.school_id

    if not has_access:
        return jsonify({'error': 'Access denied'}), 403

    # Remove from classroom
    student.classroom_id = None
    student.class_code = None
    db.session.commit()

    return jsonify({'message': 'Student removed from classroom'}), 200


@bp.route('/student/<int:student_id>/move', methods=['PUT'])
@jwt_required()
def move_student(student_id):
    """Move student to another classroom"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or user.role != 'teacher':
        return jsonify({'error': 'Access denied'}), 403

    data = request.get_json()
    new_classroom_id = data.get('classroom_id')

    student = User.query.get(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    # Get teacher code for access checks
    teacher_code = None
    if user.teacher_code:
        from app.models.code import TeacherCode
        teacher_code = TeacherCode.query.filter_by(code=user.teacher_code, is_active=True).first()

    # Verify old classroom access
    if student.classroom_id:
        old_classroom = Classroom.query.get(student.classroom_id)
        if old_classroom:
            has_old_access = old_classroom.teacher_id == user_id
            if not has_old_access and teacher_code and teacher_code.school_id:
                has_old_access = old_classroom.school_id == teacher_code.school_id
            if not has_old_access:
                return jsonify({'error': 'Access denied to current classroom'}), 403

    # Verify new classroom access
    new_classroom = Classroom.query.get(new_classroom_id)
    if not new_classroom:
        return jsonify({'error': 'New classroom not found'}), 404

    has_new_access = new_classroom.teacher_id == user_id
    if not has_new_access and teacher_code and teacher_code.school_id:
        has_new_access = new_classroom.school_id == teacher_code.school_id

    if not has_new_access:
        return jsonify({'error': 'Access denied to new classroom'}), 403

    # Move student
    student.classroom_id = new_classroom_id
    db.session.commit()

    return jsonify({'message': 'Student moved successfully'}), 200


@bp.route('/classroom/<int:classroom_id>/export/excel', methods=['GET'])
@jwt_required()
def export_classroom_excel(classroom_id):
    """Export classroom progress to Excel"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or user.role != 'teacher':
        return jsonify({'error': 'Access denied'}), 403

    classroom = Classroom.query.get(classroom_id)
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404

    # Check if teacher has access (either directly or via school through teacher code)
    has_access = classroom.teacher_id == user_id
    if not has_access and user.teacher_code:
        from app.models.code import TeacherCode
        teacher_code = TeacherCode.query.filter_by(code=user.teacher_code, is_active=True).first()
        if teacher_code and teacher_code.school_id:
            # Check if classroom belongs to the same school
            has_access = classroom.school_id == teacher_code.school_id

    if not has_access:
        return jsonify({'error': 'Access denied to this classroom'}), 403

    # Generate Excel file
    file_path = ExportService.export_classroom_to_excel(classroom_id)

    return send_file(file_path, as_attachment=True, download_name=f'classroom_{classroom_id}_progress.xlsx')


@bp.route('/student/<int:student_id>/export/pdf', methods=['GET'])
@jwt_required()
def export_student_pdf(student_id):
    """Export student detail report to PDF"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or user.role != 'teacher':
        return jsonify({'error': 'Access denied'}), 403

    student = User.query.get(student_id)
    if not student or not student.classroom_id:
        return jsonify({'error': 'Student not found'}), 404

    classroom = Classroom.query.get(student.classroom_id)
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404

    # Check if teacher has access (either directly or via school through teacher code)
    has_access = classroom.teacher_id == user_id
    if not has_access and user.teacher_code:
        from app.models.code import TeacherCode
        teacher_code = TeacherCode.query.filter_by(code=user.teacher_code, is_active=True).first()
        if teacher_code and teacher_code.school_id:
            # Check if classroom belongs to the same school
            has_access = classroom.school_id == teacher_code.school_id

    if not has_access:
        return jsonify({'error': 'Access denied'}), 403

    # Generate PDF file
    file_path = ExportService.export_student_to_pdf(student_id)

    return send_file(file_path, as_attachment=True, download_name=f'student_{student_id}_report.pdf')
