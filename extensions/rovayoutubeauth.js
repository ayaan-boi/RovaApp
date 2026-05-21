// Rova YouTube Auth Extension
// Uses ikelene.dev Google Auth to identify user, then fetches their YouTube channel

(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("Rova YouTube Auth requires unsandboxed mode.");
  }

  const { BlockType, ArgumentType, Cast } = Scratch;

  const CLIENT_ID   = "382430967410-3svk456rj8ntlu3d3gd9oma09i96cpr9.apps.googleusercontent.com";
  const REDIRECT    = "https://ikelene.dev/google/googleLogin.php";
  const YT_API_KEY  = "AIzaSyCyFg4jSNbDVzpHpvv73yZ89wpTFFeF_cY"; // same key as YouTube Operations
  const proxy       = "https://api.codetabs.com/v1/proxy?quest=";

  let authWindow  = null;
  let msgListener = null;

  // Google identity
  let googleId      = "";
  let googleEmail   = "";
  let googleName    = "";
  let googlePfp     = "";

  // YouTube channel
  let ytChannel     = null;

  // Status
  let status        = "idle"; // idle | pending | fetching | done | failed
  let lastActionDone   = false;
  let lastActionResult = "";

  function stopListener() {
    if (msgListener) { window.removeEventListener("message", msgListener); msgListener = null; }
  }

  async function fetchYouTubeChannel(email) {
    // Search for a channel by email/handle using the YouTube API
    // First try searching by email as a query
    try {
      const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=false&forHandle=${encodeURIComponent(email)}&key=${YT_API_KEY}`;
      const res  = await fetch(proxy + encodeURIComponent(url));
      const data = await res.json();
      if (data.items && data.items.length > 0) return parseChannel(data.items[0]);
    } catch(e) {}

    // Fall back to search API
    try {
      const url2 = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(email)}&maxResults=1&key=${YT_API_KEY}`;
      const res2  = await fetch(proxy + encodeURIComponent(url2));
      const data2 = await res2.json();
      if (data2.items && data2.items.length > 0) {
        const channelId = data2.items[0].snippet.channelId;
        const url3 = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YT_API_KEY}`;
        const res3  = await fetch(proxy + encodeURIComponent(url3));
        const data3 = await res3.json();
        if (data3.items && data3.items.length > 0) return parseChannel(data3.items[0]);
      }
    } catch(e) {}

    return null;
  }

  function parseChannel(item) {
    const snippet    = item.snippet    || {};
    const stats      = item.statistics || {};
    const thumbs     = snippet.thumbnails || {};
    const pfp        = (thumbs.high || thumbs.medium || thumbs.default || {}).url || "";
    return {
      id:          item.id || "",
      name:        snippet.title       || "",
      description: snippet.description || "",
      pfp,
      url:         `https://www.youtube.com/channel/${item.id}`,
      subscribers: stats.subscriberCount || "0",
      views:       stats.viewCount       || "0",
      videos:      stats.videoCount      || "0",
    };
  }

  class RovaYouTubeAuth {
    getInfo() {
      return {
        id: "rovayoutubeauth",
        name: "YouTube Auth",
        color1: "#ff0000",
        color2: "#cc0000",
        blocks: [

          // ── Login ─────────────────────────────────────────────────────
          {
            opcode: "startLogin",
            blockType: BlockType.COMMAND,
            text: "open YouTube login"
          },
          {
            opcode: "authStatus",
            blockType: BlockType.REPORTER,
            text: "auth status"
          },
          {
            opcode: "isPending",
            blockType: BlockType.BOOLEAN,
            text: "waiting for login?"
          },
          {
            opcode: "isDone",
            blockType: BlockType.BOOLEAN,
            text: "login done?"
          },
          {
            opcode: "isFailed",
            blockType: BlockType.BOOLEAN,
            text: "login failed?"
          },
          {
            opcode: "whenLinked",
            blockType: BlockType.HAT,
            text: "when YouTube account is linked",
            isEdgeActivated: false
          },
          "---",

          // ── Google identity ───────────────────────────────────────────
          {
            opcode: "getGoogleField",
            blockType: BlockType.REPORTER,
            text: "linked Google [FIELD]",
            arguments: {
              FIELD: { type: ArgumentType.STRING, menu: "googleFieldMenu" }
            }
          },
          "---",

          // ── YouTube channel ───────────────────────────────────────────
          {
            opcode: "getYTField",
            blockType: BlockType.REPORTER,
            text: "linked YouTube [FIELD]",
            arguments: {
              FIELD: { type: ArgumentType.STRING, menu: "ytFieldMenu" }
            }
          },
          "---",

          // ── Actions ───────────────────────────────────────────────────
          {
            opcode: "reset",
            blockType: BlockType.COMMAND,
            text: "reset YouTube auth"
          }
        ],
        menus: {
          googleFieldMenu: {
            acceptReporters: true,
            items: [
              { text: "email",           value: "email" },
              { text: "full name",       value: "name"  },
              { text: "profile picture", value: "pfp"   },
              { text: "user ID",         value: "id"    }
            ]
          },
          ytFieldMenu: {
            acceptReporters: true,
            items: [
              { text: "channel name",    value: "name"        },
              { text: "channel ID",      value: "id"          },
              { text: "profile picture", value: "pfp"         },
              { text: "description",     value: "description" },
              { text: "channel URL",     value: "url"         },
              { text: "subscribers",     value: "subscribers" },
              { text: "total views",     value: "views"       },
              { text: "video count",     value: "videos"      }
            ]
          }
        }
      };
    }

    startLogin() {
      stopListener();
      status    = "pending";
      ytChannel = null;
      googleId  = googleEmail = googleName = googlePfp = "";

      const state   = encodeURIComponent(JSON.stringify({ source: window.location.hostname }));
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT)}&scope=${encodeURIComponent("profile email")}&prompt=select_account&state=${state}`;

      authWindow = window.open(authUrl, "rova_google_auth", "width=500,height=600,left=" + (window.screen.width/2-250) + ",top=" + (window.screen.height/2-300));

      msgListener = async (event) => {
        if (event.origin !== "https://ikelene.dev") return;
        stopListener();

        const d = event.data;
        googleEmail = d.accountName  || "";
        googleName  = d.fullName     || "";
        googlePfp   = d.profilePicture || "";
        googleId    = d.userId       || "";

        if (authWindow && !authWindow.closed) authWindow.close();

        if (!googleEmail) { status = "failed"; return; }

        // Now fetch their YouTube channel
        status = "fetching";
        const channel = await fetchYouTubeChannel(googleEmail);
        if (channel) {
          ytChannel = channel;
          status    = "done";
        } else {
          // Channel not found via search — still mark done with Google data only
          status = "done";
        }
      };

      window.addEventListener("message", msgListener);

      // Timeout after 5 minutes
      setTimeout(() => {
        if (status === "pending" || status === "fetching") {
          stopListener();
          status = "failed";
        }
      }, 300000);
    }

    authStatus() { return status; }
    isPending()  { return status === "pending" || status === "fetching"; }

    isDone() {
      if (status === "done") { status = "idle"; return true; }
      return false;
    }

    isFailed() {
      if (status === "failed") { status = "idle"; return true; }
      return false;
    }

    whenLinked() {
      if (status === "done") { status = "idle"; return true; }
      return false;
    }

    getGoogleField({ FIELD }) {
      const map = { email: googleEmail, name: googleName, pfp: googlePfp, id: googleId };
      return map[Cast.toString(FIELD)] ?? "";
    }

    getYTField({ FIELD }) {
      if (!ytChannel) return "";
      return String(ytChannel[Cast.toString(FIELD)] ?? "");
    }

    reset() {
      stopListener();
      status    = "idle";
      ytChannel = null;
      googleId  = googleEmail = googleName = googlePfp = "";
      if (authWindow && !authWindow.closed) authWindow.close();
      authWindow = null;
    }
  }

  Scratch.extensions.register(new RovaYouTubeAuth());
})(Scratch);
