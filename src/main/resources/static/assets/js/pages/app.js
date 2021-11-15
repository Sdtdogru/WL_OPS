/* global moment, OPCContextPath, CSSStyleDeclaration, Stomp, Notification, Pace, SockJS, forbiddenProtocol, SERVER_TZ, notifications, Promise */

/**
 * 
 */

String.prototype.capitalizeFirstLetter = function () {

    if (this.toLowerCase() === "ok") {
        return "OK";
    }

    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.safeReplace = function (exp, str) {
    return this.replace(exp, function () {
        return str;
    });
};

if (typeof String.prototype.startsWith !== 'function') {
    String.prototype.startsWith = function (str) {
        return this.indexOf(str) === 0;
    };
}

if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function (suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

String.prototype.escapeHtml = function () {
    var tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };
    return this.replace(/[&<>]/g, function (tag) {
        return tagsToReplace[tag] || tag;
    });
};

(function ($) {
    if ($.fn.style) {
        return;
    }

    // Escape regex chars with \
    var escape = function (text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

    // For those who need them (< IE 9), add support for CSS functions
    var isStyleFuncSupported = !!CSSStyleDeclaration.prototype.getPropertyValue;
    if (!isStyleFuncSupported) {
        CSSStyleDeclaration.prototype.getPropertyValue = function (a) {
            return this.getAttribute(a);
        };
        CSSStyleDeclaration.prototype.setProperty = function (styleName, value, priority) {
            this.setAttribute(styleName, value);
            var priority = typeof priority !== 'undefined' ? priority : '';
            if (priority !== '') {
                // Add priority manually
                var rule = new RegExp(escape(styleName) + '\\s*:\\s*' + escape(value) +
                        '(\\s*;)?', 'gmi');
                this.cssText =
                        this.cssText.replace(rule, styleName + ': ' + value + ' !' + priority + ';');
            }
        };
        CSSStyleDeclaration.prototype.removeProperty = function (a) {
            return this.removeAttribute(a);
        };
        CSSStyleDeclaration.prototype.getPropertyPriority = function (styleName) {
            var rule = new RegExp(escape(styleName) + '\\s*:\\s*[^\\s]*\\s*!important(\\s*;)?',
                    'gmi');
            return rule.test(this.cssText) ? 'important' : '';
        };
    }

    // The style function
    $.fn.style = function (styleName, value, priority) {
        // DOM node
        var node = this.get(0);
        // Ensure we have a DOM node
        if (typeof node === 'undefined') {
            return this;
        }
        // CSSStyleDeclaration
        var style = this.get(0).style;
        // Getter/Setter
        if (typeof styleName !== 'undefined') {
            if (typeof value !== 'undefined') {
                // Set style property
                priority = typeof priority !== 'undefined' ? priority : '';
                style.setProperty(styleName, value, priority);
                return this;
            } else {
                // Get style property
                return style.getPropertyValue(styleName);
            }
        } else {
            // Get CSSStyleDeclaration
            return style;
        }
    };
})(jQuery);

function OPCApi() {

    this.services = {

        getNotificationTypeLabels: {
            URL: OPCContextPath + "/getNotificationTypeLabels"
        },

        getEnvironmentValues: {
            URL: OPCContextPath + "/getEnvironmentValues"
        },

        restartApp: {
            URL: OPCContextPath + "/admin/restartApp"
        },

        salute: {
            URL: OPCContextPath + "/Salute"
        },

        hasTokenViolation: {
            URL: OPCContextPath + "/hasTokenViolation"
        },

        hasDeadDomainRegistration: {
            URL: OPCContextPath + "/hasDeadDomainRegistration"
        },

        getEnvironmentDomains: {
            URL: OPCContextPath + "/getEnvironmentDomains",
            PARAMETERS: {
                ENV_ID: '?ENV_ID='
            }
        }

    };

    this.gritterErrorIcon = '<div class="progressbar slim progressUploadAnimate"></div> <i class="fa fa-bell"></i>';
    this.gritterWarningIcon = '<div class="progressbar slim progressUploadAnimate"></div> <i class="fa fa-exclamation-triangle"></i>';
    this.gritterInfoIcon = '<div class="progressbar slim progressUploadAnimate"></div> <i class="fa fa-info-circle"></i>';
    this.gritterSuccessIcon = '<div class="progressbar slim progressUploadAnimate"></div> <i class="fa fa-check"></i>';

    this.maxItem = 9999;

    this.loaderTimer = [];
    this.RESPONSE_TYPE_TASK_SUCCESS = 999;
    this.RESPONSE_TYPE_OK = 1;
    this.RESPONSE_TYPE_WARNING = 0;
    this.RESPONSE_TYPE_INTERNAL_ERR = -9;
    this.RESPONSE_TYPE_REMOTE_ERR = -10;
    this.RESPONSE_TYPE_NO_LIC = -11;
    this.RESPONSE_TYPE_TRIAL_MAX_EXEC = -12;
    this.RESPONSE_TYPE_T3_USER_ERROR = 888;
    this.RESPONSE_TYPE_ALREADY_EXISTS = -8;

    this.delivery = {
        status: {
            waiting: {
                code: 0,
                text: 'Waiting',
                icon: '<i style="color: #20a8d8" class="fas fa-hourglass-half"></i>'
            },
            sent: {
                code: 1,
                text: 'Sent',
                icon: '<i style="color: #4dbd74" class="fas fa-check"></i>'
            },
            ruleBlock: {
                code: 2,
                text: 'Blocked By Rule',
                icon: '<i style="color: #f8cb00" class="fas fa-ban"></i>'
            },
            notSent: {
                code: 3,
                text: 'Not Sent',
                icon: '<i style="color: #f8cb00" class="fas fa-ban"></i>'
            },
            failed: {
                code: 4,
                text: 'Failed',
                icon: '<i style="color: #f86c6b" class="fas fa-exclamation-triangle"></i>'
            },
            retry: {
                code: 5,
                text: 'Retry',
                icon: '<i style="color: #20a8d8" class="fas fa-redo"></i>'
            }
        }
    };

    this.deliverySingle = {
        status: {
            waiting: {
                code: 0,
                text: 'Waiting',
                icon: '<i style="color: #20a8d8" class="fas fa-hourglass-half"></i>',
                iconTooltip: '<i data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Waiting" style="color: #20a8d8" class="fas fa-hourglass-half"></i>'
            },
            sent: {
                code: 1,
                text: 'Sent',
                icon: '<i style="color: #4dbd74" class="fas fa-check"></i>',
                iconTooltip: '<i data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Sent" style="color: #4dbd74" class="fas fa-check"></i>'

            },
            ruleBlock: {
                code: 2,
                text: 'Blocked By Rule',
                icon: '<i style="color: #f8cb00" class="fas fa-ban"></i>',
                iconTooltip: '<i data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Blocked By Rule" style="color: #f8cb00" class="fas fa-ban"></i>'
            },
            notSent: {
                code: 3,
                text: 'Not Sent',
                icon: '<i style="color: #f8cb00" class="fas fa-ban"></i>',
                iconTooltip: '<i data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Not Sent" style="color: #f8cb00" class="fas fa-ban"></i>'
            },
            failed: {
                code: 4,
                text: 'Failed',
                icon: '<i style="color: #f86c6b" class="fas fa-exclamation-triangle"></i>',
                iconTooltip: '<i data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Failed" style="color: #f86c6b" class="fas fa-exclamation-triangle"></i>'
            },
            retry: {
                code: 5,
                text: 'Retry',
                icon: '<i style="color: #20a8d8" class="fas fa-redo"></i>',
                iconTooltip: '<i data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Retry" style="color: #20a8d8" class="fas fa-redo"></i>'
            }
        }
    };



    this.delivery.list = [
        [0, 'Waiting'],
        [1, 'Sent'],
        [2, 'Blocked By Rule'],
        [3, 'Not Sent'],
        [4, 'Failed'],
        [5, 'Retry']
    ];

    this.environmentNames = {};


    this.notificationTypes = {};
    this.napiRady = false;

    this.IDMap = {};

    this.bulkModules = {
        JVM_ASSERTER: "JVMAsserter",
        DATASOURCE_STANDARTIZER: "DatasourceStandartizer",
        DOMAIN_STANDARTIZER: "DomainStandartizer"

    };

}

OPCApi.prototype.validateForm = function (form) {


    var elms = form.find('[required]');
    var resp = true;
    var focused = false;

    for (var i = 0; i < elms.length; i++) {
        var elm = $(elms[i]);
        var parent = elm.parents('.form-group');

        var label = parent.find('.system-warnin-label');

        if (label.length === 0) {
            parent.append('<label class="control-label system-warnin-label"></label>');
        }

        label = parent.find('.system-warnin-label');

        if (elm.val().trim() === '') {

            resp = false;

//            parent.addClass('has-error has-feedback');
            parent.addClass('has-error');
            label.html('Field cannot be NULL!');

            if (!focused) {
                elm.focus();
                focused = true;
            }

//            if (parent.find('.form-control-feedback').length === 0) {
//                parent.append('<span class="glyphicon glyphicon-warning-sign form-control-feedback"></span>');
//            }

            continue;

        } else {

//            parent.find('.form-control-feedback').remove();
//            parent.removeClass('has-error has-feedback');
            parent.removeClass('has-error');
            label.remove();

        }

    }

    return resp;
};

OPCApi.prototype.formatDate = function (date) {
    return napi.formatDateWithPattern(date, 'YYYY-MM-DD HH:mm:ss');
};

OPCApi.prototype.formatDateWithPattern = function (date, pattern) {
//    return moment(date).utc(false).format(pattern);
    return moment.tz(date, SERVER_TZ).format(pattern);
};

OPCApi.prototype.populateEnvironmentSelectBox = function (target, firstOptionName, printIDs) {

    if (typeof firstOptionName === 'undefined') {
        firstOptionName = "Select Environment";
    }

    if (typeof printIDs === 'undefined') {
        printIDs = false;
    }

    var opts = '<option value=" ">' + firstOptionName + '</option>';

    var vals = Object.keys(napi.environmentNames);

    for (var i = 0; i < vals.length; i++) {
        if (printIDs) {
            opts += '<option value="' + vals[i] + '">' + napi.environmentNames[vals[i]] + " - ID: " + vals[i] + '</option>';
        } else {
            opts += '<option value="' + vals[i] + '">' + napi.environmentNames[vals[i]] + '</option>';
        }
    }

    target.html(opts);

};


OPCApi.prototype.initDatatableInputSearch = function (datatable) {
    datatable.columns().eq(0).each(function (colIdx) {
        $('input', datatable.column(colIdx).header()).on('keyup change', function () {
            datatable
                    .column(colIdx)
                    .search(this.value.trim())
                    .draw();
        });
    });

    // Reset table search
    datatable
            .search('')
            .columns().search('')
            .draw();
};

OPCApi.prototype.initDatatableSelectSearch = function (datatable, search) {

    datatable.columns().eq(0).each(function (colIdx) {

        $('select', datatable.column(colIdx).header()).on('keyup change', function () {

            var val = this.value.trim();

            if (val === "") {
                datatable.column(colIdx).search(val).draw();
            } else {

                if (search === true) {
                    datatable.column(colIdx).search(val).draw();
                } else {
                    datatable.column(colIdx).search("^(" + val + ")$", true, false).draw();
                }
            }

        });

    });

    // Reset table search
    datatable
            .search('')
            .columns().search('')
            .draw();

};

/**
 * 
 * @param {type} data
 * @returns {OPCApi.prototype.normilizeTableData.appAnonym$4}
 */
OPCApi.prototype.normilizeTableData = function (data) {

    var map = {};

    for (var i = 0; i < data.length; i++) {

        var rowMap = Object.keys(data[i]);

        for (var j = 0; j < rowMap.length; j++) {

            if (typeof map[rowMap[j]] === 'undefined') {
                map[rowMap[j]] = true;
            }
        }
    }


    var mapKeys = Object.keys(map);

    for (var i = 0; i < data.length; i++) {

        for (var j = 0; j < mapKeys.length; j++) {

            if (typeof data[i][mapKeys[j]] === 'undefined') {
                data[i][mapKeys[j]] = "";
            }
        }
    }

    mapKeys = mapKeys.sort();

    return {
        data: data,
        fields: mapKeys
    };

};

OPCApi.prototype.populateNotificationTypeSelect = function (target, defaultValue) {

    var sortable = [];
    for (var val in napi.notificationTypes) {
        sortable.push([val, napi.notificationTypes[val]]);
    }

    sortable.sort(function (a, b) {
        var x = a[1].toLowerCase();
        var y = b[1].toLowerCase();

        return x < y ? -1 : x > y ? 1 : 0;
    });

    if (typeof defaultValue === 'undefined') {
        defaultValue = "-9";
    }

    var opts = '<option value="' + defaultValue + '">Select Notification Type</option>';
    for (var i = 0; i < sortable.length; i++) {
        opts += '<option value="' + sortable[i][0] + '">' + sortable[i][1] + '</option>';
    }

    target.html(opts);

};


OPCApi.prototype.escapeHTML = function (rawHTML) {
    var entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };

    return String(rawHTML).replace(/[&<>"'`=\/]/g, function (s) {
        return entityMap[s];
    });
};

OPCApi.prototype.getFullDomainName = function (domainName, alias) {
    if (typeof alias === 'undefined' || alias === null || alias === '') {
        return domainName.safeReplace('@', ' @ ');
    }

    return alias + ' [' + domainName.safeReplace('@', ' @ ') + ']';
};

OPCApi.prototype.populateRegisteredDomainSelect = function (target, dataArr, firstOptionName) {

    if (typeof firstOptionName === 'undefined') {
        firstOptionName = "Select Domain";
    }

    var opts = '<option value=" ">' + firstOptionName + '</option>';

    var fullNames = Object.keys(dataArr).sort();

    for (var i = 0; i < fullNames.length; i++) {

        var fdn = fullNames[i];
        var lbl = dataArr[fdn];

        if (typeof lbl === 'undefined' || lbl === null || lbl === '') {
            lbl = fdn;
        } else {
            lbl = lbl + ' [' + fdn.safeReplace('@', ' @ ') + ']';
        }

        opts += '<option value="' + fdn + '">' + lbl + '</option>';
    }

    target.html(opts);

};

OPCApi.prototype.dlv_statusToString = function (dlv, messages) {

    var messageSeparator = "@@##@@";
    var arr = dlv.split('');
    var messagearr = messages.split(messageSeparator);

    if (dlv === "000") {
        if (typeof messagearr[0] === 'undefined' || messagearr[0] === "" || messagearr[0] === null) {
            messagearr[0] = "No data found. Waiting in the queue...";
        }
        if (typeof messagearr[1] === 'undefined' || messagearr[1] === "" || messagearr[1] === null) {
            messagearr[1] = "No data found. Waiting in the queue...";
        }
        if (typeof messagearr[2] === 'undefined' || messagearr[2] === "" || messagearr[2] === null) {
            messagearr[2] = "No data found. Waiting in the queue...";
        }
    }

    var detailButton = '<button \n\
\n\
                        data-dss-email-val="' + (arr[0] * 1) + '" \n\
                        data-dss-snmp-val="' + (arr[1] * 1) + '" \n\
                        data-dss-custom-val="' + (arr[2] * 1) + '" \n\
\n\
                        data-dss-email-msg="' + messagearr[0] + '" \n\
                        data-dss-snmp-msg="' + messagearr[1] + '" \n\
                        data-dss-custom-msg="' + messagearr[2] + '" \n\
\n\
\n\                     data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Delivery Status Details" \n\
\n\
                        style="float: left;" type="button" class="btn btn-primary open-dlv-status"><i class="fa fa-search"></i></button>';

    var respBody = '   <span class="notif-dss"><i class="far fa-envelope"></i> ' + napi.getSingleStatusText(arr[0] * 1) + "</span>";
    respBody += ' <br> <span class="notif-dss"><i class="far fa-square">  </i> ' + napi.getSingleStatusText(arr[1] * 1) + "</span>";
    respBody += ' <br> <span class="notif-dss"><i class="far fa-user">    </i> ' + napi.getSingleStatusText(arr[2] * 1) + "</span>";

    respBody = respBody.safeReplace(/"/g, "'");



    return '<div style="width: 30px;margin-right: 10px;font-size: 1.7em; float: left; cursor: help;" data-toggle="popover" title="" data-html="true" data-placement="bottom" data-trigger="hover" data-container="body" data-content="' + respBody + '"  data-original-title="Delivery Status">' + napi.getSingleStatusTextSingle(arr[0] * 1) + '</div> ' + detailButton;

};

OPCApi.prototype.getSingleStatusTextSingle = function (val) {

    if (val === napi.deliverySingle.status.waiting.code) {
        return napi.deliverySingle.status.waiting.icon;

    } else if (val === napi.deliverySingle.status.sent.code) {
        return napi.deliverySingle.status.sent.icon;

    } else if (val === napi.deliverySingle.status.ruleBlock.code) {
        return napi.deliverySingle.status.ruleBlock.icon;

    } else if (val === napi.deliverySingle.status.notSent.code) {
        return napi.deliverySingle.status.notSent.icon;

    } else if (val === napi.deliverySingle.status.failed.code) {
        return napi.deliverySingle.status.failed.icon;

    } else if (val === napi.deliverySingle.status.retry.code) {
        return napi.deliverySingle.status.retry.icon;
    }

    return "UNKNOWN_STATUS: " + val;

};

OPCApi.prototype.getSingleStatusTextSingleTooltip = function (val) {

    if (val === napi.deliverySingle.status.waiting.code) {
        return napi.deliverySingle.status.waiting.iconTooltip;

    } else if (val === napi.deliverySingle.status.sent.code) {
        return napi.deliverySingle.status.sent.iconTooltip;

    } else if (val === napi.deliverySingle.status.ruleBlock.code) {
        return napi.deliverySingle.status.ruleBlock.iconTooltip;

    } else if (val === napi.deliverySingle.status.notSent.code) {
        return napi.deliverySingle.status.notSent.iconTooltip;

    } else if (val === napi.deliverySingle.status.failed.code) {
        return napi.deliverySingle.status.failed.iconTooltip;

    } else if (val === napi.deliverySingle.status.retry.code) {
        return napi.deliverySingle.status.retry.iconTooltip;
    }

    return "UNKNOWN_STATUS: " + val;

};

OPCApi.prototype.getSingleStatusText = function (val) {

    if (val === napi.delivery.status.waiting.code) {
        return napi.delivery.status.waiting.icon + "<span>" + napi.delivery.status.waiting.text + "</span>";

    } else if (val === napi.delivery.status.sent.code) {
        return napi.delivery.status.sent.icon + "<span>" + napi.delivery.status.sent.text + "</span>";

    } else if (val === napi.delivery.status.ruleBlock.code) {
        return napi.delivery.status.ruleBlock.icon + "<span>" + napi.delivery.status.ruleBlock.text + "</span>";

    } else if (val === napi.delivery.status.notSent.code) {
        return napi.delivery.status.notSent.icon + "<span>" + napi.delivery.status.notSent.text + "</span>";

    } else if (val === napi.delivery.status.failed.code) {
        return napi.delivery.status.failed.icon + "<span>" + napi.delivery.status.failed.text + "</span>";

    } else if (val === napi.delivery.status.retry.code) {
        return napi.delivery.status.retry.icon + "<span>" + napi.delivery.status.retry.text + "</span>";
    }

    return "UNKNOWN_STATUS: " + val;

};

OPCApi.prototype.populateDeliveryStatusSelect = function (target) {

    var opts = '<option value="-9">Select Delivery Status</option>';
    for (var i = 0; i < napi.delivery.list.length; i++) {
        opts += '<option value="' + napi.delivery.list[i][0] + '">' + napi.delivery.list[i][1] + '</option>';
    }

    target.html(opts);

};

OPCApi.prototype.initDateRangePicker = function (target, startDateInput, endDateInput, startDate, endDate) {

    var ranges = {
        'Today': [moment(), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    };

    if (typeof startDate === 'undefined') {
        startDate = moment();
    }

    if (typeof endDate === 'undefined') {
        endDate = moment();
    }

    startDateInput.val(startDate.format('YYYY-MM-DD'));
    endDateInput.val(endDate.format('YYYY-MM-DD'));

    target.daterangepicker({
        "ranges": ranges,
        "alwaysShowCalendars": true,
        "startDate": startDate,
        "endDate": endDate
    }, function (start, end, label) {
        startDateInput.val(start.format('YYYY-MM-DD'));
        endDateInput.val(end.format('YYYY-MM-DD'));
    });

};

OPCApi.prototype.setCookie = function (cname, cvalue, exdays, extops) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();

    var eo = "";
    if (typeof extops !== "undefined") {
        eo = extops;
    }

    document.cookie = cname + "=" + cvalue + "; " + expires + eo;
};

OPCApi.prototype.removeCookie = function (cname, cvalue, exdays, extops) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();

    var eo = "";
    if (typeof extops !== "undefined") {
        eo = extops;
    }

    document.cookie = cname + "=" + cvalue + "; " + expires + eo;
};

OPCApi.prototype.getCookie = function (cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ')
            c = c.substring(1);
        if (c.indexOf(name) !== -1)
            return c.substring(name.length, c.length);
    }
    return "";
};

