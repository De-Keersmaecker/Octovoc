from app import create_app, db
from app.services.module_service import ModuleService

app = create_app()

with app.app_context():
    try:
        module = ModuleService.create_module_from_excel(
            '/home/jelledekeersmaecker/dev/projects/octovoc/voorbeeld.xlsx',
            name='Test Module',
            difficulty='Beginner',
            is_free=True
        )
        print(f"Success! Module created: {module.name}")
        print(f"Words: {module.words.count()}")
        print(f"Batteries: {module.batteries.count()}")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
