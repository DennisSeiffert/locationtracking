package com.visid.trackingclientapp;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Message;
import android.os.Messenger;
import android.os.RemoteException;
import android.support.v4.app.FragmentActivity;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.Toast;

import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.MarkerOptions;

import java.util.ArrayList;
import java.util.Date;

public class TrackingMapActivity extends FragmentActivity implements OnMapReadyCallback {

    final String PERSISTENT_ISCONNECTED = "isConnectedToTrackingService";
    final String PERSISTENT_ISTRACKING = "isTrackingServiceRunning";
    final Messenger mMessenger = new Messenger(new IncomingHandler());
    Messenger mService = null;
    private GoogleMap mMap;
    private boolean isTrackingServiceRunning = false;
    private boolean activateMap = false;
    private Marker currentPositionMarker = null;
    private Button trackButton;
    private ListView geoCoordinates;
    private ArrayList<String> geoCoordinatesItems = new ArrayList<>();
    private ArrayAdapter<String> geoCoordinatesAdapter;
    private EditText trackingIdTextbox;
    private boolean isConnectedToTrackingService;
    /**
     * Class for interacting with the main interface of the service.
     */
    private ServiceConnection mConnection = new ServiceConnection() {
        public void onServiceConnected(ComponentName className,
                                       IBinder service) {
            // This is called when the connection with the service has been
            // established, giving us the service object we can use to
            // interact with the service.  We are communicating with our
            // service through an IDL interface, so get a client-side
            // representation of that from the raw service object.
            mService = new Messenger(service);

            // We want to monitor the service for as long as we are
            // connected to it.
            try {
                Message msg = Message.obtain(null,
                        BackgroundTrackingService.MSG_REGISTER_CLIENT);
                msg.replyTo = mMessenger;
                mService.send(msg);

                // Give it some value as an example.
                msg = Message.obtain(null,
                        BackgroundTrackingService.MSG_SET_VALUE, this.hashCode(), 0);
                mService.send(msg);
            } catch (RemoteException e) {
                // In this case the service has crashed before we could even
                // do anything with it; we can count on soon being
                // disconnected (and then reconnected if it can be restarted)
                // so there is no need to do anything here.
            }

            // As part of the sample, tell the user what happened.
            Toast.makeText(TrackingMapActivity.this, R.string.cast_notification_connected_message,
                    Toast.LENGTH_SHORT).show();
        }

        public void onServiceDisconnected(ComponentName className) {
            // This is called when the connection with the service has been
            // unexpectedly disconnected -- that is, its process crashed.
            mService = null;

            // As part of the sample, tell the user what happened.
            Toast.makeText(TrackingMapActivity.this, R.string.cast_notification_disconnect,
                    Toast.LENGTH_SHORT).show();
        }
    };

    private void transferMessageIntoUi(Bundle bundle) {
        if (bundle != null) {
            double latitude = bundle.getDouble(BackgroundTrackingService.LATITUDE);
            double longitude = bundle.getDouble(BackgroundTrackingService.LONGITUDE);
            long timeUtc = bundle.getLong(BackgroundTrackingService.TIMEUTC);
            this.onLocationChanged(latitude, longitude);
            this.geoCoordinatesAdapter.insert(latitude + " :" + longitude + " at " + new Date(timeUtc).toString(), 0);
        }
    }

    void doBindService() {
        // Establish a connection with the service.  We use an explicit
        // class name because there is no reason to be able to let other
        // applications replace our component.
        bindService(new Intent(TrackingMapActivity.this,
                BackgroundTrackingService.class), mConnection, Context.BIND_ABOVE_CLIENT);
        isConnectedToTrackingService = true;
    }

    void doUnbindService() {
        if (isConnectedToTrackingService) {
            // If we have received the service, and hence registered with
            // it, then now is the time to unregister.
            if (mService != null) {
                try {
                    Message msg = Message.obtain(null,
                            BackgroundTrackingService.MSG_UNREGISTER_CLIENT);
                    msg.replyTo = mMessenger;
                    mService.send(msg);
                } catch (RemoteException e) {
                    // There is nothing special we need to do if the service
                    // has crashed.
                    isTrackingServiceRunning = false;
                }
            }

            // Detach our existing connection.
            unbindService(mConnection);
            isConnectedToTrackingService = false;
        }
    }

