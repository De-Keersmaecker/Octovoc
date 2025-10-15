from flask import Blueprint, request, jsonify, current_app, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.module import Module, Word, Battery
from app.models.code import ClassCode, TeacherCode
from app.models.classroom import Classroom
from app.models.school import School
from app.models.quote import Quote
from app.models.progress import QuestionProgress, StudentProgress, BatteryProgress
from app.models.module import DifficultWord
from app.services.module_service import ModuleService
from app.services.email_service import EmailService
from app.services.export_service import ExportService
from datetime import datetime, timedelta
from sqlalchemy import func
from werkzeug.utils import secure_filename
import os

bp = Blueprint('admin', __name__, url_prefix='/api/admin')


def admin_required():
    """Decorator to check if user is admin"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return None
    except Exception as e:
        print(f"Admin check error: {e}")
        return jsonify({'error': 'Authentication failed'}), 401


@bp.route('/modules', methods=['GET'])
@jwt_required()
def get_all_modules():
    """Get all modules ordered by display_order"""
    error = admin_required()
    if error:
        return error

    modules = Module.query.order_by(Module.display_order, Module.id).all()
    return jsonify([m.to_dict(include_words=False) for m in modules]), 200


@bp.route('/module/<int:module_id>', methods=['GET'])
@jwt_required()
def get_module(module_id):
    """Get module with all words"""
    error = admin_required()
    if error:
        return error

    module = Module.query.get(module_id)
    if not module:
        return jsonify({'error': 'Module not found'}), 404

    return jsonify(module.to_dict(include_words=True)), 200


@bp.route('/module/<int:module_id>/csv', methods=['GET'])
@jwt_required()
def get_module_csv(module_id):
    """Get module data as CSV string"""
    error = admin_required()
    if error:
        return error

    module = Module.query.get(module_id)
    if not module:
        return jsonify({'error': 'Module not found'}), 404

    # Get all words ordered by position
    words = Word.query.filter_by(module_id=module_id).order_by(Word.position_in_module).all()

    # Convert to CSV format
    csv_lines = []
    for word in words:
        # Escape any semicolons or quotes in the data
        word_text = word.word.replace(';', ',')
        meaning = word.meaning.replace(';', ',')
        example = word.example_sentence.replace(';', ',')

        csv_lines.append(f"{word_text};{meaning};{example}")

    csv_data = '\n'.join(csv_lines)

    return jsonify({
        'csv_data': csv_data,
        'name': module.name,
        'difficulty': module.difficulty,
        'is_free': module.is_free
    }), 200


@bp.route('/module/upload', methods=['POST'])
@jwt_required()
def upload_module():
    """Create module from Excel file"""
    print("=== Upload module endpoint hit ===")
    print(f"Files in request: {list(request.files.keys())}")
    print(f"Form data: {dict(request.form)}")

    error = admin_required()
    if error:
        print("Admin check failed")
        return error

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not file.filename.endswith('.xlsx'):
        return jsonify({'error': 'File must be .xlsx format'}), 400

    # Save file temporarily
    filename = secure_filename(file.filename)
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    # Parse and create module
    try:
        name = request.form.get('name', filename.replace('.xlsx', ''))
        difficulty = request.form.get('difficulty', '')
        is_free = request.form.get('is_free', 'false').lower() == 'true'

        module = ModuleService.create_module_from_excel(
            filepath,
            name=name,
            difficulty=difficulty,
            is_free=is_free
        )

        # Clean up temp file
        os.remove(filepath)

        return jsonify({
            'message': 'Module created successfully',
            'module': module.to_dict(include_words=True)
        }), 201

    except ValueError as e:
        # Clean up temp file
        if os.path.exists(filepath):
            os.remove(filepath)
        print(f"ValueError during module upload: {str(e)}")
        return jsonify({'error': str(e)}), 422
    except Exception as e:
        # Clean up temp file
        if os.path.exists(filepath):
            os.remove(filepath)
        print(f"Exception during module upload: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Error creating module: {str(e)}'}), 500


@bp.route('/module/upload-csv', methods=['POST'])
@jwt_required()
def upload_module_csv():
    """Create module from CSV data"""
    error = admin_required()
    if error:
        return error

    data = request.get_json()
    csv_data = data.get('csv_data')
    name = data.get('name')
    difficulty = data.get('difficulty', '')
    is_free = data.get('is_free', False)

    if not csv_data or not name:
        return jsonify({'error': 'CSV data and module name are required'}), 400

    try:
        module = ModuleService.create_module_from_csv(
            csv_data,
            name=name,
            difficulty=difficulty,
            is_free=is_free
        )

        return jsonify({
            'message': 'Module created successfully',
            'module': module.to_dict(include_words=True)
        }), 201

    except ValueError as e:
        print(f"ValueError during CSV upload: {str(e)}")
        return jsonify({'error': str(e)}), 422
    except Exception as e:
        print(f"Exception during CSV upload: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Error creating module: {str(e)}'}), 500


@bp.route('/module/<int:module_id>', methods=['PUT'])
@jwt_required()
def update_module(module_id):
    """Update module (metadata only or full CSV update)"""
    error = admin_required()
    if error:
        return error

    module = Module.query.get(module_id)
    if not module:
        return jsonify({'error': 'Module not found'}), 404

    data = request.get_json()

    # Check if this is a CSV update (full module content update)
    if 'csv_data' in data:
        csv_data = data.get('csv_data')

        if not csv_data:
            return jsonify({'error': 'CSV data cannot be empty'}), 400

        try:
            # Update module metadata if provided
            if 'name' in data:
                module.name = data['name']
            if 'difficulty' in data:
                module.difficulty = data['difficulty']
            if 'is_free' in data:
                module.is_free = data['is_free']

            # Update module content from CSV
            module = ModuleService.update_module_from_csv(module_id, csv_data)

            return jsonify({
                'message': 'Module updated successfully',
                'module': module.to_dict(include_words=True)
            }), 200

        except ValueError as e:
            print(f"ValueError during CSV update: {str(e)}")
            return jsonify({'error': str(e)}), 422
        except Exception as e:
            print(f"Exception during CSV update: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': f'Error updating module: {str(e)}'}), 500

    # Otherwise, just update metadata
    if 'name' in data:
        module.name = data['name']
    if 'difficulty' in data:
        module.difficulty = data['difficulty']
    if 'is_free' in data:
        module.is_free = data['is_free']
    if 'is_active' in data:
        module.is_active = data['is_active']

    module.updated_at = datetime.utcnow()
    module.version += 1

    db.session.commit()

    return jsonify(module.to_dict()), 200


@bp.route('/module/<int:module_id>', methods=['DELETE'])
@jwt_required()
def delete_module(module_id):
    """Permanently delete module and all related data"""
    error = admin_required()
    if error:
        return error

    module = Module.query.get(module_id)
    if not module:
        return jsonify({'error': 'Module not found'}), 404

    try:
        # Step 1: Get all word IDs for this module
        word_ids = [w.id for w in Word.query.filter_by(module_id=module_id).all()]

        # Step 2: Delete all DifficultWord records that reference these words
        if word_ids:
            DifficultWord.query.filter(DifficultWord.word_id.in_(word_ids)).delete(synchronize_session=False)

        # Step 3: Get all StudentProgress records for this module
        student_progress_records = StudentProgress.query.filter_by(module_id=module_id).all()

        # Step 4: Delete all related progress records
        for sp in student_progress_records:
            # Get all BatteryProgress IDs for this StudentProgress
            battery_progress_ids = [bp.id for bp in sp.battery_progress]

            # Delete all QuestionProgress records for these BatteryProgress records
            if battery_progress_ids:
                QuestionProgress.query.filter(
                    QuestionProgress.battery_progress_id.in_(battery_progress_ids)
                ).delete(synchronize_session=False)

            # Delete all BatteryProgress records
            BatteryProgress.query.filter_by(student_progress_id=sp.id).delete(synchronize_session=False)

        # Step 5: Delete all StudentProgress records for this module
        StudentProgress.query.filter_by(module_id=module_id).delete(synchronize_session=False)

        # Step 6: Delete all Word records
        Word.query.filter_by(module_id=module_id).delete(synchronize_session=False)

        # Step 7: Delete all Battery records
        Battery.query.filter_by(module_id=module_id).delete(synchronize_session=False)

        # Step 8: Finally delete the module itself
        db.session.delete(module)
        db.session.commit()

        return jsonify({'message': 'Module permanently deleted'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting module: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to delete module: {str(e)}'}), 500


@bp.route('/modules/reorder', methods=['PUT'])
@jwt_required()
def reorder_modules():
    """Update display order of modules"""
    error = admin_required()
    if error:
        return error

    data = request.get_json()
    module_order = data.get('module_order', [])  # List of module IDs in desired order

    if not module_order:
        return jsonify({'error': 'module_order is required'}), 400

    try:
        for index, module_id in enumerate(module_order):
            module = Module.query.get(module_id)
            if module:
                module.display_order = index

        db.session.commit()
        return jsonify({'message': 'Module order updated'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/codes/class/generate', methods=['POST'])
@jwt_required()
def generate_class_code():
    """Generate a new class code"""
    error = admin_required()
    if error:
        return error

    data = request.get_json()
    classroom_name = data.get('classroom_name')
    teacher_id = data.get('teacher_id')

    if not teacher_id:
        return jsonify({'error': 'Teacher ID required'}), 400

    teacher = User.query.get(teacher_id)
    if not teacher or teacher.role != 'teacher':
        return jsonify({'error': 'Invalid teacher'}), 400

    # Create classroom
    classroom = Classroom(
        name=classroom_name or f'Classroom {datetime.now().strftime("%Y%m%d%H%M%S")}',
        teacher_id=teacher_id
    )
    db.session.add(classroom)
    db.session.flush()

    # Generate code
    code = ClassCode.generate_code()
    class_code = ClassCode(
        code=code,
        classroom_id=classroom.id
    )
    db.session.add(class_code)

    classroom.class_code_id = class_code.id

    db.session.commit()

    return jsonify({
        'message': 'Class code generated',
        'code': class_code.to_dict(),
        'classroom': classroom.to_dict()
    }), 201


@bp.route('/codes/teacher/generate', methods=['POST'])
@jwt_required()
def generate_teacher_code():
    """Generate a new teacher code"""
    error = admin_required()
    if error:
        return error

    data = request.get_json()
    classroom_ids = data.get('classroom_ids', [])

    # Generate code
    code = TeacherCode.generate_code()
    teacher_code = TeacherCode(code=code)
    db.session.add(teacher_code)
    db.session.flush()

    # Link to classrooms
    if classroom_ids:
        classrooms = Classroom.query.filter(Classroom.id.in_(classroom_ids)).all()
        teacher_code.classrooms.extend(classrooms)

    db.session.commit()

    return jsonify({
        'message': 'Teacher code generated',
        'code': teacher_code.to_dict()
    }), 201


@bp.route('/codes/class', methods=['GET'])
@jwt_required()
def get_class_codes():
    """Get all class codes with optional school filter"""
    error = admin_required()
    if error:
        return error

    school_id = request.args.get('school_id', type=int)

    query = ClassCode.query
    if school_id:
        query = query.filter_by(school_id=school_id)

    codes = query.all()
    return jsonify([c.to_dict() for c in codes]), 200


@bp.route('/codes/teacher', methods=['GET'])
@jwt_required()
def get_teacher_codes():
    """Get all teacher codes with optional school filter"""
    error = admin_required()
    if error:
        return error

    school_id = request.args.get('school_id', type=int)

    query = TeacherCode.query
    if school_id:
        query = query.filter_by(school_id=school_id)

    codes = query.all()
    return jsonify([c.to_dict() for c in codes]), 200


@bp.route('/codes/teacher/<int:teacher_code_id>/link-classroom', methods=['POST'])
@jwt_required()
def link_classroom_to_teacher_code(teacher_code_id):
    """Link a classroom to a teacher code"""
    error = admin_required()
    if error:
        return error

    data = request.get_json()
    classroom_id = data.get('classroom_id')

    if not classroom_id:
        return jsonify({'error': 'classroom_id is required'}), 400

    teacher_code = TeacherCode.query.get(teacher_code_id)
    if not teacher_code:
        return jsonify({'error': 'Teacher code not found'}), 404

    classroom = Classroom.query.get(classroom_id)
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404

    # Check if already linked
    if classroom not in teacher_code.classrooms:
        teacher_code.classrooms.append(classroom)
        db.session.commit()

    return jsonify({
        'message': 'Classroom linked to teacher code',
        'teacher_code': teacher_code.to_dict()
    }), 200


@bp.route('/codes/teacher/<int:teacher_code_id>/unlink-classroom/<int:classroom_id>', methods=['DELETE'])
@jwt_required()
def unlink_classroom_from_teacher_code(teacher_code_id, classroom_id):
    """Unlink a classroom from a teacher code"""
    error = admin_required()
    if error:
        return error

    teacher_code = TeacherCode.query.get(teacher_code_id)
    if not teacher_code:
        return jsonify({'error': 'Teacher code not found'}), 404

    classroom = Classroom.query.get(classroom_id)
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404

    # Remove from linked classrooms
    if classroom in teacher_code.classrooms:
        teacher_code.classrooms.remove(classroom)
        db.session.commit()

    return jsonify({
        'message': 'Classroom unlinked from teacher code',
        'teacher_code': teacher_code.to_dict()
    }), 200


@bp.route('/codes/class/<int:code_id>/deactivate', methods=['PUT'])
@jwt_required()
def deactivate_class_code(code_id):
    """Deactivate a class code"""
    error = admin_required()
    if error:
        return error

    code = ClassCode.query.get(code_id)
    if not code:
        return jsonify({'error': 'Code not found'}), 404

    code.is_active = False
    code.deactivated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({'message': 'Code deactivated'}), 200


@bp.route('/codes/class/<int:code_id>/activate', methods=['PUT'])
@jwt_required()
def activate_class_code(code_id):
    """Reactivate a class code"""
    error = admin_required()
    if error:
        return error

    code = ClassCode.query.get(code_id)
    if not code:
        return jsonify({'error': 'Code not found'}), 404

    code.is_active = True
    code.deactivated_at = None
    db.session.commit()

    return jsonify({'message': 'Code activated'}), 200


@bp.route('/codes/class/<int:code_id>', methods=['DELETE'])
@jwt_required()
def delete_class_code(code_id):
    """Delete a class code permanently"""
    error = admin_required()
    if error:
        return error

    code = ClassCode.query.get(code_id)
    if not code:
        return jsonify({'error': 'Code not found'}), 404

    db.session.delete(code)
    db.session.commit()

    return jsonify({'message': 'Code deleted'}), 200


@bp.route('/codes/teacher/<int:code_id>/deactivate', methods=['PUT'])
@jwt_required()
def deactivate_teacher_code(code_id):
    """Deactivate a teacher code"""
    error = admin_required()
    if error:
        return error

    code = TeacherCode.query.get(code_id)
    if not code:
        return jsonify({'error': 'Code not found'}), 404

    code.is_active = False
    code.deactivated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({'message': 'Code deactivated'}), 200


@bp.route('/codes/teacher/<int:code_id>/activate', methods=['PUT'])
@jwt_required()
def activate_teacher_code(code_id):
    """Reactivate a teacher code"""
    error = admin_required()
    if error:
        return error

    code = TeacherCode.query.get(code_id)
    if not code:
        return jsonify({'error': 'Code not found'}), 404

    code.is_active = True
    code.deactivated_at = None
    db.session.commit()

    return jsonify({'message': 'Code activated'}), 200


@bp.route('/codes/teacher/<int:code_id>', methods=['DELETE'])
@jwt_required()
def delete_teacher_code(code_id):
    """Delete a teacher code permanently"""
    error = admin_required()
    if error:
        return error

    code = TeacherCode.query.get(code_id)
    if not code:
        return jsonify({'error': 'Code not found'}), 404

    db.session.delete(code)
    db.session.commit()

    return jsonify({'message': 'Code deleted'}), 200


@bp.route('/quotes', methods=['GET'])
@jwt_required()
def get_quotes():
    """Get all quotes"""
    error = admin_required()
    if error:
        return error

    quotes = Quote.query.all()
    return jsonify([q.to_dict() for q in quotes]), 200


@bp.route('/quote', methods=['POST'])
@jwt_required()
def create_quote():
    """Create a new quote"""
    error = admin_required()
    if error:
        return error

    data = request.get_json()
    text = data.get('text')
    author = data.get('author', '')
    video_url = data.get('video_url', '')

    if not text:
        return jsonify({'error': 'Quote text required'}), 400

    quote = Quote(text=text, author=author, video_url=video_url)
    db.session.add(quote)
    db.session.commit()

    return jsonify(quote.to_dict()), 201


@bp.route('/quote/<int:quote_id>', methods=['PUT'])
@jwt_required()
def update_quote(quote_id):
    """Update a quote"""
    error = admin_required()
    if error:
        return error

    quote = Quote.query.get(quote_id)
    if not quote:
        return jsonify({'error': 'Quote not found'}), 404

    data = request.get_json()

    if 'text' in data:
        quote.text = data['text']
    if 'author' in data:
        quote.author = data['author']
    if 'video_url' in data:
        quote.video_url = data['video_url']
    if 'is_active' in data:
        quote.is_active = data['is_active']

    db.session.commit()

    return jsonify(quote.to_dict()), 200


@bp.route('/quote/<int:quote_id>', methods=['DELETE'])
@jwt_required()
def delete_quote(quote_id):
    """Delete a quote"""
    error = admin_required()
    if error:
        return error

    quote = Quote.query.get(quote_id)
    if not quote:
        return jsonify({'error': 'Quote not found'}), 404

    db.session.delete(quote)
    db.session.commit()

    return jsonify({'message': 'Quote deleted'}), 200


@bp.route('/analytics/difficult-words', methods=['GET'])
@jwt_required()
def get_all_difficult_words():
    """Get most difficult words across all users"""
    error = admin_required()
    if error:
        return error

    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    module_id = request.args.get('module_id', type=int)

    query = db.session.query(
        Word.id,
        Word.word,
        Word.meaning,
        Word.module_id,
        func.count(QuestionProgress.id).label('incorrect_count')
    ).join(
        QuestionProgress, QuestionProgress.word_id == Word.id
    ).filter(
        QuestionProgress.is_correct == False
    )

    if module_id:
        query = query.filter(Word.module_id == module_id)

    if start_date:
        query = query.filter(QuestionProgress.answered_at >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(QuestionProgress.answered_at <= datetime.fromisoformat(end_date))

    results = query.group_by(Word.id, Word.word, Word.meaning, Word.module_id).order_by(
        func.count(QuestionProgress.id).desc()
    ).limit(100).all()

    return jsonify([{
        'word_id': r[0],
        'word': r[1],
        'meaning': r[2],
        'module_id': r[3],
        'incorrect_count': r[4]
    } for r in results]), 200


@bp.route('/users/cleanup', methods=['POST'])
@jwt_required()
def cleanup_inactive_users():
    """Delete users inactive for 2 years"""
    error = admin_required()
    if error:
        return error

    cutoff_date = datetime.utcnow() - timedelta(days=730)

    inactive_users = User.query.filter(
        User.last_activity < cutoff_date,
        User.role != 'admin'
    ).all()

    count = len(inactive_users)

    for user in inactive_users:
        db.session.delete(user)

    db.session.commit()

    return jsonify({
        'message': f'{count} inactive users deleted',
        'count': count
    }), 200


@bp.route('/email-template', methods=['GET'])
@jwt_required()
def get_email_template():
    """Get email template for teacher instructions"""
    error = admin_required()
    if error:
        return error

    # This would normally be stored in database
    # For now, return a default template
    template = EmailService.get_teacher_instruction_template()

    return jsonify({'template': template}), 200


@bp.route('/email-template', methods=['PUT'])
@jwt_required()
def update_email_template():
    """Update email template"""
    error = admin_required()
    if error:
        return error

    data = request.get_json()
    template = data.get('template')

    if not template:
        return jsonify({'error': 'Template required'}), 400

    # Store template (in production, save to database)
    EmailService.set_teacher_instruction_template(template)

    return jsonify({'message': 'Template updated'}), 200


@bp.route('/email/compose', methods=['POST'])
@jwt_required()
def compose_email():
    """Generate Gmail compose link"""
    error = admin_required()
    if error:
        return error

    data = request.get_json()
    recipient = data.get('recipient')
    template_type = data.get('template_type', 'teacher_instruction')
    context = data.get('context', {})

    gmail_link = EmailService.generate_gmail_compose_link(
        recipient=recipient,
        template_type=template_type,
        context=context
    )

    return jsonify({'gmail_link': gmail_link}), 200


@bp.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    """Get all users with optional role and school filters"""
    error = admin_required()
    if error:
        return error

    role = request.args.get('role')
    school_id = request.args.get('school_id', type=int)

    query = User.query
    if role:
        query = query.filter_by(role=role)

    if school_id:
        # Filter students by their classroom's school_id
        query = query.join(Classroom, User.classroom_id == Classroom.id, isouter=True)
        query = query.filter(Classroom.school_id == school_id)

    users = query.all()

    return jsonify([u.to_dict() for u in users]), 200


@bp.route('/classrooms', methods=['GET'])
@jwt_required()
def get_all_classrooms():
    """Get all classrooms"""
    error = admin_required()
    if error:
        return error

    classrooms = Classroom.query.all()

    result = []
    for classroom in classrooms:
        classroom_data = classroom.to_dict()
        classroom_data['student_count'] = User.query.filter_by(classroom_id=classroom.id).count()
        result.append(classroom_data)

    return jsonify(result), 200


@bp.route('/student/<int:student_id>/module/<int:module_id>/detail', methods=['GET'])
@jwt_required()
def get_student_module_detail(student_id, module_id):
    """Get detailed progress for a specific student and module combination (admin access)"""
    error = admin_required()
    if error:
        return error

    student = User.query.get(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    # Get module
    module = Module.query.get(module_id)
    if not module:
        return jsonify({'error': 'Module not found'}), 404

    # Get progress for this specific student and module
    progress = StudentProgress.query.filter_by(user_id=student_id, module_id=module_id).first()

    if not progress:
        return jsonify({'error': 'No progress found for this student and module'}), 404

    # Get total words in module
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
    """Get detailed progress for a specific student (admin access)"""
    error = admin_required()
    if error:
        return error

    student = User.query.get(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    # Get all progress
    progress_records = StudentProgress.query.filter_by(user_id=student_id).all()

    result = {
        'student': student.to_dict(),
        'modules': []
    }

    for progress in progress_records:
        module = Module.query.get(progress.module_id)
        if not module:
            continue

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


@bp.route('/classroom/<int:classroom_id>/progress', methods=['GET'])
@jwt_required()
def get_classroom_progress(classroom_id):
    """Get progress for all students in a classroom in matrix format (admin access)"""
    error = admin_required()
    if error:
        return error

    classroom = Classroom.query.get(classroom_id)
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404

    # Get all students in classroom (sorted alphabetically by email)
    students = User.query.filter_by(classroom_id=classroom_id).order_by(User.email).all()

    # Get all active modules (sorted by display_order)
    modules = Module.query.filter_by(is_active=True).order_by(Module.display_order).all()

    # Build matrix data structure
    matrix = []
    for student in students:
        student_row = {
            'student_id': student.id,
            'student_email': student.email,
            'modules': {}
        }

        # Get all progress records for this student
        progress_records = StudentProgress.query.filter_by(user_id=student.id).all()

        # Create a lookup dictionary for quick access
        progress_by_module = {p.module_id: p for p in progress_records}

        # For each module, add progress data
        for module in modules:
            if module.id in progress_by_module:
                progress = progress_by_module[module.id]

                # Get total words in module
                total_words = Word.query.filter_by(module_id=module.id).count()

                # Count unique words answered
                answered_word_ids = set()
                for bp in progress.battery_progress:
                    questions = QuestionProgress.query.filter_by(battery_progress_id=bp.id).all()
                    for q in questions:
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


# ===== School Management Endpoints =====

@bp.route('/schools', methods=['GET'])
@jwt_required()
def get_schools():
    """Get all schools"""
    error = admin_required()
    if error:
        return error

    schools = School.query.all()
    return jsonify([s.to_dict() for s in schools]), 200


@bp.route('/school/create', methods=['POST'])
@jwt_required()
def create_school():
    """Create a school with classrooms and codes"""
    error = admin_required()
    if error:
        return error

    data = request.get_json()
    school_code = data.get('school_code', '').strip().upper()
    school_name = data.get('school_name', '').strip()
    num_classrooms = data.get('num_classrooms', 0)
    num_teacher_codes = data.get('num_teacher_codes', 0)
    teacher_id = data.get('teacher_id')  # Optional: assign a teacher

    # Validate school code (exactly 4 letters)
    if not school_code or len(school_code) != 4 or not school_code.isalpha():
        return jsonify({'error': 'School code must be exactly 4 letters'}), 400

    if not school_name:
        return jsonify({'error': 'School name is required'}), 400

    # Check if school code already exists
    existing_school = School.query.filter_by(school_code=school_code).first()
    if existing_school:
        return jsonify({'error': 'School code already exists'}), 400

    # Create school
    school = School(school_code=school_code, school_name=school_name)
    db.session.add(school)
    db.session.flush()

    # Get or use default teacher
    if not teacher_id:
        # Find first admin/teacher to assign
        teacher = User.query.filter_by(role='admin').first()
        if teacher:
            teacher_id = teacher.id
        else:
            return jsonify({'error': 'No teacher available to assign classrooms'}), 400

    # Create classrooms and class codes
    classrooms_created = []
    class_codes_created = []

    for i in range(1, num_classrooms + 1):
        # Create classroom
        classroom = Classroom(
            name=f"klas {i}",
            teacher_id=teacher_id,
            school_id=school.id
        )
        db.session.add(classroom)
        db.session.flush()

        # Generate class code
        code_str = ClassCode.generate_code(school_code)
        class_code = ClassCode(
            code=code_str,
            classroom_id=classroom.id,
            school_id=school.id
        )
        db.session.add(class_code)
        db.session.flush()

        classroom.class_code_id = class_code.id

        classrooms_created.append(classroom.to_dict())
        class_codes_created.append(class_code.to_dict())

    # Create teacher codes
    teacher_codes_created = []
    for i in range(num_teacher_codes):
        code_str = TeacherCode.generate_code(school_code)
        teacher_code = TeacherCode(
            code=code_str,
            school_id=school.id
        )
        db.session.add(teacher_code)
        teacher_codes_created.append({'code': code_str})

    db.session.commit()

    return jsonify({
        'message': 'School created successfully',
        'school': school.to_dict(),
        'classrooms': classrooms_created,
        'class_codes': class_codes_created,
        'teacher_codes': teacher_codes_created
    }), 201


@bp.route('/classroom/<int:classroom_id>/rename', methods=['PUT'])
@jwt_required()
def rename_classroom(classroom_id):
    """Rename a classroom (admin or teacher access)"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({'error': 'User not found'}), 404

    classroom = Classroom.query.get(classroom_id)
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404

    # Check access: admin or teacher of this classroom
    if user.role not in ['admin', 'teacher']:
        return jsonify({'error': 'Access denied'}), 403

    if user.role == 'teacher':
        # Check if teacher has access to this classroom (via school)
        has_access = classroom.teacher_id == user.id

        if not has_access and user.teacher_code:
            from app.models.code import TeacherCode
            teacher_code = TeacherCode.query.filter_by(code=user.teacher_code, is_active=True).first()
            if teacher_code and teacher_code.school_id:
                # Check if classroom belongs to the same school
                has_access = classroom.school_id == teacher_code.school_id

        if not has_access:
            return jsonify({'error': 'Access denied to this classroom'}), 403

    data = request.get_json()
    new_name = data.get('name', '').strip()

    if not new_name:
        return jsonify({'error': 'New name is required'}), 400

    classroom.name = new_name
    db.session.commit()

    return jsonify({
        'message': 'Classroom renamed successfully',
        'classroom': classroom.to_dict()
    }), 200


