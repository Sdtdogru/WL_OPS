package com.wlsdm.opc.controller;

import java.util.Hashtable;
import java.util.TimeZone;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import com.wlsdm.opc.common.Statics;

@Controller
public class OPCPageController {

	final static Logger logger = LoggerFactory.getLogger(OPCPageController.class);

	@RequestMapping("/")
	public ModelAndView getUserInfoDashboard(HttpServletRequest request,
			@CookieValue(value = "sidebarstate", defaultValue = "0") int sideBarState, Model model) {

		String pageName = "UserInfo Dashboard";

		Hashtable<String, Object> data = new Hashtable<>();

		data.put("OPC_CONTEXT_PATH", "/opc");
		data.put("SERVER_TZ", TimeZone.getDefault().getID());
		data.put("PAGE_NAME", pageName);
		data.put("SIDE_BAR_STATE", sideBarState == 0 ? "sidebar-hidden" : "");
		data.put("WL_OPC_VERSION", Statics.VERSION);
		data.put("WL_OPC_BUILD_DATE", Statics.BUILD_DATE);

		return new ModelAndView("dashboard", "data", data);
	}


}
