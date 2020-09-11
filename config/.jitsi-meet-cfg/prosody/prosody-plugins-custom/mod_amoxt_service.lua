local formdecode = require "util.http".formdecode;
local sha256 = require "util.hashes".sha256;
local hex = require "util.hex";


-- module:hook("muc-room-created", function(event)
-- log("info", "into muc-room-created");

-- local Password = event.origin.password or "temppassword";
-- log("info", "checking password: %s", Password);

-- 	event.room:set_password(Password);
-- end);	


-- Extract 'token' param from URL when session is created
function init_session(event)
    -- log("info", "init session");
    local session, request = event.session, event.request;
    local query = request.url.query;

    if query ~= nil then
		local params = formdecode(query);

		session.token = query and params.token or nil;
		session.expiry = query and params.expiry or nil;
		-- log("info", "checking init session: session EXPIRY: %s -> TOKEN: %s -> RoomName: %s", tostring(session.expiry), tostring(session.token), tostring(params.room));

		
		session.previd = query and params.previd or nil;

        -- The room name and optional prefix from the bosh query
        session.jitsi_bosh_query_room = params.room;
		session.jitsi_bosh_query_prefix = params.prefix or "";

		local currentTime = os.time(os.date("!*t"));
		-- log("info", "checking current timespan %s", tostring(currentTime));
		-- log("info", "checking expiry %s", tostring(session.expiry));
		
		if tonumber(session.expiry) < currentTime then
			log("info", "into expiry session");
			session.close(session, 'Time expire!');
		end
		local PRIVATE_KEY = "amoxtsolutions123456789abcdefghi";
		local raw = params.room.."|"..session.expiry.."|"..PRIVATE_KEY; 
		-- log("info", "checking i am into verify_token raw: %s", raw);
		local decoded = hex.to(sha256(raw));
 		-- log("info", "checking decoded: %s", tostring(decoded) );
 		-- log("info", "checking token: %s", tostring(decoded) );
	 	if decoded ~= session.token then
 			session.close(session, 'unauthorized');
 		end

    end
end

module:hook_global("bosh-session", init_session);
module:hook_global("websocket-session", init_session);
