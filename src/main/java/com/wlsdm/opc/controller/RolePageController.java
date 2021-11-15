package com.wlsdm.opc.controller;

import com.wlsdm.opc.common.Statics;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import java.util.Hashtable;
import java.util.TimeZone;

@Controller
public class RolePageController {

    final static Logger logger = LoggerFactory.getLogger(OPCPageController.class);

    @RequestMapping("/roles")
    public ModelAndView getUserInfoDashboard(HttpServletRequest request,
                                             @CookieValue(value = "sidebarstate", defaultValue = "0") int sideBarState, Model model) {

        String pageName = "RoleInfo Dashboard";

        Hashtable<String, Object> data = new Hashtable<>();

        data.put("OPC_CONTEXT_PATH", "/opc");
        data.put("SERVER_TZ", TimeZone.getDefault().getID());
        data.put("PAGE_NAME", pageName);
        data.put("SIDE_BAR_STATE", sideBarState == 0 ? "sidebar-hidden" : "");
        data.put("WL_OPC_VERSION", Statics.VERSION);
        data.put("WL_OPC_BUILD_DATE", Statics.BUILD_DATE);

        return new ModelAndView("roles", "data", data);
    }
}
