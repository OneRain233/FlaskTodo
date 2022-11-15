function get_csrf_token() {
    console.log("get csrf token");
    return $("meta[name='csrf-token']").attr("content");
}

function update_statistic() {
    $.ajax({
        url: "/api/statistics", type: "get", success: function (data) {
            data = JSON.parse(data);
            $("#total-items").html(data.data.total);
            $("#completed-items").html(data.data.completed);
            $("#incomplete-items").html(data.data.incomplete);
        }
    });
}

function create_notice(message) {
    Toastify({
        text: message, duration: 3000, newWindow: true, close: true, gravity: "bottom", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "#f0f0f0", color: "black", border: "1px solid black",
        }, onClick: function () {
        } // Callback after click
    }).showToast();
}


function getModules() {
    let result = null;
    $.ajax({
        url: "/api/module", type: "get", async: false, success: function (data) {
            data = JSON.parse(data);
            if (data.status !== "success") {
                alert(data.message)
            } else {
                result = data.modules;
            }
        }
    });
    return result;

}


function add_module(name) {
    $.ajax({
        url: "/api/add_module", type: "post", data: {
            "name": name, "csrf_token": get_csrf_token()
        }, success: function (data) {
            data = JSON.parse(data);
            create_notice(data.message);
        }
    });

}


function getItems(flag, module = null) {
    // flag : 1=ALL 2=COMPLETED 3=NOT COMPLETED 4=BY MODULE
    var completed = null;
    if (flag === 2) {
        completed = true;
    } else if (flag === 3) {
        completed = false;
    }
    $("#todo_list").html("");
    $("#edit_form").html("");
    $("#add-form-placeholder").html("");
    $(".modal").remove();
    $.ajax({
        url: "/api/todo", type: "post", data: {
            "completed": completed, "order": "asc", "csrf_token": get_csrf_token()
        }, success: function (data) {
            console.log(data);
            data = JSON.parse(data);
            if (data.status !== "success") {
                alert(data.message);
            }
            var items = data.items;
            var html = "";
            let cnt = 0;
            for (var i = 0; i < items.length; i++) {
                var item = JSON.parse(items[i]);
                console.log(item);
                if (item.module_name !== module && module !== null) {
                    continue;
                }
                var new_element = document.createElement("li");
                var now_date = new Date();
                var item_date = new Date(item.date);
                var diff = item_date - now_date;
                var days = Math.floor(diff / (1000 * 60 * 60 * 24));
                var hours = Math.floor(diff / (1000 * 60 * 60));
                var minutes = Math.floor(diff / (1000 * 60));
                var seconds = Math.floor(diff / (1000));
                var time = "";
                if (days > 0) {
                    time = days + "<br/>" + " days";
                } else if (hours > 0) {
                    time = hours + "<br/>" + " hours";
                } else if (minutes > 0) {
                    time = minutes + "<br/>" + " minutes";
                } else if (seconds > 0) {
                    time = seconds + "<br/>" + " seconds";
                } else {
                    time = "<br>Expired";
                }
                //description
                var description = item.description;
                if (description.length > 20) {
                    description = description.substring(0, 10) + "...";
                }
                var title = item.title;
                if (title.length > 8) {
                    title = title.substring(0, 8) + "...";
                }
                // module
                var module_name = item.module_name;
                if (module_name.length > 8) {
                    module_name = module_name.substring(0, 8) + "...";
                }
                $("#todo_list").append(`
            <div class="eight wide mobile six wide tablet four wide computer column animate__animated animate__fadeIn" id="${item.id}">
                        <div class="ui fluid card">
                            <div class="todo-card content" id="${item.id}">
                                <div class="header" data-tooltip="${item.description}" data-variation="inverted" data-position="bottom center">${title}</div>
                                <h4 class="ui aligned header">Module: </h4>
                                <div class="meta">${module_name}</div>
                                <h4 class="ui aligned header">Description: </h4>
                                <div class="meta">${description}</div>
                                </br>
                                <strong><h2 class="ui header ${item.completed === true ? "green" : "red"}">
                             
                                <div class="description" data-tooltip="${item.date}" data-variation="inverted" data-position="top center" >${item.completed === true ? "<br>DONE" : time}</div>
                                </h2></strong>
                                

                            </div>
<!--                             <div class="ui container fluid">-->
                                <div class="ui three item borderless menu fluid">
                                    <div class="item">
                                      <button class="ui button fluid delete" id="${item.id}"><i class=" trash icon "></i></button>
                                    </div>
                                    <div class="item">
                                  <button class="ui button fluid edit  blue" id="${item.id}"><i class=" pencil icon "></i></button>
                                  </div>
                                  <div class="item">
                                  <button class="ui button fluid complete ${item.completed === true ? "olive" : "green"}" id="${item.id}">${item.completed === true ? "☒" : "☑"}</button>
                                  </div>
                                </div>
<!--                            </div>-->

                        </div>
            </div> `);
                cnt += 1;

            }
            if (cnt === 0) {
                create_notice("No items found");

            }

        }
    });
}


