package com.visid.trackingclientapp;

import android.app.Application;

import com.parse.Parse;

/**
 * Created by dennis on 25.06.16.
 */
public class TrackingApplication extends Application {

    private static TrackingApplication instance;

    public TrackingApplication getInstance() {
        return instance;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;

        InitializeParse();
    }

    private void InitializeParse() {
        Parse.initialize(new Parse.Configuration.Builder(this.getApplicationContext())
                .applicationId("myAppId")
                .server("http://hmmas8wmeibjab4e.myfritz.net/parse")
                .build()
        );
    }
}
