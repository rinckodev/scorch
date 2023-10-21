interface ServerStatusData {
    online: boolean,
	ip: string,
	port: number,
	hostname: string,
	version: string,
	icon: string,
    players: {
		online?: number,
		max?: number,
		list?: Array<{
            name: string,
            uuid: string
        }>
	},
}
interface FailServerStatusResponse {
    success: false,
}
interface SuccessServerStatusResponse {
    success: true,
    data: Partial<ServerStatusData>
}
type ServerStatusResponse = FailServerStatusResponse | SuccessServerStatusResponse;

const baseUrl = "https://api.mcsrvstat.us/3/";
export async function fetchMinecraftServerStatus(ip: string): Promise<ServerStatusResponse> {
    const response = await fetch(baseUrl + ip);

    if (response.status !== 200){
        return { success: false };
    }
    const data = await response.json();
    return { success: true, data };
}