$('.ui.dropdown#filter')
    .dropdown({
        onChange: function (value, text, $selectedItem) {
            console.log(value);
            // console.log($selectedItem);
            if (value === "All") {
                getItems(1);
            } else if (value === "Completed") {
                getItems(2);
            } else if (value === "Uncompleted") {
                getItems(3);
            } else {
                getItems(4, value);
            }

        },
    });


$(".todo-sidebar-button").click(function () {
    $('.ui.sidebar')
        .sidebar("setting", "dimPage", false)
        .sidebar('toggle');
});


$(document).on("click", ".todo-card", function () {
    $(".ui.modal").html("");
    var id = $(this).attr("id");
    $.ajax({
        url: "/api/todo/" + id, type: "get", success: function (data) {
            data = JSON.parse(data);
            if (data.status !== "success") {
                create_notice(data.message);
            }
            var item = JSON.parse(data.item);

            $("#detail-placeholder").append(`
                <div class="ui modal tiny" id="details">
                        <div class="ui icon header">
                            <h2>Details</h2>
                        </div>
                        <div class="content">
            
                            <h3 class="ui header center align">Title: </h3>
                            <div class="meta">${item.title}</div>
                            <h3 class="ui header">Description: </h3>
                            <div class="meta">${item.description}</div>
                            <h3 class="ui header">Date: </h3>
                            <div class="meta">${item.date}</div>
                            <h3 class="ui header">Module: </h3>
                            <div class="meta">${item.module_name}</div>
                            <h3 class="ui header">Completed: </h3>
                            <div class="meta">${item.completed === true ? "Yes" : "No"}</div>
                            
                        </div>
            
                    </div>
            `);

            $(".ui.modal#details").modal("show");

        }
    })

})

$(document).on("click", "#add_module", function () {
    $(".modal").remove();
    $('.ui.sidebar')
        .sidebar("setting", "dimPage", false)
        .sidebar('toggle');
    $("#add-module-placeholder").append(`
        <div class="ui modal tiny add-module-form">
                <div class="ui icon header">
                    <h2>Add Module</h2>
                </div>
                <div class="content">
    
                    <div class="ui form">
                        <div class="field">
                            <label class="card-header" for="title">Title</label>
                            <input type="text" name="name" id="module-name" placeholder="Module Name">
                        </div>
                        <button class="ui button add-module-submit" type="submit">Submit</button>
                    </div>
                </div>
    
            </div>
    `)

    $(".ui.modal.add-module-form").modal("show");
});

