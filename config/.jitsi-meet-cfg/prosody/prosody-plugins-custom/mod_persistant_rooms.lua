module:log('INFO', "i am into mod_persistant");

local formdecode = require "util.http".formdecode;

module:hook("muc-room-created", function(event)

    local session, request = event.session, event.request;
	local query = request.url.query;

	if query ~= nil then
        local params = formdecode(query);
    end;
    module:log('INFO', 'checking params %s', params.tostring());

            event.room:set_password("hello");
end);
