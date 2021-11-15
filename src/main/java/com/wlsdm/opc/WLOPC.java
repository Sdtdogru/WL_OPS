package com.wlsdm.opc;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.ComponentScan;
import com.wlsdm.opc.backend.DatabaseBuilder;
import com.wlsdm.opc.common.OPCLogger;
import com.wlsdm.opc.common.Statics;

@ComponentScan(basePackages = { "com.wlsdm.*" })
@SpringBootApplication
public class WLOPC {

	final static Logger logger = LoggerFactory.getLogger(WLOPC.class);

	public static ConfigurableApplicationContext cactx;
	public static boolean isBackgroundStarted = false;
	public static boolean isWLRCStarted = false;
	public static String[] args_;

	public static void main(String[] args) {

		System.setProperty("spring.devtools.restart.enabled", "false");

		args_ = args;

		OPCLogger.info(logger, "Setting up properties...");

		OPCLogger.info(logger, "WL-OPC " + Statics.VERSION + "-" + Statics.BULID_NUMBER + " [" + Statics.BUILD_DATE
				+ "]" + " starting...");

		cactx = SpringApplication.run(WLOPC.class, args);

		DatabaseBuilder dbb = new DatabaseBuilder();
		
		dbb.start();
		
		System.out.println(dbb.getResourceFile("banner.txt"));
		OPCLogger.info(logger, "OPC server is RUNNING and ready to accept requests. " + Statics.VERSION + "-"
				+ Statics.BULID_NUMBER);		
		
	}
	public static synchronized void close() {
		if (cactx != null) {
			cactx.close();
		}
	}


}
