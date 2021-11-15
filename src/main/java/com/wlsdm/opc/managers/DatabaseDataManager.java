package com.wlsdm.opc.managers;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.List;

public interface DatabaseDataManager {

	public List<?> executeQuery(String sqlName, Object[] parameters, Class<?> type, int timeout, boolean isSQLReady);
	
	public int executeInsert(String sqlName, Object[] parameters, boolean isSQLReady);
	
	public int executeUpdate(String sqlName, Object[] parameters, boolean isSQLReady);
	
	public PreparedStatement getPreparedStatement(Connection conn, String sql) throws SQLException;
	
	public PreparedStatement getPreparedStatement(Connection conn, String sql, int autoGeneratedKeys) throws SQLException;

	public Connection getConncetion();

	public int getCurrentAutoIncrId();
	
	public void setCurrentAutoIncrId(int generatedKey);

	public void applyChanges(Connection conn);

	public void rollbackChanges(Connection conn);
	
}
