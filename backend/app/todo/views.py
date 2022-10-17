from app.todo import todo
from flask import render_template, url_for, redirect, request, flash


@todo.route('/', methods=['GET'])
def index():
    return render_template('todo.html')
