import fs from 'node:fs';
import { environment } from '@raycast/api';

/*
 * Read cached application menu bar items json config from support directory
 * INFO: The applescript can take a while to run, thus we cache to speed up UX
 */
export async function readFile(filename: string): Promise<any> {
  try {
    console.log(`${environment.supportPath}/${filename}.json`)
    const data = await fs.promises.readFile(`${environment.supportPath}/${filename}.json`, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading JSON file:', error);
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
    console.error('Error writing JSON file:', error);
    throw error;
  }
}
