package com.wlsdm.opc.datatypes;

public class HTTPRestResponse {
	private int responseCode;
	private Object response;

	public int getResponseCode() {
		return responseCode;
	}

	public void setResponseCode(int responseCode) {
		this.responseCode = responseCode;
	}

	public Object getResponse() {
		return response;
	}

	public void setResponse(Object response) {
		this.response = response;
	}
}
