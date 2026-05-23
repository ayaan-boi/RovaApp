// Name: SoundCloud API
// ID: SPsoundCloud
// Description: Fetch songs and statistics from SoundCloud.
// By: SharkPool
// License: MIT

// Version V.1.1.0

(function (Scratch) {
  "use strict";
  if (!Scratch.extensions.unsandboxed) throw new Error("SoundCloud API must be run unsandboxed");

  const menuIconURI = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMzIiIGhlaWdodD0iMjMyIiB2aWV3Qm94PSIwIDAgMjMyIDIzMiI+PGRlZnM+PGxpbmVhckdyYWRpZW50IHgxPSIyMzkuNjM0IiB5MT0iMzAzLjAwMSIgeDI9IjIzOS42MzQiIHkyPSI3MS4wMDEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBpZD0iYSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjYmM1ODAwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjYmMxOTAwIi8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgeDE9IjIzOS42MzQiIHkxPSI4My4wMDEiIHgyPSIyMzkuNjM0IiB5Mj0iMjkxLjAwMSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGlkPSJiIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNmZjc2MDAiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmMjIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cGF0aCBkPSJNMjM5LjYzNCA3MS4wMDFjNjQuMDY1IDAgMTE2IDUxLjkzNSAxMTYgMTE2cy01MS45MzUgMTE2LTExNiAxMTYtMTE2LTUxLjkzNS0xMTYtMTE2IDUxLjkzNS0xMTYgMTE2LTExNiIgZmlsbD0idXJsKCNhKSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTEyMy42MzQgLTcxLjAwMSkiLz48cGF0aCBkPSJNMTM1LjYzNCAxODcuMDAxYzAtNTcuNDM3IDQ2LjU2Mi0xMDQgMTA0LTEwNHMxMDQgNDYuNTYzIDEwNCAxMDRjMCA1Ny40MzgtNDYuNTYyIDEwNC0xMDQgMTA0cy0xMDQtNDYuNTYyLTEwNC0xMDQiIGZpbGw9InVybCgjYikiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xMjMuNjM0IC03MS4wMDEpIi8+PHBhdGggZD0iTTM1LjAyIDExMC40NzNjLjM4NyAwIC42OTIuMzA1Ljc1My43MzNsMi4wMTMgMTYuMTY3LTIuMDEzIDE1LjgyMmMtLjA2MS40MjctLjM2Ni43MzItLjc1My43MzItLjM4NiAwLS42OTEtLjMwNS0uNzUyLS43MzJsLTEuNzctMTUuODIyIDEuNzctMTYuMTY4Yy4wNi0uNDI3LjM2Ni0uNzMyLjc1Mi0uNzMybS02LjY1IDYuMjAzYy4zNjYgMCAuNjcxLjI4NS43MTIuNjkxbDEuNTY2IDEwLjAwNi0xLjU2NiA5Ljg0M2MtLjA0LjQwNy0uMzQ2LjY5MS0uNzEyLjY5MS0uMzg2IDAtLjY3MS0uMjg0LS43MzItLjY5MWwtMS4zMjItOS44MjMgMS4zMjItMTAuMDA1Yy4wNjEtLjQyNy4zNjYtLjcxMi43MzItLjcxMm0xMy43NDgtOS4zNzVjLjQ2NyAwIC44MzMuMzY2Ljg5NC45MTVsMS45MTIgMTkuMTc3LTEuOTEyIDE4LjQ4NmMtLjA0LjUwOS0uNDI3Ljg3NS0uODk0Ljg3NS0uNDY4IDAtLjg1NS0uMzg3LS44OTUtLjg5NWwtMS42ODgtMTguNDg2IDEuNjg4LTE5LjE3N2MuMDQtLjUyOS40MjctLjg5NS44OTUtLjg5NW03LjExOC0uNjcyYy41NDggMCAuOTk2LjQ0OCAxLjA1NyAxLjAxOGwxLjgxIDE5LjcyNi0xLjgxIDE5LjA3NmMtLjA2MS41OS0uNTA5IDEuMDM3LTEuMDU4IDEuMDM3cy0xLjAxNi0uNDQ4LTEuMDU3LTEuMDM3bC0xLjU4Ni0xOS4wNzYgMS41ODYtMTkuNzA2Yy4wNC0uNTkuNTA4LTEuMDM3IDEuMDU3LTEuMDM3bTEwLjEwOCAyMC43NjMtMS43MDkgMTkuMjE4Yy0uMDQuNjkyLS41NDkgMS4yLTEuMiAxLjJzLTEuMTgtLjUyOS0xLjIyLTEuMmwtMS41MDUtMTkuMjE4IDEuNTA1LTE4LjI4MmMuMDQtLjY5Mi41Ny0xLjIgMS4yMi0xLjIuNjMgMCAxLjE2LjUwOCAxLjIgMS4xOHptNC4zMzEtMzEuMTE0Yy43MTIgMCAxLjMyMi41OSAxLjM2MyAxLjM0MmwxLjU4NiAyOS43NTItMS41ODYgMTkuMjE4Yy0uMDQuNzUyLS42NTEgMS4zNDItMS4zNjMgMS4zNDItLjczMiAwLTEuMzIyLS41OS0xLjM2Mi0xLjM0MmwtMS40MDQtMTkuMjE4IDEuNDA0LTI5Ljc1MmMuMDQtLjc1My42My0xLjM0MiAxLjM2Mi0xLjM0Mm03LjE5OS02Ljg1NGMuNzkzIDAgMS40NjUuNjcxIDEuNTI2IDEuNDg1bDEuNDg0IDM2LjU2NS0xLjQ4NCAxOS4xMTZjLS4wNDEuODU0LS43MTIgMS41MDUtMS41MjYgMS41MDUtLjgzMyAwLTEuNDg0LS42NzEtMS41MjUtMS41MDVsLTEuMzIyLTE5LjA5NiAxLjMyMi0zNi41NjVjLjA0LS44NTQuNzEyLTEuNTA1IDEuNTI1LTEuNTA1bTcuNDYzLTMuMjk0Yy44OTYgMCAxLjYyOC43MzIgMS42NjggMS42ODhsMS4zODMgMzkuNjE1LTEuMzgzIDE4LjkxM3YtLjAyYy0uMDQuOTE1LS43NzIgMS42NDctMS42NjcgMS42NDdhMS42NyAxLjY3IDAgMCAxLTEuNjY4LTEuNjQ3bC0xLjIyLTE4LjkxMyAxLjIyLTM5LjYxNmMuMDItLjkzNS43NTMtMS42NjcgMS42NjgtMS42NjdtMTAuNTM0IDQxLjI2Mi0xLjI4MSAxOC43OTFjLS4wNCAxLjAxNy0uODM0IDEuODEtMS44MyAxLjgxcy0xLjc5LS44MTMtMS44My0xLjgxbC0xLjE0LTE4Ljc5IDEuMTQtNDAuOTM4Yy4wNC0xLjAxNy44MzMtMS44MSAxLjgzLTEuODEuOTk2IDAgMS43OS43OTMgMS44MyAxLjgxem00LjM3Mi00MS44NTJjMS4wNzggMCAxLjkzMi44NTQgMS45NzMgMS45NTJsMS4xOCAzOS45LTEuMTggMTguNjI5di0uMDJjLS4wMiAxLjA5Ny0uODk1IDEuOTcyLTEuOTczIDEuOTcyYTEuOTcgMS45NyAwIDAgMS0xLjk3Mi0xLjk1MmwtMS4wMzctMTguNjA4IDEuMDM3LTM5LjljLjAyLTEuMTE5Ljg5NS0xLjk3MyAxLjk3Mi0xLjk3M203LjU0NSAxLjMwMWMxLjE2IDAgMi4wOTUuOTM2IDIuMTM2IDIuMTE1bDEuMDc3IDM4LjQzNi0xLjA3NyAxOC41MDd2LS4wMmEyLjE0NCAyLjE0NCAwIDAgMS0yLjEzNiAyLjExNCAyLjEzIDIuMTMgMCAwIDEtMi4xMzUtMi4xMTVsLS45NTYtMTguNDg2Ljk1Ni0zOC40MzZhMi4xMyAyLjEzIDAgMCAxIDIuMTM1LTIuMTE1bTguODQ3LTcuMDc3YTIuNDggMi40OCAwIDAgMSAxLjA1NyAxLjg5MmwuOTU2IDQ1LjczNi0uODc1IDE2LjU1NC0uMTAxIDEuODFjLS4wMi42My0uMjg1IDEuMi0uNjkyIDEuNjA3LS40MjcuNDA2LS45NzYuNjctMS42MDYuNjctLjcxMiAwLTEuMzIyLS4zMjUtMS43NS0uODMzYTIuMyAyLjMgMCAwIDEtLjUyOC0xLjM2MnYtLjA4MmwtLjg1NC0xOC4zODQuODU0LTQ1LjI5di0uNDI2YTIuMzQgMi4zNCAwIDAgMSAxLjA1OC0xLjkxMiAyLjI3IDIuMjcgMCAwIDEgMS4yMi0uMzY2Yy40NjggMCAuODk1LjE0MiAxLjI2LjM4Nm03LjU2Ni00LjMzMWMuNjkxLjQyNyAxLjE4IDEuMiAxLjIgMi4wNTRsMS4wNzcgNDkuOTA1LTEuMDc3IDE4LjF2LS4wMmMtLjAyIDEuMzQyLTEuMTE5IDIuNDQtMi40NCAyLjQ0LTEuMzIzIDAtMi40Mi0xLjA5OC0yLjQ0MS0yLjQybC0uNDg4LTguOTI4LS41MDktOS4xNzIuOTk3LTQ5LjY0MXYtLjI0NGMwLS43NTIuMzY2LTEuNDI0Ljg5NS0xLjg3MWEyLjQzIDIuNDMgMCAwIDEgMi43ODYtLjIwM202Ny4wNDkgMjguMzY5YzEyLjI0MyAwIDIyLjE2NyA5LjkwNCAyMi4xNjcgMjIuMTI2IDAgMTIuMjQzLTkuOTI0IDIyLjA0NS0yMi4xNDcgMjIuMDQ1aC02MS4zOTVjLTEuMzIyLS4xMjItMi4zOC0xLjE4LTIuNC0yLjU0MlY3NS4xNDljLjAyLTEuMjgxLjQ2OC0xLjk1MiAyLjEzNS0yLjYwM2EzOS42IDM5LjYgMCAwIDEgMTQuMTc1LTIuNjQ0YzIwLjM5NyAwIDM3LjEzNCAxNS42NiAzOC45MDMgMzUuNjFhMjIuMiAyMi4yIDAgMCAxIDguNTYyLTEuNzA5IiBmaWxsPSIjZmZmIi8+PC9zdmc+";

  const Cast = Scratch.Cast;
  const vm = Scratch.vm;

  const proxy = "https://api.codetabs.com/v1/proxy?quest=";
  const SoundCloudAPI = "https://api-v2.soundcloud.com/";
  const baseSoundCloudUrl = "https://soundcloud.com/";

  const cloudCache_ = new Map();

  const setCache = (id, value) => {
    cloudCache_.set(id, { expires: Date.now() + (180 * 1000), value });
  };

  const getCache = (id) => {
    if (cloudCache_.has(id)) {
      const item = cloudCache_.get(id);
      if (Date.now() > item.expires) { cloudCache_.delete(id); }
      return item.value;
    }
    return null;
  };

  const genMenuItem = (text, value, opt_pathValue) => {
    const item = { text: Scratch.translate(text), value: value ?? text };
    if (opt_pathValue) item.path = opt_pathValue;
    return item;
  };

  let clientID = "BecG5WJDDxYMffAfWcjJleNqrGyJyZhI";
  let fetchingClientID = false;
  let clientIDFetched  = false;

    async function fetchFreshClientID() {
    if (fetchingClientID) return;
    fetchingClientID = true;
    try {
      const homeRes = await fetch(proxy + encodeURIComponent("https://soundcloud.com"));
      const html = await homeRes.text();
      const rx = new RegExp('<script[^>]+src="(https://a-v2\\.sndcdn\\.com/assets/[^"]+\\.js)"', 'g');
      const scriptMatches = [...html.matchAll(rx)];
      for (const match of scriptMatches.slice(-5)) {
        try {
          const jsRes = await fetch(proxy + encodeURIComponent(match[1]));
          const js = await jsRes.text();
          const idMatch = js.match(new RegExp('client_id:"([a-zA-Z0-9]{32})"'));
          if (idMatch) {
            clientID = idMatch[1];
            clientIDFetched = true;
            fetchingClientID = false;
            return clientID;
          }
        } catch(e) {}
      }
    } catch(e) {}
    fetchingClientID = false;
    return clientID;
  }

  const TRACK_ATTRIBUTES = [
    genMenuItem("name", null, "title"),
    genMenuItem("artist", null, ["user", "username"]),
    genMenuItem("artist ID", null, "user_id"),
    genMenuItem("description", null, "description"),
    genMenuItem("cover", null, "artwork_url"),
    genMenuItem("release date", null, "created_at"),
    genMenuItem("formatted duration", null, "duration"),
    genMenuItem("duration", null, "duration"),
    genMenuItem("downloadable", null, "downloadable"),
    genMenuItem("plays", null, "playback_count"),
    genMenuItem("likes", null, "likes_count"),
    genMenuItem("comment count", null, "comment_count"),
    genMenuItem("genre", null, "genre"),
    genMenuItem("url", null, "permalink_url")
  ];
  const ARTIST_ATTRIBUTES = [
    genMenuItem("username", null, "username"),
    genMenuItem("description", null, "description"),
    genMenuItem("profile picture", null, "avatar_url"),
    genMenuItem("join date", null, "created_at"),
    genMenuItem("track count", null, "track_count"),
    genMenuItem("follower count", null, "followers_count"),
    genMenuItem("following count", null, "followings_count"),
    genMenuItem("url", null, "permalink_url")
  ];

  const STRONG_ARTIST_ATTS = ["description", "created_at", "followings_count", "track_count"];

  vm.runtime.on("PROJECT_START", () => { cloudCache_.clear(); });

  const color1 = "#ff2200";

  class SPsoundCloud {
    getInfo() {
      return {
        id: "SPsoundCloud",
        name: "SoundCloud API",
        color1,
        color2: "#db1b00",
        color3: "#c02300",
        menuIconURI,
        blocks: [
          {
            opcode: "fetchFreshClientID",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("fetch fresh client ID from SoundCloud")
          },
          {
            opcode: "clientIDReady",
            blockType: Scratch.BlockType.BOOLEAN,
            text: Scratch.translate("client ID ready?")
          },
          {
            opcode: "setClient",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("set client ID to [ID]"),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: clientID }
            }
          },
          {
            opcode: "getClientID",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("client ID")
          },
          {
            blockType: Scratch.BlockType.LABEL,
            text: Scratch.translate("Client ID must work for functionality")
          },
          {
            opcode: "testClient",
            blockType: Scratch.BlockType.BOOLEAN,
            disableMonitor: true,
            text: Scratch.translate("test client ID")
          },
          "---",
          {
            opcode: "extractID",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("ID of [THING] from url [URL]"),
            arguments: {
              THING: { type: Scratch.ArgumentType.STRING, menu: "IDS" },
              URL: { type: Scratch.ArgumentType.STRING, defaultValue: "https://soundcloud.com/" }
            }
          },
          { blockType: Scratch.BlockType.LABEL, text: Scratch.translate("Tracks") },
          {
            opcode: "getTrackAtt",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("get [THING] from track ID [ID]"),
            arguments: {
              THING: { type: Scratch.ArgumentType.STRING, menu: "TRACKS" },
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 241049935 }
            }
          },
          {
            opcode: "getTrackMp3",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("get mp3 of track ID [ID]"),
            arguments: {
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 241049935 }
            }
          },
          {
            opcode: "getTrackComment",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("get [NUM2] offset [NUM1] of [TYPE] comments from track ID [ID]"),
            arguments: {
              TYPE: { type: Scratch.ArgumentType.STRING, menu: "COMMENT" },
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 241049935 },
              NUM1: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              NUM2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 20 }
            }
          },
          {
            opcode: "searchTracks",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("search for [NUM] tracks using query [QUERY]"),
            arguments: {
              NUM:   { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              QUERY: { type: Scratch.ArgumentType.STRING, defaultValue: "Ancient Visions" }
            }
          },
          { blockType: Scratch.BlockType.LABEL, text: Scratch.translate("Artists") },
          {
            opcode: "getArtistAtt",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("get [THING] from artist ID [ID]"),
            arguments: {
              THING: { type: Scratch.ArgumentType.STRING, menu: "ARTISTS" },
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 127123168 }
            }
          },
          {
            opcode: "getFollowers",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("get [NUM2] offset [NUM1] of followers from artist ID [ID]"),
            arguments: {
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 127123168 },
              NUM1: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              NUM2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 20 }
            }
          },
          {
            opcode: "getTracks",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("get [NUM2] offset [NUM1] of tracks from artist ID [ID]"),
            arguments: {
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 127123168 },
              NUM1: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              NUM2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 20 }
            }
          },
          {
            opcode: "searchArtists",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("search for [NUM] artists using query [QUERY]"),
            arguments: {
              NUM:   { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              QUERY: { type: Scratch.ArgumentType.STRING, defaultValue: "Aliantos" }
            }
          }
        ],
        menus: {
        commentSortMenu: {
          acceptReporters: false,
          items: [
            { text: "newest", value: "newest" },
            { text: "oldest", value: "oldest" }
          ]
        },
        scCommentFieldMenu: {
          acceptReporters: true,
          items: [
            { text: "text",         value: "body"       },
            { text: "author name",  value: "authorName" },
            { text: "author pfp",   value: "authorPfp"  },
            { text: "author ID",    value: "authorId"   },
            { text: "timestamp",    value: "timestamp"  },
            { text: "created at",   value: "createdAt"  },
            { text: "permalink",    value: "permalink"  }
          ]
        },
          TRACKS:  { acceptReporters: true, items: TRACK_ATTRIBUTES },
          ARTISTS: { acceptReporters: true, items: ARTIST_ATTRIBUTES },
          IDS:     { acceptReporters: true, items: [genMenuItem("track"), genMenuItem("artist")] },
          COMMENT: { acceptReporters: true, items: [genMenuItem("new"), genMenuItem("old")] }
        }
      };
    }

    _getAttributeProp(type, value) {
      const menu = type === "artist" ? ARTIST_ATTRIBUTES : TRACK_ATTRIBUTES;
      value = Cast.toString(value);
      const item = menu.find(i => i.value === value);
      if (item) return item.path ? item : item.value;
      return null;
    }

    async _fetch(url, cacheKey) {
      const cached = getCache(cacheKey);
      if (cached) return cached;
      try {
        if (await Scratch.canFetch(url)) {
          const response = await fetch(proxy + encodeURIComponent(url));
          if (!response.ok) return null;
          const json = await response.json();
          if (cacheKey) setCache(cacheKey, json);
          return json;
        }
        return null;
      } catch(e) {
        console.warn("SoundCloud Error: " + e);
        return null;
      }
    }

    _formatDuration(milli) {
      let seconds = Math.floor(milli / 1000);
      return Math.floor(seconds / 3600) + ":" +
        String(Math.floor((seconds % 3600) / 60)).padStart(2, "0") + ":" +
        String(seconds % 60).padStart(2, "0");
    }

    _returnJSON(json) {
      return vm.extensionManager._loadedExtensions.has("SPjson") ? json : JSON.stringify(json);
    }

    _recursiveCache(collection) {
      if (!Array.isArray(collection)) return;
      for (const item of collection) {
        if (item.kind === "comment" || item.kind === "user") {
          setCache("A" + (item.user_id ?? item.id), item.user ?? item);
        } else {
          setCache("T" + item.id, item);
        }
      }
    }

    _cleanupCollection(type, collection) {
      return collection.map((item) => {
        if (type === "comment") {
          return { body: item.body, created_at: item.created_at, user_id: item.user_id };
        } else {
          return item.id;
        }
      });
    }

    async _getCollection(type, args) {
      const id     = Cast.toString(args.ID ?? args.QUERY);
      const offset = Math.max(0, Math.min(500, Cast.toNumber(args.NUM1)));
      const limit  = Math.max(1, Math.min(500, Cast.toNumber(args.NUM2)));

      let url = SoundCloudAPI;
      switch (type[0]) {
        case "comment": {
          const t = Cast.toString(args.TYPE) === "new" ? "newest" : "oldest";
          url += "tracks/" + id + "/comments?sort=" + t + "&threaded=1&";
          break;
        }
        case "followers": url += "users/" + id + "/followers?"; break;
        case "tracks":    url += "users/" + id + "/tracks?representation=1&"; break;
        case "searchT":   url += "search/tracks?q=" + id + "&"; break;
        case "searchA":   url += "search/users?q=" + id + "&"; break;
      }
      url += "limit=" + limit + "&offset=" + offset + "&client_id=" + clientID;

      const response = await this._fetch(url, type[1] + id);
      if (response) {
        const collection = response.collection ?? [];
        this._recursiveCache(collection);
        return this._returnJSON(this._cleanupCollection(type[0], structuredClone(collection)));
      }
      return '["fetch failed"]';
    }

    async fetchTrackComments(args) {
      const id    = Cast.toString(args.ID);
      const count = Math.max(1, Math.min(200, Cast.toNumber(args.COUNT)));
      const sort  = Cast.toString(args.SORT) === "oldest" ? "oldest" : "newest";
      scCommentsDone    = false;
      fetchedSCComments = [];

      try {
        const url = SoundCloudAPI + "tracks/" + id + "/comments?sort=" + sort +
                    "&threaded=1&limit=" + count + "&client_id=" + clientID;
        const response = await this._fetch(url, "SC" + id + sort + count);
        if (response && response.collection) {
          // Fetch user info for each comment
          const comments = response.collection;
          const userIds  = [...new Set(comments.map(c => c.user_id).filter(Boolean))];

          // Fetch user details in parallel
          const userMap = {};
          await Promise.all(userIds.map(async (uid) => {
            try {
              const cached = getCache("A" + uid);
              if (cached) { userMap[uid] = cached; return; }
              const userUrl = SoundCloudAPI + "users/" + uid + "?client_id=" + clientID;
              const userRes = await this._fetch(userUrl, "A" + uid);
              if (userRes) userMap[uid] = userRes;
            } catch(e) {}
          }));

          fetchedSCComments = comments.map(c => {
            const user = userMap[c.user_id] || {};
            return {
              body:       c.body        || "",
              authorName: user.username || user.full_name || String(c.user_id),
              authorPfp:  (user.avatar_url || "").replace("-large.", "-t300x300."),
              authorId:   String(c.user_id || ""),
              timestamp:  c.timestamp !== undefined ? Math.floor(c.timestamp / 1000) : 0,
              createdAt:  c.created_at  || "",
              permalink:  user.permalink_url || ""
            };
          });
        }
      } catch(e) { console.warn("SoundCloud comments error:", e); }

      scCommentsDone = true;
    }

    scCommentsDone() {
      if (scCommentsDone) { scCommentsDone = false; return true; }
      return false;
    }

    scCommentCount() { return fetchedSCComments.length; }

    getSCComment(args) {
      const idx   = Math.round(Cast.toNumber(args.N)) - 1;
      const c     = fetchedSCComments[idx];
      if (!c) return "";
      return String(c[Cast.toString(args.FIELD)] ?? "");
    }

    allSCCommentsJSON() { return JSON.stringify(fetchedSCComments); }

    async fetchFreshClientID() { await fetchFreshClientID(); }
    clientIDReady() { return clientIDFetched; }
    setClient(args)  { clientID = Cast.toString(args.ID); }
    getClientID()    { return clientID; }

    async testClient() {
      const url = "https://api-auth.soundcloud.com/oauth/session?client_id=" + clientID;
      const response = await this._fetch(url, null);
      return response ? response.session !== undefined : false;
    }

    async extractID(args) {
      const type    = Cast.toString(args.THING) === "track" ? "T" : "A";
      const songUrl = Cast.toString(args.URL);
      if (songUrl === baseSoundCloudUrl) return "";
      const url = SoundCloudAPI + "resolve?url=" + encodeURIComponent(songUrl) + "&client_id=" + clientID;
      const response = await this._fetch(url, null);
      if (response) { setCache(type + response.id, response); return response.id ?? ""; }
      return "";
    }

    async getTrackAtt(args) {
      const attrib = this._getAttributeProp("track", Cast.toString(args.THING));
      if (!attrib) return "";
      const id  = Cast.toString(args.ID);
      const url = SoundCloudAPI + "tracks/soundcloud:tracks:" + id + "?client_id=" + clientID;
      const response = await this._fetch(url, "T" + id);
      if (response) {
        const artistCache = getCache("A" + response.user_id);
        if (!artistCache) setCache("A" + response.user_id, response.user);
        let value;
        if (Array.isArray(attrib.path)) {
          value = response;
          for (const path of attrib.path) value = value[path];
        } else {
          value = response[attrib.path];
        }
        if (attrib.value === "formatted duration") value = this._formatDuration(value);
        return value ?? "";
      }
      return "fetch failed";
    }

    async getTrackMp3(args) {
      const id  = Cast.toString(args.ID);
      const url = SoundCloudAPI + "tracks/soundcloud:tracks:" + id + "?client_id=" + clientID;
      const response = await this._fetch(url, "T" + id);
      if (response) {
        const media    = response.media?.transcodings ?? [];
        const progressive = media.find(m => m.format.mime_type === "audio/mpeg" && m.format.protocol === "progressive");
        if (progressive) {
          const mp3Links = await this._fetch(progressive.url + "?client_id=" + clientID, "TS" + id);
          return mp3Links?.url ?? "";
        }
        // HLS streams (.m3u8) are not directly playable via <audio> — skip them
      }
      return "fetch failed";
    }

    async getTrackComment(args) { return await this._getCollection(["comment", "C"], args); }

    async searchTracks(args) {
      args.NUM1 = 0;
      args.NUM2 = Cast.toNumber(args.NUM) || 10;
      return await this._getCollection(["searchT", "ST"], args);
    }

    async getArtistAtt(args) {
      const attrib = this._getAttributeProp("artist", Cast.toString(args.THING));
      if (!attrib) return "";
      const id  = Cast.toString(args.ID);
      const url = SoundCloudAPI + "users/soundcloud:users:" + id + "?client_id=" + clientID;
      const response = await this._fetch(url, "A" + id);
      if (response) {
        const value = response[attrib.path];
        if (!value && STRONG_ARTIST_ATTS.includes(attrib.path)) {
          cloudCache_.delete("A" + id);
          return await this.getArtistAtt(args);
        }
        return value ?? "";
      }
      return "fetch failed";
    }

    async getFollowers(args) { return await this._getCollection(["followers", "AF"], args); }
    async getTracks(args)    { return await this._getCollection(["tracks",    "AT"], args); }

    async searchArtists(args) {
      args.NUM1 = 0;
      args.NUM2 = Cast.toNumber(args.NUM) || 10;
      return await this._getCollection(["searchA", "SA"], args);
    }
  }

  Scratch.extensions.register(new SPsoundCloud());
})(Scratch);
