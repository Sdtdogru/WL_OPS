package com.wlsdm.opc.common;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.security.cert.X509Certificate;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class Statics {

	final static Logger logger = LoggerFactory.getLogger(Statics.class);

	public final static int EXECUTION_MODE_ADD = 0;
	public final static int EXECUTION_MODE_REMOVE = 1;
	public final static int EXECUTION_MODE_UPDATE = 2;
	public final static int EXECUTION_MODE_FIND_REPLACE = 3;

	public static final SimpleDateFormat sdf = new SimpleDateFormat("MM/dd/yyyy HH:mm:ss.SSS");
	public static final SimpleDateFormat sdfRange = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	public static final SimpleDateFormat sdfDay = new SimpleDateFormat("yyyy-MM-dd");
	public static final SimpleDateFormat sdfMailHtml = new SimpleDateFormat("yyyyMMdd");
	public static final SimpleDateFormat sdfRename = new SimpleDateFormat("yyyy_MM_dd_HHmm");

	public static final String GC_METRIC_TYPE_NAME = "java.lang.management.GarbageCollector";
	public static final String GC_METRIC_INSTANCE = "java.lang:type=GarbageCollector";
	public static final String GC_METRIC_NAME_MINOR_EXEC_TIME = "Minor GC Execution Time";
	public static final String GC_METRIC_NAME_MAJOR_EXEC_TIME = "Major GC Execution Time";

	public static String VERSION = "1.9.2";
	public static String BULID_NUMBER = "1";
	public static String BUILD_DATE = new Date().toString();

	public static final String USER_AGENT = "Mozilla/5.0";
	public final static String WLSDM_SERVICE_URL = "/WLSDM/services.opc";
	public final static String WLSDM_SERVICE_IDENTFY_NAME = "serviceName";

	public final static String UNKNOWN_DOMAIN_NAME = "UNKNOWN";

	public final static String WLSDM_SERVICE_INSPECTION = "Inspection";
	public final static String WLSDM_SERVICE_INVITATION = "Invitation";
	public final static String WLSDM_SERVICE_GET_HEALTH_STATES = "HealthStates";
	public final static String WLSDM_SERVICE_DUMP_FILE_LIST = "GetDumpFileList";
	public final static String WLSDM_SERVICE_GET_DUMP_FILE = "GetDumpFile";
	public final static String WLSDM_SERVICE_PUT_FILE = "PutFile";

	public final static String WLSDM_SERVICE_GET_ALL_PROPERTIES = "GetAllProperties";
	public final static String WLSDM_SERVICE_GET_PROPERTY = "GetProperty";
	public final static String WLSDM_SERVICE_SET_PROPERTY = "SetProperty";
	public final static String WLSDM_SERVICE_OPEN_METRIC_ALERT = "OpenMetricAlerts";
	public final static String WLSDM_SERVICE_GET_DOMAIN_ID_CARD = "GetDomainIdCard";
	public final static String WLSDM_SERVICE_SET_LICENSE = "SetLicense";

	public final static int RESPONSE_TYPE_TASK_SUCCESS = 999;
	public final static int RESPONSE_TYPE_OK = 1;
	public final static int RESPONSE_TYPE_WARNING = 0;
	public final static int RESPONSE_TYPE_INTERNAL_ERR = -9;
	public final static int RESPONSE_TYPE_REMOTE_ERR = -10;
	public final static int RESPONSE_TYPE_NO_LIC = -11;
	public final static int RESPONSE_TYPE_TRIAL_MAX_EXEC = -12;
	public final static int RESPONSE_TYPE_ALREADY_EXISTS = -8;

	public final static int RESPONSE_TYPE_T3_USER_ERROR = 888;

	public final static String RESPONSE_MESSAGE_NO_LIC = "WL-OPC instance has no valid license!";
	public final static String RESPONSE_MESSAGE_INTERNAL_ERR = "Back-end error occurred! Please check the WL-OPC log.";
	public final static String RESPONSE_MESSAGE_ALREADY_EXISTS = "Record already exists!";
	public final static String RESPONSE_MESSAGE_MAX_DOMAIN_COUNT = "Reached to maximum domain count! : ";

	public final static String RESPONSE_MESSAGE_TRIAL_MAX_EXEC = "Not available for trial edition after %s execution.";

	public final static String DEFAULT_LISTEN_ADDRESS = "All Local Addresses";

	public final static int ENV_TYPE_PHY_SERVER = 0;
	public final static int ENV_TYPE_WL_DOMAIN = 1;

	public final static int DOMAIN_ENV_TYPE_NOT_SET = -1;

	private static String HOST_NAME = null;
	private static String CANONICAL_HOST_NAME = null;

	public final static String OPC_DB_TYPE_DERBY = "DERBY";
	public final static String OPC_DB_TYPE_H2 = "H2";
	public final static String OPC_DB_TYPE_MYSQL = "MYSQL";
	public final static String OPC_DB_TYPE_ORACLE = "ORACLE";

	public static Hashtable<String, String> WLSDM_REGISTER_RESPONSE_CODE_STR = new Hashtable<>();
	public static Hashtable<String, Boolean> SERVER_DOWN_STATES = new Hashtable<>();

	public final static int SUPPORT_TYPE_EXPIRE_MAIL = 0;
	public final static int SUPPORT_TYPE_EXPIRE_CLOSE_MAIL = 1;

	public static final String WLSDM_PROP_OPC_ENABLE = "wlsdm.opc.enable";
	public static final String WLSDM_PROP_OPC_TOKEN = "wlsdm.opc.token";

	public final static int JMX_NO_ERR = -1;
	public final static int JMX_BREAK_BY_CONNECTION_ERROR = 0;
	public final static int JMX_BREAK_BY_LOCK_ERROR = 1;
	public final static int JMX_BREAK_BY_ACTIVATION_ERROR = 2;
	public final static int JMX_BREAK_BY_GENERAL_ERROR = 3;
	public final static int JMX_BREAK_BY_NOT_FOUND = 4;

	public final static String[] getDiskUsageLinuxCommand() {
		return new String[] { "df", "--output=target,size,avail", "--block-size=1" };
	}

	public final static String[] getCurrentDiskUsageLinuxCommand() {
		return new String[] { "df", "-k", ".", "--output=target,size,avail", "--block-size=1" };
	}

	public final static Map<String, X509Certificate> defaultTypeCertificates = new HashMap<>();
	static {

		WLSDM_REGISTER_RESPONSE_CODE_STR.put("-9", "Registration cancelled. Error Ocurred! (WLSDM Error)");
		WLSDM_REGISTER_RESPONSE_CODE_STR.put("-8", "Registration cancelled. GetToken service call failed!");
		WLSDM_REGISTER_RESPONSE_CODE_STR.put("-7", "Registration ignored. System property not enabled.");
		WLSDM_REGISTER_RESPONSE_CODE_STR.put("-3", "Registration cancelled. Admin server runtime return NULL!");
		WLSDM_REGISTER_RESPONSE_CODE_STR.put("-2", "Registration cancelled. Port is not valid!");
		WLSDM_REGISTER_RESPONSE_CODE_STR.put("-1", "Registration cancelled. Hostname cannot be NULL!");
		WLSDM_REGISTER_RESPONSE_CODE_STR.put("0", "Already registered to WL-OPC.");
		WLSDM_REGISTER_RESPONSE_CODE_STR.put("1", "Registration Success.");

		SERVER_DOWN_STATES.put("ACTIVATE_LATER", true);
		SERVER_DOWN_STATES.put("FAILED", true);
		SERVER_DOWN_STATES.put("FAILED_NOT_RESTARTABLE", true);
		SERVER_DOWN_STATES.put("FAILED_RESTARTING", true);

		SERVER_DOWN_STATES.put("FORCE_SHUTTING_DOWN", true);
		SERVER_DOWN_STATES.put("SHUTDOWN", true);
		SERVER_DOWN_STATES.put("SHUTDOWN_IN_PROCESS", true);
		SERVER_DOWN_STATES.put("SHUTDOWN_PENDING", true);

		SERVER_DOWN_STATES.put("SHUTTING_DOWN", true);
		SERVER_DOWN_STATES.put("STANDBY", true);
		SERVER_DOWN_STATES.put("STARTING", true);
		SERVER_DOWN_STATES.put("UNKNOWN", true);

		SERVER_DOWN_STATES.put("FAILED_MIGRATABLE", true);
		SERVER_DOWN_STATES.put("DISCOVERED", true);

	}


	public synchronized static String getHostName() {

		if (HOST_NAME != null && !HOST_NAME.trim().isEmpty()) {
			return HOST_NAME;
		}

		try {
			HOST_NAME = InetAddress.getLocalHost().getHostName();
		} catch (UnknownHostException e) {
			HOST_NAME = null;
		}

		if (HOST_NAME != null) {
			HOST_NAME = HOST_NAME.trim();
		}

		return HOST_NAME;
	}

	public synchronized static String getCanonicalHostName() {

		if (CANONICAL_HOST_NAME != null && !CANONICAL_HOST_NAME.trim().isEmpty()) {
			return CANONICAL_HOST_NAME;
		}

		try {
			CANONICAL_HOST_NAME = InetAddress.getLocalHost().getCanonicalHostName();
		} catch (UnknownHostException e) {
			CANONICAL_HOST_NAME = null;
		}

		if (CANONICAL_HOST_NAME != null) {
			CANONICAL_HOST_NAME = CANONICAL_HOST_NAME.trim();
		}

		return CANONICAL_HOST_NAME;
	}




}
