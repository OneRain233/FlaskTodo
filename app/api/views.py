from flask import request
from app.api import api
from app.models import Item
import datetime


@api.route('/')
def hello_world():  # put application's code here
    return 'Hello World!'


@api.route('/todo', methods=['GET', 'POST'])
def todo():
    if request.method == 'GET':
        items = Item.query.all()
        return {'items': [item.__json__() for item in items]}
    elif request.method == 'POST':
        if_complete = request.form.get('completed')
        if if_complete == 'true':
            items = Item.query.filter_by(completed=True).all()
        elif if_complete == 'false':
            items = Item.query.filter_by(completed=False).all()
        else:
            items = Item.query.all()
        return {'items': [item.__json__() for item in items]}
    else:
        return {'error': 'Method not allowed'}, 405


@api.route('/todo/<int:id>')
def todo_id(id):
    item = Item.query.get(id)
    return item.__json__()


@api.route('/add', methods=['POST'])
def add():
    title = request.form['title']
    description = request.form['description']
    date = datetime.datetime.now()
    user_id = 1
    completed = False
    completed_date = None
    item = Item(title=title, description=description, date=date,
                user_id=user_id, completed=completed,
                completed_date=completed_date)
    db.session.add(item)
    db.session.commit()
    return {
        'status': 'success',
        'message': 'item added'
    }


@api.route('/delete')
def delete():
    item_id = request.args.get('id')
    item = Item.query.filter_by(id=item_id).first()
    db.session.delete(item)
    db.session.commit()
    return {
        'status': 'success',
        'message': 'item deleted'
    }
    # return 'delete'


@api.route('/update', methods=['POST'])
def update():
    item_id = request.form['id']
    item = Item.query.filter_by(id=item_id).first()
    if item is None:
        return {
            'status': 'error',
            'message': 'item not found'
        }
    item.title = request.form['title']
    item.description = request.form['description']
    item.date = datetime.datetime.now()

    db.session.commit()
    return {
        'status': 'success',
        'message': 'item updated'
    }


@api.route('/complete', methods=['POST'])
def complete():
    item_id = request.form['id']
    item = Item.query.filter_by(id=item_id).first()
    if item is None:
        return {
            'status': 'error',
            'message': 'item not found'
        }
    item.completed = True
    item.completed_date = datetime.datetime.now()
    db.session.commit()
    return {
        'status': 'success',
        'message': 'item completed'
    }


@api.route('/incomplete')
def incomplete():
    item_id = request.args.get('id')
    item = Item.query.filter_by(id=item_id).first()
    if item is None:
        return {
            'status': 'error',
            'message': 'item not found'
        }
    item.completed = False
    item.completed_date = None
    db.session.commit()
    return {
        'status': 'success',
        'message': 'item marked as incomplete'
    }
