const config = require("../config.json");

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(config.supabase.url, config.supabase.key, {
  global: {
    headers: {
      Authorization: `Bearer ${config.supabase.devJwt}`,
    },
  },
});

const getPermissions = async (userId) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("dcid", userId);

  if (error || data.length === 0) {
    return {
      id: 0,
      hl: 0,
      teamId: 0,
    };
  }

  return {
    id: data[0].id,
    hl: data[0].hl,
    teamId: data[0].team_id,
  };
};

const getUserByDcid = async (dcid) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("dcid", dcid);

  if (error || data.length === 0) {
    throw new Error("User not found");
  }

  return data[0];
};

module.exports = { getPermissions, getUserByDcid };
