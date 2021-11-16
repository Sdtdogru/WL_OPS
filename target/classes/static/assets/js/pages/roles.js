/* global napi, OPCContextPath, Highcharts, hasBanner */

/**
 *
 */

var roles = {};

roles.cons = {};
roles.data = {};
roles.vars = {};
roles.vars.datatable = {};
roles.fn = {};

roles.services = {
    loadAllRoleInfo: {
        URL: OPCContextPath + "/loadAllRoleInfo",
        PARAMETERS: {}
    },
    loadRoleInfo: {
        URL: OPCContextPath + "/loadRoleInfo",
        PARAMETERS: {
            ID: '?ID='
        }
    },
    addRoleInfo: {
        URL: OPCContextPath + "/addRoleInfo",
        PARAMETERS: {
            USERNAME: '?USERNAME=',
            ROLE: '&ROLE='
        }
    },
    deleteRoleInfo: {
        URL: OPCContextPath + "/deleteRoleInfo",
        PARAMETERS: {
            ID: '?ID='
        }
    },
    updateRoleInfo: {
        URL: OPCContextPath + "/updateRoleInfo",
        PARAMETERS: {
            USERNAME: '?USERNAME=',
            ROLE: '&ROLE=',
            ID: '&ID='
        }
    }
};

roles.fn.loadAll = function () {

    var url = roles.services.loadAllRoleInfo.URL;

    napi.showWaitDivDelay('Processing...', 1000);

    napi.post(url, function (data) {

        napi.removeWaitDiv();

        if (napi.processStdResp(data.responseCode, data.responseMessage, false)) {
            roles.fn.drawTable(data.responseData);
        }

    });

};

roles.fn.save = function () {

    var url = roles.services.addRoleInfo.URL;
    url.add().PARAMETERS.USERNAME.add($("#name").val());
    url.add().PARAMETERS.ROLE.add($("#role").val());
    alert(url);
    var usernanem = roles.services.addRoleInfo.PARAMETERS.USERNAME + $("#name").val();
    var role = roles.services.addRoleInfo.PARAMETERS.ROLE + $("#role").val();
    var httpUrl = url + usernanem + role;
    napi.showWaitDivDelay('Processing...', 1000);

    napi.post(httpUrl, function () {

        if (napi.processStdResp(data.responseCode, data.responseMessage, false)) {
            alert("Success Save")
        }
        napi.removeWaitDiv();

    });

};

roles.fn.deleted = function (id) {
    var url = roles.services.deleteRoleInfo.URL;
    var userId = roles.services.deleteRoleInfo.PARAMETERS.ID+id;
    var httpUrl = url + userId;

    napi.showWaitDivDelay('Processing...', 1000);

    napi.post(httpUrl, function () {

        napi.removeWaitDiv();

    });

    $('#example').DataTable().clear().draw();;
    roles.fn.loadAll();
    $('#example').DataTable().reload();
};

roles.fn.edit = function (data) {

    $("#myModal").modal('show');
    $("#updateid").text(data);
    $("#updateid1").val(data);
};

roles.fn.update = function () {

    var url = roles.services.updateRoleInfo.URL;
    var usernanem = roles.services.updateRoleInfo.PARAMETERS.USERNAME + $("#updatename").val();
    var role = roles.services.updateRoleInfo.PARAMETERS.ROLE + $("#updaterole").val();
    var id = roles.services.updateRoleInfo.PARAMETERS.ID+$("#updateid1").val();
    var httpUrl = url + usernanem + role+id;
    napi.showWaitDivDelay('Processing...', 1000);

    napi.post(httpUrl, function () {

        if (napi.processStdResp(data.responseCode, data.responseMessage, false)) {
            alert("Success Save")
        }
        napi.removeWaitDiv();

    });

    $("#myModal").modal('hide');
    $('#example').DataTable().clear().draw();;
    roles.fn.loadAll();
    $('#example').DataTable().reload();

};

roles.fn.drawTable = function (data) {
    var dataSet = [];

    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        dataSet.push([d.id, d.username, d.role,'<a class="btn btn-danger" style="margin-left:5px; margin-right:-15px" onclick="roles.fn.deleted('+d.id+')">Delete</a>', '<a class="btn btn-primary" style="margin-left:20px"  onclick="roles.fn.edit('+d.id+')">Edit</a> ']);
    }

    $('#example').DataTable({
        data: dataSet,
        columns: [
            {title: "ID"},
            {title: "Username"},
            {title: "Role"},
            {title: "Delete"},
            {title: "Update"},

        ],
        "bDestroy": true
    });
};

$(document).ready(function () {

    roles.fn.loadAll();

    $("#submitBtn").click(function () {
        roles.fn.save();
        $('#example').DataTable().clear().draw();;
        roles.fn.loadAll();
        $('#example').DataTable().reload();
    });

    $("#modalSave").click(function () {
        roles.fn.update();
    });

});



