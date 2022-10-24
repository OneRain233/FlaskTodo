from flask import request
from app.api import api
from app.models import Item
import datetime
from app import db
import json


def debug_init():
    from app.models import User, Item
    db.create_all()
    item_1 = Item(title='item 1', description='item 1 description',
                  date=datetime.datetime.now(), user_id=1, completed=False,
                  completed_date=None)
    item_2 = Item(title='item 2', description='item 2 description',
                  date=datetime.datetime.now(), user_id=1, completed=False,
                  completed_date=None)
    item_3 = Item(title='item 3', description='item 3 description',
                  date=datetime.datetime.now(), user_id=1, completed=False,
                  completed_date=None)

    db.session.add(item_1)
    db.session.add(item_2)
    db.session.add(item_3)
    db.session.commit()


@api.route('/')
def hello_world():  # put application's code here
    debug_init()
    return 'Hello World!'


@api.route('/todo', methods=['GET', 'POST'])
def todo():
    if request.method == 'GET':
        items = Item.query.all()
        return json.dumps({
            'status': 'success',
            'message': 'item pulled',
            'items': [item.__json__() for item in items]})
    elif request.method == 'POST':
        if_complete = request.form.get('completed')
        order = request.form.get('order')

        if if_complete == 'true':
            items = Item.query.filter_by(completed=True).all()
        elif if_complete == 'false':
            items = Item.query.filter_by(completed=False).all()
        else:
            items = Item.query.all()

        if order == 'asc':
            items = sorted(items, key=lambda item: item.date)
        elif order == 'desc':
            items = sorted(items, key=lambda item: item.date, reverse=True)
        else:
            pass

        return json.dumps({
            'status': 'success',
            'message': 'item pulled',
            'items': [item.__json__() for item in items]})
    else:
        # return {'error': 'Method not allowed'}, 405
        # return json.dumps({'error': 'Method not allowed'}), 405
        return {
                   'status': 'error',
                   'message': 'Method not allowed'
               }, 405


@api.route('/todo/<int:id>')
def todo_id(item_id):
    item = Item.query.get(item_id)
    return item.__json__()


@api.route('/add', methods=['POST'])
def add():
    title = request.form['title']
    description = request.form['description']
    date = request.form['date']
    try:
        date = datetime.datetime.strptime(date, '%Y-%m-%d %H:%M')
    except ValueError:
        return {
                   'status': 'error',
                   'message': 'date format error'
               }, 400
    user_id = 1
    completed = False
    completed_date = None
    item = Item(title=title, description=description, date=date,
                user_id=user_id, completed=completed,
                completed_date=completed_date)
    try:
        db.session.add(item)
        db.session.commit()
        return {
                   'status': 'success',
                   'message': 'item added'
               }, 201
    except Exception as e:
        return {
                   'status': 'error',
                   'message': str(e)
               }, 400


@api.route('/delete', methods=["POST"])
def delete():
    item_id = request.form.get("id")
    item = Item.query.filter_by(id=item_id).first()
    db.session.delete(item)
    db.session.commit()
    return json.dumps({
        'status': 'success',
        'message': 'item deleted'
    })
    # return 'delete'


@api.route('/update', methods=['POST'])
def update():
    item_id = request.form['id']
    item = Item.query.filter_by(id=item_id).first()
    if item is None:
        return json.dumps({
            'status': 'error',
            'message': 'item not found'
        })
    item.title = request.form['title']
    item.description = request.form['description']
    item.date = datetime.datetime.now()

    db.session.commit()
    return json.dumps({
        'status': 'success',
        'message': 'item updated'
    })


@api.route('/complete', methods=['POST'])
def complete():
    item_id = request.form['id']
    item = Item.query.filter_by(id=item_id).first()
    if item is None:
        return json.dumps({
            'status': 'error',
            'message': 'item not found'
        })
    if item.completed:
        item.completed = False
        item.completed_date = None
        db.session.commit()
        return json.dumps({
            'status': 'success',
            "message": "item set to incomplete"
        })
    else:
        item.completed = True
        item.completed_date = datetime.datetime.now()
        db.session.commit()
        return json.dumps({
            "status": "success",
            "message": "item set to completed"
        })


@api.route('/incomplete')
def incomplete():
    item_id = request.args.get('id')
    item = Item.query.filter_by(id=item_id).first()
    if item is None:
        return json.dumps({
            'status': 'error',
            'message': 'item not found'
        })
    item.completed = False
    item.completed_date = None
    db.session.commit()
    return json.dumps({
        'status': 'success',
        'message': 'item marked as incomplete'
    })


@api.route('/statistics')
def statistics():
    total = Item.query.count()
    completed = Item.query.filter_by(completed=True).count()
    incomplete1 = Item.query.filter_by(completed=False).count()
    return json.dumps({
        'status': 'success',
        'message': 'statistics pulled',
        'data': {
            'total': total,
            'completed': completed,
            'incomplete': incomplete1
        }

    })


@api.route('/recent')
def recent():
    items = Item.query.order_by(Item.date.desc()).limit(1).all()
    return json.dumps({
        'status': 'success',
        'message': 'recent items pulled',
        'items': [item.__json__() for item in items]
    })


@api.route("/edit", methods=["POST"])
def edit():
    item_id = request.form.get("id")
    item = Item.query.filter_by(id=item_id).first()
    item.title = request.form.get("title")
    item.description = request.form.get("description")
    date = request.form.get("date")
    try:
        date = datetime.datetime.strptime(date, '%Y-%m-%d %H:%M')
    except ValueError:
        return {
                   'status': 'error',
                   'message': 'date format error'
               }, 400
    item.date = date
    db.session.commit()
    return json.dumps({
        'status': 'success',
        'message': 'item updated'
    })
