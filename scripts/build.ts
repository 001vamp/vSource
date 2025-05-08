import { build } from '@suwatte/cli';
import path from 'path';

const runnerPath = path.join(__dirname, '../src/runners/vortexscans');

async function main() {
    try {
        await build({
            entry: runnerPath,
            outDir: path.join(__dirname, '../dist'),
            name: 'vortexscans'
        });
        console.log('Build completed successfully!');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

main(); 