OPCApi.prototype.success = function (title, text) {
    return $.gritter.add({
        title: napi.gritterSuccessIcon + title,
        text: text,
        class_name: 'gritter-icon gritter-success',
        time: 10000
    });
};

OPCApi.prototype.info = function (title, text) {
    return $.gritter.add({
        title: napi.gritterInfoIcon + title,
        text: text,
        class_name: 'gritter-icon gritter-info',
        time: 10000
    });
};

OPCApi.prototype.warning = function (title, text) {
    return $.gritter.add({
        title: napi.gritterWarningIcon + title,
        text: text,
        class_name: 'gritter-icon gritter-warning',
        time: 10000
    });
};

OPCApi.prototype.error = function (title, text) {
    return $.gritter.add({
        title: napi.gritterErrorIcon + title,
        text: text,
        class_name: 'gritter-icon gritter-danger',
        time: 10000
    });
};


OPCApi.prototype.putfilter = function (domains, cbf) {

    var sbs = '<li><select id="page-environment" class="form-control"></select></li><li><select id="page-domain" class="form-control"></select></li>';
    $('.bar-filter-cont').append(sbs);

    var environmentcb = $('#page-environment');
    var domaincb = $('#page-domain');

    napi.populateEnvironmentSelectBox(environmentcb, 'All Environments', false);
    napi.populateRegisteredDomainSelect(domaincb, domains, 'All Domains');

    environmentcb.change(function () {

        var val = $(this).val().trim();

        if (val === "") {

            napi.populateRegisteredDomainSelect(domaincb, domains, 'All Domains');
            cbf();

        } else {

            var url = napi.services.getEnvironmentDomains.URL;
            url += napi.services.getEnvironmentDomains.PARAMETERS.ENV_ID + val;

            napi.post(url, function (data) {
                napi.populateRegisteredDomainSelect(domaincb, data.responseData, "All Domains");
                cbf();
            });

        }


    });
    domaincb.change(cbf);

    var changeCss = {
        'color': 'blue',
        'font-weight': 'bold'
    };

    var defaultCss = {
        'color': '',
        'font-weight': ''
    };

    environmentcb.change(function () {
        var node = $(this);

        if (node.val().trim() === "") {
            node.css(defaultCss);
        } else {
            node.css(changeCss);
        }

    });

    domaincb.change(function () {
        var node = $(this);

        if (node.val().trim() === "") {
            node.css(defaultCss);
        } else {
            node.css(changeCss);
        }

    });

    environmentcb.select2();
    domaincb.select2({
        dropdownCssClass: 'bigdrop'
    });

//    setTimeout(function () {
    $('#page-environment').parent().find('> .select2-container').css('min-width', '250px');
//    }, 200);
};

