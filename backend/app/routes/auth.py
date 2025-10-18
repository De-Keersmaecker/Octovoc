from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.code import ClassCode, TeacherCode
from app.models.classroom import Classroom
from app.utils.email import send_password_reset_email
from datetime import datetime, timedelta
import secrets

bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@bp.route('/register', methods=['POST'])
def register():
    """Register a new user (student or teacher)"""
    data = request.get_json()

    email = data.get('email', '').strip().lower()
    password = data.get('password')
    code = data.get('code', '').strip().upper()  # Can be class code or teacher code

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    # Check if user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 400

    # Determine role based on code
    role = 'student'
    class_code = None
    teacher_code = None
    classroom_id = None

    if code:
        # Check if it's a teacher code
        tc = TeacherCode.query.filter_by(code=code, is_active=True).first()
        if tc:
            role = 'teacher'
            teacher_code = code
        else:
            # Check if it's a class code
            cc = ClassCode.query.filter_by(code=code, is_active=True).first()
            if cc:
                role = 'student'
                class_code = code
                if cc.classroom_id:
                    classroom_id = cc.classroom_id

    # Create user
    user = User(
        email=email,
        role=role,
        class_code=class_code,
        teacher_code=teacher_code,
        classroom_id=classroom_id,
        is_active=True,
        is_verified=False,
        verification_token=secrets.token_urlsafe(32)
    )
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    # Create access token for immediate login
    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        'message': 'Registration successful. Please verify your email.',
        'token': access_token,
        'user': user.to_dict(),
        'verification_token': user.verification_token  # In production, send via email
    }), 201


@bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    data = request.get_json()

    email = data.get('email', '').strip().lower()
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401

    if not user.is_active:
        return jsonify({'error': 'Account is not active'}), 401

    # Update last activity
    user.last_activity = db.func.now()
    db.session.commit()

    # Create access token
    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        'token': access_token,
        'user': user.to_dict()
    }), 200


@bp.route('/verify/<token>', methods=['POST'])
def verify_email(token):
    """Verify email address"""
    user = User.query.filter_by(verification_token=token).first()

    if not user:
        return jsonify({'error': 'Invalid verification token'}), 400

    user.is_verified = True
    user.verification_token = None
    db.session.commit()

    return jsonify({'message': 'Email verified successfully'}), 200


@bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Request password reset"""
    print("=== FORGOT PASSWORD ENDPOINT CALLED ===")
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        print(f"Email received: {email}")

        if not email:
            return jsonify({'error': 'Email is required'}), 400

        print("Querying database for user...")
        user = User.query.filter_by(email=email).first()
        print(f"User found: {user is not None}")

        if user:
            print("Generating reset token...")
            user.reset_token = secrets.token_urlsafe(32)
            print("Committing to database...")
            db.session.commit()
            print("Commit successful")

            # Send reset email in background thread with timeout
            print(f"Sending email to: {user.email} with token: {user.reset_token}")

            # For now, just log the reset URL instead of sending email
            # This allows password reset to work while we debug email sending
            from flask import current_app
            frontend_url = current_app.config.get('FRONTEND_URL', 'https://www.octovoc.be')
            reset_url = f"{frontend_url}/reset-password?token={user.reset_token}"
            print(f"Reset URL (copy this to browser): {reset_url}")

            # TODO: Re-enable email sending once SMTP is debugged
            # try:
            #     email_sent = send_password_reset_email(user.email, user.reset_token)
            #     print(f"Email sent: {email_sent}")
            # except Exception as e:
            #     print(f"Email error: {str(e)}")

        print("Returning success response")
        # Always return success message (don't reveal if email exists)
        return jsonify({
            'message': 'Als dit e-mailadres bij ons bekend is, ontvang je een link om je wachtwoord te resetten.'
        }), 200

    except Exception as e:
        print(f"ERROR in forgot_password: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Er is een fout opgetreden. Probeer het later opnieuw.'}), 500


@bp.route('/reset-password/<token>', methods=['POST'])
def reset_password(token):
    """Reset password using token"""
    data = request.get_json()
    new_password = data.get('password')

    if not new_password:
        return jsonify({'error': 'Nieuw wachtwoord is verplicht'}), 400

    if len(new_password) < 6:
        return jsonify({'error': 'Wachtwoord moet minimaal 6 karakters bevatten'}), 400

    user = User.query.filter_by(reset_token=token).first()

    if not user:
        return jsonify({'error': 'Ongeldige of verlopen reset link'}), 400

    # TODO: Add expiry check after reset_token_expiry column is added
    # # Check if token has expired
    # if user.reset_token_expiry and user.reset_token_expiry < datetime.utcnow():
    #     # Token expired, clear it
    #     user.reset_token = None
    #     user.reset_token_expiry = None
    #     db.session.commit()
    #     return jsonify({'error': 'Deze reset link is verlopen. Vraag een nieuwe aan.'}), 400

    # Reset password
    user.set_password(new_password)
    user.reset_token = None
    # user.reset_token_expiry = None  # TODO: Uncomment after column is added
    db.session.commit()

    return jsonify({'message': 'Wachtwoord succesvol gereset. Je kunt nu inloggen met je nieuwe wachtwoord.'}), 200


@bp.route('/add-class-code', methods=['POST'])
@jwt_required()
def add_class_code():
    """Add class code to existing student account"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or user.role != 'student':
        return jsonify({'error': 'Invalid user'}), 400

    data = request.get_json()
    code = data.get('code', '').strip().upper()

    if not code:
        return jsonify({'error': 'Code is required'}), 400

    # Check if it's a class code first
    class_code = ClassCode.query.filter_by(code=code, is_active=True).first()

    if class_code:
        # It's a valid class code
        user.class_code = code
        if class_code.classroom_id:
            user.classroom_id = class_code.classroom_id

        db.session.commit()

        # Get classroom name
        classroom_name = None
        if class_code.classroom_id:
            classroom = Classroom.query.get(class_code.classroom_id)
            if classroom:
                classroom_name = classroom.name

        return jsonify({
            'message': 'Class code added successfully',
            'classroom_name': classroom_name,
            'user': user.to_dict()
        }), 200

    # Check if it's a teacher code
    teacher_code = TeacherCode.query.filter_by(code=code, is_active=True).first()

    if teacher_code:
        # It's a teacher code - upgrade the student to teacher role
        user.role = 'teacher'
        user.teacher_code = code
        user.class_code = None  # Clear class code when becoming teacher
        user.classroom_id = None  # Clear classroom when becoming teacher

        db.session.commit()

        return jsonify({
            'message': 'Je bent nu een leerkracht! Je hebt nu toegang tot alle leerkrachtfuncties.',
            'user': user.to_dict()
        }), 200

    # Code doesn't exist at all
    return jsonify({'error': 'Ongeldige of inactieve code'}), 400


@bp.route('/accept-gdpr', methods=['POST'])
@jwt_required()
def accept_gdpr():
    """Accept GDPR terms"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    user.gdpr_accepted = True
    user.gdpr_accepted_at = db.func.now()
    db.session.commit()

    return jsonify({'message': 'GDPR terms accepted'}), 200


@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user info"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify(user.to_dict()), 200
