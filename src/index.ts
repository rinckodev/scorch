import { GlobalFonts } from "@napi-rs/canvas";
import { createClient } from "./discord/base";
import { log } from "./settings";
import { join } from "node:path";

GlobalFonts.loadFontsFromDir(join(__rootname, "assets/fonts"));

const client = createClient();
client.start();

process.on("uncaughtException", log.error);
process.on("unhandledRejection", log.error);