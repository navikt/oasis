import { Options } from 'tsup'

export const sharedConfig: Options = {
    format: "esm",
    sourcemap: true,
    clean: true,
    metafile: true,
}
