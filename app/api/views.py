from flask import request
from app.api import api
from app.models import Item, User, Module
import datetime
from app import db
import json
import hashlib
from flask_login import login_required, current_user
from .form import ItemForm, EditForm, ModuleForm


def debug_init():
    from app.models import User, Item
    db.create_all()
    user_1 = User(username='user1',
                  password=hashlib.sha256('password'.encode('utf-8')).hexdigest(),
                  email="localhost@localhost")
    item_1 = Item(title='item 1', description='item 1 description',
                  date=datetime.datetime.now(), user_id=1, completed=False,
                  completed_date=None)
    item_2 = Item(title='item 2', description='item 2 description',
                  date=datetime.datetime.now(), user_id=1, completed=False,
                  completed_date=None)
    item_3 = Item(title='item 3', description='item 3 description',
                  date=datetime.datetime.now(), user_id=1, completed=False,
                  completed_date=None)
    db.session.add(user_1)
    db.session.add(item_1)
    db.session.add(item_2)
    db.session.add(item_3)
    db.session.commit()


@api.route('/')
@login_required
def hello_world():  # put application's code here
    debug_init()
    return 'Hello World!'


@api.route('/todo', methods=['GET', 'POST'])
@login_required
def todo():
    if request.method == 'GET':
        items = Item.query.filter_by(user_id=current_user.id).all()
        # items = Item.query.all()
        return json.dumps({
            'status': 'success',
            'message': 'item pulled',
            'items': [item.__json__() for item in items]})
    elif request.method == 'POST':
        if_complete = request.form.get('completed')
        order = request.form.get('order')
        item_module_id = request.form.get('module_id')

        if if_complete == 'true':
            items = Item.query.filter_by(completed=True, user_id=current_user.id).all()
        elif if_complete == 'false':
            items = Item.query.filter_by(completed=False, user_id=current_user.id).all()
        else:
            items = Item.query.filter_by(user_id=current_user.id).all()

        if order == 'asc':
            items = sorted(items, key=lambda item: item.date)
        elif order == 'desc':
            items = sorted(items, key=lambda item: item.date, reverse=True)
        else:
            pass

        if item_module_id is not None:
            items = [item for item in items if item.module_id == item_module_id]

        return json.dumps({
            'status': 'success',
            'message': 'item pulled',
            'items': [item.__json__() for item in items]})
    else:
        # return {'error': 'Method not allowed'}, 405
        # return json.dumps({'error': 'Method not allowed'}), 405
        return json.dumps({
            'status': 'error',
            'message': 'Method not allowed'
        })


@api.route('/todo/<int:item_id>')
@login_required
def todo_id(item_id):
    item = Item.query.filter_by(id=item_id, user_id=current_user.id).first()
    return json.dumps({
        'status': 'success',
        'message': 'item pulled',
        'item': item.__json__()})


@api.route('/add', methods=['POST'])
@login_required
def add():
    form = ItemForm()
    if form.validate_on_submit():
        title = form.title.data
        description = form.description.data
        date = form.date.data
        module_id = form.module_id.data
        try:
            date = datetime.datetime.strptime(date, '%Y-%m-%d %H:%M')
        except ValueError:
            return {
                'status': 'error',
                'message': 'Date format error',
                'date': date
            }
        if Module.query.filter_by(name=module_id).first() is None:
            # CREATE A NEW MODULE
            module = Module(name=module_id, user_id=current_user.id)
            db.session.add(module)
            db.session.commit()
            module_id = module.id
        else:
            module_id = Module.query.filter_by(name=module_id).first().id
        item = Item(title=title, description=description, date=date, user_id=current_user.id,
                    module_id=module_id)
        item.completed = False
        item.completed_date = None
        try:
            db.session.add(item)
            db.session.commit()
        except Exception as e:
            return json.dumps({
                'status': 'error',
                'message': 'Database error'
            })
        return json.dumps({
            'status': 'success',
            'message': 'item added'
        })
    else:
        return json.dumps({
            'status': 'error',
            'message': 'Form validation error'
        })


