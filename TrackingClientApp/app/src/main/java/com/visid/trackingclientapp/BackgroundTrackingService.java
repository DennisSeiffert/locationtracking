package com.visid.trackingclientapp;

import android.app.Notification;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.location.Location;
import android.location.LocationManager;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Message;
import android.os.Messenger;
import android.os.Parcel;
import android.os.PowerManager;
import android.os.RemoteException;
import android.util.Log;

import com.parse.ParseObject;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import bolts.Continuation;
import bolts.Task;

public class BackgroundTrackingService extends Service
{
    public static final String LONGITUDE = "longitude";
    public static final String LATITUDE = "latitude";
    public static final String TRACKINGID = "trackingId";
    public static final String LOCATIONCHANGEDINTENT = "locationchangedintent";
    public static final String TIMEUTC = "TIMEUTC";
    static final int MSG_REGISTER_CLIENT = 1;
    static final int MSG_UNREGISTER_CLIENT = 2;
    static final int MSG_SET_VALUE = 3;
    static final int MSG_LOCATION_INFO = 4;
    private static final String TAG = "LocationTracker";
    private static final long LOCATION_INTERVAL = 20 * 1000;
    private static final float LOCATION_DISTANCE = 50.0f;
    final Messenger mMessenger = new Messenger(new IncomingHandler());
    int mValue = 0;
    Location mLastLocation;
    LocationListener[] mLocationListeners = new LocationListener[]{
            new LocationListener(LocationManager.GPS_PROVIDER),
            new LocationListener(LocationManager.NETWORK_PROVIDER)
    };
    private LocationManager mLocationManager = null;
    private String trackingId;
    private ArrayList<Messenger> mClients = new ArrayList<Messenger>();
    private List<Location> queuedLocations;

    private void InformListeners(Location location) {
        Intent locationChanged = new Intent(LOCATIONCHANGEDINTENT);
        Bundle bundle = new Bundle();
        bundle.putDouble(LONGITUDE, location.getLongitude());
        bundle.putDouble(LATITUDE, location.getLatitude());
        bundle.putLong(TIMEUTC, location.getTime());
        locationChanged.putExtras(bundle);

        for (Messenger client : mClients) {
            try {
                Message message = new Message();
                message.setData(bundle);
                message.what = MSG_LOCATION_INFO;
                client.send(message);
            } catch (RemoteException e) {
                Log.e(TAG, "cannot send message to client:  ", e);
            }
        }
    }

    public void InformListener(Messenger client) {
        for (Location location : queuedLocations) {
            Bundle bundle = new Bundle();
            bundle.putDouble(LONGITUDE, location.getLongitude());
            bundle.putDouble(LATITUDE, location.getLatitude());
            bundle.putLong(TIMEUTC, location.getTime());

            Message message = new Message();
            message.setData(bundle);
            message.what = MSG_LOCATION_INFO;
            try {
                client.send(message);
            } catch (RemoteException e) {
                Log.e(TAG, "cannot send message to client:  ", e);
            }
        }
    }

    @Override
    public IBinder onBind(Intent arg0) {
        return mMessenger.getBinder();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.i(TAG, "onStartCommand");
        super.onStartCommand(intent, flags, startId);

        if (intent != null && intent.hasExtra(TRACKINGID)) {
            trackingId = intent.getStringExtra(TRACKINGID);
        }

        startForeground(startId, new Notification(Parcel.obtain()));
        Log.i(TAG, trackingId == null ? "trackingId ist null" : trackingId);

        InitializeLocationRequests();

        return START_STICKY;
    }

    @Override
    public void onCreate()
    {
        Log.i(TAG, "onCreate");
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
    }

    private void initializeLocationManager() {
        Log.i(TAG, "initializeLocationManager");
        if (mLocationManager == null) {
            mLocationManager = (LocationManager) getApplicationContext().getSystemService(Context.LOCATION_SERVICE);
        }
    }

