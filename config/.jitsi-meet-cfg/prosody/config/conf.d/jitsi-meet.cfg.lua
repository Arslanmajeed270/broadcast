admins = {
    "focus@auth.meet.jitsi",
    "jvb@auth.meet.jitsi"
}

plugin_paths = { "/prosody-plugins/", "/prosody-plugins-custom" }
http_default_host = "meet.jitsi"



VirtualHost "meet.jitsi"

    authentication = "anonymous"

    ssl = {
        key = "/config/certs/meet.jitsi.key";
        certificate = "/config/certs/meet.jitsi.crt";
    }
    modules_enabled = {
        "bosh";
        "pubsub";
        "ping";
        "speakerstats";
        "conference_duration";
    }

    

    speakerstats_component = "speakerstats.meet.jitsi"
    conference_duration_component = "conferenceduration.meet.jitsi"

    c2s_require_encryption = false



VirtualHost "auth.meet.jitsi"
    ssl = {
        key = "/config/certs/auth.meet.jitsi.key";
        certificate = "/config/certs/auth.meet.jitsi.crt";
    }
    authentication = "internal_hashed"


VirtualHost "recorder.meet.jitsi"
    modules_enabled = {
      "ping";
    }
    authentication = "internal_hashed"


Component "internal-muc.meet.jitsi" "muc"
    storage = "memory"
    modules_enabled = {
        "ping";
	"persistant_rooms";
        
    }
    muc_room_locking = false
    muc_room_default_public_jids = true
    muc_room_default_persistent = true
    restrict_room_creation = false

Component "muc.meet.jitsi" "muc"
    storage = "memory"
    modules_enabled = {
        "muc_meeting_id";
	"persistant_rooms";
    }	
    muc_room_cache_size = 1000
    muc_room_locking = false
    muc_room_default_public_jids = true
    muc_room_default_persistent = true
    restrict_room_creation = false

Component "focus.meet.jitsi"
    component_secret = "87a6714c503a5f50a1fb6b176240b824"

Component "speakerstats.meet.jitsi" "speakerstats_component"
    muc_component = "muc.meet.jitsi"

Component "conferenceduration.meet.jitsi" "conference_duration_component"
    muc_component = "muc.meet.jitsi"