$(document).on("click", "#statics", function () {
    $(".modal").remove();
    $('.ui.sidebar')
        .sidebar("setting", "dimPage", false)
        .sidebar('toggle');
    $.ajax({
        url: "/api/statistics", type: "get", success: function (data) {
            data = JSON.parse(data);
            $("#total-items").html();
            $("#completed-items").html(data.data.completed);
            $("#incomplete-items").html(data.data.incomplete);
            $("#statics-placeholder").append(`
                        <div class="ui modal tiny aligned center">
                            <div class="ui center aligned segment ">
                                  <div class="ui statistic">
                                    <div class="value" id="total-items">
                                      ${data.data.total}
                                    </div>
                                    <div class="label">
                                      Total Items
                                    </div>
                                  </div>
                                  <div class="ui green statistic">
                                    <div class="value"  id="completed-items">
                                        ${data.data.completed}
                                    </div>
                                    <div class="label">
                                        Completed Items
                                    </div>
                                  </div>
                                  <div class="ui red statistic">
                                    <div class="value" id="incomplete-items">
                                        ${data.data.incomplete}
                                    </div>
                                    <div class="label">
                                        Incomplete Items
                                    </div>
                                  </div>
                            </div>
                        </div>
                        
                   `);

            $(".ui.modal").modal("show");
        }
    });


});

$(document).on("click", ".add-module-submit", function () {
    let name = $("#module-name").val();
    add_module(name);
    $(".ui.modal.add-module-form").modal("hide");
    // remove all options
    $("#add-module-placeholder").html("");
    $(".modal").html("");
})

$(document).on("click", "#add", function () {
    // $("#add-form").toggle();
    var hourSelectItems = "";
    for (var j = 0; j < 24; j++) {
        if (j === 0) {
            hourSelectItems += `<option value="${j}" selected>${j}</option>`;
        } else {
            hourSelectItems += `<option value="${j}">${j}</option>`;
        }
    }
    var minuteSelectItems = "";
    for (var j = 0; j < 60; j++) {
        if (j === 0) {
            minuteSelectItems += `<option value="${j}" selected>${j}</option>`;
        } else {
            minuteSelectItems += `<option value="${j}">${j}</option>`;
        }
    }
    var modules = getModules(); // array
    console.log(modules);
    var modulesSelectItem = "";
    for (var j = 0; j < modules.length; j++) {
        var m = JSON.parse(modules[j]);
        modulesSelectItem += `<option value="${m.name}">${m.name}</option>`;
    }
    // <div className="field">
    //     <lable className="card-header" htmlFor="module_id">Module</lable>
    //     <select name="module-id" id="module-id">
    //         ${modulesSelectItem}
    //     </select>
    // </div>
    console.log(modulesSelectItem);
    $('.ui.sidebar')
        .sidebar("setting", "dimPage", false)
        .sidebar('toggle');
    $("#add-form-placeholder").append(`
        <div class="ui modal tiny add-form">
                <div class="ui icon header">
                    <h2>Add Item</h2>
                </div>
                <div class="content">
    
                    <div class="ui form">
                        <div class="field">
                            <label class="card-header" for="title">Title</label>
                            <input type="text" name="title" id="title-add" placeholder="Title">
                        </div>
                        <div class="field">
                            <label class="card-header" for="description">Description</label>
                            <input type="text" name="description" id="description-add" placeholder="Description">
                        </div>
                        
                        <div class="field">
                            <lable class="card-header" for="module_id">Module</lable>
                            <input type="text" name="module-id" id="module-id" placeholder="Module Name">
                        </div>
                        <div class="field">
                            <lable class="card-header" for="datetime">Datetime</lable>
                          <input type="hidden" id="datetimepkr">
                        </div> 
                        <button class="ui button add-submit" type="submit">Submit</button>
                    </div>
                </div>
    
            </div>
    
    
    `);
    let datepicker = $('#datetimepkr').flatpickr({
        enableTime: true, dateFormat: "Y-m-d H:i", time_24hr: true,

    });

    $(".ui.modal.add-form").modal("show");

});


