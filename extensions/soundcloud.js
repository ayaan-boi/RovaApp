// Name: SoundCloud API
// ID: SPsoundCloud
// Description: Fetch songs and statistics from SoundCloud.
// By: SharkPool & Manus AI
// License: MIT

// Version V.1.2.0

(function (Scratch) {
  "use strict";
  if (!Scratch.extensions.unsandboxed) throw new Error("SoundCloud API must be run unsandboxed");

  const menuIconURI =
"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMzIiIGhlaWdodD0iMjMyIiB2aWV3Qm94PSIwIDAgMjMyIDIzMiI+PGRlZnM+PGxpbmVhckdyYWRpZW50IHgxPSIyMzkuNjM0IiB5MT0iMzAzLjAwMSIgeDI9IjIzOS42MzQiIHkyPSI3MS4wMDEiIGdyYWRpZW50VW5pdHMgPSJ1c2VyU3BhY2VPblVzZSIgaWQ9ImEiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iI2JjNTgwMCIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2JjMTkwMCIvPj/bGluZWFyR3JhZGllbnQ+PGxpbmVhckdyYWRpZW50IHgxPSIyMzkuNjM0IiB5MT0iODMuMDAxIiB4Mj0iMjM5LjYzNCIgeTI9IjI5MS4wMDEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBpZD0iYiI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZmY3NjAwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZjIwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZD0iTTIzOS42MzQgNzEuMDAxYzY0LjA2NSAwIDExNiA1MS45MzUgMTE2IDExNnMtNTEuOTM1IDExNi0xMTYgMTE2LTExNi01MS45MzUtMTE2LTExNiA1MS45MzUtMTE2IDExNi0xMTYiIGZpbGw9InVybCgjYSkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xMjMuNjM0IC03MS4wMDEpIi8+PHBhdGggZD0iTTEzNS42MzQgMTg3LjAwMWMwLTU3LjQzNyA0Ni41NjItMTA0IDEwNC0xMDRzMTA0IDQ2LjU2MyAxMDQgMTA0YzAgNTcuNDM4LTQ2LjU2MiAxMDQtMTA0IDEwNHMtMTA0LTQ2LjU2Mi0xMDQtMTA0IiBmaWxsPSJ1cmwoI2IpIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTIzLjYzNCAtNzEuMDAxKSIvPjxwYXRoIGQ9Ik0zNS4wMiAxMTAuNDczYy4zODcgMCAuNjkzLjMwNS43NTMuNzMzbDIuMDEzIDE2LjE2Ny0yLjAxMyAxNS44MjJjLS4wNjEuNDI3LS4zNjYuNzMyLS43NTMuNzMyLS4zODYgMC0uNjkxLS4zMDUtLjc1Mi0uNzMybC0xLjc3LTE1LjgyMiAxLjc3LTE2LjE2OGMuMDYtLjQyNy4zNjYtLjczMi43NTItLjczMm0tNi42NS02LjIwM2MuMzY2IDAgLjY3MS4yODUuNzEyLjY5MWwxLjU2NiAxMC4wMDYtMS41NjYgOS44NDNjLS4wNC40MDctLjM0Ni42OTEtLjcxMi42OTEtLjM4NiAwLS42NzEtLjI4NC0uNzMyLS42OTFMMCA1Ny40OTFsMS4zMjItMTAuMDA1Yy4wNjEtLjQyNy4zNjYtLjcxMi43MzItLjcxMm0xMy43NDgtOS4zNzVjLjQ2NyAwIC44MzMuMzY2Ljg5NC45MTVsMS45MTIgMTkuMTc3LTEuOTEyIDE4LjQ4NmMtLjA0LjUwOS0uNDI3Ljg3NS0uODk0Ljg3NS0uNDY4IDAtLjg1NS0uMzg3LS44OTUtLjg5NWwtMS42ODgtMTguNDg2IDEuNjg4LTE5LjE3N2MuMDQtLjUyOS40MjctLjg5NS44OTUtLjg5NW03LjExOC0uNjcyYy41NDggMCAuOTk2LjQ0OCAxLjA1NyAxLjAxOGwxLjgxIDE5LjcyNi0xLjgxIDE5LjA3NmMtLjA2MS41OS0uNTA5IDEuMDM3LTEuMDU4IDEuMDM3cy0xLjAxNi0uNDQ4LTEuMDU3LTEuMDM3bC0xLjU4Ni0xOS4wNzYgMS41ODYtMTkuNzA2Yy4wNC0uNTkuNTA4LTEuMDM3IDEuMDU3LTEuMDM3bTEwLjEwOCAyMC43NjMtMS43MDkgMTkuMjE4Yy0uMDQuNjkyLS41NDkgMS4yLTEuMiAxLjJzLTEuMTgtLjUyOS0xLjIyLTEuMmwtMS41MDUtMTkuMjE4IDEuNTA1LTE4LjI4MmMuMDQtLjY5Mi41Ny0xLjIgMS4yMi0xLjIuNjMgMCAxLjE2LjUwOCAxLjIgMS4xOHptNC4zMzEtMzEuMTE0Yy43MTIgMCAxLjMyMi41OSAxLjM2MyAxLjM0MmwxLjU4NiAyOS43NTItMS41ODYgMTkuMjE4Yy0uMDQuNzUyLS42NTEgMS4zNDItMS4zNjMgMS4zNDItLjczMiAwLTEuMzIyLS41OS0xLjM2Mi0xLjM0MmwtMS40MDQtMTkuMjE4IDEuNDA0LTI5Ljc1MmMuMDQtLjc1My42My0xLjM0MiAxLjM2Mi0xLjM0Mm03LjE5OS02Ljg1NGMuNzkzIDAgMS40NjUuNjcxIDEuNTI2IDEuNDg1bDEuNDg0IDM2LjU2NS0xLjQ4NCAxOS4xMTZjLS4wNDEuODU0LS43MTIgMS41MDUtMS41MjYgMS41MDUtLjgzMyAwLTEuNDg0LS42NzEtMS41MjUtMS41MDVsLTEuMzIyLTE5LjA5NiAxLjMyMi0zNi41NjVjLjA0LS44NTQuNzEyLTEuNTA1IDEuNTI1LTEuNTA1bTcuNDYzLTMuMjk0Yy44OTYgMCAxLjYyOC43MzIgMS42NjggMS42ODhsMS4zODMgMzkuNjE1LTEuMzgzIDE4LjkxM3YtLjAyYy0uMDQuOTE1LS43NzIgMS42NDctMS42NjcgMS42NDdhMS42NyAxLjY3IDAgMCAxLTEuNjY4LTEuNjQ3bC0xLjIyLTE4LjkxMyAxLjIyLTM5LjYxNmMuMDItLjkzNS43NTMtMS42NjcgMS42NjgtMS42NjdtMTAuNTM0IDQxLjI2Mi0xLjI4MSAxOC43OTFjLS4wNCAxLjAxNy0uODM0IDEuODEtMS44MyAxLjgxcy0xLjc5LS44MTMtMS44My0xLjgxbC0xLjE0LTE4Ljc5IDEuMTQtNDAuOTM4Yy4wNC0xLjAxNy44MzMtMS44MSAxLjgzLTEuODEuOTk2IDAgMS43OS43OTMgMS44MyAxLjgxem00LjM3Mi00MS44NTJjMS4wNzggMCAxLjkzMi44NTQgMS45NzMgMS45NTJsMS4xOCAzOS45LTEuMTggMTguNjI5di0uMDJjLS4wMiAxLjA5Ny0uODk1IDEuOTcyLTEuOTczIDEuOTcyYTEuOTcgMS45NyAwIDAgMS0xLjk3Mi0xLjk1MmwtMS4wMzctMTguNjA4IDEuMDM3LTM5LjljLjAyLTEuMTE5Ljg5NS0xLjk3MyAxLjk3Mi0xLjk3M203LjU0NSAxLjMwMWMxLjE2IDAgMi4wOTUuOTM2IDIuMTM2IDIuMTE1bDEuMDc3IDM4LjQzNi0xLjA3NyAxOC41MDd2LS4wMmEyLjE0NCAyLjE0NCAwIDAgMS0yLjEzNiAyLjExNCAyLjEzIDIuMTMgMCAwIDEtMi4xMzUtMi4xMTVsLS45NTYtMTguNDg2Ljk1Ni0zOC40MzZhMi4xMyAyLjEzIDAgMCAxIDIuMTM1LTIuMTE1bTguODQ3LTcuMDc3YTIuNDggMi40OCAwIDAgMSAxLjA1NyAxLjg5MmwuOTU2IDQ1LjczNi0uODc1IDE2LjU1NC0uMTAxIDEuODFjLS4wMi42My0uMjg1IDEuMi0uNjkyIDEuNjA3LS40MjcuNDA2LS45NzYuNjctMS42MDYuNjctLjcxMiAwLTEuMzIyLS4zMjUtMS43NS0uODMzYTIuMyAyLjMgMCAwIDEtLjUyOC0xLjM2MnYtLjA4MmwtLjg1NC0xOC4zODQuODU0LTQ1LjI5di0uNDI2YTIuMzQgMi4zNCAwIDAgMSAxLjA1OC0xLjkxMiAyLjI3IDIuMjcgMCAwIDEgMS4yMi0uMzY2Yy40NjggMCAuODk1LjE0MiAxLjI2LjM4Nm03LjU2Ni00LjMzMWMuNjkxLjQyNyAxLjE4IDEuMiAxLjIgMi4wNTRsMS4wNzcgNDkuOTA1LTEuMDc3IDE4LjF2LS4wMmMtLjAyIDEuMzQyLTEuMTE5IDIuNDQtMi40NCAyLjQ0LTEuMzIzIDAtMi40Mi0xLjA5OC0yLjQ0MS0yLjQybC0uNDg4LTguOTI4LS41MDktOS4xNzIuOTk3LTQ5LjY0MXYtLjI0NGMwLS43NTIuMzY2LTEuNDI0Ljg5NS0xLjg3MWEyLjQzIDIuNDMgMCAwIDEgMi43ODYtLjIwM202Ny4wNDkgMjguMzY5YzEyLjI0MyAwIDIyLjE2NyA5LjkwNCAyMi4xNjcgMjIuMTI2IDAgMTIuMjQzLTkuOTI0IDIyLjA0NS0yMi4xNDcgMjIuMDQ1aC02MS4zOTVjLTEuMzIyLS4xMjItMi4zOC0xLjE4LTIuNC0yLjU0MlY3NS4xNDljLjAyLTEuMjgxLjQ2OC0xLjk1MiAyLjEzNS0yLjYwM2EzOS42IDM5LjYgMCAwIDEgMTQuMTc1LTIuNjQ0YzIwLjM5NyAwIDM3LjEzNCAxNS42NiAzOC45MDMgMzUuNjFhMjIuMiAyMi4yIDAgMCAxIDguNTYyLTEuNzA5IiBmaWxsPSIjZmZmIi8+PC9zdmc+";
  const blockIconURI =
"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxODAuMSIgaGVpZ2h0PSI3OC4xOTQiIHZpZXdCb3g9IjAgMCAxODAuMSA3OC4xOTQiPjxwYXRoIGQ9Ik04LjcwNCA0MC41NzFjLjM4NyAwIC42OTIuMzA1Ljc1My43MzNsMi4wMTMgMTYuMTY3LTIuMDEzIDE1LjgyMmMtLjA2MS40MjctLjM2Ni43MzItLjc1My43MzItLjM4NiAwLS42OTEtLjMwNS0uNzUyLS43MzJsLTEuNzctMTUuODIyIDEuNzctMTYuMTY3Yy4wNi0uNDI4LjM2Ni0uNzMzLjc1Mi0uNzMzbS02LjY1IDYuMjAzY2MuMzY2IDAgLjY3MS4yODUuNzEyLjY5MWwxLjU2NiAxMC4wNi0xLjU2NiA5Ljg0M2MtLjA0LjQwNy0uMzQ2LjY5MS0uNzEyLjY5MS0uMzg2IDAtLjY3MS0uMjg0LS43MzItLjY5MUwwIDU3LjQ5MWwxLjMyMi0xMC4wMDVjLjA2MS0uNDI3LjM2Ni0uNzEyLjczMi0uNzEybTEzLjc0OC05LjM3NWMuNDY3IDAgLjgzMy4zNjYuODk0LjkxNWwxLjkxMiAxOS4xNzctMS45MTIgMTguNDg2Yy0uMDQuNTA5LS40MjcuODc1LS44OTQuODc1LS40NjggMC0uODU1LS4zODctLjg5NS0uODk1bC0xLjY4OC0xOC40ODYgMS42ODgtMTkuMTc3Yy4wNC0uNTI5LjQyNy0uODk1Ljg5NS0uODk1bTcuMTE4LS42NzJjLjU0OCAwIC45OTYuNDQ4IDEuMDU3IDEuMDE4bDEuODEgMTkuNzI2LTEuODEgMTkuMDc2Yy0uMDYxLjU5LS41MDkgMS4wMzctMS4wNTggMS4wMzdzLTEuMDE2LS40NDgtMS4wNTctMS4wMzdsLTEuNTg2LTE5LjA3NiAxLjU4Ni0xOS43MDZjLjA0LS41OS41MDgtMS4wMzcgMS4wNTctMS4wMzdtMTAuMTA4IDIwLjc2My0xLjcwOSAxOS4yMThjLS4wNC42OTItLjU0OSAxLjItMS4yIDEuMnMtMS4xOC0uNTI5LTEuMjItMS4ybC0xLjUwNS0xOS4yMTggMS41MDUtMTguMjgyYy4wNC0uNjkyLjU3LTEuMiAxLjIyLTEuMi42MyAwIDEuMTYuNTA4IDEuMiAxLjE4em00LjMzMS0zMS4xMTRjLjcxMiAwIDEuMzIyLjU5IDEuMzYzIDEuMzQybDEuNTg2IDI5Ljc1Mi0xLjU4NiAxOS4yMThjLS4wNC43NTItLjY1MSAxLjM0Mi0xLjM2MyAxLjM0Mi0uNzMyIDAtMS4zMjItLjU5LTEuMzYyLTEuMzQybC0xLjQwNC0xOS4yMTggMS40MDQtMjkuNzUyYy4wNC0uNzUzLjYzLTEuMzQyIDEuMzYyLTEuMzQybTcuMTk5LTYuODU0Yy43OTMgMCAxLjQ2NS42NzEgMS41MjYgMS40ODVsMS40ODQgMzYuNTY1LTEuNDg0IDE5LjExNmMtLjA0MS44NTQtLjcxMiAxLjUwNS0xLjUyNiAxLjUwNS0uODMzIDAtMS40ODQtLjY3MS0xLjUyNS0xLjUwNWwtMS4zMjItMTkuMDk2IDEuMzIyLTM2LjU2NWMuMDQtLjg1NC43MTItMS41MDUgMS41MjUtMS41MDVtNy40NjMtMy4yOTRjLjg5NiAwIDEuNjI4LjczMiAxLjY2OCAxLjY4OGwxLjM4MyAzOS42MTUtMS4zODMgMTguOTEzdi0uMDJjLS4wNC45MTUtLjc3MiAxLjY0Ny0xLjY2NyAxLjY0N2ExLjY3IDEuNjcgMCAwIDEtMS42NjgtMS42NDdsLTEuMjItMTguOTEzIDEuMjItMzkuNjE2Yy4wMi0uOTM1Ljc1My0xLjY2NyAxLjY2OC0xLjY2N20xMC41MzQgNDEuMjYyLTEuMjgxIDE4Ljc5MWMtLjA0IDEuMDE3LS44MzQgMS44MS0xLjgzIDEuODFzLTEuNzktLjgxMy0xLjgzLTEuODFsLTEuMTQtMTguNzkgMS4xNC00MC45MzhjLjA0LTEuMDE3LjgzMy0xLjgxIDEuODMtMS44MS45OTYgMCAxLjc5Ljc5MyAxLjgzIDEuODF6bTQuMzcyLTQxLjg1MmMxLjA3OCAwIDEuOTMyLjg1NCAxLjk3MyAxLjk1MmwxLjE4IDM5LjktMS4xOCAxOC42Mjl2LS4wMmMtLjAyIDEuMDk3LS44OTUgMS45NzItMS45NzMgMS45NzJhMS45NyAxLjk3IDAgMCAxLTEuOTcyLTEuOTUybC0xLjAzNy0xOC42MDggMS4wMzctMzkuOWMuMDItMS4xMTkuODk1LTEuOTczIDEuOTcyLTEuOTczbTcuNTQ1IDEuMzAxYzEuMTYgMCAyLjA5NS45MzYgMi4xMzYgMi4xMTVsMS4wNzcgMzguNDM2LTEuMDc3IDE4LjUwN3YtLjAyYTIuMTQ0IDIuMTQ0IDAgMCAxLTIuMTM2IDIuMTE0IDIuMTMgMi4xMyAwIDAgMS0yLjEzNS0yLjExNWwtLjk1Ni0xOC40ODYuOTU2LTM4LjQzNmEyLjEzIDIuMTMgMCAwIDEgMi4xMzUtMi4xMTVtOC44NDctNy4wNzdhMi40OCAyLjQ4IDAgMCAxIDEuMDU3IDEuODkybC45NTYgNDUuNzM2LS44NzUgMTYuNTU0LS4xMDEgMS44MWMtLjAyLjYzLS4yODUgMS4yLS42OTIgMS42MDctLjQyNy40MDYtLjk3Ni42Ny0xLjYwNi42Ny0uNzEyIDAtMS4zMjItLjMyNS0xLjc1LS44MzNhMi4zIDIuMyAwIDAgMS0uNTI4LTEuMzYydi0uMDgybC0uODU0LTE4LjM4NC44NTQtNDUuMjl2LS40MjZhMi4zNCAyLjM0IDAgMCAxIDEuMDU4LTEuOTEyIDIuMjcgMi4yNyAwIDAgMSAxLjIyLS4zNjZjLjQ2OCAwIC44OTUuMTQyIDEuMjYuMzg2bTcuNTY2LTQuMzMxYy42OTEuNDI3IDEuMTggMS4yIDEuMiAyLjA1NGwxLjA3NyA0OS45MDUtMS4wNzcgMTguMXYtLjAyYy0uMDIgMS4zNDItMS4xMTkgMi40NC0yLjQ0IDIuNDQtMS4zMjMgMC0yLjQyLTEuMDk4LTIuNDQxLTIuNDJsLS40ODgtOC45MjgtLjUwOS05LjE3Mi45OTctNDkuNjQxdi0uMjQ0YzAtLjc1Mi4zNjYtMS40MjQuODk1LTEuODcxYTIuNDMgMi40MyAwIDAgMSAyLjc4Ni0uMjAzbTY3LjA0OSAyOC4zNjljMTIuMjQzIDAgMjIuMTY3IDkuOTA0IDIyLjE2NyAyMi4xMjYgMCAxMi4yNDMtOS45MjQgMjIuMDQ1LTIyLjE0NyAyMi4wNDVIOTYuNTU4Yy0xLjMyMi0uMTIyLTIuMzgtMS4xOC0yLjQtMi41NDJWNS4yNDdjLjAyLTEuMjgxLjQ2OC0xLjk1MiAyLjEzNS0yLjYwM0EzOS42IDM5LjYgMCAwIDEgMTEwLjQ2OCAwYzIwLjM5NyAwIDM3LjEzNCAxNS42NiAzOC45MDMgMzUuNjFhMjIuMiAyMi4yIDAgMCAxIDguNTYyLTEuNzA5IiBmaWxsPSIjZmZmIi8+PC9zdmc+";

  const Cast = Scratch.Cast;
  const vm = Scratch.vm;

  // Multiple CORS proxies — extension tries them in order, falls back on failure.
  // Your own Cloudflare worker is listed FIRST (fast, reliable, no rate limits).
  // The public proxies below are fallbacks in case the worker is ever down.
  const proxies = [
    "https://souncloudcorsproxy.ayaan-perf09.workers.dev/?",
    "https://api.allorigins.win/raw?url=",
    "https://api.codetabs.com/v1/proxy?quest=",
    "https://corsproxy.org/?",
    "https://proxy.cors.sh/",
  ];
  let proxyIndex = 0;
  const proxy = proxies[proxyIndex]; // kept for backwards compatibility

  // Smart fetch that tries proxies in order until one works.
  // If a 401 (bad client ID) comes back, automatically try to fetch a fresh
  // client ID once and retry — so a stale ID heals itself silently.
  let _retryingClientId = false;
  async function proxiedFetch(targetUrl, options) {
    let lastError = null;
    for (let i = 0; i < proxies.length; i++) {
      const idx = (proxyIndex + i) % proxies.length;
      const p = proxies[idx];
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(p + encodeURIComponent(targetUrl), {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (res.ok) {
          proxyIndex = idx;
          return res;
        }
        // Auto-heal: 401 = bad client_id. Try to refresh it ONCE then retry.
        if (res.status === 401 && !_retryingClientId && targetUrl.includes('client_id=')) {
          _retryingClientId = true;
          try {
            console.warn('[SoundCloud] Got 401, attempting to refresh client ID...');
            await ext_refreshClientId();
            const newUrl = targetUrl.replace(/client_id=[^&]+/, 'client_id=' + clientID);
            const retryRes = await fetch(p + encodeURIComponent(newUrl), {
              ...options,
              signal: (new AbortController()).signal,
            });
            if (retryRes.ok) {
              proxyIndex = idx;
              console.info('[SoundCloud] Client ID refreshed, request succeeded.');
              return retryRes;
            }
            lastError = new Error('Refreshed client ID still got HTTP ' + retryRes.status);
          } catch (e) {
            lastError = e;
          } finally {
            _retryingClientId = false;
          }
        } else {
          lastError = new Error("HTTP " + res.status + " from " + p);
        }
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError || new Error("All CORS proxies failed");
  }

  // Internal helper for the auto-retry above (calls the same logic as
  // fetchFreshClient block, defined below).
  // SoundCloud splits its app across many JS bundles; only ONE contains
  // the client_id. We try each one until we find a match.
  async function ext_refreshClientId() {
    const response = await fetch(proxies[proxyIndex] + encodeURIComponent(baseSoundCloudUrl));
    if (!response.ok) throw new Error('Could not fetch soundcloud.com to refresh client ID');
    const html = await response.text();
    // Find ALL JS bundle URLs, not just the first one
    const bundles = [...new Set(html.match(/https:\/\/a-v2\.sndcdn\.com\/assets\/[^"]+\.js/g) || [])];
    if (!bundles.length) throw new Error('Could not find any JS bundle URLs');
    // Try each bundle until we find a working client_id (require length 20+)
    for (const url of bundles) {
      try {
        const jsResponse = await fetch(proxies[proxyIndex] + encodeURIComponent(url));
        if (!jsResponse.ok) continue;
        const jsContent = await jsResponse.text();
        const m = jsContent.match(/client_id:"([a-zA-Z0-9]{20,})"/);
        if (m && m[1]) {
          clientID = m[1];
          console.info('[SoundCloud] Fresh client ID extracted from', url);
          return clientID;
        }
      } catch (e) { /* try next bundle */ }
    }
    throw new Error('Could not extract client ID from any of the ' + bundles.length + ' bundles');
  }

  // Safe JSON parser — never throws; returns null if body is empty/invalid.
  // Use this instead of `await safeJson(res)` everywhere to avoid the
  // "Unexpected end of JSON input" crash when the proxy or API returns empty.
  async function safeJson(res) {
    if (!res) return null;
    try {
      const text = await res.text();
      if (!text || !text.trim()) return null;
      return JSON.parse(text);
    } catch (e) {
      console.warn('[SoundCloud] Failed to parse response JSON:', e.message);
      return null;
    }
  }
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

  let clientID = "gxPRNsEq7CDD7Wvem4iymWOq3YfU7KS8";

  // ── New comment state ─────────────────────────────────────────────────────
  let fetchedSCComments = [];
  let scCommentsDone_   = false;

  // ── Related tracks state ───────────────────────────────────────────────────
  let fetchedRelated  = [];
  let relatedDone     = false;

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
    genMenuItem("url", null, "permalink_url"),
    genMenuItem("lyrics", null, "description")
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
        blockIconURI,
        blocks: [
          {
            opcode: "fetchFreshClient",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("fetch fresh client ID from SoundCloud")
          },
          {
            opcode: "isClientIDReady",
            blockType: Scratch.BlockType.BOOLEAN,
            text: Scratch.translate("client ID ready?")
          },
          {
            opcode: "setClient",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("set client ID to [ID]"),
            arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: clientID } }
          },
          {
            opcode: "getClientID",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("client ID")
          },
          { blockType: Scratch.BlockType.LABEL, text: Scratch.translate("Client ID must work for functionality") },
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
              URL:   { type: Scratch.ArgumentType.STRING, defaultValue: "https://soundcloud.com/" }
            }
          },
          { blockType: Scratch.BlockType.LABEL, text: Scratch.translate("Tracks") },
          {
            opcode: "getTrackAtt",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("get [THING] from track ID [ID]"),
            arguments: {
              THING: { type: Scratch.ArgumentType.STRING, menu: "TRACKS" },
              ID:    { type: Scratch.ArgumentType.NUMBER, defaultValue: 241049935 }
            }
          },
          {
            opcode: "getTrackMp3",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("get mp3 of track ID [ID]"),
            arguments: { ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 241049935 } }
          },
          {
            opcode: "isTrackPlayable",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("playability of track ID [ID]"),
            arguments: { ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 241049935 } }
          },
          {
            opcode: "getTrackFormat",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("format of track ID [ID]"),
            arguments: { ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 241049935 } }
          },
          {
            opcode: "getTrackComment",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("get [NUM2] offset [NUM1] of [TYPE] comments from track ID [ID]"),
            arguments: {
              TYPE: { type: Scratch.ArgumentType.STRING, menu: "COMMENT" },
              ID:   { type: Scratch.ArgumentType.NUMBER, defaultValue: 241049935 },
              NUM1: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              NUM2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 20 }
            }
          },
          "---",
          { blockType: Scratch.BlockType.LABEL, text: Scratch.translate("Related Tracks") },
          {
            opcode: "fetchRelatedTracks",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("fetch [COUNT] related tracks for track ID [ID]"),
            arguments: {
              COUNT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              ID:    { type: Scratch.ArgumentType.NUMBER, defaultValue: 241049935 },
            }
          },
          {
            opcode: "relatedTracksDone",
            blockType: Scratch.BlockType.BOOLEAN,
            text: Scratch.translate("related tracks fetched?"),
          },
          {
            opcode: "relatedTrackCount",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("number of related tracks"),
          },
          {
            opcode: "getRelatedTrack",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("related track ID [N]"),
            arguments: {
              N: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
            }
          },
          {
            opcode: "allRelatedJSON",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("all related track IDs as JSON"),
          },
          {
            opcode: "fetchRelatedForMany",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("fetch related tracks for track IDs [IDS] limit [COUNT] per track"),
            arguments: {
              IDS:   { type: Scratch.ArgumentType.STRING, defaultValue: "[]" },
              COUNT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 },
            }
          },
          "---",
          { blockType: Scratch.BlockType.LABEL, text: Scratch.translate("Comments") },
          {
            opcode: "fetchTrackComments",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("fetch [COUNT] comments from track ID [ID] sorted [SORT]"),
            arguments: {
              COUNT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              ID:    { type: Scratch.ArgumentType.NUMBER, defaultValue: 241049935 },
              SORT:  { type: Scratch.ArgumentType.STRING, menu: "commentSortMenu" }
            }
          },
          {
            opcode: "scCommentsDone",
            blockType: Scratch.BlockType.BOOLEAN,
            text: Scratch.translate("comments fetched?")
          },
          {
            opcode: "scCommentCount",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("number of fetched comments")
          },
          {
            opcode: "getSCComment",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("[FIELD] of comment [N]"),
            arguments: {
              FIELD: { type: Scratch.ArgumentType.STRING, menu: "scCommentFieldMenu" },
              N:     { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: "allSCCommentsJSON",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("all fetched comments as JSON")
          },
          "---",
          {
            opcode: "searchTracks",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("search for [NUM] tracks using query [QUERY]"),
            arguments: {
              NUM:   { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              QUERY: { type: Scratch.ArgumentType.STRING, defaultValue: "Ancient Visions" }
            }
          },
          {
            opcode: "getTrendingSongs",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("get [NUM] trending songs"),
            arguments: { NUM: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 } }
          },
          { blockType: Scratch.BlockType.LABEL, text: Scratch.translate("Artists") },
          {
            opcode: "getArtistAtt",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("get [THING] from artist ID [ID]"),
            arguments: {
              THING: { type: Scratch.ArgumentType.STRING, menu: "ARTISTS" },
              ID:    { type: Scratch.ArgumentType.NUMBER, defaultValue: 127123168 }
            }
          },
          {
            opcode: "getArtistFollowers",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("get [NUM2] offset [NUM1] of followers from artist ID [ID]"),
            arguments: {
              ID:   { type: Scratch.ArgumentType.NUMBER, defaultValue: 127123168 },
              NUM1: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              NUM2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 20 }
            }
          },
          {
            opcode: "getArtistTracks",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("get [NUM2] offset [NUM1] of tracks from artist ID [ID]"),
            arguments: {
              ID:   { type: Scratch.ArgumentType.NUMBER, defaultValue: 127123168 },
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
          },
          "---",
          {
            opcode: "getBulkTrackAtt",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("get [THING] from track IDs [IDS]"),
            arguments: {
              THING: { type: Scratch.ArgumentType.STRING, menu: "TRACKS" },
              IDS:   { type: Scratch.ArgumentType.STRING, defaultValue: "[]" }
            }
          },
          {
            opcode: "getTrackMetadataList",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("get metadata list from track IDs [IDS]"),
            arguments: { IDS: { type: Scratch.ArgumentType.STRING, defaultValue: "[]" } }
          },
          {
            opcode: "getSyncedLyrics",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("get synced lyrics for track ID [ID]"),
            arguments: { ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 241049935 } }
          }
        ],
        menus: {
          IDS: {
            acceptReporters: true,
            items: [genMenuItem("track", null, "track"), genMenuItem("artist", null, "artist")]
          },
          TRACKS:  { acceptReporters: true, items: TRACK_ATTRIBUTES },
          COMMENT: {
            acceptReporters: true,
            items: [genMenuItem("new"), genMenuItem("popular")]
          },
          ARTISTS: { acceptReporters: true, items: ARTIST_ATTRIBUTES },
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
          }
        }
      };
    }

    // Fetches a fresh client ID from SoundCloud's website.
    // SoundCloud splits its app into many JS bundles — only one contains
    // the client_id, and that file changes hash often. We try ALL of them
    // until we find a match.
    async fetchFreshClient() {
      try {
        const response = await proxiedFetch(baseSoundCloudUrl);
        const html = await response.text();
        const bundles = [...new Set(html.match(/https:\/\/a-v2\.sndcdn\.com\/assets\/[^"]+\.js/g) || [])];
        for (const url of bundles) {
          try {
            const jsResponse = await proxiedFetch(url);
            if (!jsResponse.ok) continue;
            const jsContent = await jsResponse.text();
            // Require length 20+ so we don't accept an empty match
            const m = jsContent.match(/client_id:"([a-zA-Z0-9]{20,})"/);
            if (m && m[1]) {
              clientID = m[1];
              console.info('[SoundCloud] Fresh client ID extracted from', url);
              return;
            }
          } catch (e) { /* try next bundle */ }
        }
        console.warn('[SoundCloud] Could not find client_id in any bundle (' + bundles.length + ' tried)');
      } catch(e) { console.error("Error fetching fresh client ID:", e); }
    }

    // Check that the ID is set AND looks like a real one (≥20 chars).
    // Previously this returned true for empty / partial IDs.
    isClientIDReady() { return !!(clientID && clientID.length >= 20); }
    setClient(args)   { clientID = args.ID; }
    getClientID()     { return clientID; }

    async testClient() {
      try {
        const url = `${SoundCloudAPI}charts?kind=trending&genre=soundcloud%3Agenres%3Aall-music&client_id=${clientID}&limit=1`;
        const req  = await proxiedFetch(url);
        const json = await safeJson(req);
        return !!(json?.collection?.length > 0);
      } catch(e) { return false; }
    }

    async extractID(args) {
      const url        = Cast.toString(args.URL);
      const thing      = Cast.toString(args.THING);
      const resolveUrl = `${SoundCloudAPI}resolve?url=${encodeURIComponent(url)}&client_id=${clientID}`;
      const req        = await proxiedFetch(resolveUrl);
      const json       = await safeJson(req);
      return (thing === "track" || thing === "artist") ? (json?.id || "") : "";
    }

    async getTrackAtt(args) {
      const id      = Cast.toNumber(args.ID);
      const thing   = Cast.toString(args.THING);
      const cacheId = `track-${id}`;
      let track     = getCache(cacheId);
      if (!track) {
        const req = await proxiedFetch(`${SoundCloudAPI}tracks/${id}?client_id=${clientID}`);
        track = await safeJson(req);
        setCache(cacheId, track);
      }
      if (!track) return "";
      if (thing === "formatted duration") {
        const d = track.duration;
        const m = Math.floor(d / 60000);
        const s = Math.floor((d % 60000) / 1000);
        return `${m}:${s < 10 ? "0" : ""}${s}`;
      }
      const attribute = TRACK_ATTRIBUTES.find(item => item.text === thing);
      if (attribute?.path) {
        if (Array.isArray(attribute.path)) {
          let value = track;
          for (const p of attribute.path) { value = value[p]; if (value === undefined) return ""; }
          return value;
        }
        return track[attribute.path];
      }
      return "";
    }

    async getTrackMp3(args) {
      const id = Cast.toNumber(args.ID);
      try {
        const req  = await proxiedFetch(`${SoundCloudAPI}tracks/${id}?client_id=${clientID}`);
        if (!req.ok) return "";
        const json = await safeJson(req);
        if (json?.media?.transcodings) {
          // Filter out DRM-encrypted transcodings (cbcs / encrypted) — these
          // can't be played outside SoundCloud's official player.
          if (!json?.media?.transcodings) return "";
          const usable = json.media.transcodings.filter(t => {
            const u = String(t.url || '');
            return !u.includes('/cbcs/') && !u.includes('encrypted') &&
                   t.format?.protocol !== 'encrypted-hls';
          });

          // Prefer progressive MP3 (works in any audio engine)
          let t = usable.find(t => t.format.protocol === "progressive" && t.format.mime_type === "audio/mpeg");
          if (!t) t = usable.find(t => t.format.protocol === "progressive");
          // Fall back to non-DRM HLS (notSound handles it via hls.js)
          if (!t) t = usable.find(t => t.format.protocol === "hls");
          if (!t) t = usable[0];

          // If everything was DRM, give up
          if (!t) {
            console.warn(`[SoundCloud] Track ${id}: all transcodings are DRM-protected (cbcs). Skipping.`);
            return "";
          }

          if (t?.url) {
            const sReq  = await proxiedFetch(`${t.url}?client_id=${clientID}`);
            if (!sReq.ok) return "";
            const sJson = await safeJson(sReq);
            const streamUrl = sJson.url || "";
            // Safety net: if SC returned a DRM URL anyway, reject it
            if (streamUrl.includes('/cbcs/')) {
              console.warn(`[SoundCloud] Track ${id}: stream URL is DRM-encrypted. Skipping.`);
              return "";
            }
            return streamUrl;
          }
        }
      } catch(e) { console.error("Error getting track MP3:", e); }
      return "";
    }

    // Reports whether a track can be played by your project.
    // Returns "playable", "drm", or "unavailable".
    async isTrackPlayable(args) {
      const id = Cast.toNumber(args.ID);
      try {
        const req  = await proxiedFetch(`${SoundCloudAPI}tracks/${id}?client_id=${clientID}`);
        if (!req.ok) return "unavailable";
        const json = await safeJson(req);
        if (!json?.media?.transcodings || json.media.transcodings.length === 0) {
          return "unavailable";
        }
        if (!json?.media?.transcodings) return "";
          const usable = json.media.transcodings.filter(t => {
          const u = String(t.url || '');
          return !u.includes('/cbcs/') && !u.includes('encrypted') &&
                 t.format?.protocol !== 'encrypted-hls';
        });
        if (usable.length === 0) return "drm";
        return "playable";
      } catch(e) { return "unavailable"; }
    }

    async getTrackComment(args) {
      const id     = Cast.toNumber(args.ID);
      const type   = Cast.toString(args.TYPE);
      const offset = Cast.toNumber(args.NUM1);
      const limit  = Cast.toNumber(args.NUM2);
      let url = `${SoundCloudAPI}tracks/${id}/comments?client_id=${clientID}&limit=${limit}&offset=${offset}`;
      if (type === "popular") url += "&sort=popular";
      const req  = await proxiedFetch(url);
      const json = await safeJson(req);
      return json?.collection ? JSON.stringify(json.collection.map(item => item.id)) : "[]";
    }

    // ── Related tracks ────────────────────────────────────────────────────────
    async fetchRelatedTracks(args) {
      const id    = Cast.toNumber(args.ID);
      const count = Math.max(1, Math.min(50, Cast.toNumber(args.COUNT)));
      relatedDone    = false;
      fetchedRelated = [];

      try {
        const url  = `${SoundCloudAPI}tracks/${id}/related?limit=${count}&client_id=${clientID}`;
        const req  = await proxiedFetch(url);
        const json = await safeJson(req);
        if (json?.collection) {
          fetchedRelated = json.collection.map(t => t.id).filter(Boolean);
          // Cache track info for instant attribute retrieval
          json.collection.forEach(t => setCache(`track-${t.id}`, t));
        }
      } catch(e) { console.warn("SoundCloud related tracks error:", e); }

      relatedDone = true;
    }

    async fetchRelatedForMany(args) {
      const ids   = JSON.parse(Cast.toString(args.IDS) || "[]");
      const count = Math.max(1, Math.min(20, Cast.toNumber(args.COUNT)));
      relatedDone    = false;
      fetchedRelated = [];

      const seen = new Set(ids.map(String)); // pre-seed with source IDs to exclude them

      // Fetch all in parallel instead of sequentially
      const results = await Promise.all(ids.map(async (id) => {
        if (!id) return [];
        // Check cache first
        const cacheKey = `related-${id}-${count}`;
        const cached   = getCache(cacheKey);
        if (cached) return cached;
        try {
          const url  = `${SoundCloudAPI}tracks/${id}/related?limit=${count}&client_id=${clientID}`;
          const req  = await proxiedFetch(url);
          const json = await safeJson(req);
          const tracks = json?.collection || [];
          setCache(cacheKey, tracks);
          return tracks;
        } catch(e) { return []; }
      }));

      // Merge and deduplicate
      for (const tracks of results) {
        for (const t of tracks) {
          if (t.id && !seen.has(String(t.id))) {
            seen.add(String(t.id));
            fetchedRelated.push(t.id);
            setCache(`track-${t.id}`, t);
          }
        }
      }

      // Shuffle for variety
      for (let i = fetchedRelated.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [fetchedRelated[i], fetchedRelated[j]] = [fetchedRelated[j], fetchedRelated[i]];
      }

      relatedDone = true;
    }

    relatedTracksDone() {
      if (relatedDone) { relatedDone = false; return true; }
      return false;
    }

    relatedTrackCount() { return fetchedRelated.length; }

    getRelatedTrack(args) {
      const idx = Math.round(Cast.toNumber(args.N)) - 1;
      return fetchedRelated[idx] ?? "";
    }

    allRelatedJSON() { return JSON.stringify(fetchedRelated); }

    // ── New comment blocks ─────────────────────────────────────────────────────
    async fetchTrackComments(args) {
      const id    = Cast.toNumber(args.ID);
      const count = Math.max(1, Math.min(200, Cast.toNumber(args.COUNT)));
      const sort  = Cast.toString(args.SORT) === "oldest" ? "oldest" : "newest";
      scCommentsDone_   = false;
      fetchedSCComments = [];

      try {
        const url  = `${SoundCloudAPI}tracks/${id}/comments?sort=${sort}&threaded=1&limit=${count}&client_id=${clientID}`;
        const req  = await proxiedFetch(url);
        const json = await safeJson(req);

        if (json?.collection) {
          const comments = json?.collection || [];

          // SoundCloud includes basic user info inline on each comment
          // Use that first, then fill gaps with separate user fetches
          const userMap = {};
          comments.forEach(c => {
            if (c.user && c.user.username) {
              userMap[c.user_id] = c.user;
            }
          });

          // Only fetch users we don't already have from inline data
          const missingIds = [...new Set(comments.map(c => c.user_id).filter(uid => uid && !userMap[uid]))];
          await Promise.all(missingIds.map(async (uid) => {
            try {
              const cached = getCache("A" + uid);
              if (cached) { userMap[uid] = cached; return; }
              const uReq  = await proxiedFetch(`${SoundCloudAPI}users/${uid}?client_id=${clientID}`);
              const uJson = await safeJson(uReq);
              if (uJson?.username) { userMap[uid] = uJson; setCache("A" + uid, uJson); }
            } catch(e) {}
          }));

          fetchedSCComments = comments.map(c => {
            const user = userMap[c.user_id] || c.user || {};
            return {
              body:       c.body        || "",
              authorName: user.username || user.full_name || String(c.user_id || ""),
              authorPfp:  (user.avatar_url || "").replace("-large.", "-t300x300."),
              authorId:   String(c.user_id || ""),
              timestamp:  c.timestamp !== undefined ? Math.floor(c.timestamp / 1000) : 0,
              createdAt:  c.created_at  || "",
              permalink:  user.permalink_url || ""
            };
          });
        }
      } catch(e) { console.warn("SoundCloud comments error:", e); }

      scCommentsDone_ = true;
    }

    scCommentsDone() {
      if (scCommentsDone_) { scCommentsDone_ = false; return true; }
      return false;
    }

    scCommentCount() { return fetchedSCComments.length; }

    getSCComment(args) {
      const idx = Math.round(Cast.toNumber(args.N)) - 1;
      const c   = fetchedSCComments[idx];
      if (!c) return "";
      return String(c[Cast.toString(args.FIELD)] ?? "");
    }

    allSCCommentsJSON() { return JSON.stringify(fetchedSCComments); }

    // ── Rest of original methods (unchanged) ──────────────────────────────────
    async searchTracks(args) {
      const query = Cast.toString(args.QUERY);
      const limit = Cast.toNumber(args.NUM);
      const req   = await proxiedFetch(`${SoundCloudAPI}search/tracks?q=${encodeURIComponent(query)}&client_id=${clientID}&limit=${limit}`);
      const json  = await safeJson(req);
      if (json?.collection) {
        if (!json?.collection) return "[]";
        json.collection.forEach(track => setCache(`track-${track.id}`, track));
        return JSON.stringify(json.collection.map(item => item.id));
      }
      return "[]";
    }

    async getTrendingSongs(args) {
      const limit = Cast.toNumber(args.NUM);
      const req   = await proxiedFetch(`${SoundCloudAPI}charts?kind=trending&genre=soundcloud%3Agenres%3Aall-music&client_id=${clientID}&limit=${limit}`);
      const json  = await safeJson(req);
      if (json?.collection) {
        if (!json?.collection) return "[]";
        json.collection.forEach(item => { if (item.track) setCache(`track-${item.track.id}`, item.track); });
        return JSON.stringify(json.collection.map(item => item.track.id));
      }
      return "[]";
    }

    async getArtistAtt(args) {
      const id      = Cast.toNumber(args.ID);
      const thing   = Cast.toString(args.THING);
      const cacheId = `artist-${id}`;
      let artist    = getCache(cacheId);
      if (!artist) {
        const req = await proxiedFetch(`${SoundCloudAPI}users/${id}?client_id=${clientID}`);
        artist = await safeJson(req);
        setCache(cacheId, artist);
      }
      if (!artist) return "";
      const attribute = ARTIST_ATTRIBUTES.find(item => item.text === thing);
      return attribute?.path ? artist[attribute.path] : "";
    }

    async getArtistFollowers(args) {
      const id     = Cast.toNumber(args.ID);
      const offset = Cast.toNumber(args.NUM1);
      const limit  = Cast.toNumber(args.NUM2);
      const req    = await proxiedFetch(`${SoundCloudAPI}users/${id}/followers?client_id=${clientID}&limit=${limit}&offset=${offset}`);
      const json   = await safeJson(req);
      return json?.collection ? JSON.stringify(json.collection.map(item => item.id)) : "[]";
    }

    async getArtistTracks(args) {
      const id     = Cast.toNumber(args.ID);
      const offset = Cast.toNumber(args.NUM1);
      const limit  = Cast.toNumber(args.NUM2);
      const req    = await proxiedFetch(`${SoundCloudAPI}users/${id}/tracks?client_id=${clientID}&limit=${limit}&offset=${offset}`);
      const json   = await safeJson(req);
      return json?.collection ? JSON.stringify(json.collection.map(item => item.id)) : "[]";
    }

    async searchArtists(args) {
      const query = Cast.toString(args.QUERY);
      const limit = Cast.toNumber(args.NUM);
      const req   = await proxiedFetch(`${SoundCloudAPI}search/users?q=${encodeURIComponent(query)}&client_id=${clientID}&limit=${limit}`);
      const json  = await safeJson(req);
      if (json?.collection) {
        if (!json?.collection) return "[]";
        json.collection.forEach(artist => setCache(`artist-${artist.id}`, artist));
        return JSON.stringify(json.collection.map(item => item.id));
      }
      return "[]";
    }

    async getBulkTrackAtt(args) {
      const ids     = JSON.parse(Cast.toString(args.IDS) || "[]");
      const thing   = Cast.toString(args.THING);
      const results = [];
      for (const id of ids) { results.push(await this.getTrackAtt({ ID: id, THING: thing })); }
      return JSON.stringify(results);
    }

    async getTrackMetadataList(args) {
      const ids     = JSON.parse(Cast.toString(args.IDS) || "[]");
      const results = [];
      for (const id of ids) {
        results.push({
          id,
          name:        await this.getTrackAtt({ ID: id, THING: "name" }),
          cover:       await this.getTrackAtt({ ID: id, THING: "cover" }),
          description: await this.getTrackAtt({ ID: id, THING: "description" }),
          artist:      await this.getTrackAtt({ ID: id, THING: "artist" })
        });
      }
      return JSON.stringify(results);
    }

    async getSyncedLyrics(args) {
      const id = Cast.toNumber(args.ID);
      try {
        const name   = await this.getTrackAtt({ ID: id, THING: "name" });
        const artist = await this.getTrackAtt({ ID: id, THING: "artist" });
        if (!name || !artist) return "";
        const req  = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(name + " " + artist)}`);
        const json = await safeJson(req);
        if (json?.length > 0) {
          if (!Array.isArray(json) || !json.length) return "";
          const match = json.find(item => item.syncedLyrics) || json[0];
          return match.syncedLyrics || match.plainLyrics || "";
        }
      } catch(e) { console.error("Error getting synced lyrics:", e); }
      return "";
    }
  }

  if (Scratch.gui) Scratch.gui.getBlockly().then((SB) => {
    function add2Body() {
      const grad = document.querySelector(`div[class="SPgradCache"]`) || document.createElement("div");
      grad.setAttribute("class", "SPgradCache");
      grad.innerHTML = `${grad.innerHTML}<svg><defs><linearGradient x1="240" y1="0" x2="240" y2="100" gradientUnits="userSpaceOnUse" id="SPsoundCloud-GRAD"><stop offset="0" stop-color="#ff7600"/><stop offset="0.5" stop-color="#ff2200"/></linearGradient></defs></svg>`;
      document.body.append(grad);
    }
    add2Body();
    if (!SB?.SPgradients?.patched) {
      SB.SPgradients = { gradientUrls: new Map(), patched: true };
      const ogBlockRender = SB.BlockSvg.prototype.render;
      SB.BlockSvg.prototype.render = function(...args) {
        const result = ogBlockRender.apply(this, args);
        const grad   = SB.SPgradients.gradientUrls.get(this.type.slice(0, this.type.indexOf("_")));
        if (grad && this?.svgPath_ && this?.category_) {
          const fill = this.svgPath_.getAttribute("fill");
          this.svgPath_.setAttribute(fill === grad.check || fill === grad.path ? "fill" : "stroke", grad.path);
        }
        return result;
      };
    }
    SB.SPgradients.gradientUrls.set("SPsoundCloud", { path: "url(#SPsoundCloud-GRAD)", check: color1 });
  });

  Scratch.extensions.register(new SPsoundCloud());
})(Scratch);
