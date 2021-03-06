package com.wlsdm.opc.managers;

import java.beans.IntrospectionException;
import java.beans.PropertyDescriptor;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.sql.Clob;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Types;
import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.wlsdm.opc.backend.DatabaseConnection;
import com.wlsdm.opc.common.OPCLogger;

public class DatabaseOperation {

	final static Logger logger = LoggerFactory.getLogger(DatabaseOperation.class);

	public final static int TIMEOUT_SHORT = 30;
	public final static int TIMEOUT_MEDIUM = 60;
	public final static int TIMEOUT_LONG = 90;
	public final static int TIMEOUT_REPORT = 120;

	private PreparedStatement getPreparedStatement(Connection conn, String sql, int autoGeneratedKeys)
			throws SQLException {
		return conn.prepareStatement(sql, autoGeneratedKeys);
	}

	private PreparedStatement getPreparedStatement(Connection conn, String sql) throws SQLException {
		return conn.prepareStatement(sql);
	}

	public PreparedStatement getExecutePSWithSQL(Connection conn, String SQL, Object[] parameters, boolean getGenKeys) {
		try {

			PreparedStatement ps;

			if (getGenKeys) {
				ps = getPreparedStatement(conn, SQL, PreparedStatement.RETURN_GENERATED_KEYS);
			} else {
				ps = getPreparedStatement(conn, SQL);
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

	public PreparedStatement getExecutePS(Connection conn, String sqlName, Object[] parameters, boolean getGenKeys) {
		try {

			String sql = DatabaseConnection.queries.get(sqlName);

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

	////////

	public int insert(Connection conn, PreparedStatement ps) {

		int result = -9;
		ResultSet rs = null;

		try {

			int execResult = ps.executeUpdate();

			if (execResult > 0) {

				rs = ps.getGeneratedKeys();

				if (rs != null) {
					while (rs.next()) {
						result = rs.getInt(1);
					}
				}
			}

		} catch (SQLException e) {
			printSQLException(e, ps);
		} catch (Exception e) {
			printSQLException(e, ps);
		} finally {

			if (rs != null) {
				try {
					rs.close();
				} catch (SQLException e) {
				}
			}

			if (ps != null) {
				try {
					ps.close();
				} catch (SQLException e) {
				}
			}
		}

		return result;

	}

	public int update(Connection conn, PreparedStatement ps) {

		try {

			return ps.executeUpdate();

		} catch (SQLException e) {
			printSQLException(e, ps);
		} catch (Exception e) {
			printSQLException(e, ps);
		} finally {

			if (ps != null) {

				try {
					ps.close();
				} catch (SQLException e) {
				}

			}

		}

		return -9;

	}

	public List<?> executeQuery(Connection conn, PreparedStatement ps, Class<?> type, int timeout) {

		ResultSet rs = null;

		try {

			ps.setQueryTimeout(timeout);
			rs = ps.executeQuery();
			return createObjects(rs, type);

		} catch (SQLException e) {
			printSQLException(e, ps);
		} catch (SecurityException e) {
			printSQLException(e, ps);
		} catch (IllegalArgumentException e) {
			printSQLException(e, ps);
		} catch (InstantiationException e) {
			printSQLException(e, ps);
		} catch (IllegalAccessException e) {
			printSQLException(e, ps);
		} catch (InvocationTargetException e) {
			printSQLException(e, ps);
		} catch (IntrospectionException e) {
			printSQLException(e, ps);
		} catch (Exception e) {
			printSQLException(e, ps);
		} finally {

			if (rs != null) {
				try {
					rs.close();
				} catch (SQLException e) {
				}
			}

			if (ps != null) {
				try {
					ps.close();
				} catch (SQLException e) {
				}
			}
		}

		return new ArrayList<>();

	}

	public void printSQLException(Throwable t, PreparedStatement ps) {

		StringBuilder sb = new StringBuilder();

		sb.append(t.getMessage());
		sb.append(System.lineSeparator()).append(System.lineSeparator());
		sb.append("SQL Statement:").append(System.lineSeparator()).append(System.lineSeparator());
		sb.append(getSQL(ps)).append(System.lineSeparator()).append(System.lineSeparator());

		OPCLogger.error(logger, sb.toString(), t);
	}

	public String getSQL(PreparedStatement ps) {
		return ((org.apache.derby.impl.jdbc.EmbedPreparedStatement) ps).getSQLText();
	}

	@SuppressWarnings("deprecation")
	private List<?> createObjects(ResultSet resultSet, Class<?> type)
			throws SecurityException, IllegalArgumentException, SQLException, InstantiationException,
			IllegalAccessException, IntrospectionException, InvocationTargetException {

		ArrayList<Object> list = new ArrayList<>();
		ResultSetMetaData mdrs = resultSet.getMetaData();

		int columnCount = mdrs.getColumnCount();
		Hashtable<String, Integer> colmuns = new Hashtable<>();

		for (int i = 1; i < columnCount + 1; i++) {
			String lbl = mdrs.getColumnLabel(i);
			int ctype = mdrs.getColumnType(i);
			colmuns.put(lbl, ctype);
		}

		while (resultSet.next()) {

			Object instance = type.newInstance();

			for (Field field : type.getDeclaredFields()) {

				String fname = field.getName();

				if (colmuns.containsKey(fname)) {

					Object value = null;

					if (Types.CLOB == colmuns.get(fname).intValue()) {
						value = "";

						Clob clob = resultSet.getClob(fname);
						if (clob != null) {
							value = clob.getSubString(1, (int) clob.length());
						}

					} else {
						value = resultSet.getObject(fname);
					}

					PropertyDescriptor propertyDescriptor = new PropertyDescriptor(field.getName(), type);
					Method method = propertyDescriptor.getWriteMethod();
					method.invoke(instance, value);
				}

			}

			list.add(instance);
		}

		return list;

	}

}
