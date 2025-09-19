from phantomnet import create_app  # Adjust if your package name differs
from phantomnet.models import db
from phantomnet.app import _initialize_default_data  # Import the initialization function

def main():
    app = create_app()

    with app.app_context():
        print("Creating database tables...")
        db.create_all()
        print("Initializing default data...")
        _initialize_default_data()  # Call without arguments, matches definition in app.py
        print("Database initialization complete.")

if __name__ == '__main__':
    main()