OPCApi.prototype.highlightDatatableRow = function (tbody, dtbl) {

//    tbody.on('mouseenter', 'tr', function () {
//        
//        var colIdx = dtbl.cell(this).index().column;
//
//        $(dtbl.cells().nodes()).removeClass('highlight');
//        $(dtbl.column(colIdx).nodes()).addClass('highlight');
//        
//    });

};

OPCApi.prototype.processStdResp = function (code, message, showSuccessMessage) {

    if (code === napi.RESPONSE_TYPE_TASK_SUCCESS || code === napi.RESPONSE_TYPE_OK) {
        if (showSuccessMessage === true) {
            napi.stdMessage(code, message);
        }
        return true;
    } else {
        napi.stdMessage(code, message);
        return false;
    }

};


OPCApi.prototype.post_to_url = function (path, params, method, rdurl) {
    var w = window.open("", "_blank");
    method = method || "post";
    var form = w.document.createElement("FORM");
    form.setAttribute("method", method);
    form.setAttribute("action", path);
    form.setAttribute("target", "_self");

    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            var hiddenField = w.document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
        }
    }

    w.document.body.appendChild(form);
    form.submit();

    if (rdurl !== null && rdurl !== '' && typeof rdurl !== 'undefined') {
        setTimeout(function () {
            w.location = rdurl;
        }, 100);
    }

};

OPCApi.prototype.normalizePropertyNamesArray = function (arr) {

    for (var i = 0; i < arr.length; i++) {
        arr[i] = napi.normalizePropertyNames(arr[i]);
    }

    return arr;

};

OPCApi.prototype.normalizePropertyNames = function (obj) {

    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (typeof obj.length !== 'undefined') {

        for (var i = 0; i < obj.length; i++) {
            obj[i] = napi.normalizePropertyNames(obj[i]);
        }

    } else {

        var keys = Object.keys(obj);

        for (var i = 0; i < keys.length; i++) {

            var key = keys[i];
            var val = obj[key];

            var newKey = key.toLowerCase();
            var newVal = napi.normalizePropertyNames(val);

            obj[newKey] = newVal;

            if (key !== newKey) {
                delete obj[key];
            }

        }

    }


    return obj;
};

OPCApi.prototype.normalizePropertyName = function (f) {

    if (f.indexOf('_') > -1) {
        f = f.toLowerCase();
    }

    var nStr = "";

    for (var i = 0; i < f.length; i++) {

        if (f[i] === '_') {
            nStr += ' ';

        } else {

            if (f[i] === f[i].toUpperCase()) {
                nStr += ' ' + f[i];
            } else {
                nStr += f[i];
            }

        }

    }

    nStr = nStr.trim();
    var strArr = nStr.split(' ');
    nStr = "";

    for (var i = 0; i < strArr.length; i++) {
        nStr += " " + strArr[i].capitalizeFirstLetter();
    }

    nStr = nStr.trim();

    return nStr;

};

OPCApi.prototype.uniqueIdGenerator = function () {
    var id = '_' + Math.random().toString(36).substr(2, 9);

    if (napi.IDMap[id] === undefined) {
        napi.IDMap[id] = id;
        return id;
    }

    return napi.uniqueIdGenerator();
};

