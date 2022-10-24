function get_csrf_token() {
    console.log("get csrf token");
    return $("meta[name='csrf-token']").attr("content");
}

function update_statistic() {
    $.ajax({
        url: "/api/statistics", type: "get", success: function (data) {
            data = JSON.parse(data);
            $("#total-items.value").html(data.data.total);
            $("#completed-items.value").html(data.data.completed);
            $("#incomplete-items.value").html(data.data.incomplete);
        }
    });
}

function getItems(flag) {
    // flag : 1=ALL 2=COMPLETED 3=NOT COMPLETED
    var completed = null;
    if (flag === 2) {
        completed = true;
    } else if (flag === 3) {
        completed = false;
    }
    var complete_cnt = 0;
    var not_complete_cnt = 0;
    var total_cnt = 0;
    $("#todo_list").html("");
    $.ajax({
        url: "/api/todo", type: "post", data: {
            "completed": completed, "order": "desc", "csrf_token": get_csrf_token()
        }, success: function (data) {
            console.log(data);
            data = JSON.parse(data);
            if (data.status !== "success") {
                alert(data.message);
            }
            var items = data.items;
            var html = "";
            for (var i = 0; i < items.length; i++) {
                var item = JSON.parse(items[i]);
                console.log(item);
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
                if (description.length > 10) {
                    description = description.substring(0, 10) + "...";
                }
                var title = item.title;
                if (title.length > 8) {
                    title = title.substring(0, 8) + "...";
                }
                $("#todo_list").append(`
            <div class="eight wide mobile six wide tablet four wide computer column">
                        <div class="ui fluid card">
                            <div class="content">
                                <div class="header" data-tooltip="${item.description}" data-variation="inverted" data-position="bottom center">${title}</div>

                                <div class="meta">${description}</div>
                                <strong><h2 class="ui header ${item.completed === true ? "green" : "red"}">
                                <div class="description" data-tooltip="${item.date}" data-variation="inverted" data-position="top center" >${item.completed === true ? "<br>DONE" : time}</div>
                                </h2></strong>
                            </div>
                            <div class="ui two bottom buttons">
              
                                <div class="ui buttons fluid">
                                  <button class="ui button delete" id="${item.id}">Delete</button>
                                  <div class="or"></div>
                                  <button class="ui button edit blue" id="${item.id}">Edit</button>
                                  <div class="or"></div>
                                  <button class="ui button complete ${item.completed === true ? "olive" : "green"}" id="${item.id}">${item.completed === true ? "Incomplete" : "Complete"}</button>
                                </div>
                            </div>
                        </div>
            </div> `);

                var datetime = item.date;
                var date = datetime.split(" ")[0];
                var time = datetime.split(" ")[1];
                var hour = time.split(":")[0];
                var minute = time.split(":")[1];

                var hourSelectItems = "";
                for (var j = 0; j < 24; j++) {
                    hourSelectItems += `<option value="${j}" ${j === parseInt(hour) ? "selected" : ""}>${j}</option>`;
                }
                var minuteSelectItems = "";
                for (var j = 0; j < 60; j++) {
                    minuteSelectItems += `<option value="${j}" ${j === parseInt(minute) ? "selected" : ""}>${j}</option>`;
                }

                $("#edit_form").append(`
                
        <div class="ui fullscreen modal edit-${item.id}">
            <div class="ui icon header">
                <h2>Edit Item</h2>
            </div>
            <div class="content">

                <div class="ui form">
                    <div class="field">
                        <label class="card-header" for="title">Title</label>
                        <input type="text" name="title" id="title-${item.id}" placeholder="Title" value="${item.title}">
                    </div>
                    <div class="field">
                        <label class="card-header" for="description">Description</label>
                        <input type="text" name="description" id="description-${item.id}" placeholder="Description" value="${item.description}">
                    </div>
                    <div class="field">
                        <label class="card-header" for="date">Date</label>
                        <input type="date" name="date" id="date-${item.id}" placeholder="Date" value="${date}">
                    </div>
                    <div class="field">
                        <label class="card-header" for="date">Time</label>
                        <div class="ui input left icon">
                            <select name="hour" id="hour-${item.id}">
                                   ${hourSelectItems}
                            </select>
                            <select name="minute" id="minute-${item.id}">
                                      ${minuteSelectItems}
                            </select>
                        </div>

                    </div>
                    <button class="ui button edit-submit" type="submit" id="${item.id}">Submit</button>
                </div>
            </div>

        </div>
                
                `)


            }

        }
    });
}

$(document).on("click", "#add", function () {
    $("#add-form").toggle();
});
$(document).on("click", "#add-submit", function () {
    var title = $("#title").val();
    var description = $("#description").val();
    var date = $("#date").val();
    var time = $("#hour").val() + ":" + $("#minute").val();
    // var csrf_token = $("#csrf_token").val();
    var datetime = date + " " + time;
    console.log(date, time, datetime);
    $.ajax({
        url: "/api/add", type: "post", data: {
            title: title, description: description, date: datetime, csrf_token: get_csrf_token()
        }, success: function (data) {
            console.log(data);
            data = JSON.parse(data);
            if (data.status !== "success") {
                alert(data.message);
            }
            getItems(1);
            update_statistic();
        }
    })

});


$(document).on("click", ".edit-submit", function () {
    var item_id = $(this).attr("id");
    var title = $("#title-" + item_id).val();
    var description = $("#description-" + item_id).val();
    var date = $("#date-" + item_id).val();
    var time = $("#hour-" + item_id).val() + ":" + $("#minute-" + item_id).val();
    var datetime = date + " " + time;
    console.log(date, time, datetime);
    $.ajax({
        url: "/api/edit", type: "post", data: {
            id: item_id, title: title, description: description, date: datetime, csrf_token: get_csrf_token()
        }, success: function (data) {
            console.log(data);
            data = JSON.parse(data);
            if (data.status !== "success") {
                alert(data.message);
            }


        }
    });
    $(".edit-" + item_id).modal("hide");
    getItems(1);
    update_statistic();


});

$(function () {
    $("#get").click(function () {
        getItems(1);
        update_statistic();
    })

})

// onload
$(function () {
    getItems(1);
    update_statistic();
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
            $("#get").click();
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
            $("#get").click();

        }
    })
})


$(document).on("click", ".edit", function () {
    $('.ui.fullscreen.modal.edit-' + $(this).attr("id")).modal('show');
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