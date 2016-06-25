package com.visid.trackingclientapp;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.support.v4.app.FragmentActivity;
import android.view.View;
import android.widget.Button;

import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.MarkerOptions;

public class TrackingMapActivity extends FragmentActivity implements OnMapReadyCallback {

    private GoogleMap mMap;
    private boolean isTrackingServiceRunning = false;
    private Button trackButton;
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

        trackButton =(Button)findViewById(R.id.trackButtonId);
        trackButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // start tracking by invoking background tracking service
                controlTrackingService();
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
            startService(new Intent(TrackingMapActivity.this,
                    BackgroundTrackingService.class));
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
        if (this.isMapReady()) {
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

    private boolean isMapReady() {
        return mMap != null;
    }

    private void MoveToPosition(double latitude, double longitude) {
        LatLng myOwnPosition = new LatLng(latitude, longitude);
        mMap.addMarker(new MarkerOptions().position(myOwnPosition).title("You are here!"));
        mMap.moveCamera(CameraUpdateFactory.newLatLng(myOwnPosition));
    }
}