OPCApi.prototype.stdMessage = function (code, message) {

    var title = "";
    var text = "";
    var clazz = "";

    if (code === napi.RESPONSE_TYPE_TASK_SUCCESS) {
        title = napi.gritterSuccessIcon + "Success";
        text = "Operation completed.";
        clazz = "gritter-success";

    } else if (code === napi.RESPONSE_TYPE_OK) {
        title = napi.gritterSuccessIcon + "Success";
        text = "Operation completed.";
        clazz = "gritter-success";

    } else if (code === napi.RESPONSE_TYPE_WARNING) {
        title = napi.gritterWarningIcon + "Warning!";
        text = "Operation completed with a warning!";
        clazz = "gritter-warning";

    } else if (code === napi.RESPONSE_TYPE_INTERNAL_ERR) {
        title = napi.gritterErrorIcon + "Error!";
        text = 'Error occurred! <br><a href="' + OPCContextPath + '/admin/viewlog" target="_blank">Check WL-OPC log files. (WLOPC/logs)</a>';
        clazz = "gritter-danger";

    } else if (code === napi.RESPONSE_TYPE_REMOTE_ERR) {
        title = napi.gritterErrorIcon + "Remote Error!";
        text = 'Error occurred! <br><a href="' + OPCContextPath + '/admin/viewlog" target="_blank">Check WL-OPC log files. (WLOPC/logs)</a>';
        clazz = "gritter-danger";

    } else if (code === napi.RESPONSE_TYPE_NO_LIC) {
        title = napi.gritterWarningIcon + "Warning!";
        text = "WL-OPC instance has no valid license!";
        clazz = "gritter-warning";

    } else if (code === napi.RESPONSE_TYPE_T3_USER_ERROR) {
        title = napi.gritterWarningIcon + "Warning!";
        text = "T3 Connection Error";
        clazz = "gritter-warning";

    } else if (code === napi.RESPONSE_TYPE_ALREADY_EXISTS) {
        title = napi.gritterWarningIcon + "Warning!";
        text = "";
        clazz = "gritter-warning";

    } else if (code === napi.RESPONSE_TYPE_TRIAL_MAX_EXEC) {
        title = napi.gritterWarningIcon + "Warning!";
        text = "";
        clazz = "gritter-warning";

    }



    if (typeof message === 'undefined' || message === null) {
        message = "";
    }
    if (message.trim() !== "") {
        text = message;
    }

    $.gritter.add({
        title: title,
        text: text,
        class_name: "gritter-icon " + clazz,
        time: 10000
    });
};

OPCApi.prototype.showWaitDivDelay = function (text, delay) {
    napi.loaderTimer.push(setTimeout(function () {
        napi.showWaitDiv(text);
    }, delay));
};

OPCApi.prototype.showRestartDivDelay = function (text, delay) {
    napi.loaderTimer.push(setTimeout(function () {
        napi.showRestartDiv(text);
    }, delay));
};

OPCApi.prototype.unique = function (arr) {
    var r = [];
    var m = {};
    var item = "";

    for (var i = 0; i < arr.length; i++) {
        item = arr[i];
        if (!m[item]) {
            r.push(item);
            m[item] = true;
        }
    }

    return(r);
};

OPCApi.prototype.uniqueObjectList = function (arr) {
    var r = [];
    var m = {};
    var item = "";
    var itemKey = "";

    for (var i = 0; i < arr.length; i++) {
        itemKey = JSON.stringify(arr[i]);
        item = arr[i];
        if (!m[itemKey]) {
            r.push(item);
            m[itemKey] = true;
        }
    }

    return(r);
};

OPCApi.prototype.serilizeJsonObjectNames = function (obj, root, resp) {

    if (typeof resp === 'undefined') {
        resp = [];
    }

    if (obj === null || typeof obj === 'undefined' || typeof obj !== 'object') {
        return resp;
    }

    if (typeof obj.length === 'undefined') {//object

        var keys = Object.keys(obj);

        for (var i = 0; i < keys.length; i++) {
            var lroot = root + '.' + keys[i];
            resp.push(lroot);

            var o = obj[keys[i]];

            if (typeof o === 'object') {
                resp = napi.serilizeJsonObjectNames(o, lroot, resp);
            }

        }

    } else {// array
        for (var i = 0; i < obj.length; i++) {
            var o = obj[i];
            if (typeof o === 'object') {
                resp = napi.serilizeJsonObjectNames(o, root, resp);
            }
        }
    }


    return resp;

};



OPCApi.prototype.showWaitDiv = function (text) {

    var $element = $('.mainLoader');

    if ($element.length === 0) {

        if (!text || text === null || text === "") {
            text = 'Processing';
        }

//        var html =
//                '<div class="mainLoader" style="position: fixed; width: 100%; height: 100%; top: 0px; left: 0px; background-color: rgba(0, 0, 0, 0.2); z-index: 1100; display: flex; background-repeat: no-repeat;  background-position: center;">\n\
//\n\
//    <div style="margin: auto; display: flex; background: #FFF; padding: 20px 30px 50px 30px; box-shadow: 0px 0px 15px; border-radius: 5px;">\n\
//     \n\
//\n\     <svg width="160" height="160" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">\n\
//            <g transform="translate(50 50)"> <g transform="translate(-19 -19) scale(0.6)"> \n\
//                <g transform="rotate(252.973)"><animateTransform attributeName="transform" type="rotate" values="0;360" keyTimes="0;1" dur="3.7s" begin="0s" repeatCount="indefinite"></animateTransform>\n\
//                <path d="M36.12478373637689 -8 L48.12478373637689 -8 L48.12478373637689 8 L36.12478373637689 8 A37 37 0 0 1 31.200933798381982 19.887225299397222 L31.200933798381982 19.887225299397222 L39.68621517262055 28.37250667363579 L28.372506673635797 39.68621517262055 L19.887225299397226 31.20093379838198 A37 37 0 0 1 7.999999999999998 36.12478373637689 L7.999999999999998 36.12478373637689 L7.999999999999999 48.12478373637689 L-7.999999999999994 48.12478373637689 L-7.999999999999995 36.12478373637689 A37 37 0 0 1 -19.887225299397222 31.200933798381982 L-19.887225299397222 31.200933798381982 L-28.37250667363579 39.68621517262055 L-39.68621517262055 28.3725066736358 L-31.20093379838198 19.88722529939723 A37 37 0 0 1 -36.12478373637689 8 L-36.12478373637689 8 L-48.12478373637689 8.000000000000002 L-48.12478373637689 -7.999999999999991 L-36.12478373637689 -7.999999999999992 A37 37 0 0 1 -31.200933798381982 -19.887225299397222 L-31.200933798381982 -19.887225299397222 L-39.68621517262055 -28.37250667363579 L-28.3725066736358 -39.68621517262055 L-19.88722529939723 -31.20093379838198 A37 37 0 0 1 -8.000000000000002 -36.124783736376884 L-8.000000000000002 -36.124783736376884 L-8.000000000000004 -48.124783736376884 L7.999999999999988 -48.12478373637689 L7.999999999999989 -36.12478373637689 A37 37 0 0 1 19.887225299397215 -31.200933798381985 L19.887225299397215 -31.200933798381985 L28.372506673635783 -39.68621517262056 L39.68621517262055 -28.372506673635804 L31.20093379838198 -19.887225299397233 A37 37 0 0 1 36.124783736376884 -8.000000000000005 M0 -22A22 22 0 1 0 0 22 A22 22 0 1 0 0 -22" fill="#58aee0"></path></g></g> <g transform="translate(19 19) scale(0.6)"> <g transform="rotate(84.527)"><animateTransform attributeName="transform" type="rotate" values="360;0" keyTimes="0;1" dur="3.7s" begin="-0.23125s" repeatCount="indefinite"></animateTransform><path d="M36.12478373637689 -8 L48.12478373637689 -8 L48.12478373637689 8 L36.12478373637689 8 A37 37 0 0 1 31.200933798381982 19.887225299397222 L31.200933798381982 19.887225299397222 L39.68621517262055 28.37250667363579 L28.372506673635797 39.68621517262055 L19.887225299397226 31.20093379838198 A37 37 0 0 1 7.999999999999998 36.12478373637689 L7.999999999999998 36.12478373637689 L7.999999999999999 48.12478373637689 L-7.999999999999994 48.12478373637689 L-7.999999999999995 36.12478373637689 A37 37 0 0 1 -19.887225299397222 31.200933798381982 L-19.887225299397222 31.200933798381982 L-28.37250667363579 39.68621517262055 L-39.68621517262055 28.3725066736358 L-31.20093379838198 19.88722529939723 A37 37 0 0 1 -36.12478373637689 8 L-36.12478373637689 8 L-48.12478373637689 8.000000000000002 L-48.12478373637689 -7.999999999999991 L-36.12478373637689 -7.999999999999992 A37 37 0 0 1 -31.200933798381982 -19.887225299397222 L-31.200933798381982 -19.887225299397222 L-39.68621517262055 -28.37250667363579 L-28.3725066736358 -39.68621517262055 L-19.88722529939723 -31.20093379838198 A37 37 0 0 1 -8.000000000000002 -36.124783736376884 L-8.000000000000002 -36.124783736376884 L-8.000000000000004 -48.124783736376884 L7.999999999999988 -48.12478373637689 L7.999999999999989 -36.12478373637689 A37 37 0 0 1 19.887225299397215 -31.200933798381985 L19.887225299397215 -31.200933798381985 L28.372506673635783 -39.68621517262056 L39.68621517262055 -28.372506673635804 L31.20093379838198 -19.887225299397233 A37 37 0 0 1 36.124783736376884 -8.000000000000005 M0 -22A22 22 0 1 0 0 22 A22 22 0 1 0 0 -22" fill="#ed5a6f"></path></g></g></g>\n\
//        \n\</svg>\n\
//        <div style="position: fixed;top: calc(50% + 75px);font-size: 18px;color: #888888;text-shadow: 0px -1px 0px rgba(0,0,0,.8);width: 160px;text-align: center;"> ' + text + ' </div>\n\
//    </div>\n\
//</div>';
        var html =
                '<div class="mainLoader" style="position: fixed; width: 100%; height: 100%; top: 0px; left: 0px; background-color: rgba(0, 0, 0, 0.2); z-index: 1100; display: flex; background-repeat: no-repeat;  background-position: center;">\n\
\n\
    <div style="margin: auto; display: flex; background: #FFF; padding: 20px 30px 50px 30px; box-shadow: 0px 0px 15px; border-radius: 5px;">\n\
     \n\
     <svg class="lds-gears" width="160" height="160" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><g transform="translate(50 50)"> <g transform="translate(-19 -19) scale(0.6)"> <g transform="rotate(84)"> \n\
<animateTransform attributeName="transform" type="rotate" values="0;360" keyTimes="0;1" dur="5s" begin="0s" repeatCount="indefinite"></animateTransform><path d="M37.3496987939662 -7 L47.3496987939662 -7 L47.3496987939662 7 L37.3496987939662 7 A38 38 0 0 1 31.359972760794346 21.46047782418268 L31.359972760794346 21.46047782418268 L38.431040572659825 28.531545636048154 L28.531545636048154 38.431040572659825 L21.46047782418268 31.359972760794346 A38 38 0 0 1 7.0000000000000036 37.3496987939662 L7.0000000000000036 37.3496987939662 L7.000000000000004 47.3496987939662 L-6.999999999999999 47.3496987939662 L-7 37.3496987939662 A38 38 0 0 1 -21.46047782418268 31.35997276079435 L-21.46047782418268 31.35997276079435 L-28.531545636048154 38.431040572659825 L-38.43104057265982 28.531545636048158 L-31.359972760794346 21.460477824182682 A38 38 0 0 1 -37.3496987939662 7.000000000000007 L-37.3496987939662 7.000000000000007 L-47.3496987939662 7.000000000000008 L-47.3496987939662 -6.9999999999999964 L-37.3496987939662 -6.999999999999997 A38 38 0 0 1 -31.35997276079435 -21.460477824182675 L-31.35997276079435 -21.460477824182675 L-38.431040572659825 -28.531545636048147 L-28.53154563604818 -38.4310405726598 L-21.4604778241827 -31.35997276079433 A38 38 0 0 1 -6.999999999999992 -37.3496987939662 L-6.999999999999992 -37.3496987939662 L-6.999999999999994 -47.3496987939662 L6.999999999999977 -47.3496987939662 L6.999999999999979 -37.3496987939662 A38 38 0 0 1 21.460477824182686 -31.359972760794342 L21.460477824182686 -31.359972760794342 L28.531545636048158 -38.43104057265982 L38.4310405726598 -28.53154563604818 L31.35997276079433 -21.4604778241827 A38 38 0 0 1 37.3496987939662 -6.999999999999995 M0 -23A23 23 0 1 0 0 23 A23 23 0 1 0 0 -23" fill="#8ad699"></path></g></g> <g transform="translate(19 19) scale(0.6)"> <g transform="rotate(253.5)"> \n\
<animateTransform attributeName="transform" type="rotate" values="360;0" keyTimes="0;1" dur="5s" begin="-0.3125s" repeatCount="indefinite"></animateTransform><path d="M37.3496987939662 -7 L47.3496987939662 -7 L47.3496987939662 7 L37.3496987939662 7 A38 38 0 0 1 31.359972760794346 21.46047782418268 L31.359972760794346 21.46047782418268 L38.431040572659825 28.531545636048154 L28.531545636048154 38.431040572659825 L21.46047782418268 31.359972760794346 A38 38 0 0 1 7.0000000000000036 37.3496987939662 L7.0000000000000036 37.3496987939662 L7.000000000000004 47.3496987939662 L-6.999999999999999 47.3496987939662 L-7 37.3496987939662 A38 38 0 0 1 -21.46047782418268 31.35997276079435 L-21.46047782418268 31.35997276079435 L-28.531545636048154 38.431040572659825 L-38.43104057265982 28.531545636048158 L-31.359972760794346 21.460477824182682 A38 38 0 0 1 -37.3496987939662 7.000000000000007 L-37.3496987939662 7.000000000000007 L-47.3496987939662 7.000000000000008 L-47.3496987939662 -6.9999999999999964 L-37.3496987939662 -6.999999999999997 A38 38 0 0 1 -31.35997276079435 -21.460477824182675 L-31.35997276079435 -21.460477824182675 L-38.431040572659825 -28.531545636048147 L-28.53154563604818 -38.4310405726598 L-21.4604778241827 -31.35997276079433 A38 38 0 0 1 -6.999999999999992 -37.3496987939662 L-6.999999999999992 -37.3496987939662 L-6.999999999999994 -47.3496987939662 L6.999999999999977 -47.3496987939662 L6.999999999999979 -37.3496987939662 A38 38 0 0 1 21.460477824182686 -31.359972760794342 L21.460477824182686 -31.359972760794342 L28.531545636048158 -38.43104057265982 L38.4310405726598 -28.53154563604818 L31.35997276079433 -21.4604778241827 A38 38 0 0 1 37.3496987939662 -6.999999999999995 M0 -23A23 23 0 1 0 0 23 A23 23 0 1 0 0 -23" fill="#28accf"></path></g></g></g></svg> \n\
        <div style="position: fixed;top: calc(50% + 75px);font-size: 18px;color: #888888;text-shadow: 0px -1px 0px rgba(0,0,0,.8);width: 160px;text-align: center;"> ' + text + ' </div>\n\
    </div>\n\
</div>';

        $('body').append(html);

        $('body').css('overflow', 'hidden');

    }

};