# ===== Bulk Actions =====

@bp.route('/codes/bulk-delete', methods=['POST'])
@jwt_required()
def bulk_delete_codes():
    """Delete multiple codes at once"""
    error = admin_required()
    if error:
        return error

    data = request.get_json()
    class_code_ids = data.get('class_code_ids', [])
    teacher_code_ids = data.get('teacher_code_ids', [])

    deleted_count = 0

    # Delete class codes
    if class_code_ids:
        ClassCode.query.filter(ClassCode.id.in_(class_code_ids)).delete(synchronize_session=False)
        deleted_count += len(class_code_ids)

    # Delete teacher codes
    if teacher_code_ids:
        TeacherCode.query.filter(TeacherCode.id.in_(teacher_code_ids)).delete(synchronize_session=False)
        deleted_count += len(teacher_code_ids)

    db.session.commit()

    return jsonify({
        'message': f'{deleted_count} codes deleted',
        'count': deleted_count
    }), 200


@bp.route('/codes/bulk-deactivate', methods=['POST'])
@jwt_required()
def bulk_deactivate_codes():
    """Deactivate multiple codes at once"""
    error = admin_required()
    if error:
        return error

    data = request.get_json()
    class_code_ids = data.get('class_code_ids', [])
    teacher_code_ids = data.get('teacher_code_ids', [])

    deactivated_count = 0

    # Deactivate class codes
    if class_code_ids:
        codes = ClassCode.query.filter(ClassCode.id.in_(class_code_ids)).all()
        for code in codes:
            code.is_active = False
            code.deactivated_at = datetime.utcnow()
        deactivated_count += len(codes)

    # Deactivate teacher codes
    if teacher_code_ids:
        codes = TeacherCode.query.filter(TeacherCode.id.in_(teacher_code_ids)).all()
        for code in codes:
            code.is_active = False
            code.deactivated_at = datetime.utcnow()
        deactivated_count += len(codes)

    db.session.commit()

    return jsonify({
        'message': f'{deactivated_count} codes deactivated',
        'count': deactivated_count
    }), 200