    private class LocationListener implements android.location.LocationListener
    {
        public LocationListener(String provider) {
            Log.i(TAG, "LocationListener " + provider);
            mLastLocation = new Location(provider);
            queuedLocations = new ArrayList<>();
        }

        @Override
        public void onLocationChanged(Location location) {
            Log.i(TAG, "onLocationChanged: " + location);

            InformListeners(location);

            if (canSavePosition() && hasPositionChanged(location)) {
                savePosition(location.getLatitude(), location.getLongitude(), location.getTime());
            }

            if (!this.isConnectedToInternet(getApplicationContext())) {
                queuedLocations.add(location);
                Log.i(TAG, "onLocationChanged: cannot write updates because network is unreachable.");
            } else {
                for (Location queuedLocation : queuedLocations) {
                    if (canSavePosition()) {
                        // savePosition(queuedLocation.getLatitude(), queuedLocation.getLongitude(), location.getTime());
                        InformListeners(queuedLocation);
                    }
                }
                queuedLocations.clear();
            }

            mLastLocation.set(location);
        }

        private boolean hasPositionChanged(Location location) {
            return mLastLocation.getLatitude() != location.getLatitude()
                    && mLastLocation.getLongitude() != location.getLongitude();
        }

        private boolean canSavePosition() {
            return trackingId != null && !trackingId.isEmpty() && this.isConnectedToInternet(getApplicationContext());
        }

        private void savePosition(double latitude, double longitude, long timeInMillisecondsUtc) {
            Log.i(TAG, String.format("sending Position to parse server %s.", trackingId));
            ParseObject obj = new ParseObject("Posts");

            obj.put("name", trackingId);
            obj.put("latitude", latitude);
            obj.put("longitude", longitude);
            obj.put("timestamputc", new Date(timeInMillisecondsUtc));

            obj.saveInBackground().continueWith(new Continuation<Void, Void>() {
                public Void then(Task<Void> task) throws Exception {
                    if (task.isFaulted()) {
                        Log.e(TAG, "unable to send position to parse server: ");
                    }
                    return null;
                }
            });
        }

        @Override
        public void onProviderDisabled(String provider) {
            Log.w(TAG, "onProviderDisabled: " + provider);
        }

        @Override
        public void onProviderEnabled(String provider) {
            Log.i(TAG, "onProviderEnabled: " + provider);
        }

        @Override
        public void onStatusChanged(String provider, int status, Bundle extras) {
            Log.i(TAG, "onStatusChanged: " + provider);
        }

        public boolean isConnectedToInternet(Context _context) {
            ConnectivityManager connectivity = (ConnectivityManager) _context
                    .getSystemService(Context.CONNECTIVITY_SERVICE);
            if (connectivity != null) {
                NetworkInfo info = connectivity.getActiveNetworkInfo();
                if (info != null) {
                    if (info.getState() == NetworkInfo.State.CONNECTED) {
                        return true;
                    }
                }
            }
            return false;
        }

    }

    class IncomingHandler extends Handler {
        @Override
        public void handleMessage(Message msg) {
            switch (msg.what) {
                case MSG_REGISTER_CLIENT:
                    mClients.add(msg.replyTo);
                    BackgroundTrackingService.this.InformListener(msg.replyTo);
                    break;
                case MSG_UNREGISTER_CLIENT:
                    mClients.remove(msg.replyTo);
                    break;
                case MSG_SET_VALUE:
                    mValue = msg.arg1;
                    for (int i = mClients.size() - 1; i >= 0; i--) {
                        try {
                            mClients.get(i).send(Message.obtain(null,
                                    MSG_SET_VALUE, mValue, 0));
                        } catch (RemoteException e) {
                            // The client is dead.  Remove it from the list;
                            // we are going through the list from back to front
                            // so this is safe to do inside the loop.
                            mClients.remove(i);
                        }
                    }
                    break;
                default:
                    super.handleMessage(msg);
            }
        }
    }
}