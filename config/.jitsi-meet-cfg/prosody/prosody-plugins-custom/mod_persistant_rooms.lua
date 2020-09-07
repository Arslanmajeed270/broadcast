
log("info", "checking into mod_persistant_rooms.lua2");


module:hook("muc-room-created", function(event)
log("info", "into muc-room-created");



local oldPassword = event.room:get_password();

	event.room:set_password("hello");
end);	
