package com.wlsdm.opc.managers;

import java.util.List;

import org.springframework.stereotype.Component;

import com.wlsdm.opc.common.OPCLogger;
import com.wlsdm.opc.config.ExecuteQueryNames;
import com.wlsdm.opc.database.datatypes.UserInfo;

@Component
public class UserInfoDataManager extends DatabaseDataManagerImpl {

    public int add(String USERNAME) {

        Object[] values = new Object[1];
        values[0] = USERNAME;

        int resp = 0;
        try {
            return executeInsert(ExecuteQueryNames.INSERT_USER_INFO, values, false);
        } catch (Exception e) {
            OPCLogger.error(logger, e.getMessage(), e);
        }

        if (resp > -1) {
            return 1;
        }

        return 0;
    }

    @SuppressWarnings("unchecked")
    public List<UserInfo> load() {

        List<?> resp = executeQuery(ExecuteQueryNames.LOAD_ALL_USER_INFO, null, UserInfo.class,
                DatabaseOperation.TIMEOUT_SHORT, false);

        if (resp != null && resp.size() > 0) {
            return (List<UserInfo>) resp;
        }

        return null;

    }

    public int delete(int ID) {
        int resp = executeUpdate(ExecuteQueryNames.DELETE_USER_INFO, new Object[]{ID}, false);
        return resp;
    }

    public UserInfo load(int ID) {

        List<?> resp = executeQuery(ExecuteQueryNames.LOAD_BY_ID_USER_INFO,
                new Object[]{ID}, UserInfo.class, DatabaseOperation.TIMEOUT_SHORT, false);

        if (resp != null && resp.size() > 0) {
            return (UserInfo) resp.get(0);
        }

        return null;

    }


    public int update(String USERNAME, int ID) {

        Object[] values = new Object[2];
        values[0] = USERNAME;
        values[1] = ID;

        int resp = 0;
        try {
            return executeInsert(ExecuteQueryNames.UPDATE_USER_INFO, values, false);
        } catch (Exception e) {
            OPCLogger.error(logger, e.getMessage(), e);
        }

        if (resp > -1) {
            return 1;
        }

        return 0;
    }
}
