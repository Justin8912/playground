export const genericErrorResponse = (msg?: string, status?:number) => {
    return {
        statusCode: status ?? 400,
        body: JSON.stringify({
            message: msg ?? "Something went wrong"
        })
    }
}