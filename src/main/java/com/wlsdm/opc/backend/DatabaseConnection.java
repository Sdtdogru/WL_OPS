package com.wlsdm.opc.backend;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Hashtable;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.wlsdm.opc.common.OPCLogger;
import com.wlsdm.opc.managers.DatabaseOperation;

public class DatabaseConnection {

	final static Logger logger = LoggerFactory.getLogger(DatabaseConnection.class);

	public static String username = "wlsdm_opc_admin";
	public static String password = "wlsdm_opc_admin";
	public static String schema = "WLSDM_OPC_ADMIN";

	private static String framework = "embedded";
	private String protocol = "jdbc:derby:";
	private static Connection conn = null;

	public static Hashtable<String, String> queries = null;

	public Connection getConnection() {
		Connection tc = null;

		tc = getDerbyConnection("WLOPC/db", DatabaseConnection.username, DatabaseConnection.password);

		try {
			tc.setAutoCommit(false);
		} catch (Exception e) {
			OPCLogger.error(logger, e.getMessage(), e);
		} catch (Throwable t) {
			OPCLogger.error(logger, t.getMessage(), t);
		}

		return tc;
	}

	public Connection getOneShotDerbyConnection() {
		Connection tc = null;
		String referer = "DatabaseConnection.OSDConnection: ";

		try {
			tc = getOneShotDerbyConnection("WLOPC/db", DatabaseConnection.username, DatabaseConnection.password);
		} catch (InstantiationException e) {
			OPCLogger.error(logger, referer + e.getMessage());
		} catch (IllegalAccessException e) {
			OPCLogger.error(logger, referer + e.getMessage());
		} catch (ClassNotFoundException e) {
			OPCLogger.error(logger, referer + e.getMessage());
		} catch (SQLException e) {
			OPCLogger.error(logger, referer + e.getMessage());
		} catch (Exception e) {
			OPCLogger.error(logger, referer + e.getMessage());
		}

		return tc;
	}

	@SuppressWarnings("deprecation")
	private Connection getDerbyConnection(String dbName, String username, String password) {

		synchronized (DatabaseConnection.class) {

			try {

				if (conn != null && !conn.isClosed()) {

					if (conn.isReadOnly()) {
						conn.setReadOnly(false);
					}

					return conn;
				}

				String driver = "org.apache.derby.jdbc.EmbeddedDriver";
				Class.forName(driver).newInstance();

				Properties props = new Properties(); // connection props
				props.put("user", username);
				props.put("password", password);

				conn = DriverManager.getConnection(protocol + dbName + ";create=true", props);
				OPCLogger.info(logger, "New DB Connection Initialized.");

			} catch (Exception e) {
				OPCLogger.error(logger, e.getMessage(), e);
			} catch (Throwable t) {
				OPCLogger.error(logger, t.getMessage(), t);
			}

			return conn;
		}

	}

	@SuppressWarnings("deprecation")
	private Connection getOneShotDerbyConnection(String dbName, String username, String password)
			throws InstantiationException, IllegalAccessException, ClassNotFoundException, SQLException {

		String driver = "org.apache.derby.jdbc.EmbeddedDriver";
		Class.forName(driver).newInstance();

		Properties props = new Properties(); // connection props
		props.put("user", username);
		props.put("password", password);

		DriverManager.setLoginTimeout(DatabaseOperation.TIMEOUT_MEDIUM);

		Connection newConn = DriverManager.getConnection(protocol + dbName + ";create=true", props);

		Statement s = newConn.createStatement();
		s.executeUpdate("SET ISOLATION CS");

		return newConn;
	}

	public String getProtocol() {
		return protocol;
	}

	public String getFramework() {
		return framework;
	}

	public void shutDownDerbyDB() {
		try {

			OPCLogger.info(logger, "'ShutDownDB' started.");

			Connection c = getDerbyConnection("WLOPC/db", username, password);
			c.commit();
			
			createDerbyCheckPoint();

			DriverManager.getConnection("jdbc:derby:;shutdown=true");
			
			conn = null;
			
		} catch (SQLException e) {

			if (((e.getErrorCode() == 50000) && ("XJ015".equals(e.getSQLState())))) {
				OPCLogger.info(logger, "Derby shutdown normally.");
			} else {
				OPCLogger.error(logger, e.getMessage(), e);
			}

		}

	}

	public void createDerbyCheckPoint() {
		try {
			conn.commit();
			CallableStatement cs = conn.prepareCall("CALL SYSCS_UTIL.SYSCS_CHECKPOINT_DATABASE()");
			cs.execute();
			cs.close();
			OPCLogger.info(logger, "Derby DB checkpoint created sucessfully.");
		} catch (SQLException e) {
			OPCLogger.error(logger, e.getMessage(), e);
		}
	}

}