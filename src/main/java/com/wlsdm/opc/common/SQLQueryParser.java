package com.wlsdm.opc.common;

import java.util.Hashtable;

public class SQLQueryParser {
	
	
	private final static String QUERY_START = "#QUERY: START";
	private final static String QUERY_END = "#QUERY: END";
	
	private final static String QUERY_NAME = "#NAME:";
	
	
	public Hashtable<String, String> parse(String queries) {
		
		Hashtable<String, String> response = new Hashtable<>();
		
		String[] lines = queries.split(System.lineSeparator());
		
		String lastQueryName = "";
		boolean queryStarted = false;
		
		for (String line : lines) {
			String sLine = line.trim().replaceAll("\t", "");
			
			if(sLine.startsWith(QUERY_NAME)) {
				lastQueryName = sLine.replaceFirst(QUERY_NAME, "").trim().replaceAll("\t", "");
				response.put(lastQueryName, "");
			}
			
			if(sLine.startsWith(QUERY_START)) {
				queryStarted = true;
			}
			
			if(sLine.startsWith(QUERY_END)) {
				queryStarted = false;
			}
			
			if(queryStarted) {
				
				if(sLine.startsWith(QUERY_START)) {
					continue;
				}
				
				String oldData = response.get(lastQueryName);
				String sql = "";
				
				if(oldData.isEmpty()) {
					sql = line;
				} else {
					sql = oldData + "\n" + line;
				}
				
				
				response.put(lastQueryName, sql);
			}
			
		}
		
		
		
		return response;
		
	}
	
}
