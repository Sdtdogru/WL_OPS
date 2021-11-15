package com.wlsdm.opc.database.datatypes;

import java.sql.Timestamp;

public class RoleInfo {

    private int ID;
    private String USERNAME;
    private String ROLE;
    private Timestamp DT;

    public int getID() {
        return ID;
    }

    public void setID(int iD) {
        ID = iD;
    }

    public String getUSERNAME() {
        return USERNAME;
    }

    public void setUSERNAME(String uSERNAME) {
        USERNAME = uSERNAME;
    }

    public String getROLE() {
        return ROLE;
    }

    public void setROLE(String ROLE) {
        this.ROLE = ROLE;
    }

    public Timestamp getDT() {
        return DT;
    }

    public void setDT(Timestamp dT) {
        DT = dT;
    }
}
