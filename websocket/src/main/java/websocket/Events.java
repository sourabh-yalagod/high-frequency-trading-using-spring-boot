package websocket;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "")
public class Events {

    private String userCreatedByNameQueue;
    private String userCreatedRecordQueue;
    private String userCreatedEventTypeQueue;
}
