/**
 * Generators generate and write files.
 */
export type Generator = (targetPath: string, options?: any) => Promise<void>;

/**
 * Configurators compute and return config objects.
 */
export type Configurator<T> = (options: T) => { cfgs: any; deps: string[] };
