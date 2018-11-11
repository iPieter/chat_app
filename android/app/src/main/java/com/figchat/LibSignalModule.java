package com.figchat;

import android.util.Base64;
import com.facebook.react.bridge.*;
import com.google.gson.Gson;
import org.whispersystems.libsignal.*;
import org.whispersystems.libsignal.ecc.Curve;
import org.whispersystems.libsignal.ecc.DjbECPrivateKey;
import org.whispersystems.libsignal.protocol.CiphertextMessage;
import org.whispersystems.libsignal.protocol.SignalMessage;
import org.whispersystems.libsignal.state.*;
import org.whispersystems.libsignal.state.impl.InMemoryIdentityKeyStore;
import org.whispersystems.libsignal.state.impl.InMemoryPreKeyStore;
import org.whispersystems.libsignal.state.impl.InMemorySessionStore;
import org.whispersystems.libsignal.state.impl.InMemorySignedPreKeyStore;
import org.whispersystems.libsignal.util.KeyHelper;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by anton on 25/11/17.
 */

public class LibSignalModule extends ReactContextBaseJavaModule
{

    public LibSignalModule(ReactApplicationContext context )
    {
        super(context);
    }

    public Map getConstants()
    {
        Map<String, Object> result = new HashMap<>();

        return result;
    }

    @ReactMethod
    public void generateIdentityKeyPair( Promise p )
    {
        IdentityKeyPair identityKeyPair = KeyHelper.generateIdentityKeyPair();

        String result = Base64.encodeToString( identityKeyPair.serialize(), Base64.NO_WRAP );

        p.resolve( result );
    }

    @ReactMethod
    void getPublicKey( String identityKeyPair, Promise p )
    {
        byte [] identity = Base64.decode( identityKeyPair, Base64.NO_WRAP );

        try
        {
            IdentityKeyPair keyPair = new IdentityKeyPair( identity );

            p.resolve( Base64.encodeToString( keyPair.getPublicKey().serialize(), Base64.NO_WRAP ) );
        }
        catch ( InvalidKeyException e )
        {
            p.reject( e );
        }

    }

    @ReactMethod
    void getPrivateKey( String identityKeyPair, Promise p )
    {
        byte [] identity = Base64.decode( identityKeyPair, Base64.NO_WRAP );

        try
        {
            IdentityKeyPair keyPair = new IdentityKeyPair( identity );

            p.resolve( Base64.encodeToString( keyPair.getPrivateKey().serialize(), Base64.NO_WRAP ) );
        }
        catch ( InvalidKeyException e )
        {
            p.reject( e );
        }

    }

    @ReactMethod
    public void generateRegistrationID( Promise p )
    {
        int registrationID = KeyHelper.generateRegistrationId( true );
        p.resolve( registrationID );
    }

    @ReactMethod
    public void generatePreKeys( int startID, int amount, Promise p )
    {
        List<PreKeyRecord> preKeys = KeyHelper.generatePreKeys( startID, amount );

        WritableArray result = new WritableNativeArray();

        for ( PreKeyRecord record : preKeys )
            result.pushString( Base64.encodeToString( record.serialize(), Base64.NO_WRAP ) );

        p.resolve( result );
    }

    @ReactMethod
    public void generateSignedPreKey( String keyPair, int signedPreKeyID, Promise p )
    {
        try
        {
            IdentityKeyPair identityKeyPair = new IdentityKeyPair( Base64.decode( keyPair, Base64.NO_WRAP ) );

            SignedPreKeyRecord signedPreKey = KeyHelper.generateSignedPreKey( identityKeyPair, signedPreKeyID );

            p.resolve( Base64.encodeToString( signedPreKey.serialize(), Base64.NO_WRAP ) );
        }
        catch ( InvalidKeyException e )
        {
            p.reject( e );
        }
    }

    @ReactMethod
    public void getEncryptedMessage( String message, String identityKeyPair, int localRegistrationID, int recipientID, int deviceID, PreKeyBundle receivedPreyKey, Promise p )
    {
        SessionStore sessionStore = new InMemorySessionStore();
        PreKeyStore keyStore = new InMemoryPreKeyStore();
        SignedPreKeyStore signedPreKeyStore = new InMemorySignedPreKeyStore();
        IdentityKeyStore identityKeyStore = null;
        try
        {
            identityKeyStore = new InMemoryIdentityKeyStore( new IdentityKeyPair( Base64.decode( identityKeyPair, Base64.NO_WRAP ) ), localRegistrationID );
        }
        catch ( InvalidKeyException e )
        {
            p.reject( e );
        }

        SessionBuilder sessionBuilder = new SessionBuilder( sessionStore, keyStore, signedPreKeyStore, identityKeyStore, new SignalProtocolAddress( "" +recipientID, deviceID ) );
        try
        {
            sessionBuilder.process( receivedPreyKey );

            SessionCipher sessionCipher = new SessionCipher( sessionStore, keyStore, signedPreKeyStore, identityKeyStore, new SignalProtocolAddress( "" +recipientID, deviceID ) );
            CiphertextMessage result = sessionCipher.encrypt( message.getBytes( "UTF-8" ) );

            p.resolve( Base64.encodeToString( result.serialize(), Base64.NO_WRAP ) );
        }
        catch ( InvalidKeyException e )
        {
            p.reject( e );
        }
        catch ( UntrustedIdentityException e )
        {
            p.reject( e );
        }
        catch ( UnsupportedEncodingException e )
        {
            p.reject( e );
        }
    }

    @ReactMethod
    public void getDecryptedMessage( String message, IdentityKeyPair identityKeyPair, int localRegistrationID, int recipientID, int deviceID, PreKeyBundle receivedPreyKey, Promise p )
    {
        SessionStore sessionStore = new InMemorySessionStore();
        PreKeyStore keyStore = new InMemoryPreKeyStore();
        SignedPreKeyStore signedPreKeyStore = new InMemorySignedPreKeyStore();
        IdentityKeyStore identityKeyStore = new InMemoryIdentityKeyStore( identityKeyPair, localRegistrationID );

        SessionBuilder sessionBuilder = new SessionBuilder( sessionStore, keyStore, signedPreKeyStore, identityKeyStore, new SignalProtocolAddress( "" +recipientID, deviceID ) );
        try
        {
            sessionBuilder.process( receivedPreyKey );

            SessionCipher sessionCipher = new SessionCipher( sessionStore, keyStore, signedPreKeyStore, identityKeyStore, new SignalProtocolAddress( "" +recipientID, deviceID ) );

            p.resolve( new String( sessionCipher.decrypt( new SignalMessage( Base64.decode( message, Base64.NO_WRAP ) ))));
        }
        catch ( InvalidKeyException e )
        {
            p.reject( e );
        }
        catch ( UntrustedIdentityException e )
        {
            p.reject( e );
        }
        catch ( LegacyMessageException e )
        {
            p.reject( e );
        }
        catch ( InvalidMessageException e )
        {
            p.reject( e );
        }
        catch ( DuplicateMessageException e )
        {
            p.reject( e );
        }
        catch ( NoSessionException e )
        {
            p.reject( e );
        }
    }

    public String getName()
    {
        return "LibSignalModule";
    }

}
