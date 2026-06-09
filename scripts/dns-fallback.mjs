// Point Node's resolver at public DNS before anything else loads.
//
// On some Windows setups Node's bundled resolver (c-ares) fails with
// `querySrv ECONNREFUSED` when resolving Atlas `mongodb+srv://` hosts, even
// though the OS itself resolves DNS fine. Forcing known-good public DNS servers
// makes remote (Atlas) seeding work. Used by the `seed:atlas` npm script.
import dns from "node:dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);
