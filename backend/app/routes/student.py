from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.module import Module, Word, Battery, DifficultWord
from app.models.progress import StudentProgress, BatteryProgress, QuestionProgress
from app.models.quote import Quote
from datetime import datetime
import random

bp = Blueprint('student', __name__, url_prefix='/api/student')


@bp.route('/allowed-levels', methods=['GET'])
@jwt_required(optional=True)
def get_allowed_levels():
    """Get levels available for the current user"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id) if user_id else None

    # Default: all levels
    allowed_levels = [1, 2, 3, 4, 5, 6]

    if user and user.classroom_id:
        # Student with classroom: get classroom's allowed levels
        from app.models.classroom import Classroom
        classroom = Classroom.query.get(user.classroom_id)
        if classroom and classroom.allowed_levels:
            allowed_levels = classroom.allowed_levels

    return jsonify({'allowed_levels': allowed_levels}), 200


@bp.route('/modules/debug', methods=['GET'])
def debug_modules():
    """Debug endpoint to check module status"""
    total_modules = Module.query.count()
    active_modules = Module.query.filter_by(is_active=True).count()
    modules_by_level = {}
    for level in range(1, 7):
        count = Module.query.filter_by(is_active=True, level=level).count()
        modules_by_level[f'level_{level}'] = count

    return jsonify({
        'total_modules': total_modules,
        'active_modules': active_modules,
        'modules_by_level': modules_by_level,
        'sample_modules': [m.to_dict() for m in Module.query.limit(3).all()]
    }), 200


@bp.route('/modules', methods=['GET'])
@jwt_required(optional=True)
def get_modules():
    """Get available modules for student, optionally filtered by level"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id) if user_id else None
        level = request.args.get('level', type=int)  # Optional level filter

        # Determine which levels to show
        allowed_levels = [1, 2, 3, 4, 5, 6]  # Default: all levels

        if user and user.classroom_id:
            # Student with classroom: filter by classroom's allowed levels
            from app.models.classroom import Classroom
            classroom = Classroom.query.get(user.classroom_id)
            if classroom and classroom.allowed_levels:
                allowed_levels = classroom.allowed_levels

        # Build query
        query = Module.query.filter_by(is_active=True)

        # Filter by level if specified
        if level:
            query = query.filter_by(level=level)
        else:
            # Filter by allowed levels
            query = query.filter(Module.level.in_(allowed_levels))

        modules = query.order_by(Module.display_order, Module.id).all()

        # Get progress for each module
        result = []
        for module in modules:
            try:
                module_data = module.to_dict()

                if user_id:
                    progress = StudentProgress.query.filter_by(
                        user_id=user_id,
                        module_id=module.id
                    ).first()

                    if progress:
                        module_data['progress'] = progress.to_dict()
                        # Calculate completion percentage
                        total_batteries = len(progress.battery_order) if progress.battery_order else 0
                        completed = len(progress.completed_batteries) if progress.completed_batteries else 0
                        module_data['completion_percentage'] = (completed / total_batteries * 100) if total_batteries > 0 else 0

                result.append(module_data)
            except Exception as e:
                print(f"Error processing module {module.id}: {str(e)}")
                continue

        return jsonify(result), 200
    except Exception as e:
        print(f"Error in get_modules: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/module/<int:module_id>/start', methods=['POST'])
@jwt_required(optional=True)
def start_module(module_id):
    """Start or resume a module"""
    user_id = get_jwt_identity()
    module = Module.query.get(module_id)

    if not module or not module.is_active:
        return jsonify({'error': 'Module not found'}), 404

    # For anonymous users with free modules, return basic module info
    if not user_id:
        if not module.is_free:
            return jsonify({'error': 'Authentication required for this module'}), 401

        # Return batteries for anonymous users
        batteries = Battery.query.filter_by(module_id=module_id).all()
        battery_ids = [b.id for b in batteries]
        random.shuffle(battery_ids)

        return jsonify({
            'anonymous': True,
            'module_id': module_id,
            'current_battery_id': battery_ids[0] if battery_ids else None,
            'battery_order': battery_ids,
            'current_phase': 1
        }), 200

    # Authenticated user flow
    user = User.query.get(user_id)

    # Check access
    if not module.is_free and not user.class_code:
        return jsonify({'error': 'Access denied. Class code required.'}), 403

    # Check if progress already exists
    progress = StudentProgress.query.filter_by(
        user_id=user_id,
        module_id=module_id
    ).first()

    if not progress:
        # Create new progress
        batteries = Battery.query.filter_by(module_id=module_id).all()
        battery_ids = [b.id for b in batteries]
        random.shuffle(battery_ids)  # Randomize battery order

        progress = StudentProgress(
            user_id=user_id,
            module_id=module_id,
            current_battery_id=battery_ids[0] if battery_ids else None,
            current_phase=1,
            battery_order=battery_ids,
            completed_batteries=[],
            in_final_round=False,
            final_round_word_ids=[]
        )
        db.session.add(progress)
        db.session.commit()

    return jsonify(progress.to_dict()), 200


@bp.route('/battery/<int:battery_id>/start', methods=['POST'])
@jwt_required(optional=True)
def start_battery(battery_id):
    """Start or resume a battery"""
    user_id = get_jwt_identity()
    battery = Battery.query.get(battery_id)

    if not battery:
        return jsonify({'error': 'Battery not found'}), 404

    # Anonymous user flow - just return battery words
    if not user_id:
        # Check if module is free
        module = Module.query.get(battery.module_id)
        if not module or not module.is_free:
            return jsonify({'error': 'Authentication required'}), 401

        # Get all words in battery
        battery_words = Word.query.filter(Word.id.in_(battery.word_ids)).all()
        word_ids_shuffled = battery.word_ids.copy()
        random.shuffle(word_ids_shuffled)

        first_word = Word.query.get(word_ids_shuffled[0])

        return jsonify({
            'anonymous': True,
            'battery_progress': {
                'id': None,
                'battery_id': battery_id,
                'current_phase': 1,
                'current_question_queue': word_ids_shuffled
            },
            'current_word': first_word.to_dict(),
            'battery_words': [w.to_dict() for w in battery_words],
            'phase': 1
        }), 200

    # Authenticated user flow
    # Get or create battery progress
    student_progress = StudentProgress.query.filter_by(
        user_id=user_id,
        module_id=battery.module_id
    ).first()

    if not student_progress:
        return jsonify({'error': 'Module progress not found'}), 404

    battery_progress = BatteryProgress.query.filter_by(
        student_progress_id=student_progress.id,
        battery_id=battery_id
    ).first()

    if not battery_progress:
        # Create new battery progress
        battery_progress = BatteryProgress(
            student_progress_id=student_progress.id,
            battery_id=battery_id,
            current_phase=1,
            current_question_queue=battery.word_ids.copy()
        )
        random.shuffle(battery_progress.current_question_queue)
        db.session.add(battery_progress)
        db.session.commit()

    # Get current question
    if battery_progress.current_question_queue:
        word_id = battery_progress.current_question_queue[0]
        word = Word.query.get(word_id)

        # Get all words in battery for answer options
        battery_words = Word.query.filter(Word.id.in_(battery.word_ids)).all()

        return jsonify({
            'battery_progress': battery_progress.to_dict(),
            'current_word': word.to_dict(),
            'battery_words': [w.to_dict() for w in battery_words],
            'phase': battery_progress.current_phase
        }), 200
    else:
        return jsonify({'error': 'No questions in queue'}), 400


@bp.route('/question/answer', methods=['POST'])
@jwt_required(optional=True)
def answer_question():
    """Submit answer to a question"""
    user_id = get_jwt_identity()
    data = request.get_json()
    word_id = data.get('word_id')
    user_answer = data.get('answer')
    phase = data.get('phase')

    word = Word.query.get(word_id)
    if not word:
        return jsonify({'error': 'Word not found'}), 404

    # Get module to check case sensitivity setting
    module = Module.query.get(word.module_id)
    case_sensitive = module.case_sensitive if module else False

    # Determine if answer is correct based on phase
    is_correct = False

    if phase == 1:
        # Phase 1: Match meaning
        if case_sensitive:
            is_correct = user_answer.strip() == word.meaning.strip()
        else:
            is_correct = user_answer.strip().lower() == word.meaning.strip().lower()
    elif phase == 2:
        # Phase 2: Match word
        if case_sensitive:
            is_correct = user_answer.strip() == word.word.strip()
        else:
            is_correct = user_answer.strip().lower() == word.word.strip().lower()
    elif phase == 3:
        # Phase 3: Type the word
        if case_sensitive:
            is_correct = user_answer == word.word
        else:
            is_correct = user_answer.lower() == word.word.lower()

    # Anonymous user - just check answer, no progress tracking
    if not user_id:
        return jsonify({
            'is_correct': is_correct,
            'correct_answer': word.word if phase in [2, 3] else word.meaning,
            'anonymous': True
        }), 200

    # Authenticated user - full progress tracking
    battery_progress_id = data.get('battery_progress_id')
    battery_progress = BatteryProgress.query.get(battery_progress_id)
    if not battery_progress:
        return jsonify({'error': 'Battery progress not found'}), 404

    # Record the attempt
    question_progress = QuestionProgress(
        battery_progress_id=battery_progress_id,
        word_id=word_id,
        phase=phase,
        user_answer=user_answer,
        is_correct=is_correct
    )
    db.session.add(question_progress)

    # Update question queue
    queue = battery_progress.current_question_queue.copy()
    if is_correct:
        # Remove from queue
        queue.remove(word_id)
    else:
        # Move to end of queue
        queue.remove(word_id)
        queue.append(word_id)

        # For phase 3, track wrong answers for final round
        if phase == 3:
            student_progress = battery_progress.student_progress
            final_words = student_progress.final_round_word_ids.copy()
            if word_id not in final_words:
                final_words.append(word_id)
                student_progress.final_round_word_ids = final_words
                db.session.add(student_progress)

            # Also add to difficult words immediately for practice
            existing_difficult = DifficultWord.query.filter_by(
                user_id=user_id,
                word_id=word_id
            ).first()

            if not existing_difficult:
                difficult_word = DifficultWord(
                    user_id=user_id,
                    word_id=word_id
                )
                db.session.add(difficult_word)

    battery_progress.current_question_queue = queue
    db.session.add(battery_progress)

    # Check if phase is complete (queue is empty BEFORE we refill it)
    phase_just_completed = False
    if not battery_progress.current_question_queue:
        phase_just_completed = True
        if phase == 1:
            battery_progress.phase1_completed = True
            battery_progress.current_phase = 2
            battery = Battery.query.get(battery_progress.battery_id)
            battery_progress.current_question_queue = battery.word_ids.copy()
            random.shuffle(battery_progress.current_question_queue)
        elif phase == 2:
            battery_progress.phase2_completed = True
            battery_progress.current_phase = 3
            battery = Battery.query.get(battery_progress.battery_id)
            battery_progress.current_question_queue = battery.word_ids.copy()
            random.shuffle(battery_progress.current_question_queue)
        elif phase == 3:
            battery_progress.phase3_completed = True
            battery_progress.is_completed = True
            battery_progress.completed_at = datetime.utcnow()

            # Mark battery as complete in student progress
            student_progress = battery_progress.student_progress
            completed = student_progress.completed_batteries.copy()
            if battery_progress.battery_id not in completed:
                completed.append(battery_progress.battery_id)
                student_progress.completed_batteries = completed

                # Move to next battery if available
                current_index = student_progress.battery_order.index(battery_progress.battery_id)
                if current_index + 1 < len(student_progress.battery_order):
                    # There's a next battery
                    student_progress.current_battery_id = student_progress.battery_order[current_index + 1]
                else:
                    # All batteries done
                    student_progress.current_battery_id = None

                db.session.add(student_progress)

            # Check if all batteries are complete
            if len(student_progress.completed_batteries) == len(student_progress.battery_order):
                # Start final round
                student_progress.in_final_round = True

    db.session.commit()

    # Get next question if available
    next_word = None
    if battery_progress.current_question_queue:
        next_word_id = battery_progress.current_question_queue[0]
        next_word = Word.query.get(next_word_id).to_dict()

    return jsonify({
        'is_correct': is_correct,
        'correct_answer': word.word if phase in [2, 3] else word.meaning,
        'battery_progress': battery_progress.to_dict(),
        'next_word': next_word,
        'phase_complete': phase_just_completed and phase < 3,
        'battery_complete': battery_progress.is_completed
    }), 200


@bp.route('/module/<int:module_id>/final-round/start', methods=['POST'])
@jwt_required()
def start_final_round(module_id):
    """Start final round for a module"""
    user_id = get_jwt_identity()

    student_progress = StudentProgress.query.filter_by(
        user_id=user_id,
        module_id=module_id
    ).first()

    if not student_progress or not student_progress.in_final_round:
        return jsonify({'error': 'Final round not available'}), 404

    # Get words for final round
    word_ids = student_progress.final_round_word_ids
    if not word_ids:
        # No mistakes, complete immediately
        student_progress.is_completed = True
        student_progress.completion_date = datetime.utcnow()
        db.session.commit()
        return jsonify({'message': 'No words in final round', 'completed': True}), 200

    # Shuffle the word order
    random.shuffle(word_ids)
    student_progress.final_round_word_ids = word_ids
    db.session.commit()

    # Get first word
    first_word = Word.query.get(word_ids[0])

    return jsonify({
        'current_word': first_word.to_dict(),
        'total_words': len(word_ids),
        'remaining': len(word_ids)
    }), 200


@bp.route('/module/<int:module_id>/final-round/answer', methods=['POST'])
@jwt_required()
def answer_final_round(module_id):
    """Submit answer for final round question"""
    user_id = get_jwt_identity()
    data = request.get_json()
    word_id = data.get('word_id')
    user_answer = data.get('answer')

    student_progress = StudentProgress.query.filter_by(
        user_id=user_id,
        module_id=module_id
    ).first()

    if not student_progress or not student_progress.in_final_round:
        return jsonify({'error': 'Final round not available'}), 404

    word = Word.query.get(word_id)
    if not word:
        return jsonify({'error': 'Word not found'}), 404

    # Get module to check case sensitivity setting
    module = Module.query.get(word.module_id)
    case_sensitive = module.case_sensitive if module else False

    # Check answer
    if case_sensitive:
        is_correct = user_answer == word.word
    else:
        is_correct = user_answer.lower() == word.word.lower()

    # Update word list
    word_ids = student_progress.final_round_word_ids.copy()

    if is_correct:
        # Remove from list
        word_ids.remove(word_id)
    else:
        # Move to end of list
        word_ids.remove(word_id)
        word_ids.append(word_id)

        # Add to difficult words if not already there
        existing_difficult = DifficultWord.query.filter_by(
            user_id=user_id,
            word_id=word_id
        ).first()

        if not existing_difficult:
            difficult_word = DifficultWord(
                user_id=user_id,
                word_id=word_id
            )
            db.session.add(difficult_word)

    student_progress.final_round_word_ids = word_ids
    db.session.add(student_progress)

    # Check if final round is complete
    if not word_ids:
        student_progress.is_completed = True
        student_progress.completion_date = datetime.utcnow()
        db.session.commit()

        return jsonify({
            'is_correct': is_correct,
            'correct_answer': word.word,
            'final_round_complete': True
        }), 200

    # Get next word
    next_word = Word.query.get(word_ids[0])

    db.session.commit()

    return jsonify({
        'is_correct': is_correct,
        'correct_answer': word.word,
        'next_word': next_word.to_dict(),
        'remaining': len(word_ids),
        'final_round_complete': False
    }), 200


@bp.route('/module/<int:module_id>/complete', methods=['POST'])
@jwt_required()
def complete_module(module_id):
    """Mark module as complete and get quote"""
    user_id = get_jwt_identity()

    student_progress = StudentProgress.query.filter_by(
        user_id=user_id,
        module_id=module_id
    ).first()

    if not student_progress:
        return jsonify({'error': 'Progress not found'}), 404

    student_progress.is_completed = True
    student_progress.completion_date = datetime.utcnow()
    db.session.commit()

    # Get random quote
    quote = Quote.get_random_quote()

    return jsonify({
        'message': 'Module completed!',
        'quote': quote.to_dict() if quote else None,
        'progress': student_progress.to_dict()
    }), 200


@bp.route('/difficult-words', methods=['GET'])
@jwt_required()
def get_difficult_words():
    """Get student's difficult words module"""
    user_id = get_jwt_identity()

    difficult_words = DifficultWord.query.filter_by(user_id=user_id).all()

    return jsonify([dw.to_dict() for dw in difficult_words]), 200


@bp.route('/difficult-words/<int:word_id>', methods=['DELETE'])
@jwt_required()
def remove_difficult_word(word_id):
    """Remove word from difficult words"""
    user_id = get_jwt_identity()

    difficult_word = DifficultWord.query.filter_by(
        user_id=user_id,
        word_id=word_id
    ).first()

    if not difficult_word:
        return jsonify({'error': 'Word not found in difficult words'}), 404

    db.session.delete(difficult_word)
    db.session.commit()

    return jsonify({'message': 'Word removed from difficult words'}), 200


@bp.route('/quote/random', methods=['GET'])
def get_random_quote():
    """Get a random quote - available for anonymous users"""
    quote = Quote.get_random_quote()

    if quote:
        return jsonify({'quote': quote.to_dict()}), 200
    else:
        return jsonify({'quote': None}), 200


@bp.route('/quotes', methods=['GET'])
def get_all_quotes():
    """Get all quotes - available for anonymous users"""
    quotes = Quote.query.filter_by(is_active=True).all()
    return jsonify({'quotes': [q.to_dict() for q in quotes]}), 200
