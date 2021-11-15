package com.wlsdm.opc.controller.provider;

import com.wlsdm.opc.common.OPCLogger;
import com.wlsdm.opc.common.Statics;
import com.wlsdm.opc.controller.base.ServiceDataProviderImpl;
import com.wlsdm.opc.datatypes.HTTPScreenResponse;
import com.wlsdm.opc.managers.RoleInfoDataManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RoleData extends ServiceDataProviderImpl {

    @Autowired
    RoleInfoDataManager rldm;

    final static Logger logger = LoggerFactory.getLogger(OPCData.class);

    public RoleData() {
        super();
    }

    public HTTPScreenResponse addRoleInfo(String UserName, String Role) {

        HTTPScreenResponse resp = new HTTPScreenResponse();

        if (!hasLicense()) {
            resp.setResponseCode(Statics.RESPONSE_TYPE_NO_LIC);
            resp.setResponseMessage(Statics.RESPONSE_MESSAGE_NO_LIC);
            return resp;
        }

        try {
            resp.setResponseData(rldm.add(UserName, Role));
            resp.setResponseCode(Statics.RESPONSE_TYPE_OK);
        } catch (Exception e) {
            resp.setResponseCode(Statics.RESPONSE_TYPE_INTERNAL_ERR);
            resp.setResponseMessage(Statics.RESPONSE_MESSAGE_INTERNAL_ERR);
            OPCLogger.error(logger, e.getMessage(), e);
        }

        return resp;

    }

    public HTTPScreenResponse loadRoleInfo() {

        HTTPScreenResponse resp = new HTTPScreenResponse();

        if (!hasLicense()) {
            resp.setResponseCode(Statics.RESPONSE_TYPE_NO_LIC);
            resp.setResponseMessage(Statics.RESPONSE_MESSAGE_NO_LIC);
            return resp;
        }

        try {
            resp.setResponseData(rldm.loadRole());
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
            resp.setResponseData(rldm.delete(ID));
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
            resp.setResponseData(rldm.load(ID));
            resp.setResponseCode(Statics.RESPONSE_TYPE_OK);
        } catch (Exception e) {
            resp.setResponseCode(Statics.RESPONSE_TYPE_INTERNAL_ERR);
            resp.setResponseMessage(Statics.RESPONSE_MESSAGE_INTERNAL_ERR);
            OPCLogger.error(logger, e.getMessage(), e);
        }

        return resp;

    }

    public HTTPScreenResponse updateUserInfo(String USERNAME, String ROLE, int ID) {

        HTTPScreenResponse resp = new HTTPScreenResponse();

        if (!hasLicense()) {
            resp.setResponseCode(Statics.RESPONSE_TYPE_NO_LIC);
            resp.setResponseMessage(Statics.RESPONSE_MESSAGE_NO_LIC);
            return resp;
        }

        try {
            resp.setResponseData(rldm.update(USERNAME, ROLE, ID));
            resp.setResponseCode(Statics.RESPONSE_TYPE_OK);
        } catch (Exception e) {
            resp.setResponseCode(Statics.RESPONSE_TYPE_INTERNAL_ERR);
            resp.setResponseMessage(Statics.RESPONSE_MESSAGE_INTERNAL_ERR);
            OPCLogger.error(logger, e.getMessage(), e);
        }

        return resp;

    }
}
