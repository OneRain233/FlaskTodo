from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect
from flask_bootstrap import Bootstrap
from flask_login import LoginManager


# app = Flask(__name__)
# app.config.from_pyfile('config.py')
db = SQLAlchemy()
csrf = CSRFProtect()
migrate = Migrate()
bootstrap = Bootstrap()
login_manager = LoginManager()
# login_manager.session_protection = 'strong'
login_manager.login_view = 'todo.login'
login_manager.login_message = 'Please login to access this page.'
login_manager.login_message_category = 'info'


# user loader
@login_manager.user_loader
def load_user(user_id):
    from app.models import User
    return User.query.get(int(user_id))


def create_app():
    app = Flask(__name__)
    app.config.from_pyfile('config.py')
    db.init_app(app)
    csrf.init_app(app)
    migrate.init_app(app, db)
    bootstrap.init_app(app)
    login_manager.init_app(app)
    from app.api import api as api_blueprint
    app.register_blueprint(api_blueprint, url_prefix='/api')

    from app.todo import todo as todo_blueprint
    app.register_blueprint(todo_blueprint, url_prefix='/')

    with app.app_context():
        db.create_all()

    return app
