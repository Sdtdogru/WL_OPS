package com.wlsdm.opc.common;

import org.slf4j.Logger;

public class OPCLogger {

	public static final String LEVELS = "TRACE, DEBUG, INFO, WARN, ERROR, FATAL, OFF";

	public static void info(Logger logger, String message, Throwable t) {
		if (logger.isInfoEnabled()) {
			logger.info(message, t);
		}
	}

	public static void info(Logger logger, String message) {
		if (logger.isInfoEnabled()) {
			logger.info(message);
		}
	}

	public static void debug(Logger logger, String message, Throwable t) {
		if (logger.isDebugEnabled()) {
			logger.debug(message, t);
		}
	}

	public static void debug(Logger logger, String message) {
		if (logger.isDebugEnabled()) {
			logger.debug(message);
		}
	}

	public static void error(Logger logger, String message, Throwable t) {
		logger.error(message, t);
	}

	public static void error(Logger logger, String message) {
		logger.error(message);
	}

//	public static void fatal(Logger logger, String message, Throwable t) {
//		logger.fatal(message, t);
//	}
//
//	public static void fatal(Logger logger, String message) {
//		logger.fatal(message);
//	}

	public static void trace(Logger logger, String message, Throwable t) {
		if (logger.isTraceEnabled()) {
			logger.trace(message, t);
		}
	}

	public static void trace(Logger logger, String message) {
		if (logger.isTraceEnabled()) {
			logger.trace(message);
		}
	}

	public static void warn(Logger logger, String message, Throwable t) {
		logger.warn(message, t);
	}

	public static void warn(Logger logger, String message) {
		logger.warn(message);
	}

}
