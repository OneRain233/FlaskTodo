from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect
from flask_bootstrap import Bootstrap

# app = Flask(__name__)
# app.config.from_pyfile('config.py')
db = SQLAlchemy()
csrf = CSRFProtect()
migrate = Migrate()
bootstrap = Bootstrap()

def create_app():
    app = Flask(__name__)
    app.config.from_pyfile('config.py')
    db.init_app(app)
    csrf.init_app(app)
    migrate.init_app(app, db)
    bootstrap.init_app(app)

    from app.api import api as api_blueprint
    app.register_blueprint(api_blueprint, url_prefix='/api')

    from app.todo import todo as todo_blueprint
    app.register_blueprint(todo_blueprint, url_prefix='/')

    return app