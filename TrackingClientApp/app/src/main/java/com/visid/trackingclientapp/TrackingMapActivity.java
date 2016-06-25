package com.visid.trackingclientapp;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.support.v4.app.FragmentActivity;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.EditText;

import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.android.gms.vision.text.TextBlock;

public class TrackingMapActivity extends FragmentActivity implements OnMapReadyCallback {

    private GoogleMap mMap;
    private boolean isTrackingServiceRunning = false;
    private boolean activateMap = false;
    private Marker currentPositionMarker = null;
    private Button trackButton;
    private EditText trackingIdTextbox;
    private BroadcastReceiver receiver = new BroadcastReceiver() {

        @Override
        public void onReceive(Context context, Intent intent) {
            Bundle bundle = intent.getExtras();
            if (bundle != null) {
                double latitude = bundle.getDouble(BackgroundTrackingService.LATITUDE);
                double longitude = bundle.getDouble(BackgroundTrackingService.LONGITUDE);
                TrackingMapActivity.this.onLocationChanged(latitude, longitude);
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tracking_map);
        // Obtain the SupportMapFragment and get notified when the map is ready to be used.
        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager()
                .findFragmentById(R.id.map);
        mapFragment.getMapAsync(this);

        trackingIdTextbox = (EditText) findViewById(R.id.trackingIdTextbox);

        trackButton =(Button)findViewById(R.id.trackButtonId);
        trackButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // start tracking by invoking background tracking service
                controlTrackingService();
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

    private void controlTrackingService() {
        if (isTrackingServiceRunning){
            trackButton.setText(R.string.track);
            stopService(new Intent(TrackingMapActivity.this,
                    BackgroundTrackingService.class));
        }else{
            trackButton.setText(R.string.donottrack);
            Intent startIntent = new Intent(TrackingMapActivity.this,
                    BackgroundTrackingService.class);
            startIntent.putExtra(BackgroundTrackingService.TRACKINGID, trackingIdTextbox.getText().toString());
            startService(startIntent);
        }
        isTrackingServiceRunning = !isTrackingServiceRunning;
    }

    @Override
    protected void onResume() {
        super.onResume();
        registerReceiver(receiver, new IntentFilter(BackgroundTrackingService.LOCATIONCHANGEDINTENT));
    }

    @Override
    protected void onPause() {
        super.onPause();
        unregisterReceiver(receiver);
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
}
