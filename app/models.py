from app import db
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, TextAreaField, DateTimeField, IntegerField, BooleanField
from wtforms.validators import DataRequired, Length
import json
import datetime


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

    def __repr__(self):
        return '<User %r>' % self.username

    def __json__(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email
        }

    def check_password(self, password):
        return self.password == password

    def is_active(self):
        return True

    def is_authenticated(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        return self.id


class Module(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('modules', lazy=True))

    def __json__(self):
        return json.dumps({
            'id': self.id,
            'name': self.name
        })

    def check_exist(self, name):
        return self.name == name


class Item(db.Model):
    # api list item
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(80), nullable=False)
    description = db.Column(db.String(120), nullable=False)
    date = db.Column(db.DateTime, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'),
                        nullable=False)
    user = db.relationship('User',
                           backref=db.backref('items', lazy=True))
    completed = db.Column(db.Boolean, nullable=False)
    completed_date = db.Column(db.DateTime)
    module_id = db.Column(db.Integer, db.ForeignKey('module.id'),
                          nullable=False)
    module = db.relationship('Module', backref=db.backref('items', lazy=True))

    def __json__(self):
        return json.dumps({
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'date': datetime.datetime.strftime(self.date, '%Y-%m-%d %H:%M:%S'),
            'module_id': self.module_id,
            'module_name': Module.query.filter_by(id=self.module_id).first().name,
            'completed': self.completed,
            'completed_date': datetime.datetime.strftime(self.completed_date,
                                                         '%Y-%m-%d %H:%M:%S') if self.completed_date else None
        })