OPCApi.prototype.showRestartDiv = function (text) {

    var $element = $('.mainLoader');

    if ($element.length === 0) {

        if (!text || text === null || text === "") {
            text = 'Processing';
        }

        var html =
                '<div class="mainLoader" style="position: fixed; width: 100%; height: 100%; top: 0px; left: 0px; background-color: rgba(0, 0, 0, 0.2); z-index: 1100; display: flex; background-repeat: no-repeat;  background-position: center;">\n\
\n\
    <div style="margin: auto; display: flex; background: #FFF; padding: 20px 30px 50px 30px; box-shadow: 0px 0px 15px; border-radius: 5px;">\n\
     \n\
<svg width="160" height="160" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="lds-hourglass">\n\
	<defs>\n\
		<clipPath ng-attr-id="{{config.cpid}}" id="lds-hourglass-cpid-0cd8c118eeb98">\n\
			<rect x="0" y="0" width="100" height="3.75233">\n\
				<animate attributeName="y" calcMode="spline" values="0;50;0;0;0" keyTimes="0;0.4;0.5;0.9;1" dur="4" keySplines="0.3 0 1 0.7;0.3 0 1 0.7;0.3 0 1 0.7;0.3 0 1 0.7" begin="0s" repeatCount="indefinite"></animate>\n\
				<animate attributeName="height" calcMode="spline" values="50;0;0;50;50" keyTimes="0;0.4;0.5;0.9;1" dur="4" keySplines="0.3 0 1 0.7;0.3 0 1 0.7;0.3 0 1 0.7;0.3 0 1 0.7" begin="0s" repeatCount="indefinite"></animate>\n\
			</rect>\n\
			<rect x="0" y="50" width="100" height="46.2477">\n\
				<animate attributeName="y" calcMode="spline" values="100;50;50;50;50" keyTimes="0;0.4;0.5;0.9;1" dur="4" keySplines="0.3 0 1 0.7;0.3 0 1 0.7;0.3 0 1 0.7;0.3 0 1 0.7" begin="0s" repeatCount="indefinite"></animate>\n\
				<animate attributeName="height" calcMode="spline" values="0;50;50;0;0" keyTimes="0;0.4;0.5;0.9;1" dur="4" keySplines="0.3 0 1 0.7;0.3 0 1 0.7;0.3 0 1 0.7;0.3 0 1 0.7" begin="0s" repeatCount="indefinite"></animate>\n\
			</rect>\n\
		</clipPath>\n\
	</defs>\n\
	<g transform="translate(50,50)">\n\
		<g transform="scale(0.9)">\n\
			<g transform="translate(-50,-50)"><g transform="rotate(180 50 50)">\n\
				<animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;0 50 50;180 50 50;180 50 50;360 50 50" keyTimes="0;0.4;0.5;0.9;1" dur="4s" begin="0s" repeatCount="indefinite"></animateTransform>\n\
				<path ng-attr-clip-path="url(#{{config.cpid}})" ng-attr-fill="{{config.sand}}" d="M54.864,50L54.864,50c0-1.291,0.689-2.412,1.671-2.729c9.624-3.107,17.154-12.911,19.347-25.296 c0.681-3.844-1.698-7.475-4.791-7.475H28.908c-3.093,0-5.472,3.631-4.791,7.475c2.194,12.385,9.723,22.189,19.347,25.296 c0.982,0.317,1.671,1.438,1.671,2.729v0c0,1.291-0.689,2.412-1.671,2.729C33.84,55.836,26.311,65.64,24.117,78.025 c-0.681,3.844,1.698,7.475,4.791,7.475h42.184c3.093,0,5.472-3.631,4.791-7.475C73.689,65.64,66.16,55.836,56.536,52.729 C55.553,52.412,54.864,51.291,54.864,50z" clip-path="url(#lds-hourglass-cpid-0cd8c118eeb98)" fill="#28accf"></path>\n\
				<path ng-attr-fill="{{config.frame}}" d="M81,81.5h-2.724l0.091-0.578c0.178-1.122,0.17-2.243-0.022-3.333C76.013,64.42,68.103,54.033,57.703,50.483l-0.339-0.116 v-0.715l0.339-0.135c10.399-3.552,18.31-13.938,20.642-27.107c0.192-1.089,0.2-2.211,0.022-3.333L78.276,18.5H81 c2.481,0,4.5-2.019,4.5-4.5S83.481,9.5,81,9.5H19c-2.481,0-4.5,2.019-4.5,4.5s2.019,4.5,4.5,4.5h2.724l-0.092,0.578 c-0.178,1.122-0.17,2.243,0.023,3.333c2.333,13.168,10.242,23.555,20.642,27.107l0.338,0.116v0.715l-0.338,0.135 c-10.4,3.551-18.31,13.938-20.642,27.106c-0.193,1.09-0.201,2.211-0.023,3.333l0.092,0.578H19c-2.481,0-4.5,2.019-4.5,4.5 s2.019,4.5,4.5,4.5h62c2.481,0,4.5-2.019,4.5-4.5S83.481,81.5,81,81.5z M73.14,81.191L73.012,81.5H26.988l-0.128-0.309 c-0.244-0.588-0.491-1.538-0.28-2.729c2.014-11.375,8.944-20.542,17.654-23.354c2.035-0.658,3.402-2.711,3.402-5.108 c0-2.398-1.368-4.451-3.403-5.108c-8.71-2.812-15.639-11.979-17.653-23.353c-0.211-1.191,0.036-2.143,0.281-2.731l0.128-0.308 h46.024l0.128,0.308c0.244,0.589,0.492,1.541,0.281,2.731c-2.015,11.375-8.944,20.541-17.654,23.353 c-2.035,0.658-3.402,2.71-3.402,5.108c0,2.397,1.368,4.45,3.403,5.108c8.71,2.812,15.64,11.979,17.653,23.354 C73.632,79.651,73.384,80.604,73.14,81.191z" fill="#8ad699"></path>\n\
			</g></g></g></g>\n\
</svg>\n\
        <div style="position: fixed;top: calc(50% + 75px);font-size: 18px;color: #888888;text-shadow: 0px -1px 0px rgba(0,0,0,.8);width: 160px;text-align: center;"> ' + text + ' </div>\n\
    </div>\n\
</div>';

        $('body').append(html);

        $('body').css('overflow', 'hidden');

    }

};

