package com.wlsdm.opc.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.wlsdm.opc.controller.provider.OPCData;
import com.wlsdm.opc.datatypes.HTTPScreenResponse;

@Controller
public class OPCDataController {

	@Autowired
	private OPCData nd;

	@RequestMapping("/loadAllUserInfo")
	@ResponseBody
	public HTTPScreenResponse loadAllUserInfo(Model model) {
		return nd.loadUserInfo();
	}

	@RequestMapping("/loadUserInfo")
	@ResponseBody
	public HTTPScreenResponse loadUserInfo(@RequestParam(value = "ID", required = true) int ID, Model model) {
		return nd.loadUserInfo();
	}

	@RequestMapping("/addUserInfo")
	@ResponseBody
	public HTTPScreenResponse addUserInfo(@RequestParam(value = "USERNAME", required = true) String USERNAME,
			Model model) {
		return nd.addUserInfo(USERNAME);
	}

	@RequestMapping("/deleteUserInfo")
	@ResponseBody
	public HTTPScreenResponse deleteUserInfo(@RequestParam(value = "ID", required = true) int ID, Model model) {
		return nd.deleteUserInfo(ID);
	}

	@RequestMapping("/updateUserInfo")
	@ResponseBody
	public HTTPScreenResponse updateUserInfo(@RequestParam(value = "USERNAME", required = true) String USERNAME,
			@RequestParam(value = "ID", required = true) int ID, Model model) {
		return nd.updateUserInfo(USERNAME, ID);
	}

}
