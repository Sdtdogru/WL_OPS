package com.wlsdm.opc.database.datatypes;

import java.sql.Timestamp;

public class UserInfo {

	private int ID;
	private String USERNAME;
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

	public Timestamp getDT() {
		return DT;
	}

	public void setDT(Timestamp dT) {
		DT = dT;
	}

}
