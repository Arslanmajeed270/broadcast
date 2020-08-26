module:hook("muc-room-created", function(event)
            event.room:set_password("hello");
end);
