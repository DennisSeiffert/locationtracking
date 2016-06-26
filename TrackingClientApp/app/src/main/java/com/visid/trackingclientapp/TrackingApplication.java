package com.visid.trackingclientapp;

import android.app.Application;
import android.content.Context;
import android.support.multidex.MultiDex;

import com.parse.Parse;
import com.parse.ParseACL;
import com.parse.ParseUser;

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

    protected void attachBaseContext(Context base) {
        super.attachBaseContext(base);
        MultiDex.install(this);
    }

    private void InitializeParse() {
        Parse.initialize(new Parse.Configuration.Builder(this.getApplicationContext())
                .applicationId("myAppId")
                .server("http://hmmas8wmeibjab4e.myfritz.net/parse/")
                .build()
        );
    }
}
