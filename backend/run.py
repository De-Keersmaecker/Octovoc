from app import create_app, db

app = create_app()

@app.route('/health')
def health_check():
    """Health check endpoint with database stats"""
    try:
        from app.models.module import Module
        from app.models.user import User
        module_count = Module.query.count()
        user_count = User.query.count()

        return {
            'status': 'ok',
            'message': 'App is running',
            'modules': module_count,
            'users': user_count,
            'database': 'connected'
        }, 200
    except Exception as e:
        return {
            'status': 'error',
            'message': str(e),
            'database': 'error'
        }, 500

@app.shell_context_processor
def make_shell_context():
    # Lazy import models to avoid blocking startup
    from app.models.user import User
    from app.models.module import Module, Word, Battery
    from app.models.progress import StudentProgress, BatteryProgress, QuestionProgress
    from app.models.code import ClassCode, TeacherCode
    from app.models.classroom import Classroom
    from app.models.quote import Quote

    return {
        'db': db,
        'User': User,
        'Module': Module,
        'Word': Word,
        'Battery': Battery,
        'StudentProgress': StudentProgress,
        'BatteryProgress': BatteryProgress,
        'QuestionProgress': QuestionProgress,
        'ClassCode': ClassCode,
        'TeacherCode': TeacherCode,
        'Classroom': Classroom,
        'Quote': Quote
    }

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
