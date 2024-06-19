import { type Options, type OptionalOptions } from "./types";
declare class Config {
    private options;
    constructor(options?: OptionalOptions);
    get(): Options;
}
export default Config;
