import { Application, environment } from "@raycast/api";
import { runAppleScript } from "@raycast/utils";
import { join } from "path";
import { parseAppleScriptResponse } from "./parser";
import fs from 'node:fs';

/*
 * Load applescript file for getting menu bar items and details
 */
const scriptPath = join(environment.assetsPath, "get-menu-bar-items-and-shortcuts.applescript");
const APPLESCRIPT = fs.readFileSync(scriptPath, "utf8");

/*
 * Filename helper
 */
function getFileName(app: Application) {
  return `${app.name}__config`
}

/*
 * Retrieves locally stored shortcuts for given app
 */
export async function getMenuBarShortcutsCache(app: Application) {
  try {
    const cache = await readFile(getFileName(app))
    return cache;
  } catch (e) {
    throw new Error('Could not load local shortcuts')
  }
}

/*
 * Runs an applescript to get all the menu bar items and details then returns a string to parse
 */
export async function getMenuBarShortcuts(app: Application) {
  try {
    const response = await runAppleScript(APPLESCRIPT, { timeout: 60000 });
    if (!response?.includes('MNS:')) {
      throw new Error('Invalid shortcuts response')
    }
    const parsed = parseAppleScriptResponse(app, response);
    await writeFile(getFileName(app), parsed)
    return parsed;
  } catch (e) {
    throw new Error('Could not load shortcuts')
  }
}

/*
 * Read cached application menu bar items json config from support directory
 * INFO: The applescript can take a while to run, thus we cache to speed up UX
 */
export async function readFile(filename: string): Promise<any> {
  try {
    const data = await fs.promises.readFile(`${environment.supportPath}/${filename}.json`, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    throw error;
  }
}

/*
 * Write file to support directory for retrieval later
 * Used to cache application shortcuts data
 */
export async function writeFile(filename: string, data: any): Promise<void> {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    await fs.promises.writeFile(`${environment.supportPath}/${filename}.json`, jsonData, 'utf-8');
  } catch (error) {
    throw error;
  }
}

/*
 * Handler for getting data from cache or running applescript to get it
 */
export async function loadInitialData(app: Application) {
  let data;
  try {
    data = await getMenuBarShortcutsCache(app)
    if (!data || !data?.menus?.length) {
      data = await getMenuBarShortcuts(app)
    }
  } catch (e) {
    data = await getMenuBarShortcuts(app)
  }

  // return data if it exists
  if (data && data?.menus?.length) {
    return data;
  } else {
    throw new Error('Shortcuts not found')
  }
}

/*
 * Handler for getting data from cache or running applescript to get it
 */
export async function refreshData(app: Application) {
  const data = await getMenuBarShortcuts(app)

  // return data if it exists
  if (data && data?.menus?.length) {
    return data;
  } else {
    throw new Error('Shortcuts not found during refresh')
  }
}