OPCApi.prototype.removeWaitDiv = function () {

    var $element = $('.mainLoader');

    if ($element.length > 0) {
        $element.remove();

    }

    for (var i = 0; i < napi.loaderTimer.length; i++) {
        clearTimeout(napi.loaderTimer[i]);
    }

    $('body').css('overflow', '');

    napi.loaderTimer = [];

};

OPCApi.prototype.setTableSearchElements = function (headers, tbody, split, splitChar) {

    for (var i = 0; i < headers.length; i++) {

        var h = $(headers[i]);
        var label = h.text();
        h.attr('title', label);

        if (h.hasClass('input')) {
            h.html('<input class="form-control" type="text" autocomplete="off" placeholder="Search ' + label + '" />');

        } else if (h.hasClass('select')) {

            var splt = split === true;

            var tds = tbody.find('td:nth-child(' + (i + 1) + ')');

            var vals = {};

            for (var j = 0; j < tds.length; j++) {

                if (splt) {
                    var iVals = $(tds[j]).text().split(splitChar);

                    for (var k = 0; k < iVals.length; k++) {
                        vals[iVals[k]] = true;
                    }

                } else {
                    vals[$(tds[j]).text()] = true;
                }
            }

            vals = Object.keys(vals);
            vals = vals.sort();

            var selElm = '<select class="form-control"><option value=" ">Select ' + label + '</option>';

            for (var j = 0; j < vals.length; j++) {
                selElm += '<option>' + vals[j] + '</option>';
            }

            selElm += '</select>';

            h.html(selElm);

        }

    }

};

OPCApi.prototype.getEnvironmentName = function (envId) {
    return napi.environmentNames[envId];
};

OPCApi.prototype.processError = function (xhr, ajaxOptions, thrownError) {
    napi.removeWaitDiv();

    var title = "Error";
    var text = thrownError;

    if (xhr.responseJSON && xhr.responseJSON !== null && typeof xhr.responseJSON !== 'undefined') {

        title += ": " + xhr.responseJSON.error + " ( " + xhr.responseJSON.status + " )";
        text = "<br><b>Service:</b> " + xhr.responseJSON.path + "<br><br>";
        text += "<b>Message:</b> " + xhr.responseJSON.message;

    }

    $.gritter.add({
        title: napi.gritterErrorIcon + title,
        text: text,
        class_name: "gritter-icon gritter-danger",
        time: 10000
    });
};

OPCApi.prototype.activationTimeParser = function (a) {
    var x = 99999999999999;
    var val = $(a).text();

    if ($.trim(val) !== '') {

        if (val.indexOf("Day") > -1) {
            x = parseInt(val) * 24 * 60;
        } else if (val.indexOf("Hour") > -1) {
            x = parseInt(val) * 60;
        } else if (val.indexOf("Minute") > -1) {
            x = parseInt(val);
        }

    }

    return x;
};

OPCApi.prototype.activationTimeSorter = function (a, b) {
    var an = napi.activationTimeParser(a);
    var bn = napi.activationTimeParser(b);

    if (an > bn)
        return 1;
    if (an < bn)
        return -1;
    return 0;
};

OPCApi.prototype.healthValueConverter = function (a) {

    if (a.toUpperCase().indexOf("SHUTDOWN") > -1) {
        return 5;
    }

    if (a.toUpperCase().indexOf("FAILED") > -1) {
        return 4;
    }

    if (a.toUpperCase().indexOf("CRITICAL") > -1) {
        return 3;
    }

    if (a.toUpperCase().indexOf("OVERLOADED") > -1) {
        return 2;
    }

    if (a.toUpperCase().indexOf("WARN") > -1) {
        return 1;
    }

    return 0;

};

OPCApi.prototype.healthSorter = function (a, b) {
    var an = napi.healthValueConverter(a);
    var bn = napi.healthValueConverter(b);

    if (an > bn)
        return 1;
    if (an < bn)
        return -1;
    return 0;
};

OPCApi.prototype.stateValueConverter = function (a) {


    if (a.toUpperCase().indexOf("RUNNING") > -1) {
        return 0;
    }

    if (a.toUpperCase().indexOf("ACTIVE") > -1) {
        return 0;
    }

    return 9;

};

OPCApi.prototype.stateSorter = function (a, b) {
    var an = napi.stateValueConverter(a);
    var bn = napi.stateValueConverter(b);

    if (an > bn)
        return 1;
    if (an < bn)
        return -1;
    return 0;
};


OPCApi.prototype.ajax = function (type, url, data, success, dataType, async) {

    napi.showWaitDivDelay("Reloading...", 1000);

    $.ajax({
        type: type,
        url: url,
        data: data,
        success: function (data) {
            napi.removeWaitDiv();
            $('.tooltip').remove();
            success(data);
        },
        dataType: dataType,
        async: async,
        cache: false,
        error: function (xhr, ajaxOptions, thrownError) {

            napi.removeWaitDiv();
            $('.tooltip').remove();

            if (typeof xhr.responseText !== 'undefined') {
                if (xhr.responseText.indexOf('<form action="/opc/login" method="post">') > -1) {
                    document.location.reload(true);
                } else {
                    napi.processError(xhr, ajaxOptions, thrownError);
                }
            }
        }
    });

};

OPCApi.prototype.post = function (url, success) {
    napi.ajax('POST', url, null, success, 'json', true);
};

OPCApi.prototype.parseInputArg = function (ps) {
    var prop = ps.split("=");
    var key = prop[0].trim();
    var val = "N/A";

    if (prop.length > 1) {
        val = prop[1].trim();
    }


    return [key, val];
};

OPCApi.prototype.postfd = function (url, data, success) {
    napi.ajax('POST', url, data, success, 'json', true);
};

OPCApi.prototype.ajaxForm = function (url, data, success, async, showWaitDiv) {

    if (async === undefined) {
        async = true;
    }

    if (showWaitDiv === undefined) {
        showWaitDiv = true;
    }

    if (showWaitDiv) {
        napi.showWaitDivDelay("Reloading...", 1000);
    }

    $.ajax({
        url: url,
        data: data,
        processData: false,
        contentType: false,
        async: async,
        type: 'POST',
        success: function (data) {
            napi.removeWaitDiv();
            $('.tooltip').remove();
            success(data);
        },
        error: function (xhr, ajaxOptions, thrownError) {

            napi.removeWaitDiv();
            $('.tooltip').remove();

            if (xhr.responseText.indexOf('<form action="/opc/login" method="post">') > -1) {
                document.location.reload(true);
            } else {
                napi.processError(xhr, ajaxOptions, thrownError);
            }

        }
    });

};


OPCApi.prototype.ajaxFormAwait = function (url, data, success) {
    return Promise.resolve().then(function () {
        return $.ajax({
            url: url,
            data: data,
            processData: false,
            contentType: false,
            async: true,
            type: 'POST',
            success: function (data) {
                napi.removeWaitDiv();
                $('.tooltip').remove();
                success(data);
            },
            error: function (xhr, ajaxOptions, thrownError) {

                napi.removeWaitDiv();
                $('.tooltip').remove();

                if (xhr.responseText.indexOf('<form action="/opc/login" method="post">') > -1) {
                    document.location.reload(true);
                } else {
                    napi.processError(xhr, ajaxOptions, thrownError);
                }

            }
        });
    }).then(function () {});
};


/**
 * 
 * @returns {OPCApi.prototype.getDatatableOpts.appAnonym$15}
 */
