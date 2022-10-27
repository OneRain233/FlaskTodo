from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, TextAreaField, DateTimeField, IntegerField, BooleanField
from wtforms.validators import DataRequired, Length, Email, Regexp, ValidationError
from app.models import User, Item


class ItemForm(FlaskForm):
    title = StringField('title', validators=[DataRequired()])
    description = StringField('description', validators=[DataRequired()])
    date = StringField('date', validators=[DataRequired()])
    module_id = IntegerField('module_id', validators=[DataRequired()])
    submit = SubmitField('Submit')


class EditForm(FlaskForm):
    id = IntegerField('id', validators=[DataRequired()])
    title = StringField('title', validators=[DataRequired()])
    description = StringField('description', validators=[DataRequired()])
    date = StringField('date', validators=[DataRequired()])
    submit = SubmitField('Submit')


class ModuleForm(FlaskForm):
    # id = IntegerField('id', validators=[DataRequired()])
    name = StringField("name", validators=[DataRequired()])
    submit = SubmitField("Submit")
