package com.wlsdm.opc.controller.provider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wlsdm.opc.common.OPCLogger;
import com.wlsdm.opc.common.Statics;
import com.wlsdm.opc.controller.base.ServiceDataProviderImpl;
import com.wlsdm.opc.datatypes.HTTPScreenResponse;
import com.wlsdm.opc.managers.UserInfoDataManager;

@Service
public class OPCData extends ServiceDataProviderImpl {

	@Autowired
	UserInfoDataManager uidm;

	public OPCData() {
		super();
	}

	final static Logger logger = LoggerFactory.getLogger(OPCData.class);

	public HTTPScreenResponse loadUserInfo() {

		HTTPScreenResponse resp = new HTTPScreenResponse();

		if (!hasLicense()) {
			resp.setResponseCode(Statics.RESPONSE_TYPE_NO_LIC);
			resp.setResponseMessage(Statics.RESPONSE_MESSAGE_NO_LIC);
			return resp;
		}

		try {
			resp.setResponseData(uidm.load());
			resp.setResponseCode(Statics.RESPONSE_TYPE_OK);
		} catch (Exception e) {
			resp.setResponseCode(Statics.RESPONSE_TYPE_INTERNAL_ERR);
			resp.setResponseMessage(Statics.RESPONSE_MESSAGE_INTERNAL_ERR);
			OPCLogger.error(logger, e.getMessage(), e);
		}

		return resp;

	}
	

	public HTTPScreenResponse loadUserInfo(int ID) {

		HTTPScreenResponse resp = new HTTPScreenResponse();

		if (!hasLicense()) {
			resp.setResponseCode(Statics.RESPONSE_TYPE_NO_LIC);
			resp.setResponseMessage(Statics.RESPONSE_MESSAGE_NO_LIC);
			return resp;
		}

		try {
			resp.setResponseData(uidm.load(ID));
			resp.setResponseCode(Statics.RESPONSE_TYPE_OK);
		} catch (Exception e) {
			resp.setResponseCode(Statics.RESPONSE_TYPE_INTERNAL_ERR);
			resp.setResponseMessage(Statics.RESPONSE_MESSAGE_INTERNAL_ERR);
			OPCLogger.error(logger, e.getMessage(), e);
		}

		return resp;

	}	
	
	

	public HTTPScreenResponse addUserInfo(String USERNAME) {

		HTTPScreenResponse resp = new HTTPScreenResponse();

		if (!hasLicense()) {
			resp.setResponseCode(Statics.RESPONSE_TYPE_NO_LIC);
			resp.setResponseMessage(Statics.RESPONSE_MESSAGE_NO_LIC);
			return resp;
		}

		try {
			resp.setResponseData(uidm.add(USERNAME));
			resp.setResponseCode(Statics.RESPONSE_TYPE_OK);
		} catch (Exception e) {
			resp.setResponseCode(Statics.RESPONSE_TYPE_INTERNAL_ERR);
			resp.setResponseMessage(Statics.RESPONSE_MESSAGE_INTERNAL_ERR);
			OPCLogger.error(logger, e.getMessage(), e);
		}

		return resp;

	}	
	

	public HTTPScreenResponse updateUserInfo(String USERNAME, int ID) {

		HTTPScreenResponse resp = new HTTPScreenResponse();

		if (!hasLicense()) {
			resp.setResponseCode(Statics.RESPONSE_TYPE_NO_LIC);
			resp.setResponseMessage(Statics.RESPONSE_MESSAGE_NO_LIC);
			return resp;
		}

		try {
			resp.setResponseData(uidm.update(USERNAME, ID));
			resp.setResponseCode(Statics.RESPONSE_TYPE_OK);
		} catch (Exception e) {
			resp.setResponseCode(Statics.RESPONSE_TYPE_INTERNAL_ERR);
			resp.setResponseMessage(Statics.RESPONSE_MESSAGE_INTERNAL_ERR);
			OPCLogger.error(logger, e.getMessage(), e);
		}

		return resp;

	}	
	

	public HTTPScreenResponse deleteUserInfo(int ID) {

		HTTPScreenResponse resp = new HTTPScreenResponse();

		if (!hasLicense()) {
			resp.setResponseCode(Statics.RESPONSE_TYPE_NO_LIC);
			resp.setResponseMessage(Statics.RESPONSE_MESSAGE_NO_LIC);
			return resp;
		}

		try {
			resp.setResponseData(uidm.delete(ID));
			resp.setResponseCode(Statics.RESPONSE_TYPE_OK);
		} catch (Exception e) {
			resp.setResponseCode(Statics.RESPONSE_TYPE_INTERNAL_ERR);
			resp.setResponseMessage(Statics.RESPONSE_MESSAGE_INTERNAL_ERR);
			OPCLogger.error(logger, e.getMessage(), e);
		}

		return resp;

	}	

}
