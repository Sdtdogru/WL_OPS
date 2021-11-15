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
        PARAMETERS: {
        }
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
            ROLE: '&ROLE'
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

roles.fn.drawTable = function (data) {

    var dataSet = [];

    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        dataSet.push([d.id, d.username,d.role, d.dt]);
    }

    $('#example').DataTable( {
        data: dataSet,
        columns: [
            { title: "ID" },
            { title: "Username" },
            { title: "Role" },
            { title: "Dt" }
        ]
    } );
};

$(document).ready(function () {
    roles.fn.loadAll();
});