OPCApi.prototype.getDatatableOpts = function () {
    return {
        columns: []
        , height: undefined
        , data: []
        , toolbar: "#toolbar"
        , search: true
        , showRefresh: true
        , showToggle: true
        , showColumns: true
        , showExport: true
        , minimumCountColumns: 1
        , showPaginationSwitch: true
        , pagination: true
        , idField: "id"
        , pageList: [10, 25, 50, 100, "ALL"]
        , pageSize: 10
        , showFooter: false
        , responseHandler: "responseHandler"
        , resizable: true
        , reorderableColumns: true
        , filterControl: true
        , stickyHeader: true
        , stickyHeaderOffsetY: '0px'
//      , cookie: true
//      , cookieIdTable: ''
//      , cookieExpire: '1y'
        , showMultiSort: true
//      , sortPriority: []
    };
};

OPCApi.prototype.restartApplication = function () {
    napi.showRestartDivDelay("Restarting ...", 200);

    napi.post(napi.services.restartApp.URL, function () {

    });

    setInterval(function () {

        napi.post(napi.services.salute.URL, function (data) {

            if (data * 1 === 1) {
                document.location.reload(true);
            }

        });

    }, 3000);

};

OPCApi.prototype.setExtraColumnProperties = function (cols) {

    var newCols = cols;


    for (var i = 0; i < cols.length; i++) {

        var col = cols[i];

        if (Array.isArray(col)) {

            for (var j = 0; j < col.length; j++) {

                if (!col[j].hasOwnProperty("titleTooltip") && col[j].hasOwnProperty("title")) {
                    col[j]["titleTooltip"] = col[j]["title"];
                }

            }

        } else {
            if (!col.hasOwnProperty("titleTooltip") && col.hasOwnProperty("title")) {
                col["titleTooltip"] = col["title"];
            }
        }

    }


    return newCols;
};


OPCApi.prototype.convertTimeShort = function (duration) {
    var ms = parseInt((duration / 1000000) % (1000));
    var sc = parseInt((duration / (1000 * 1000 * 1000)) % (1000));

    if (ms > 0) {
        ms += "ms ";
    } else {
        ms = "";
    }

    if (sc > 0) {
        sc += "sec ";
    } else {
        sc = "";
    }

    var result = sc + ms;

    if (result === "") {
        result = "< 1ms";
    }

    return result;
};

OPCApi.prototype.convertTime = function (duration) {
    var ns = duration % (1000);
    var mc = parseInt((duration / 1000) % (1000));
    var ms = parseInt((duration / 1000000) % (1000));
    var sc = parseInt((duration / (1000 * 1000 * 1000)) % (1000));

    if (ns > 0) {
        ns += "ns";
    } else {
        ns = "";
    }

    if (mc > 0) {
        mc += "mu ";
    } else {
        mc = "";
    }

    if (ms > 0) {
        ms += "ms ";
    } else {
        ms = "";
    }

    if (sc > 0) {
        sc += "sec ";
    } else {
        sc = "";
    }

    return sc + ms + mc + ns;
};


OPCApi.prototype.isMetricSuitableForTheThreadCPUConsumption = function (metricName) {
    return metricName.toLowerCase().indexOf("cpu") > -1;
//            || metricName === "StuckThreadCount"
//            || metricName === "HoggingThreadCount";
};

OPCApi.prototype.isMetricSuitableForBackendCandidates = function (metricName) {
    return metricName === "OpenSocketsCurrentCount" ||
            metricName === "PendingUserRequestCount" ||
            metricName === "StuckThreadCount" ||
            metricName === "HoggingThreadCount";
};

OPCApi.prototype.isMetricSuitableForJVMConsumers = function (metricName) {
    return metricName === "SystemCpuLoad" || metricName === "CPULoad";
};

OPCApi.prototype.sort_by = function (field, reverse, primer) {
    var key = function (x) {
        return primer ? primer(x[field]) : x[field];
    };

    return function (a, b) {
        var A = key(a), B = key(b);
        return ((A < B) ? -1 : ((A > B) ? 1 : 0)) * [-1, 1][+!!reverse];
    };
};

OPCApi.prototype.clone = function (obj) {
    if (null === obj || "object" !== typeof obj)
        return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr))
            copy[attr] = obj[attr];
    }
    return copy;
};