    @Override
    public void onSaveInstanceState(Bundle savedInstanceState) {
        // Save the user's current game state
        savedInstanceState.putBoolean(PERSISTENT_ISCONNECTED, this.isConnectedToTrackingService);
        savedInstanceState.putBoolean(PERSISTENT_ISTRACKING, this.isTrackingServiceRunning);

        // Always call the superclass so it can save the view hierarchy state
        super.onSaveInstanceState(savedInstanceState);

    }

    public void onRestoreInstanceState(Bundle savedInstanceState) {
        // Always call the superclass so it can restore the view hierarchy
        super.onRestoreInstanceState(savedInstanceState);

        this.isConnectedToTrackingService =
                savedInstanceState.getBoolean(PERSISTENT_ISCONNECTED);
        this.isTrackingServiceRunning =
                savedInstanceState.getBoolean(PERSISTENT_ISTRACKING);

        this.setTrackingButtonState();
        if (this.isConnectedToTrackingService) {
            this.doBindService();
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        PermissionRequesting.request(this);

        setContentView(R.layout.activity_tracking_map);
        // Obtain the SupportMapFragment and get notified when the map is ready to be used.
        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager()
                .findFragmentById(R.id.map);
        mapFragment.getMapAsync(this);

        trackingIdTextbox = (EditText) findViewById(R.id.trackingIdTextbox);
        geoCoordinates = (ListView) findViewById(R.id.listviewGeoCoordinates);
        geoCoordinatesAdapter = new ArrayAdapter<String>(this, android.R.layout.simple_list_item_1, geoCoordinatesItems);
        geoCoordinates.setAdapter(geoCoordinatesAdapter);

        trackButton =(Button)findViewById(R.id.trackButtonId);
        trackButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // start tracking by invoking background tracking service
                toggleTrackingService();
            }
        });

        final CheckBox activateMapCheckbox = (CheckBox) findViewById(R.id.activateMap);
        activateMapCheckbox.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                activateMap = isChecked;
            }
        });
    }

    private void toggleTrackingService() {
        if (isTrackingServiceRunning){
            doUnbindService();
            stopService(new Intent(TrackingMapActivity.this,
                    BackgroundTrackingService.class));
        } else {
            Intent startIntent = new Intent(TrackingMapActivity.this,
                    BackgroundTrackingService.class);
            startIntent.putExtra(BackgroundTrackingService.TRACKINGID, trackingIdTextbox.getText().toString());
            startService(startIntent);
            doBindService();
        }
        isTrackingServiceRunning = !isTrackingServiceRunning;
        setTrackingButtonState();
    }

    private void setTrackingButtonState() {
        if (!isTrackingServiceRunning) {
            trackButton.setText(R.string.track);
        }else{
            trackButton.setText(R.string.donottrack);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        //doBindService();
    }

    @Override
    protected void onPause() {
        super.onPause();
        //doUnbindService();
    }

    public void onLocationChanged(double latitude, double longitude) {
        if (this.canUpdateMap()) {
            MoveToPosition(latitude, longitude);
        }
    }

    /**
     * Manipulates the map once available.
     * This callback is triggered when the map is ready to be used.
     * This is where we can add markers or lines, add listeners or move the camera. In this case,
     * we just add a marker near Sydney, Australia.
     * If Google Play services is not installed on the device, the user will be prompted to install
     * it inside the SupportMapFragment. This method will only be triggered once the user has
     * installed Google Play services and returned to the app.
     */
    @Override
    public void onMapReady(GoogleMap googleMap) {
        mMap = googleMap;
    }

    private boolean canUpdateMap() {
        return mMap != null && activateMap;
    }

    private void MoveToPosition(double latitude, double longitude) {
        LatLng myOwnPosition = new LatLng(latitude, longitude);
        if (currentPositionMarker == null) {
            currentPositionMarker = mMap.addMarker(new MarkerOptions().position(myOwnPosition).title("You are here!"));
        } else {
            currentPositionMarker.setPosition(myOwnPosition);
        }

        mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(myOwnPosition, 1.0f));
    }

    class IncomingHandler extends Handler {
        @Override
        public void handleMessage(Message msg) {
            switch (msg.what) {
                case BackgroundTrackingService.MSG_LOCATION_INFO:
                    transferMessageIntoUi(msg.getData());
                    break;
                default:
                    super.handleMessage(msg);
            }
        }
    }
}
