local formdecode = require "util.http".formdecode;
local log = module._log;

local function verify_user(session, stanza, room)
    local user_jid = stanza.attr.from;
    if session.token == "lala" then
        room:set_affiliation(true, user_jid, "owner");
    else
        room:set_affiliation(true, user_jid, nil);
    end
end


module:hook("muc-room-pre-create", function(event)
    local origin, room, stanza = event.origin, event.room, event.stanza;
    log("info", "checking token: %s", tostring(origin.token));
    log("info", "pre create: %s %s", tostring(origin), tostring(stanza));
    return verify_user(origin, stanza, room);
end);

module:hook("muc-occupant-pre-join", function(event)
    local origin, room, stanza = event.origin, event.room, event.stanza;
    log("info", "pre join: %s %s", tostring(room), tostring(stanza));
    return verify_user(origin, stanza, room);
end);


-- Extract 'token' param from URL when session is created
function init_session(event)
    log("info", "init session");
    local session, request = event.session, event.request;
    local query = request.url.query;

    if query ~= nil then
        local params = formdecode(query);
        session.token = query and params.token or nil;
        -- previd is used together with https://modules.prosody.im/mod_smacks.html
        -- the param is used to find resumed session and re-use anonymous(random) user id
        -- (see get_username_from_token)
        session.previd = query and params.previd or nil;

        -- The room name and optional prefix from the bosh query
        session.jitsi_bosh_query_room = params.room;
        session.jitsi_bosh_query_prefix = params.prefix or "";
    end
end
module:hook_global("bosh-session", init_session);
