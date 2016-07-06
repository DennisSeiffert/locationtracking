package com.visid.trackingclientapp;

import android.app.Notification;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.location.Location;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.IBinder;
import android.os.Parcel;
import android.os.PowerManager;
import android.util.Log;

import com.parse.ParseException;
import com.parse.ParseObject;

import java.util.Date;

public class BackgroundTrackingService extends Service
{
    public static final String LONGITUDE = "longitude";
    public static final String LATITUDE = "latitude";
    public static final String TRACKINGID = "trackingId";
    public static final String LOCATIONCHANGEDINTENT = "locationchangedintent";
    private static final String TAG = "LocationTracker";
    private LocationManager mLocationManager = null;
    private static final int LOCATION_INTERVAL = 1000;
    private static final float LOCATION_DISTANCE = 2.0f;
    private String trackingId;
    private PowerManager.WakeLock wakeLock;

    private class LocationListener implements android.location.LocationListener
    {
        Location mLastLocation;

        public LocationListener(String provider)
        {
            Log.i(TAG, "LocationListener " + provider);
            mLastLocation = new Location(provider);
        }

        @Override
        public void onLocationChanged(Location location)
        {
            Log.i(TAG, "onLocationChanged: " + location);

            Intent locationChanged = new Intent(LOCATIONCHANGEDINTENT);
            Bundle bundle = new Bundle();
            bundle.putDouble(LONGITUDE, location.getLongitude());
            bundle.putDouble(LATITUDE, location.getLatitude());
            locationChanged.putExtras(bundle);
            sendBroadcast(locationChanged);

            if (canSavePosition() && hasPositionChanged(location)) {
                savePosition(location.getLatitude(), location.getLongitude());
            }

            mLastLocation.set(location);
        }

        private boolean hasPositionChanged(Location location) {
            return mLastLocation.getLatitude() != location.getLatitude()
                    && mLastLocation.getLongitude() != location.getLongitude();
        }

        private boolean canSavePosition() {
            return trackingId != null && !trackingId.isEmpty();
        }

        private void savePosition(double latitude, double longitude) {
            Log.i(TAG, String.format("sending Position to parse server %s.", trackingId));
            ParseObject obj = new ParseObject("Posts");

            obj.put("name", trackingId);
            obj.put("latitude", latitude);
            obj.put("longitude", longitude);
            obj.put("timestamputc", new Date());

            try {
                //if (!obj.saveInBackground().waitForCompletion(5, TimeUnit.SECONDS)){
                //    Log.w(TAG, "Position update has not been completed.");
                //}
                obj.save();
                // } catch (InterruptedException e) {
                //     Log.e(TAG, "unable to send position to parse server: ", e);
            } catch (ParseException e) {
                Log.e(TAG, "unable to send position to parse server: ", e);
            }
        }

        @Override
        public void onProviderDisabled(String provider)
        {
            Log.w(TAG, "onProviderDisabled: " + provider);
        }

        @Override
        public void onProviderEnabled(String provider)
        {
            Log.i(TAG, "onProviderEnabled: " + provider);
        }

        @Override
        public void onStatusChanged(String provider, int status, Bundle extras)
        {
            Log.i(TAG, "onStatusChanged: " + provider);
        }
    }

    LocationListener[] mLocationListeners = new LocationListener[] {
            new LocationListener(LocationManager.GPS_PROVIDER),
            new LocationListener(LocationManager.NETWORK_PROVIDER)
    };

    @Override
    public IBinder onBind(Intent arg0)
    {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId)
    {
        Log.i(TAG, "onStartCommand");
        super.onStartCommand(intent, flags, startId);

        if (intent != null && intent.hasExtra(TRACKINGID)) {
            trackingId = intent.getStringExtra(TRACKINGID);
        }

        startForeground(startId, new Notification(Parcel.obtain()));
        Log.i(TAG, trackingId == null ? "trackingId ist null" : trackingId);
        return START_STICKY;
    }

    @Override
    public void onCreate()
    {
        Log.i(TAG, "onCreate");
        PowerManager pm = (PowerManager) getSystemService(this.POWER_SERVICE);
        this.wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "DoNotSleep");

        InitializeLocationRequests();
    }

    private void InitializeLocationRequests() {
        initializeLocationManager();
        try {
            mLocationManager.requestLocationUpdates(
                    LocationManager.NETWORK_PROVIDER, LOCATION_INTERVAL, LOCATION_DISTANCE,
                    mLocationListeners[1]);
        } catch (SecurityException ex) {
            Log.i(TAG, "fail to request location update, ignore", ex);
        } catch (IllegalArgumentException ex) {
            Log.d(TAG, "network provider does not exist, " + ex.getMessage());
        }
        try {
            mLocationManager.requestLocationUpdates(
                    LocationManager.GPS_PROVIDER, LOCATION_INTERVAL, LOCATION_DISTANCE,
                    mLocationListeners[0]);
        } catch (SecurityException ex) {
            Log.i(TAG, "fail to request location update, ignore", ex);
        } catch (IllegalArgumentException ex) {
            Log.d(TAG, "gps provider does not exist " + ex.getMessage());
        }
    }

    @Override
    public void onDestroy()
    {
        Log.i(TAG, "onDestroy");
        super.onDestroy();
        if (mLocationManager != null) {
            for (int i = 0; i < mLocationListeners.length; i++) {
                try {
                    mLocationManager.removeUpdates(mLocationListeners[i]);
                } catch (java.lang.SecurityException ex) {
                    Log.i(TAG, "fail to request location update, ignore", ex);
                } catch (Exception ex) {
                    Log.i(TAG, "fail to remove location listners, ignore", ex);
                }
            }
        }
        stopForeground(true);

        this.wakeLock.release();
    }

    private void initializeLocationManager() {
        Log.i(TAG, "initializeLocationManager");
        if (mLocationManager == null) {
            mLocationManager = (LocationManager) getApplicationContext().getSystemService(Context.LOCATION_SERVICE);
        }
    }
}