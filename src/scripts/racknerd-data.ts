import { VpsData } from "./vpsdata"

export const basicHeader = () => new Headers()

export async function getRacknerdData(): Promise<[ResponseMeta | null, VpsData[]]> {
    const githubProxyDomain = `raw.gitmirror.com`;
    const href = `https://${githubProxyDomain}/KarsonJo/vps-data/main/racknerd-filtered.json`;
    const headers = basicHeader();
    // 请求
    let items: Array<VpsData> = [];
    let meta: ResponseMeta | null = null;
    try {
        const response = await fetch(href, {
            method: 'GET',
            headers: headers
        })

        const jsonData = await response.json()
        // console.log(jsonData)

        meta = new ResponseMeta(jsonData.meta);
        for (const [id, item] of Object.entries<any>(jsonData.data)) {
            items.push(new VpsData(parseInt(id), item))
        }
        // console.log(items)

    } catch (error) {
        console.error('Error fetching data:', error);
    }
    return [meta, items];
}

export class ResponseMeta {
    utcTime: Date;
    constructor(metas: any) {
        this.utcTime = new Date(metas.utcTime);
    }
}