$(document).on("click", ".add-submit", function () {
    let datetime = $("#datetimepkr").val();

    console.log(datetime);
    let title = $("#title-add").val();
    let description = $("#description-add").val();
    let date = $("#date-add").val();
    let hour = $("#hour-add").val();
    let minute = $("#minute-add").val();
    let module_id = $("#module-id").val();
    console.log(title, description, datetime);

    console.log(datetime);
    $.ajax({
        url: "/api/add", type: "post", data: {
            "module_id": module_id,
            "title": title,
            "description": description,
            "date": datetime,
            "csrf_token": get_csrf_token()
        }, success: function (data) {
            console.log(data);
            data = JSON.parse(data);
            if (data.status !== "success") {
                alert(data.message);
            }
            $(".ui.modal.add-form").modal("hide");
            update_all();
        }
    });

});


$(document).on("click", ".edit", function () {
    // get item

    var id = $(this).attr("id");

    var item = null;
    $.ajax({
        url: "/api/todo/" + id, type: "get", data: {
            "id": id, "csrf_token": get_csrf_token()
        }, success: function (data) {
            data = JSON.parse(data);
            if (data.status !== "success") {
                alert(data.message);

            } else {
                data = JSON.parse(data.item);
                item = data;
                var title = item.title;
                var description = item.description;
                var datetime = item.date;
                var date = datetime.split(" ")[0];
                var time = datetime.split(" ")[1];
                var hour = time.split(":")[0];
                var minute = time.split(":")[1];
                var module_id = item.module_name;

                var hourSelectItems = "";
                for (var j = 0; j < 24; j++) {
                    hourSelectItems += `<option value="${j}" ${j === parseInt(hour) ? "selected" : ""}>${j}</option>`;
                }
                var minuteSelectItems = "";
                for (var j = 0; j < 60; j++) {
                    minuteSelectItems += `<option value="${j}" ${j === parseInt(minute) ? "selected" : ""}>${j}</option>`;
                }
                $(".edit-" + item.id).remove();

                $("#edit_form").append(`
                <div class="ui modal tiny edit-${item.id}">
                <div class="ui icon header">
                    <h2>Edit Item</h2>
                </div>
                <div class="content">
    
                    <div class="ui form">
                        <div class="field">
                            <label class="card-header" for="title">Title</label>
                            <input type="text" name="title" id="title-${item.id}" placeholder="Title" value="${title}">
                        </div>
                        <div class="field">
                            <label class="card-header" for="description">Description</label>
                            <input type="text" name="description" id="description-${item.id}" placeholder="Description" value="${description}">
                        </div>
                        <div class="field">
                            <lable class="card-header" for="module_id">Module</lable>
                            <input type="text" name="module-id" id="module-id-${item.id}" placeholder="Module Name" value="${module_id}">
                        </div>
                        <div class="field">
                          <lable class="card-header" for="datetime">Datetime</lable>
                          <input type="hidden" id="datetimepkr" value="${datetime}">
                        </div>
                        <button class="ui button edit-submit" type="submit" id="${item.id}">Submit</button>
                    </div>
                </div>
    
            </div>`);
                let datepicker = $('#datetimepkr').flatpickr({
                    enableTime: true, dateFormat: "Y-m-d H:i", time_24hr: true,

                });
                $(".edit-" + item.id).modal("show");
            }
        }
    });
});


$(document).on("click", ".edit-submit", function () {
    var id = $(this).attr("id");
    var title = $("#title-" + id).val();
    var description = $("#description-" + id).val();
    var datetime = $("#datetimepkr").val();
    var module_id = $("#module-id-" + id).val();
    // /api/edit
    $.ajax({
        url: "/api/edit", type: "post", data: {
            "id": id,
            "title": title,
            "description": description,
            "date": datetime,
            "csrf_token": get_csrf_token(),
            "module_id": module_id
        }, success: function (data) {
            data = JSON.parse(data);
            if (data.status !== "success") {
                Toastify({
                    text: data.message, duration: 3000, newWindow: true, close: true, gravity: "bottom", // `top` or `bottom`
                    position: "right", // `left`, `center` or `right`
                    stopOnFocus: true, // Prevents dismissing of toast on hover
                    style: {
                        background: "#f0f0f0", color: "black", border: "1px solid black",
                    }, onClick: function () {
                    } // Callback after click
                }).showToast();

            } else {
                Toastify({
                    text: data.message, duration: 3000, newWindow: true, close: true, gravity: "bottom", // `top` or `bottom`
                    position: "right", // `left`, `center` or `right`
                    stopOnFocus: true, // Prevents dismissing of toast on hover
                    style: {
                        background: "#f0f0f0", color: "black", border: "1px solid black",
                    }, onClick: function () {
                    } // Callback after click
                }).showToast();

            }
        }
    });
    $(".edit-" + id).modal("hide").remove();
    getItems(1);
    update_statistic();
});


