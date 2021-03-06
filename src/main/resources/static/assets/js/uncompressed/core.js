/*******************************************************************************
 * CONFIGURATION
 */
$.ajaxLoad = false; // Active ajax page loader
// required when $.ajaxLoad = true
$.defaultPage = 'dashboard.html';
$.subPagesDirectory = 'pages/';
$.page404 = 'page-404.html';
$.mainContent = $('.main');

$.panelIconOpened = 'icon-arrow-up';
$.panelIconClosed = 'icon-arrow-down';

/*******************************************************************************
 * ASYNC LOAD Load JS files and CSS files asynchronously in ajax mode
 */
function loadJS(jsFiles, pageScript) {

	for (i = 0; i < jsFiles.length; i++) {

		var body = document.getElementsByTagName('body')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.async = false;
		script.src = jsFiles[i];
		body.appendChild(script);
	}

	if (pageScript) {
		var body = document.getElementsByTagName('body')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.async = false;
		script.src = pageScript;
		body.appendChild(script);
	}

	init();
}

var cssArray = {};

function loadCSS(cssFile, end, callback) {

	if (!cssArray[cssFile]) {
		cssArray[cssFile] = true;

		if (end == 1) {

			var head = document.getElementsByTagName('head')[0];
			var s = document.createElement('link');
			s.setAttribute('rel', 'stylesheet');
			s.setAttribute('type', 'text/css');
			s.setAttribute('href', cssFile);

			s.onload = callback;
			head.appendChild(s);

		} else {

			var head = document.getElementsByTagName('head')[0];
			var style = document.getElementById('main-style');

			var s = document.createElement('link');
			s.setAttribute('rel', 'stylesheet');
			s.setAttribute('type', 'text/css');
			s.setAttribute('href', cssFile);

			s.onload = callback;
			head.insertBefore(s, style);

		}

	} else if (callback) {
		callback();
	}

}

/*******************************************************************************
 * AJAX LOAD Load pages asynchronously in ajax mode
 */

