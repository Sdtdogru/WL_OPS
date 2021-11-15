package com.wlsdm.opc.backend;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.wlsdm.opc.common.OPCLogger;
import com.wlsdm.opc.common.SQLQueryParser;

public class DatabaseBuilder {

    final static Logger logger = LoggerFactory.getLogger(DatabaseBuilder.class);

	public void start() {
        setTables();
    }

    private void setTables() {

        DatabaseConnection dbc = new DatabaseConnection();
        Connection conn = null;

        try {
            conn = dbc.getOneShotDerbyConnection();
        } catch (Exception e) {
            OPCLogger.error(logger, e.getMessage(), e);
            return;
        }

        if (conn == null) {
            return;
        }

        String SQLsStr = getResourceFile("Tables.sql");

        String[] SQLs = SQLsStr.split(";");

        for (String SQL : SQLs) {

            if (!SQL.trim().isEmpty()) {
                Statement s = null;

                try {
                    s = conn.createStatement();
                    s.executeUpdate(SQL);
                } catch (SQLException e) {
                } finally {
                    if (s != null) {
                        try {
                            s.close();
                        } catch (SQLException e) {
                        }
                    }
                }
            }

        }
        
        SQLQueryParser qp = new SQLQueryParser();
        DatabaseConnection.queries = qp.parse(getResourceFile("Executes.sql"));



    }

    public String getResourceFile(String fileName) {
        InputStream is = this.getClass().getClassLoader().getResourceAsStream(fileName);
        String resultStr = "";
        byte[] buffer = new byte[1024];
        int length;

        ByteArrayOutputStream baos = null;

        try {

            baos = new ByteArrayOutputStream();

            while ((length = is.read(buffer)) != -1) {
                baos.write(buffer, 0, length);
            }

            resultStr = baos.toString(StandardCharsets.UTF_8.name());

        } catch (Exception e) {
            OPCLogger.error(logger, e.getMessage(), e);
        } finally {

            if (is != null) {
                try {
                    is.close();
                } catch (Exception e) {
                }
            }

            if (baos != null) {
                try {
                    baos.close();
                } catch (Exception e) {
                }
            }

        }

        return resultStr;
    }

}