@api.route('/delete', methods=["POST"])
@login_required
def delete():
    item_id = request.form.get("id")
    item = Item.query.filter_by(id=item_id, user_id=current_user.id).first()
    module = Module.query.filter_by(id=item.module_id).first()
    module_id = module.id

    db.session.delete(item)
    db.session.commit()

    items = Item.query.filter_by(module_id=module_id).all()
    if len(items) == 0:
        db.session.delete(module)
        db.session.commit()

    return json.dumps({
        'status': 'success',
        'message': 'item deleted'
    })
    # return 'delete'


@api.route('/update', methods=['POST'])
@login_required
def update():
    item_id = request.form['id']
    item = Item.query.filter_by(id=item_id, user_id=current_user.id).first()
    if item is None:
        return json.dumps({
            'status': 'error',
            'message': 'Item not found'
        })
    item.title = request.form['title']
    item.description = request.form['description']
    item.date = datetime.datetime.now()

    db.session.commit()
    return json.dumps({
        'status': 'success',
        'message': 'Item updated'
    })


@api.route('/complete', methods=['POST'])
@login_required
def complete():
    item_id = request.form['id']
    item = Item.query.filter_by(id=item_id, user_id=current_user.id).first()
    if item is None:
        return json.dumps({
            'status': 'error',
            'message': 'Item not found'
        })
    if item.completed:
        item.completed = False
        item.completed_date = None
        db.session.commit()
        return json.dumps({
            'status': 'success',
            "message": "Item set to incomplete"
        })
    else:
        item.completed = True
        item.completed_date = datetime.datetime.now()
        db.session.commit()
        return json.dumps({
            "status": "success",
            "message": "Item set to completed"
        })


@api.route('/statistics')
@login_required
def statistics():
    total = Item.query.filter_by(user_id=current_user.id).count()
    completed = Item.query.filter_by(completed=True, user_id=current_user.id).count()
    incomplete1 = Item.query.filter_by(completed=False, user_id=current_user.id).count()
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
@login_required
def recent():
    items = Item.query.filter_by(user_id=current_user.id).order_by(Item.date.desc()).limit(1).all()
    return json.dumps({
        'status': 'success',
        'message': 'recent items pulled',
        'items': [item.__json__() for item in items]
    })


@api.route("/edit", methods=["POST"])
@login_required
def edit():
    form = EditForm()
    if form.validate_on_submit():
        item_id = form.id.data
        title = form.title.data
        description = form.description.data
        date = form.date.data
        module_name = form.module_id.data
        try:
            date = datetime.datetime.strptime(date, '%Y-%m-%d %H:%M')
        except ValueError:
            return json.dumps({
                'status': 'error',
                'message': 'Date format error',
            })
        module = Module.query.filter_by(name=module_name).first()
        if module is None:
            module = Module(name=module_name, user_id=current_user.id)
            db.session.add(module)
            db.session.commit()
            module_id = module.id
        else:
            module_id = module.id
        item = Item.query.filter_by(id=item_id, user_id=current_user.id).first()
        item.title = title
        item.description = description
        item.date = date
        item.module_id = module_id
        db.session.commit()
        return json.dumps({
            'status': 'success',
            'message': 'Item edited'
        })
    else:
        return json.dumps({
            'status': 'error',
            'message': 'Form validation error'
        })


@api.route("/module", methods=["GET"])
@login_required
def get_modules():
    modules = Module.query.filter_by(user_id=current_user.id).all()
    return json.dumps({
        'status': 'success',
        'modules': [i.__json__() for i in modules]
    })


@api.route("/add_module", methods=['POST'])
@login_required
def add_module():
    form = ModuleForm()
    if form.validate_on_submit():
        name = form.name.data
        # check if module exists
        module = Module.query.filter_by(name=name, user_id=current_user.id).first()
        if module is not None:
            return json.dumps({
                'status': 'error',
                'message': 'Module already exists'
            })
        module = Module(name=name, user_id=current_user.id)
        try:
            db.session.add(module)
            db.session.commit()
        except Exception as e:
            return json.dumps({
                'status': 'error',
                'message': 'Database error'
            })
        return json.dumps({
            'status': 'success',
            'message': 'Module added'
        })
