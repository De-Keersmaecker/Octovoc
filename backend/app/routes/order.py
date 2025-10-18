from flask import Blueprint, request, jsonify, current_app
from app.utils.email import send_order_email

bp = Blueprint('order', __name__, url_prefix='/api/order')


@bp.route('/submit', methods=['POST'])
def submit_order():
    """Submit order form and send email to octovoc@katern.be"""
    try:
        data = request.get_json()

        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        school_name = data.get('schoolName', '').strip()
        num_classrooms = data.get('numClassrooms', '')
        num_students = data.get('numStudents', '')
        num_teacher_accounts = data.get('numTeacherAccounts', '')

        # Validate required fields
        if not all([name, email, school_name, num_classrooms, num_students, num_teacher_accounts]):
            return jsonify({'error': 'Alle velden zijn verplicht'}), 400

        # Validate numeric fields
        try:
            num_classrooms = int(num_classrooms)
            num_students = int(num_students)
            num_teacher_accounts = int(num_teacher_accounts)

            if num_classrooms < 1 or num_students < 1 or num_teacher_accounts < 1:
                return jsonify({'error': 'Aantal moet minimaal 1 zijn'}), 400
        except (ValueError, TypeError):
            return jsonify({'error': 'Ongeldige waarden voor aantal'}), 400

        # Send email
        send_order_email(
            name=name,
            email=email,
            school_name=school_name,
            num_classrooms=num_classrooms,
            num_students=num_students,
            num_teacher_accounts=num_teacher_accounts
        )

        return jsonify({'message': 'Bestelling verzonden'}), 200

    except Exception as e:
        print(f"Error in submit_order: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Er is een fout opgetreden. Probeer het later opnieuw.'}), 500
