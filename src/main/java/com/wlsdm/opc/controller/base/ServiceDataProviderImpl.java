package com.wlsdm.opc.controller.base;


public class ServiceDataProviderImpl implements ServiceDataProvider {
	
	@Override
	public boolean hasLicense() {
		return true;
	}

	@Override
	public boolean isTrial_() {
		return false;
	}


}
