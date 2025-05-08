declare module '@suwatte/cli' {
    export interface BuildOptions {
        entry: string;
        outDir: string;
        name: string;
    }

    export function build(options: BuildOptions): Promise<void>;
} 