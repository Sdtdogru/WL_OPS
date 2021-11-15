package com.wlsdm.opc.managers;

import com.wlsdm.opc.common.OPCLogger;
import com.wlsdm.opc.config.ExecuteQueryNames;
import com.wlsdm.opc.database.datatypes.RoleInfo;
import com.wlsdm.opc.database.datatypes.UserInfo;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RoleInfoDataManager extends DatabaseDataManagerImpl {

    public int add(String USERNAME, String RL) {

        Object[] values = new Object[2];
        values[0] = USERNAME;
        values[1] = RL;

        int resp = 0;
        try {
            return executeInsert(ExecuteQueryNames.INSERT_ROLE_INFO, values, false);
        } catch (Exception e) {
            OPCLogger.error(logger, e.getMessage(), e);
        }

        if (resp > -1) {
            return 1;
        }

        return 0;
    }

    public List<RoleInfo> loadRole() {

        List<?> resp = executeQuery(ExecuteQueryNames.LOAD_ALL_ROLE_INFO, null, RoleInfo.class,
                DatabaseOperation.TIMEOUT_SHORT, false);

        if (resp != null && resp.size() > 0) {
            return (List<RoleInfo>) resp;
        }

        return null;

    }

    public RoleInfo load(int ID) {

        List<?> resp = executeQuery(ExecuteQueryNames.LOAD_BY_ID_ROLE_INFO,
                new Object[]{ID}, RoleInfo.class, DatabaseOperation.TIMEOUT_SHORT, false);

        if (resp != null && resp.size() > 0) {
            return (RoleInfo) resp.get(0);
        }

        return null;

    }

    public int delete(int ID) {
        int resp = executeUpdate(ExecuteQueryNames.DELETE_ROLE_INFO, new Object[]{ID}, false);
        return resp;
    }

    public int update(String USERNAME, String ROLE, int ID) {

        Object[] values = new Object[3];
        values[0] = USERNAME;
        values[1] = ROLE;
        values[2] = ID;

        int resp = 0;
        try {
            return executeInsert(ExecuteQueryNames.UPDATE_ROLE_INFO, values, false);
        } catch (Exception e) {
            OPCLogger.error(logger, e.getMessage(), e);
        }

        if (resp > -1) {
            return 1;
        }

        return 0;
    }
}
