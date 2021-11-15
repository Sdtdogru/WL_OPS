package com.wlsdm.opc.controller;

import com.wlsdm.opc.controller.provider.RoleData;
import com.wlsdm.opc.datatypes.HTTPScreenResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class RoleDataController {

    @Autowired
    RoleData roleData;

    @RequestMapping("/addRoleInfo")
    @ResponseBody
    public HTTPScreenResponse addRoleInfo(@RequestParam(value = "USERNAME", required = true) String userName, @RequestParam(value = "ROLE", required = true) String role, Model model) {
        return roleData.addRoleInfo(userName, role);
    }

    @RequestMapping("/loadAllRoleInfo")
    @ResponseBody
    public HTTPScreenResponse loadAllRoleInfo(Model model) {
        return roleData.loadRoleInfo();
    }

    @RequestMapping("/loadRoleInfo")
    @ResponseBody
    public HTTPScreenResponse loadUserInfo(@RequestParam(value = "ID", required = true) int ID, Model model) {
        return roleData.loadUserInfo(ID);
    }

    @RequestMapping("/deleteRoleInfo")
    @ResponseBody
    public HTTPScreenResponse deleteUserInfo(@RequestParam(value = "ID", required = true) int ID, Model model) {
        return roleData.deleteUserInfo(ID);
    }

    @RequestMapping("/updateRoleInfo")
    @ResponseBody
    public HTTPScreenResponse updateUserInfo(@RequestParam(value = "USERNAME", required = true) String USERNAME,
                                             @RequestParam(value = "ROLE", required = true) String ROLE,
                                             @RequestParam(value = "ID", required = true) int ID, Model model) {
        return roleData.updateUserInfo(USERNAME, ROLE, ID);
    }
}
