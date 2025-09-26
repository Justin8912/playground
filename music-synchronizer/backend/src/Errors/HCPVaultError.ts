export class HCPVaultError extends Error {
    constructor(message: string, options?:ErrorOptions) {
        super(message, options);
        this.name = "HCPVaultError";
        this.cause = options?.cause;
    }
}