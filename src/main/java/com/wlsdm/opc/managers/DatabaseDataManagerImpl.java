package com.wlsdm.opc.managers;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.wlsdm.opc.backend.DatabaseConnection;
import com.wlsdm.opc.common.OPCLogger;

public class DatabaseDataManagerImpl implements DatabaseDataManager {

	final static Logger logger = LoggerFactory.getLogger(DatabaseDataManagerImpl.class);

	DatabaseConnection dbc = new DatabaseConnection();
	DatabaseOperation dop = new DatabaseOperation();

	private int generatedKey;

	public DatabaseDataManagerImpl() {
		setConnection();
	}

	private void setConnection() {
	}

	@Override
	public Connection getConncetion() {
		return null;
	}

	@Override
	public int getCurrentAutoIncrId() {
		return generatedKey;
	}

	@Override
	public void setCurrentAutoIncrId(int generatedKey) {
		this.generatedKey = generatedKey;
	}

	@Override
	public void applyChanges(Connection conn) {
		try {

			if (conn != null) {
				conn.commit();
				conn.close();
			}
		} catch (SQLException e) {
			OPCLogger.error(logger, e.getMessage(), e);
		}
	}

	@Override
	public void rollbackChanges(Connection conn) {
		try {
			conn.rollback();
		} catch (SQLException e) {
			OPCLogger.error(logger, e.getMessage(), e);
		}
	}

	@Override
	public PreparedStatement getPreparedStatement(Connection conn, String sql) throws SQLException {
		return conn.prepareStatement(sql);
	}

	@Override
	public PreparedStatement getPreparedStatement(Connection conn, String sql, int autoGeneratedKeys)
			throws SQLException {
		return conn.prepareStatement(sql, autoGeneratedKeys);
	}

	@Override
	public List<?> executeQuery(String sqlName, Object[] parameters, Class<?> type, int timeout, boolean isSQLReady) {

		Connection conn = dbc.getOneShotDerbyConnection();
		
		if(conn == null) {
			return new ArrayList<>();
		}

		PreparedStatement ps = getExecutePS(conn, sqlName, parameters, false, isSQLReady);

		if (ps == null) {
			applyChanges(conn);
			return null;
		}

		List<?> resp = dop.executeQuery(conn, ps, type, timeout);

		applyChanges(conn);

		return resp;
	}

	@Override
	public int executeInsert(String sqlName, Object[] parameters, boolean isSQLReady) {

		Connection conn = dbc.getOneShotDerbyConnection();
		
		if(conn == null) {
			return -9;
		}
		
		PreparedStatement ps = getExecutePS(conn, sqlName, parameters, true, isSQLReady);

		if (ps == null) {
			applyChanges(conn);
			return -9;
		}

		int resp = dop.insert(conn, ps);

		applyChanges(conn);

		return resp;
	}

	@Override
	public int executeUpdate(String sqlName, Object[] parameters, boolean isSQLReady) {

		Connection conn = dbc.getOneShotDerbyConnection();
		
		if(conn == null) {
			return -9;
		}
		
		PreparedStatement ps = getExecutePS(conn, sqlName, parameters, false, isSQLReady);

		if (ps == null) {
			applyChanges(conn);
			return -9;
		}

		int resp = dop.update(conn, ps);

		applyChanges(conn);

		return resp;
	}

	private PreparedStatement getExecutePS(Connection conn, String sqlName, Object[] parameters, boolean getGenKeys,
			boolean isSQLReady) {
		
		try {

			String sql;

			if (isSQLReady) {
				sql = sqlName;
			} else {
				sql = DatabaseConnection.queries.get(sqlName);
			}

			PreparedStatement ps;

			if (getGenKeys) {
				ps = getPreparedStatement(conn, sql, PreparedStatement.RETURN_GENERATED_KEYS);
			} else {
				ps = getPreparedStatement(conn, sql);
			}

			if (parameters != null && parameters.length > 0) {

				int i = 1;

				for (Object param : parameters) {
					ps.setObject(i, param);
					i++;
				}

			}

			return ps;

		} catch (Exception e) {
			OPCLogger.error(logger, e.getMessage(), e);
		}

		return null;
	}

}
