from app import db
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, TextAreaField, DateTimeField, IntegerField, BooleanField
from wtforms.validators import DataRequired, Length
import json
import datetime


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    def __repr__(self):
        return '<User %r>' % self.username


class Item(db.Model):
    # api list item
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(80), nullable=False)
    description = db.Column(db.String(120), nullable=False)
    date = db.Column(db.DateTime, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'),
                        nullable=False)
    user = db.relationship('User',
                           backref=db.backref('items', lazy=True))
    completed = db.Column(db.Boolean, nullable=False)
    completed_date = db.Column(db.DateTime)

    def __json__(self):
        return json.dumps({
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'date': datetime.datetime.strftime(self.date, '%Y-%m-%d %H:%M:%S'),
            'user_id': self.user_id,
            'completed': self.completed,
            'completed_date': datetime.datetime.strftime(self.completed_date,
                                                         '%Y-%m-%d %H:%M:%S') if self.completed_date else None
        })


class ItemForm(FlaskForm):
    title = StringField('Title', validators=[DataRequired()])
    description = StringField('Description', validators=[DataRequired()])
    date = DateTimeField('Date', validators=[DataRequired()])
    user_id = IntegerField('User ID', validators=[DataRequired()])
    completed = BooleanField('Completed', validators=[DataRequired()])
    completed_date = DateTimeField('Completed Date', validators=[DataRequired()])
    submit = SubmitField('Submit')