@bp.route('/users/bulk-delete', methods=['POST'])
@jwt_required()
def bulk_delete_users():
    """Delete multiple users at once"""
    error = admin_required()
    if error:
        return error

    data = request.get_json()
    user_ids = data.get('user_ids', [])

    if not user_ids:
        return jsonify({'error': 'No user IDs provided'}), 400

    # Don't allow deleting admins
    users = User.query.filter(User.id.in_(user_ids), User.role != 'admin').all()
    deleted_count = len(users)

    for user in users:
        db.session.delete(user)

    db.session.commit()

    return jsonify({
        'message': f'{deleted_count} users deleted',
        'count': deleted_count
    }), 200


# ===== Export Endpoints =====

@bp.route('/classroom/<int:classroom_id>/export/excel', methods=['GET'])
@jwt_required()
def export_classroom_excel(classroom_id):
    """Export classroom progress to Excel (admin access)"""
    error = admin_required()
    if error:
        return error

    classroom = Classroom.query.get(classroom_id)
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404

    # Generate Excel file
    file_path = ExportService.export_classroom_to_excel(classroom_id)

    return send_file(file_path, as_attachment=True, download_name=f'classroom_{classroom_id}_progress.xlsx')


@bp.route('/student/<int:student_id>/export/pdf', methods=['GET'])
@jwt_required()
def export_student_pdf(student_id):
    """Export student detail report to PDF (admin access)"""
    error = admin_required()
    if error:
        return error

    student = User.query.get(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    # Generate PDF file
    file_path = ExportService.export_student_to_pdf(student_id)

    return send_file(file_path, as_attachment=True, download_name=f'student_{student_id}_report.pdf')


@bp.route('/student/<int:student_id>/export/excel', methods=['GET'])
@jwt_required()
def export_student_excel(student_id):
    """Export student progress matrix to Excel (admin access)"""
    error = admin_required()
    if error:
        return error

    student = User.query.get(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    # Generate Excel file with student progress matrix
    file_path = ExportService.export_student_to_excel(student_id)

    return send_file(file_path, as_attachment=True, download_name=f'student_{student_id}_progress.xlsx')