$(function () {
    $("#get").click(function () {
        getItems(1);
        update_statistic();
    })

})

function update_all() {
    getItems(1);
    update_statistic();
    update_module();
}

function update_module() {
    var modules = getModules();
    for (var i = 0; i < modules.length; i++) {
        modules[i] = JSON.parse(modules[i]);
    }
    // add all completed and uncompleted
    modules.push({id: 0, name: "All"});
    modules.push({id: -1, name: "Completed"});
    modules.push({id: -2, name: "Uncompleted"});
    var moduleSelectItems = []; //{ values: [ {value, text, name} ] }.
    for (var i = 0; i < modules.length; i++) {
        moduleSelectItems.push({value: modules[i].name, text: modules[i].name, name: modules[i].name});
        // if (modules[i].name !== "All" && modules[i].name !== "Completed" && modules[i].name !== "Uncompleted") {
        //     moduleSelectItems.push({value: modules[i].name, text: "Module: " + modules[i].name, name: modules[i].name});
        // } else {
        //
        // }

    }


    $('.ui.dropdown#filter').dropdown("setup menu", {
        "values": moduleSelectItems
    });
}

// onload
$(function () {
    update_all();


    // $('.ui.sidebar')
    //     .sidebar("setting", "dimPage", false)
    //     .sidebar('toggle');
})

$(document).on("click", ".complete", function () {
    var id = $(this).attr("id");
    $.ajax({
        url: "/api/complete", type: "post", data: {
            id: id, csrf_token: get_csrf_token()
        }, success: function (data) {
            console.log(data);
            data = JSON.parse(data);
            if (data.status !== "success") {
                alert(data.message);
            }
            Toastify({
                text: data.message, duration: 3000, newWindow: true, close: true, gravity: "bottom", // `top` or `bottom`
                position: "right", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                    background: "#f0f0f0", color: "black", border: "1px solid black",
                }, onClick: function () {
                } // Callback after click
            }).showToast();
            update_all();
        }
    })
})

$(document).on("click", ".delete", function () {
    var id = $(this).attr("id");
    $.ajax({
        url: "/api/delete", type: "post", data: {
            id: id, csrf_token: get_csrf_token()
        }, success: function (data) {
            console.log(data);
            data = JSON.parse(data);
            if (data.status !== "success") {
                alert(data.message);
            }
            Toastify({
                text: data.message, duration: 3000, newWindow: true, close: true, gravity: "bottom", // `top` or `bottom`
                position: "right", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                    background: "#f0f0f0", color: "black", border: "1px solid black",

                }, onClick: function () {
                } // Callback after click
            }).showToast();
            update_all();

        }
    })
})


$(document).on("click", ".edit", function () {
    $('.ui.modal.edit-' + $(this).attr("id")).modal('show');
});

$(document).on("click", "#all-btn", function () {
    $(this).addClass("active");
    $("#complete-btn").removeClass("active");
    $("#incomplete-btn").removeClass("active");
    getItems(1);
})
$(document).on("click", "#complete-btn", function () {
    $(this).addClass("active");
    $("#all-btn").removeClass("active");
    $("#incomplete-btn").removeClass("active");
    getItems(2);
})
$(document).on("click", "#incomplete-btn", function () {
    $(this).addClass("active");
    $("#all-btn").removeClass("active");
    $("#complete-btn").removeClass("active");
    getItems(3);
})