OPCApi.prototype.datatable = function ($table, toolbar, data, columns, height, pageSize, sortName, sortOrder, onPostBody, stickyHeader) {

    var opts = napi.getDatatableOpts();
    opts.data = data;
    opts.columns = napi.setExtraColumnProperties(columns);
    opts.toolbar = toolbar;
    opts.tableSelector = $table.selector;

    var page_name = window.location.pathname.safeReplace(/\//g, '_');
    opts.cookieIdTable = page_name + "_" + toolbar.safeReplace(/#/g, '_').safeReplace(/\./g, '_').safeReplace(/-/g, '_');

    if (height === undefined) {
        opts.height = $(window).height() - 125;
    } else {
        opts.height = height;
    }

    if (stickyHeader !== undefined) {
        opts.stickyHeader = stickyHeader;
    }

    if (opts.height < 480) {
        opts.height = 480;
    }

    if (pageSize !== undefined) {

        if (pageSize === napi.maxItem) {
            opts.pagination = false;
        } else {
            opts.pageSize = pageSize;
        }
    }

    if (typeof sortName !== 'undefined' && sortName !== null && sortName.trim() !== '') {
        opts.sortName = sortName;
    }

    if (typeof onPostBody !== 'undefined' && onPostBody !== null) {
        opts.onPostBody = onPostBody;
    }

    if (typeof sortOrder !== 'undefined' && sortOrder !== null && sortOrder.trim() !== '') {
        opts.sortOrder = sortOrder;
    }

//    opts.onPostHeader = function () {
//        $(this.tableSelector).find('select').not('.select2-hidden-accessible').select2();
//    };

    $table.bootstrapTable('destroy');
    var btt = $table.bootstrapTable(opts);

    $('.custom_datatables_search_form').submit(function (e) {
        e.preventDefault();
        return false;
    });

    var cont = $table.parents('.bootstrap-table');
    cont.addClass('fadeIn animated animatein1s');

    var bar = cont.find('.columns.columns-right.btn-group.pull-right');
    bar.append(
            '<button class="btn btn-default" data-state="0" type="button" name="toggle-filter" aria-label="toggle-filter" title="Toggle Filter"><i class="glyphicon glyphicon-filter"></i></button>'
            );

    bar.find('[name="toggle-filter"]').click(function () {

        var node = $(this);
        var state = node.data('state');

        var cells = cont.find('.fht-cell');

        if (state === '1') {

            cells.css('display', '');
            node.data('state', '0');
            cont.find('.fixed-table-header').css('height', node.data('sheight'));

        } else {

            cells.css('display', 'none');
            node.data('state', '1');
            var h = cont.find('.fixed-table-header').css('height');
            node.data('sheight', h);
            cont.find('.fixed-table-header').css('height', 'auto');

        }

        $table.bootstrapTable('resetView');

    });

    bar.find('[name="toggle-filter"]').click();

//    $table.click(function () {
//        setTimeout(function () {
//            $(this).bootstrapTable('resetView');
//        }, 500);
//    });


    $table.on('all.bs.table', function (e, name, args) {

        var state = cont.find('[name="toggle-filter"]').data('state');
        var tbl = $(this);

        if (state === '1') {
            cont.find('.fixed-table-header').css('height', 'auto');
        }

        setTimeout(function () {
            var mt = tbl.style('margin-top');
            tbl.style('margin-top', mt, 'important');
        }, 10);

        tbl.find('td').each(function () {
            var diz = $(this);
            diz.attr('title', diz.text());
        });

        setTimeout(function () {

            tbl.parents('.fixed-table-container').find('thead > tr > th select').each(function () {
                var slct = $(this);
                var opts = slct.find('option');
                var cval = slct.val();

                var map = {};

                opts.each(function () {

                    try {
                        map[$(this).text().trim()] = "";
                    } catch (e) {
                    }

                });

                var o = "";
                var v = Object.keys(map);

                for (var i = 0; i < v.length; i++) {

                    var sval = v[i];

                    if (sval === cval) {
                        o += '<option selected value="' + v[i] + '">' + v[i] + '</option>';
                    } else {
                        o += '<option value="' + v[i] + '">' + v[i] + '</option>';
                    }

                }

                slct.html(o);
                slct.val(cval);

            });

            tbl.parents('.fixed-table-container').css('padding-bottom',
                    tbl.parents('.fixed-table-container').find('.fixed-table-header').height() + 4
                    );

        }, 200);

    });

    setTimeout(function () {
        $table.bootstrapTable('resetView');

        setTimeout(function () {
            $table.bootstrapTable('resetView');
        }, 100);

    }, 100);

//    $('#main-menu-toggle').click(function () {
//        setTimeout(function () {
//            $table.bootstrapTable('resetView');
//            setTimeout(function () {
//                $table.bootstrapTable('resetView');
//            }, 100);
//        }, 100);
//    });

    $('.nav.tab-menu.nav-tabs').find('[href="#' + $table.parents('.tab-pane').attr('id') + '"]').click(function () {

        setTimeout(function () {
            $table.bootstrapTable('resetView');
            setTimeout(function () {
                $table.bootstrapTable('resetView');
            }, 100);
        }, 50);
    });

    $(window).resize(function () {

        if (cont.data('resizing') === '1') {
            return;
        }

        cont.data('resizing', '1');
        cont.removeClass('fadeIn animated animatein1s');
        setTimeout(function () {
            cont.addClass('fadeIn animated animatein1s');
        }, 50);

        setTimeout(function () {
            $table.bootstrapTable('resetView');
            setTimeout(function () {
                $table.bootstrapTable('resetView');
                cont.data('resizing', '');
            }, 100);
        }, 50);
    });

};

var napi = new OPCApi();

$(document).ready(function () {

    $("#open-close").addClass("closed");

    $("#open-close").click(function () {

        var w = $('#theme-settings').outerWidth();

        if ($(this).hasClass("closed")) {
            $(this).parent().animate({
                left: $(window).width() - w
            }, 300);
            $(this).removeClass("closed");
        } else {
            $(this).parent().animate({
                left: "100%"
            }, 300);
            $(this).addClass("closed");
        }
    });

    $('.main').css('min-height', $(window).height() - 46);
    $('footer').css('display', '');

    $('#main-menu-toggle').click(function () {
        $(window).resize();
    });

    $(window).resize(function () {
        $('.tooltip').remove();
    });

    $('a.action.logout').click(function () {
        document.location.href = OPCContextPath + "/logout";
    });

    $('a.action.edit-password').click(function () {

        var oldPasswordElm = $('#glb-old-password');
        var newPasswordElm = $('#glb-new-password');
        var conPasswordElm = $('#glb-confirm-password');

        oldPasswordElm.val('');
        newPasswordElm.val('');
        conPasswordElm.val('');

        $('#modal-edit-password').modal({
            backdrop: 'static',
            keyboard: false
        });

    });

    $('.change-user-password-glb').click(function () {

        var form = $('#change-user-password-glb-form');

        if (napi.validateForm(form)) {

            var fdata = new FormData();

            var oldPasswordElm = $('#glb-old-password');
            var newPasswordElm = $('#glb-new-password');
            var conPasswordElm = $('#glb-confirm-password');

            var oldPassword = oldPasswordElm.val().trim();
            var newPassword = newPasswordElm.val().trim();
            var conPassword = conPasswordElm.val().trim();

            if (newPassword !== conPassword) {
                var parent = conPasswordElm.parents('.form-group');
                var label = parent.find('.system-warnin-label');

                if (label.length === 0) {
                    parent.append('<label class="control-label system-warnin-label"></label>');
                    label = parent.find('.system-warnin-label');
                }

                parent.addClass('has-error');
                label.html('Not same!');

                return;
            }

            fdata.append('old-password', oldPassword);
            fdata.append('new-password', newPassword);
            fdata.append('confirm-password', conPassword);

            napi.showWaitDivDelay("Processing...", 500);

            var url = OPCContextPath + "/changePassword";

            napi.ajaxForm(url, fdata, function (data) {

                napi.removeWaitDiv();

                if (napi.processStdResp(data.responseCode, data.responseMessage, true)) {
                    $('#modal-edit-password').modal('hide');
                }


            });

        }

    });

    $('.md-close').click(function () {
        $(this).parents('.md-show').removeClass('md-show');
    });

    $('[data-toggle="tooltip"]').tooltip();


    $.fn.enterKey = function (fnc) {
        return this.each(function () {
            $(this).keypress(function (e) {
                var keycode = (e.keyCode ? e.keyCode : e.which);
                if (keycode * 1 === 13) {
                    fnc.call(this, e);
                }
            });
        });
    };

});



/***************************
 * 
 * 
 *  
 * 
 */

function OPCWSClient() {

    this.stompClient = null;
    this.wsconnected = false;
    this.socket = null;
    this.timer = null;
    this.ttlCounter = 0;
}

OPCWSClient.prototype.setConnected = function (connected) {
    opcwsc.wsconnected = connected;
};


OPCWSClient.prototype.connect = function () {
    opcwsc.ttlCounter++;

    opcwsc.socket = new SockJS(OPCContextPath + '/wsroot');

    opcwsc.stompClient = Stomp.over(opcwsc.socket);

    opcwsc.stompClient.connect({}, function (frame) {
        opcwsc.setConnected(true);
        opcwsc.stompClient.subscribe('/topic/message', function (message) {
            opcwsc.processMessage(JSON.parse(message.body));
        });
    });

};



OPCWSClient.prototype.triggerNotificationTimeLine = function () {
    $('[href="#historia-reiss"]').click();
    notifications.fn.getHistoryData(false);
};

OPCWSClient.prototype.processMessage = function (message) {

    if (document.location.href.indexOf("/notificationdashboard") > -1 && document.location.href.indexOf("?tid=") === -1) {

        $.gritter.add({
            position: 'bottom-right',
            title: napi.gritterWarningIcon + ' New notifications just received!',
            text: '<a href="javascript:;" onclick="opcwsc.triggerNotificationTimeLine()">Refresh Notifications Timeline <i class="fas fa-sync fa-spin"></i></a>',
            class_name: 'gritter-icon gritter-warning gritter-push bounceInRight animated',
            time: 10000
        });

    } else {
        $.gritter.add({
            position: 'bottom-right',
            title: napi.gritterWarningIcon + ' New notifications just received!',
            text: '<a href="' + message.pageName + '">Click to go notifications <i class="fa fa-external-link-alt"></i></a>',
            class_name: 'gritter-icon gritter-warning gritter-push bounceInRight animated',
            time: 10000
        });
    }
};

OPCWSClient.prototype.start = function () {

    if (typeof SockJS === 'undefined') {
        return;
    }

    opcwsc.connect();

    opcwsc.timer = setInterval(function () {

        if (opcwsc.ttlCounter >= 3) {
            clearInterval(opcwsc.timer);
            return;
        }

        if (!opcwsc.wsconnected) {
            opcwsc.connect();
        }

    }, 30000);

    window.addEventListener("beforeunload", function (e) {
        opcwsc.stompClient.disconnect();
    }, false);

};

var opcwsc = new OPCWSClient();

$(document).ready(function () {

    $(document).on('click', '.panel-heading h2', function (e) {
        e.preventDefault();
        $(this).parent().parent().find('.btn-minimize').click();
    });

    $('div.sidebar-menu.opened ul li a[href="javascript:;"]').click(function () {

        if (!$(this).parent().hasClass("opened")) {
            $(this).parent().parent().find('li.opened > ul').not(this).slideToggle('slow', function () {
                dropSidebarShadow();
            }).parent().removeClass('opened');
        }

    });

    setTimeout(function () {

//        Pace.stop();
//        Pace.off();
//        Pace = null;

//        window.paceOptions = {
//            ajax: {
//                trackWebSockets: false,
//                ajax: false
//            }
//        };

//      var b = document.location.href.startsWith('https');
        var b = false;

        if (b) {
            if ('serviceWorker' in navigator) {

                if (Notification.permission !== "granted") {
                    Notification.requestPermission();
                }

                if (Notification.permission === "granted") {

                    navigator.serviceWorker.register(OPCContextPath + '/assets/js/sw/serviceWorker.js').then(function (registration) {
                        console.log('ServiceWorker registration successful with scope: ', registration.scope);
                        registration.update();
//                        console.log(registration);
                    }).catch(function (err) {
                        console.log('ServiceWorker registration failed: ', err);
                        opcwsc.start();
                    });

                } else {
                    opcwsc.start();
                }

            } else {
                opcwsc.start();
            }
        } else {
            opcwsc.start();
        }
    }, 3000);

});


(function ($) {
    if ($.fn.style) {
        return;
    }

    // Escape regex chars with \
    var escape = function (text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

    // For those who need them (< IE 9), add support for CSS functions
    var isStyleFuncSupported = !!CSSStyleDeclaration.prototype.getPropertyValue;
    if (!isStyleFuncSupported) {
        CSSStyleDeclaration.prototype.getPropertyValue = function (a) {
            return this.getAttribute(a);
        };
        CSSStyleDeclaration.prototype.setProperty = function (styleName, value, priority) {
            this.setAttribute(styleName, value);
            var priority = typeof priority !== 'undefined' ? priority : '';
            if (priority !== '') {
                // Add priority manually
                var rule = new RegExp(escape(styleName) + '\\s*:\\s*' + escape(value) +
                        '(\\s*;)?', 'gmi');
                this.cssText =
                        this.cssText.replace(rule, styleName + ': ' + value + ' !' + priority + ';');
            }
        };
        CSSStyleDeclaration.prototype.removeProperty = function (a) {
            return this.removeAttribute(a);
        };
        CSSStyleDeclaration.prototype.getPropertyPriority = function (styleName) {
            var rule = new RegExp(escape(styleName) + '\\s*:\\s*[^\\s]*\\s*!important(\\s*;)?',
                    'gmi');
            return rule.test(this.cssText) ? 'important' : '';
        };
    }

    // The style function
    $.fn.style = function (styleName, value, priority) {
        // DOM node
        var node = this.get(0);
        // Ensure we have a DOM node
        if (typeof node === 'undefined') {
            return this;
        }
        // CSSStyleDeclaration
        var style = this.get(0).style;
        // Getter/Setter
        if (typeof styleName !== 'undefined') {
            if (typeof value !== 'undefined') {
                // Set style property
                priority = typeof priority !== 'undefined' ? priority : '';
                style.setProperty(styleName, value, priority);
                return this;
            } else {
                // Get style property
                return style.getPropertyValue(styleName);
            }
        } else {
            // Get CSSStyleDeclaration
            return style;
        }
    };
})(jQuery);