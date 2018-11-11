package com.figchat;

import com.facebook.react.bridge.*;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.rabbitmq.client.*;

import java.io.IOException;
import java.util.concurrent.TimeoutException;

/**
 * Created by anton on 30/11/17.
 */

public class RabbitMQModule extends ReactContextBaseJavaModule
{
    private static Connection connection = null;
    private static Channel    channel = null;

    public RabbitMQModule( ReactApplicationContext context )
    {
        super( context );
    }

    @ReactMethod
    public void init( String username, String password, String host, int port, String virtualhost, Promise p )
    {
        if( connection != null && connection.isOpen() && channel != null && channel.isOpen() )
        {
            try
            {
                channel.close();
                connection.close();

                channel = null;
                connection = null;
            }
            catch ( IOException e )
            {
                p.reject( e );
            }
            catch ( TimeoutException e )
            {
                p.reject( e );
            }
        }

        ConnectionFactory factory = new ConnectionFactory();
        factory.setUsername( username );
        factory.setPassword( password );
        factory.setHost( host );
        factory.setPort( port );
        factory.setVirtualHost( virtualhost );

        try
        {
            connection = factory.newConnection();
            channel = connection.createChannel();

            p.resolve( "" );
        }
        catch ( IOException e )
        {
            p.reject( e );
        }
        catch ( TimeoutException e )
        {
            p.reject( e );
        }
    }

    @ReactMethod
    public void declareExchange( String name, Promise p )
    {
        try
        {
            channel.exchangeDeclare( name, BuiltinExchangeType.DIRECT, true );
            p.resolve( "" );
        }
        catch ( IOException e )
        {
            p.reject( e );
        }
    }

    @ReactMethod
    public void subscribe( String queueName, Promise p )
    {
        boolean autoAck = false;
        try
        {
            channel.basicConsume( queueName, autoAck, "myConsumerTag", new DefaultConsumer( channel )
            {
                public void handleDelivery( String consumerTag,
                                            Envelope envelope,
                                            AMQP.BasicProperties properties,
                                            byte[] body )
                        throws IOException
                {
                    String routingKey  = envelope.getRoutingKey();
                    String contentType = properties.getContentType();
                    long   deliveryTag = envelope.getDeliveryTag();
                    channel.basicAck( deliveryTag, false );

                    String message = new String( body, "UTF-8" );

                    WritableMap params = Arguments.createMap();
                    params.putString( "message", message );

                    sendEvent( getReactApplicationContext(), "messageReceived", params );
                }
            } );

            p.resolve( "" );
        }
        catch ( IOException e )
        {
            p.reject( e );
        }
    }

    @ReactMethod
    public void sendMessage( String msg, String clientKey, Promise p )
    {
        try
        {
            channel.basicPublish( "messages", clientKey, null, msg.getBytes(  ) );
            p.resolve( "" );
        }
        catch ( IOException e )
        {
            p.reject( e );
        }
    }

    @ReactMethod
    public void close( Promise p )
    {
        if( connection != null && connection.isOpen() && channel != null && channel.isOpen() )
        {
            try
            {
                channel.close();
                connection.close();

                channel = null;
                connection = null;
            }
            catch ( IOException e )
            {
                p.reject( e );
            }
            catch ( TimeoutException e )
            {
                p.reject( e );
            }
        }
    }

    private void sendEvent( ReactContext reactContext, String eventName, WritableMap params )
    {
        reactContext.getJSModule( DeviceEventManagerModule.RCTDeviceEventEmitter.class ).emit( eventName, params );
    }

    @Override
    public String getName()
    {
        return "RabbitMQ";
    }
}
