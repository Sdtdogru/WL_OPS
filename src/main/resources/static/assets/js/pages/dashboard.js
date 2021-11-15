/* global napi, OPCContextPath, Highcharts, hasBanner */

/**
 * 
 */

var dashboard = {};

dashboard.cons = {};
dashboard.data = {};
dashboard.vars = {};
dashboard.vars.datatable = {};
dashboard.fn = {};

dashboard.services = {
    loadAllUserInfo: {
        URL: OPCContextPath + "/loadAllUserInfo",
        PARAMETERS: {
        }
    },
    loadUserInfo: {
        URL: OPCContextPath + "/loadUserInfo",
        PARAMETERS: {
            ID: '?ID='
        }
    },
    addUserInfo: {
        URL: OPCContextPath + "/addUserInfo",
        PARAMETERS: {
            USERNAME: '?USERNAME='
        }
    },
    deleteUserInfo: {
        URL: OPCContextPath + "/deleteUserInfo",
        PARAMETERS: {
            ID: '?ID='
        }
    },
    updateUserInfo: {
        URL: OPCContextPath + "/updateUserInfo",
        PARAMETERS: {
            USERNAME: '?USERNAME=',
            ID: '&ID='
        }
    }
};

dashboard.fn.loadAll = function () {

    var url = dashboard.services.loadAllUserInfo.URL;

    napi.showWaitDivDelay('Processing...', 1000);

    napi.post(url, function (data) {

        napi.removeWaitDiv();

        if (napi.processStdResp(data.responseCode, data.responseMessage, false)) {
            dashboard.fn.drawTable(data.responseData);
        }

    });

};

dashboard.fn.drawTable = function (data) {
    
    var dataSet = [];
    
    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        dataSet.push([d.id, d.username, d.dt]);
    }
    
    $('#example').DataTable( {
        data: dataSet,
        columns: [
            { title: "ID" },
            { title: "Username" },
            { title: "Dt" }
        ]
    } );
};

$(document).ready(function () {
    dashboard.fn.loadAll();
});