if ($.ajaxLoad) {

	paceOptions = {
		elements : false,
		restartOnRequestAfter : false
	};

	url = location.hash.replace(/^#/, '');

	if (url != '') {
		setUpUrl(url);
	} else {
		setUpUrl($.defaultPage);
	}

	$(document).on(
			'click',
			'.nav a[href!="#"]',
			function(event) {

				if ($(this).parent().parent().hasClass('nav-tabs')
						|| $(this).parent().parent().hasClass('nav-pills')) {
					event.preventDefault();
				} else if ($(this).attr('target') == '_top') {
					event.preventDefault();
					$this = $(event.currentTarget);
					window.location = ($this.attr('href'));
				} else if ($(this).attr('target') == '_blank') {
					event.preventDefault();
					$this = $(event.currentTarget);
					window.open($this.attr('href'));
				} else {
					event.preventDefault();
					var target = $(event.currentTarget);
					setUpUrl(target.attr('href'));
				}
			});

	$(document).on('click', 'a[href="#"]', function(e) {
		e.preventDefault();
	});
}

function setUpUrl(url) {
	$('.nav li').removeClass('active');
	$('.nav li:has(a[href="' + url + '"])').addClass('active').parent().show();

	if ($('.nav li:has(a[href="' + url + '"])').find("ul").size() != 0) {

		$('.opened').removeClass('opened');

		$('.nav a[href="' + url + '"]').parents('li').add(this).each(
				function() {
					$(this).addClass('opened');
				});

		$('.nav li').each(function() {
			if (!$(this).hasClass('opened')) {
				$(this).find('ul').slideUp();
			}
		});
	}

	loadPage(url);
}

function loadPage(url) {

	$.ajax({
		type : "GET",
		url : $.subPagesDirectory + url,
		dataType : 'html',
		cache : false,
		async : false,
		beforeSend : function() {
			$.mainContent.css({
				opacity : 0
			});
		},
		success : function() {
			Pace.restart();
			$("html, body").animate({
				scrollTop : 0
			}, 0);
			$.mainContent.load($.subPagesDirectory + url, null,
					function(responseText) {
						window.location.hash = url;
					}).delay(250).animate({
				opacity : 1
			}, 750);

		},
		error : function() {
			window.location.href = $.page404;
		}

	});
}

/*******************************************************************************
 * MAIN NAVIGATION
 */

$(document)
		.ready(
				function($) {

					if ($('body').hasClass('rtl')) {
						loadCSS('assets/css/bootstrap-rtl.min.css', loadCSS(
								'assets/css/style.rtl.min.css', 1, 0))
					}

					if ($('#clock').length) {
						startTime();
					}

					// Add class .active to current link - AJAX Mode off
					$('ul.nav-sidebar').find('a').each(function() {

						var cUrl = String(window.location);

						if (cUrl.substr(cUrl.length - 1) == '#') {
							cUrl = cUrl.slice(0, -1);
						}

						if ($($(this))[0].href == cUrl) {

							$(this).parent().addClass('active');

							$(this).parents('ul').add(this).each(function() {
								$(this).show().parent().addClass('opened');
							});
						}
					});

					// Dropdown Menu
					$('.nav-sidebar')
							.on(
									'click',
									'a',
									function(e) {

										if ($.ajaxLoad) {
											e.preventDefault();
										}

										if (!$(this).parent().hasClass('hover')) {
											if ($(this).parent().find('ul')
													.size() != 0) {

												if ($(this).parent().hasClass(
														'opened')) {
													$(this).parent()
															.removeClass(
																	'opened');
												} else {
													$(this).parent().addClass(
															'opened');
												}

												$(this)
														.parent()
														.find('ul')
														.first()
														.slideToggle(
																'slow',
																function() {
																	dropSidebarShadow();
																});

												$(this)
														.parent()
														.parent()
														.find('ul')
														.each(
																function() {
																	if (!$(this)
																			.parent()
																			.hasClass(
																					'opened')) {
																		$(this)
																				.slideUp();
																	}
																});

												if (!$(this).parent().parent()
														.parent().hasClass(
																'opened')) {
													$('.nav a')
															.not(this)
															.parent()
															.find('ul')
															.slideUp(
																	'slow',
																	function() {
																		$(this)
																				.parent()
																				.removeClass(
																						'opened')
																				.find(
																						'.opened')
																				.each(
																						function() {
																							$(
																									this)
																									.removeClass(
																											'opened');
																						});
																	});
												}

											} else {

												if (!$(this).parent().parent()
														.parent().hasClass(
																'opened')) {
													$('.nav a')
															.not(this)
															.parent()
															.find('ul')
															.slideUp(
																	'slow',
																	function() {
																		$(this)
																				.parent()
																				.removeClass(
																						'opened')
																				.find(
																						'.opened')
																				.each(
																						function() {
																							$(
																									this)
																									.removeClass(
																											'opened')
																						});
																	});
												}
											}
										}
									});

					$('.nav-sidebar > li').hover(function() {
						if ($('body').hasClass('sidebar-minified')) {
							$(this).addClass('opened hover');
						}
					}, function() {
						if ($('body').hasClass('sidebar-minified')) {
							$(this).removeClass('opened hover');
						}
					});

					/* ---------- Main Menu Open/Close, Min/Full ---------- */
					$('#main-menu-toggle').click(function() {

						var cls = 'sidebar-hidden';
						
						if ($('body').hasClass(cls)) {

							$('body').removeClass(cls);
							napi.setCookie('sidebarstate', '1', 365);

						} else {

							$('body').addClass(cls);
							napi.setCookie('sidebarstate', '0', 365);
							

						}

					});

					$('#sidebar-menu').click(function() {

						$(".sidebar").trigger("open");

					});

					$('#sidebar-minify').click(
							function() {

								if ($('body').hasClass('sidebar-minified')) {

									$('body').removeClass('sidebar-minified');
									$('#sidebar-minify i').removeClass(
											'fa-list')
											.addClass('fa-ellipsis-v');

								} else {

									$('body').addClass('sidebar-minified');
									$('#sidebar-minify i').removeClass(
											'fa-ellipsis-v')
											.addClass('fa-list');
								}

							});

					widthFunctions();
					dropSidebarShadow();
					init();

					$(".sidebar").mmenu();

					/* ---------- Disable moving to top ---------- */
					$('a[href="#"][data-top!=true]').click(function(e) {
						e.preventDefault();
					});

				});

/*******************************************************************************
 * PANELS ACTIONS
 */

$(document).on(
		'click',
		'.panel-actions a',
		function(e) {
			e.preventDefault();

			if ($(this).hasClass('btn-close')) {
				$(this).parent().parent().parent().fadeOut();
			} else if ($(this).hasClass('btn-minimize')) {
				var $target = $(this).parent().parent().next('.panel-body');
				if ($target.is(':visible'))
					$('i', $(this)).removeClass($.panelIconOpened).addClass(
							$.panelIconClosed);
				else
					$('i', $(this)).removeClass($.panelIconClosed).addClass(
							$.panelIconOpened);
				$target.slideToggle('slow', function() {
					widthFunctions();
				});
			} else if ($(this).hasClass('btn-setting')) {
				$('#myModal').modal('show');
			}

		});

function init() {

	/* ---------- Minimized panel ---------- */
	$('.panel-minimized').find('.panel-actions i.' + $.panelIconOpened)
			.removeClass($.panelIconOpened).addClass($.panelIconClosed);

	/* ---------- Tooltip ---------- */
	$('[rel="tooltip"],[data-rel="tooltip"]').tooltip({
		"placement" : "bottom",
		delay : {
			show : 400,
			hide : 200
		}
	});

	/* ---------- Popover ---------- */
	$('[rel="popover"],[data-rel="popover"],[data-toggle="popover"]').popover();

}

$('.sidebar-menu').scroll(function() {
	dropSidebarShadow();
});

function dropSidebarShadow() {

	if ($('.nav-sidebar').length) {
		var topPosition = $('.nav-sidebar').offset().top
				- $('.sidebar').offset().top;
	}

	if (topPosition < 60) {
		$('.sidebar-header').addClass('drop-shadow');
	} else {
		$('.sidebar-header').removeClass('drop-shadow');
	}

	var bottomPosition = $(window).height() - $('.nav-sidebar').outerHeight()
			- topPosition;

	if (bottomPosition < 130) {
		$('.sidebar-footer').addClass('drop-shadow');
	} else {
		$('.sidebar-footer').removeClass('drop-shadow');
	}
}

/*******************************************************************************
 * CHECK BROWSER VERSION
 */
function browser() {

	var isOpera = !!(window.opera && window.opera.version); // Opera 8.0+
	var isFirefox = testCSS('MozBoxSizing'); // FF 0.8+
	var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf(
			'Constructor') > 0;
	// At least Safari 3+: "[object HTMLElementConstructor]"
	var isChrome = !isSafari && testCSS('WebkitTransform'); // Chrome 1+
	// var isIE = /*@cc_on!@*/false || testCSS('msTransform'); // At least IE6

	function testCSS(prop) {
		return prop in document.documentElement.style;
	}

	if (isOpera) {
		return false;
	} else if (isSafari || isChrome) {
		return true;
	} else {
		return false;
	}
}

/*******************************************************************************
 * CHECK IF RETINA DISPLAY
 */
function retina() {
	retinaMode = (window.devicePixelRatio > 1);
	return retinaMode;
}

/*******************************************************************************
 * CHARTS This function activate all widgets with charts
 */
function activeCharts() {
	if ($(".boxchart").length) {

		if (retina()) {

			$(".boxchart").sparkline('html', {
				type : 'bar',
				height : '60', // Double pixel number for retina display
				barWidth : '8', // Double pixel number for retina display
				barSpacing : '2', // Double pixel number for retina display
				barColor : '#ffffff',
				negBarColor : '#eeeeee'
			});

			if (jQuery.browser.mozilla) {

				if (!!navigator.userAgent.match(/Trident\/7\./)) {
					$(".boxchart").css('zoom', 0.5);
					$(".boxchart").css('height', '30px;').css('margin',
							'0px 15px -15px 17px');
				} else {
					$(".boxchart").css('MozTransform', 'scale(0.5,0.5)').css(
							'height', '30px;');
					$(".boxchart").css('height', '30px;').css('margin',
							'-15px 15px -15px -5px');
				}

			} else {
				$(".boxchart").css('zoom', 0.5);
			}

		} else {

			$(".boxchart").sparkline('html', {
				type : 'bar',
				height : '30',
				barWidth : '4',
				barSpacing : '1',
				barColor : '#ffffff',
				negBarColor : '#eeeeee'
			});

		}

	}

	if ($(".linechart").length) {

		if (retina()) {

			$(".linechart").sparkline('html', {
				width : '130',
				height : '60',
				lineColor : '#ffffff',
				fillColor : false,
				spotColor : false,
				maxSpotColor : false,
				minSpotColor : false,
				spotRadius : 2,
				lineWidth : 2
			});

			if (jQuery.browser.mozilla) {

				if (!!navigator.userAgent.match(/Trident\/7\./)) {
					$(".linechart").css('zoom', 0.5);
					$(".linechart").css('height', '30px;').css('margin',
							'0px 15px -15px 17px');
				} else {
					$(".linechart").css('MozTransform', 'scale(0.5,0.5)').css(
							'height', '30px;');
					$(".linechart").css('height', '30px;').css('margin',
							'-15px 15px -15px -5px');
				}

			} else {
				$(".linechart").css('zoom', 0.5);
			}
		} else {

			$(".linechart").sparkline('html', {
				width : '65',
				height : '30',
				lineColor : '#ffffff',
				fillColor : false,
				spotColor : false,
				maxSpotColor : false,
				minSpotColor : false,
				spotRadius : 2,
				lineWidth : 1
			});
		}
	}

	if ($('.chart-stat').length) {

		if (retina()) {

			$(".chart-stat > .chart").each(
					function() {

						var chartColor = $(this).css('color');

						$(this).sparkline('html', {
							width : '180%',// Width of the chart - Defaults to
											// 'auto' - May be any valid css
											// width - 1.5em, 20px, etc (using a
											// number without a unit specifier
											// won't do what you want) - This
											// option does nothing for bar and
											// tristate chars (see barWidth)
							height : 80,// Height of the chart - Defaults to
										// 'auto' (line height of the containing
										// tag)
							lineColor : chartColor,// Used by line and discrete
													// charts to specify the
													// colour of the line drawn
													// as a CSS values string
							fillColor : false,// Specify the colour used to
												// fill the area under the graph
												// as a CSS value. Set to false
												// to disable fill
							spotColor : false,// The CSS colour of the final
												// value marker. Set to false or
												// an empty string to hide it
							maxSpotColor : false,// The CSS colour of the
													// marker displayed for the
													// maximum value. Set to
													// false or an empty string
													// to hide it
							minSpotColor : false,// The CSS colour of the
													// marker displayed for the
													// mimum value. Set to false
													// or an empty string to
													// hide it
							spotRadius : 2,// Radius of all spot markers, In
											// pixels (default: 1.5) - Integer
							lineWidth : 2
						// In pixels (default: 1) - Integer
						});

						if (jQuery.browser.mozilla) {

							if (!!navigator.userAgent.match(/Trident\/7\./)) {
								$(this).css('zoom', 0.5);
							} else {
								$(this).css('MozTransform', 'scale(0.5,0.5)');
								$(this).css('height', '40px;').css('margin',
										'-20px 0px -20px -25%');
							}
						} else {
							$(this).css('zoom', 0.5);
						}
					});

		} else {

			$(".chart-stat > .chart").each(function() {

				var chartColor = $(this).css('color');

				$(this).sparkline('html', {
					width : '90%',// Width of the chart - Defaults to 'auto' -
									// May be any valid css width - 1.5em, 20px,
									// etc (using a number without a unit
									// specifier won't do what you want) - This
									// option does nothing for bar and tristate
									// chars (see barWidth)
					height : 40,// Height of the chart - Defaults to 'auto'
								// (line height of the containing tag)
					lineColor : chartColor,// Used by line and discrete charts
											// to specify the colour of the line
											// drawn as a CSS values string
					fillColor : false,// Specify the colour used to fill the
										// area under the graph as a CSS value.
										// Set to false to disable fill
					spotColor : false,// The CSS colour of the final value
										// marker. Set to false or an empty
										// string to hide it
					maxSpotColor : false,// The CSS colour of the marker
											// displayed for the maximum value.
											// Set to false or an empty string
											// to hide it
					minSpotColor : false,// The CSS colour of the marker
											// displayed for the mimum value.
											// Set to false or an empty string
											// to hide it
					spotRadius : 2,// Radius of all spot markers, In pixels
									// (default: 1.5) - Integer
					lineWidth : 2
				// In pixels (default: 1) - Integer
				});
			});
		}
	}
}

/*******************************************************************************
 * TODO LIST WIDGET Active TODO List widget Require: jQuery UI
 */
function todoList() {
	$(".todo-list-tasks").sortable({
		connectWith : ".todo-list-tasks",
		cancel : ".disabled"
	});

	$('.todo-list-tasks').on(
			'change',
			'.custom-checkbox',
			function() {
				$(this).parent().parent().clone().appendTo('.completed').hide()
						.slideToggle().addClass('disabled').find(
								'.custom-checkbox').attr('disabled', true);
				$(this).parent().parent().slideUp("slow", function() {
					$(this).remove();
					if ($('.todo-list-tasks li').length == 0) {
						$('.todo-list-tasks').html('<!--empty-->');
					}
					// add your function here
				});

			});

	$(".todo-list").disableSelection();

	$('#add-task')
			.click(
					function() {

						$('#todo-1')
								.append(
										'<li><label class="custom-checkbox-item pull-left"><input class="custom-checkbox" type="checkbox"/><span class="custom-checkbox-mark"></span></label><span class="desc">'
												+ $('#task-description').val()
												+ '</span>');

					});

}

/*******************************************************************************
 * Clock
 */

function startTime() {
	var today = new Date();
	var h = today.getHours();
	var m = today.getMinutes();
	var s = today.getSeconds();
	m = checkTime(m);
	s = checkTime(s);
	document.getElementById('clock').innerHTML = h + ":" + m + ":" + s;
	var t = setTimeout(function() {
		startTime()
	}, 500);
}

function checkTime(i) {
	if (i < 10) {
		i = "0" + i
	}
	; // add zero in front of numbers < 10
	return i;
}

/*******************************************************************************
 * SMART RESIZE
 */
$(window).bind("resize", widthFunctions);

function widthFunctions(e) {

	var headerHeight = $('.navbar').outerHeight();
	var footerHeight = $('footer').outerHeight();

	var winHeight = $(window).height();
	var winWidth = $(window).width();

	if (!$('body').hasClass('static-sidebar')) {
		var sidebarHeaderHeight = $('.sidebar-header').outerHeight();
		var sidebarFooterHeight = $('.sidebar-footer').outerHeight();

		if (winWidth < 992) {
			var otherHeight = sidebarHeaderHeight + sidebarFooterHeight;
		} else {
			var otherHeight = headerHeight + sidebarHeaderHeight
					+ sidebarFooterHeight;
		}
		$('.sidebar-menu').css('height', winHeight - otherHeight);
	}

	if (winWidth < 992) {
		if ($('body').hasClass('sidebar-hidden')) {
			$('body').removeClass('sidebar-hidden').addClass(
					'sidebar-hidden-disabled');
		}

		if ($('body').hasClass('sidebar-minified')) {
			$('body').removeClass('sidebar-minified').addClass(
					'sidebar-minified-disabled');
		}
		$('#sidebar-minify i').removeClass('fa-list').addClass('fa-ellipsis-v');
	} else {
		if ($('body').hasClass('sidebar-hidden-disabled')) {
			$('body').removeClass('sidebar-hidden-disabled').addClass(
					'sidebar-hidden');
		}

		if ($('body').hasClass('sidebar-minified-disabled')) {
			$('body').removeClass('sidebar-minified-disabled').addClass(
					'sidebar-minified');
		}
	}

	if (winWidth > 768) {
		$('.main').css('min-height', winHeight - footerHeight);
	}
}