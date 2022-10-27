import hashlib

from flask import render_template, url_for, redirect, flash
from flask_login import login_user, logout_user, login_required

from app import db
from app.models import User
from app.todo import todo
from .form import LoginForm, RegisterForm


@todo.route('/', methods=['GET'])
@login_required
def index():
    return render_template('todo.html')


@todo.route('/login', methods=['POST', 'GET'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        username = form.username.data
        password = form.password.data
        password = hashlib.sha256(password.encode('utf-8')).hexdigest()
        user = User.query.filter_by(username=username).first()
        if user is not None and user.check_password(password):
            login_user(user)
            return redirect(url_for('todo.index'))
        print('Invalid username or password.')

    return render_template('login.html', form=form)


@todo.route("/register", methods=['POST', 'GET'])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        username = form.username.data
        password = form.password.data
        email = form.email.data
        enc_password = hashlib.sha256(password.encode('utf-8')).hexdigest()
        user = User(username=username, password=enc_password, email=email)
        db.session.add(user)
        db.session.commit()
        return redirect(url_for('todo.login'))

    return render_template('register.html', form=form)


@todo.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('todo.login'))
