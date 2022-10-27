from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, TextAreaField, DateTimeField, IntegerField, BooleanField
from wtforms.validators import DataRequired, Length, Email, Regexp, ValidationError
from app.models import User, Item


class LoginForm(FlaskForm):
    username = StringField('username', validators=[DataRequired(), Length(1, 64)])
    password = StringField('password', validators=[DataRequired(), Length(1, 64)])
    submit = SubmitField('Log In')


class RegisterForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(1, 64)])
    password = StringField('Password', validators=[DataRequired(), Length(1, 64)])
    email = StringField('Email', validators=[DataRequired(), Length(1, 64), Email()])
    submit = SubmitField('Register')

    def validate_username(self, field):
        if User.query.filter_by(username=field.data).first():
            raise ValidationError('Username already in use.')

    def validate_email(self, field):
        if User.query.filter_by(email=field.data).first():
            raise ValidationError('Email already registered.')
